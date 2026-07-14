import { VERITY_PROMPT } from "./prompt.js";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      const input = await request.json();
      const payload = normalizeInput(input);
      const extracted = await extractUploadedMaterials(payload.files);
      payload.content = [payload.content, extracted.text].filter(Boolean).join("\n\n");
      payload.materials = extracted.materials;

      if (!payload.content) {
        return jsonResponse({ error: "Missing project content or supported material" }, 400);
      }

      if (!env.DEEPSEEK_API_KEY) {
        return jsonResponse({ error: "Worker is not configured" }, 500);
      }

      const aiResult = await callDeepSeek(payload, env);
      const report = parseModelJson(aiResult);
      const normalizedReport = normalizeReport(report, payload);

      return jsonResponse(normalizedReport);
    } catch (error) {
      console.error(JSON.stringify({
        event: "verity_worker_error",
        message: error instanceof Error ? error.message : "Unknown error"
      }));

      return jsonResponse({ error: "AI review failed" }, 500);
    }
  }
};

function normalizeInput(input) {
  return {
    type: String(input?.type || "其他").trim(),
    name: String(input?.name || "未命名项目").trim(),
    content: String(input?.content || "").trim(),
    extra: {
      background: String(input?.extra?.background || "").trim(),
      targetUsers: String(input?.extra?.targetUsers || "").trim(),
      solution: String(input?.extra?.solution || "").trim(),
      innovation: String(input?.extra?.innovation || "").trim(),
      achievement: String(input?.extra?.achievement || "").trim(),
      technicalRoute: String(input?.extra?.technicalRoute || "").trim(),
      evidence: String(input?.extra?.evidence || "").trim()
    },
    files: Array.isArray(input?.files) ? input.files.map((file) => ({
      name: String(file?.name || "未命名材料").trim(),
      type: String(file?.type || "").trim(),
      size: Number(file?.size || 0),
      content: String(file?.content || ""),
      extractedText: String(file?.extractedText || "")
    })) : [],
    materials: []
  };
}

async function callDeepSeek(payload, env) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: VERITY_PROMPT
        },
        {
          role: "user",
          content: buildUserPrompt(payload)
        }
      ],
      temperature: 0,
      max_tokens: 3500,
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek returned empty content");
  }

  return content;
}

function buildUserPrompt(payload) {
  return `
请根据以下项目材料生成 Verity v0.3 JSON 评审报告。

项目类型：${payload.type}
项目名称：${payload.name}

项目简介：
${payload.content}

补充信息：
项目背景：${payload.extra.background || "材料未体现"}
目标用户：${payload.extra.targetUsers || "材料未体现"}
解决方案：${payload.extra.solution || "材料未体现"}
创新点：${payload.extra.innovation || "材料未体现"}
已有成果：${payload.extra.achievement || "材料未体现"}
技术路线：${payload.extra.technicalRoute || "材料未体现"}
数据依据：${payload.extra.evidence || "材料未体现"}

上传材料（已提取文本）：
${payload.materials?.map((material) => `【${material.name}】\n${material.text}`).join("\n\n") || "材料未体现"}

请严格返回 JSON 对象，不要返回 Markdown 或额外解释。
`;
}

