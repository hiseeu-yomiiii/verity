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

      if (!payload.content) {
        return jsonResponse({ error: "Missing project content" }, 400);
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
    }
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
      temperature: 0.2,
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
请根据以下项目材料生成 Verity JSON 评审报告。

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

function normalizeReport(report, payload) {
  const dimensions = Array.isArray(report.dimensions) ? report.dimensions : [];
  const score = Number(report?.evaluation?.score || dimensions.reduce((sum, item) => sum + Number(item.score || 0), 0));

  return {
    meta: {
      projectName: String(report?.meta?.projectName || payload.name),
      projectType: String(report?.meta?.projectType || payload.type)
    },
    evaluation: {
      score,
      status: String(report?.evaluation?.status || "建议优化后提交"),
      riskCount: Number(report?.evaluation?.riskCount || 0),
      questionCount: Number(report?.evaluation?.questionCount || 0),
      suggestionCount: Number(report?.evaluation?.suggestionCount || 0)
    },
    dimensions,
    credibilityCheck: {
      overall: report?.credibilityCheck?.overall || "warning",
      items: Array.isArray(report?.credibilityCheck?.items) ? report.credibilityCheck.items : []
    },
    judgeQuestions: Array.isArray(report?.judgeQuestions) ? report.judgeQuestions : [],
    actionList: {
      S: Array.isArray(report?.actionList?.S) ? report.actionList.S : [],
      A: Array.isArray(report?.actionList?.A) ? report.actionList.A : [],
      B: Array.isArray(report?.actionList?.B) ? report.actionList.B : []
    },
    optimization: {
      positioning: String(report?.optimization?.positioning || "材料未体现"),
      structureAdvice: Array.isArray(report?.optimization?.structureAdvice) ? report.optimization.structureAdvice : [],
      rewriteExample: String(report?.optimization?.rewriteExample || "材料未体现")
    }
  };
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