function parseModelJson(content) {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

async function extractUploadedMaterials(files = []) {
  const supported = files.filter((file) => (file.extractedText || file.content) && /\.(docx|txt)$/i.test(file.name));
  const materials = [];

  for (const file of supported) {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const text = file.extractedText || (extension === ".txt"
      ? decodeTextFile(file.content)
      : await extractDocxText(file.content));

    if (text.trim()) {
      materials.push({
        name: file.name,
        type: extension.slice(1),
        text: limitText(text.trim(), 50000)
      });
    }
  }

  return {
    materials,
    text: materials.map((material) => `【${material.name}】\n${material.text}`).join("\n\n")
  };
}

function decodeTextFile(base64) {
  return new TextDecoder("utf-8", { fatal: false }).decode(decodeBase64(base64));
}

async function extractDocxText(base64) {
  const bytes = decodeBase64(base64);
  const entry = findZipEntry(bytes, "word/document.xml");

  if (!entry) {
    throw new Error("DOCX document.xml not found");
  }

  const xmlBytes = entry.method === 0
    ? entry.data
    : await inflateRaw(entry.data);

  return xmlToText(new TextDecoder("utf-8", { fatal: false }).decode(xmlBytes));
}

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function findZipEntry(bytes, targetName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let endOffset = -1;

  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      endOffset = index;
      break;
    }
  }

  if (endOffset < 0) {
    throw new Error("Invalid DOCX ZIP container");
  }

  const entryCount = view.getUint16(endOffset + 10, true);
  const directoryOffset = view.getUint32(endOffset + 16, true);
  let offset = directoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      break;
    }

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength));

    if (name === targetName) {
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;

      return {
        method,
        data: bytes.slice(dataStart, dataStart + compressedSize)
      };
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return null;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DOCX decompression is unavailable");
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function xmlToText(xml) {
  return xml
    .replace(/<w:tab\s*\/?>/gi, "\t")
    .replace(/<w:br\s*\/?>/gi, "\n")
    .replace(/<\/w:p>/gi, "\n")
    .replace(/<\/w:tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function limitText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n[材料文本已截断]` : text;
}

function normalizeReport(report, payload) {
  const normalizedDimensions = normalizeDimensions(Array.isArray(report.dimensions) ? report.dimensions : []);
  const score = normalizedDimensions.reduce((sum, item) => sum + item.score, 0);
  const level = inferLevel(score);
  const evaluation = report?.evaluation || {};
  const credibilityItems = Array.isArray(report?.credibilityCheck?.items) ? report.credibilityCheck.items : [];
  const risks = Array.isArray(report?.risks) && report.risks.length
    ? report.risks
    : credibilityItems
        .filter((item) => item.status === "danger" || item.status === "warning")
        .map((item) => ({
          level: item.status === "danger" ? "high" : "medium",
          type: item.type || "evidence",
          title: item.content || "材料可信度风险",
          description: item.problem || "材料未体现",
          suggestion: item.suggestion || "建议补充依据"
        }));
  const questions = Array.isArray(report?.judgeQuestions) ? report.judgeQuestions : [];
  const actionPlan = normalizeActionPlan(report?.actionPlan || report?.actionList);

  return {
    meta: {
      projectName: String(report?.meta?.projectName || payload.name),
      projectType: String(report?.meta?.projectType || payload.type),
      reviewMode: String(report?.meta?.reviewMode || "竞赛评审")
    },
    summary: {
      overallComment: String(report?.summary?.overallComment || evaluation.reason || "材料已完成基础评审，建议继续补充关键证据。"),
      competitiveLevel: level,
      mainConcern: String(report?.summary?.mainConcern || inferMainConcern(credibilityItems, risks))
    },
    evaluation: {
      score,
      level,
      reason: String(evaluation.reason || evaluation.status || "建议优化后提交"),
      riskCount: risks.length,
      questionCount: questions.length,
      suggestionCount: countActions(actionPlan)
    },
    dimensions: normalizedDimensions,
    strengths: Array.isArray(report?.strengths) ? report.strengths : [],
    credibilityCheck: {
      overall: report?.credibilityCheck?.overall || "warning",
      items: credibilityItems
    },
    risks,
    judgeQuestions: questions,
    actionPlan,
    optimization: {
      positioning: String(report?.optimization?.positioning || "材料未体现"),
      structureAdvice: Array.isArray(report?.optimization?.structureAdvice) ? report.optimization.structureAdvice : [],
      rewriteExample: String(report?.optimization?.rewriteExample || "材料未体现")
    },
    ...(report?.projectProfile ? { projectProfile: normalizeProjectProfile(report.projectProfile) } : {}),
    ...(report?.materialSummary ? { materialSummary: normalizeMaterialSummary(report.materialSummary) } : {}),
    ...(report?.evidenceScore ? { evidenceScore: normalizeEvidenceScore(report.evidenceScore) } : {})
  };
}

function normalizeProjectProfile(profile = {}) {
  return {
    basicInfo: profile.basicInfo || {},
    problemAnalysis: profile.problemAnalysis || {},
    solution: profile.solution || {},
    technology: profile.technology || {},
    evidence: profile.evidence || {},
    businessValue: profile.businessValue || {}
  };
}

function normalizeMaterialSummary(summary = {}) {
  return {
    understanding: String(summary.understanding || "材料未体现"),
    keyEvidence: Array.isArray(summary.keyEvidence) ? summary.keyEvidence : [],
    criticalMissing: Array.isArray(summary.criticalMissing) ? summary.criticalMissing : []
  };
}

function normalizeEvidenceScore(score = {}) {
  const covered = normalizeEvidenceCategories(score.covered);
  const missing = normalizeEvidenceCategories(score.missing);
  const total = covered.length + missing.length;
  const calculatedScore = total ? Math.round((covered.length / total) * 100) : 0;

  return {
    score: calculatedScore,
    covered,
    missing
  };
}

function normalizeEvidenceCategories(items) {
  return [...new Set((Array.isArray(items) ? items : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean))];
}

function normalizeActionPlan(actionPlan = {}) {
  return {
    S: normalizeActionItems(actionPlan.S),
    A: normalizeActionItems(actionPlan.A),
    B: normalizeActionItems(actionPlan.B)
  };
}

function normalizeActionItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (typeof item === "string") {
      return {
        problem: item,
        reason: "材料当前存在会影响评审判断的优化点。",
        action: item
      };
    }

    return {
      problem: String(item?.problem || "材料未体现"),
      reason: String(item?.reason || "建议补充依据"),
      action: String(item?.action || "建议明确修改动作")
    };
  });
}

function countActions(actionPlan = {}) {
  return ["S", "A", "B"].reduce((sum, level) => {
    return sum + (Array.isArray(actionPlan[level]) ? actionPlan[level].length : 0);
  }, 0);
}

function inferLevel(score) {
  if (score >= 90) return "优秀竞争项目";
  if (score >= 80) return "具备竞争力";
  if (score >= 70) return "基础较好";
  if (score >= 60) return "存在明显短板";
  return "需要重新梳理";
}

function inferMainConcern(credibilityItems, risks) {
  const firstRisk = risks[0]?.description || credibilityItems[0]?.problem;
  return String(firstRisk || "材料未体现关键风险，建议继续核实证据。");
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
