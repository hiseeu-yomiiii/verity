const WORKER_URL = "https://verity-ai.cyyuhiseeu.workers.dev";
const USE_DEMO = false;

const form = document.querySelector("#projectForm");
const statusSection = document.querySelector("#analysisStatus");
const reportSection = document.querySelector("#reportSection");
const reportContent = document.querySelector("#reportContent");
const heroPreviewContent = document.querySelector("#heroPreviewContent");
const reportBadge = document.querySelector("#reportBadge");
const themeToggle = document.querySelector("#themeToggle");
const submitButton = document.querySelector(".button-action");
const statusNote = document.querySelector("#statusNote");
const statusTimer = document.querySelector("#statusTimer");
const statusSteps = Array.from(document.querySelectorAll(".status-list li"));
const projectTypeInputs = Array.from(document.querySelectorAll("input[name='projectType']"));
const customTypeField = document.querySelector("#customTypeField");
const customProjectType = document.querySelector("#customProjectType");
const projectFiles = document.querySelector("#projectFiles");
const fileList = document.querySelector("#fileList");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const reviewHints = [
  "正在读取上传材料并组织项目上下文，请稍候。",
  "正在整理项目档案，识别背景、方案和已有成果。",
  "正在对照竞赛评审标准，检查项目定位与问题表达。",
  "正在扫描创新点、证据依据和落地风险。",
  "正在整理评委可能追问与修改行动清单。",
  "报告内容较长时会多花一点时间，系统仍在生成。"
];

let reviewStartedAt = 0;
let timerId = null;
let stepTimerId = null;
let hintTimerId = null;

const storedTheme = localStorage.getItem("verity-theme") || "light";
setTheme(storedTheme);

window.VerityRenderer.renderHeroPreview(normalizeReport(window.demoReport), heroPreviewContent);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("verity-theme", nextTheme);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runReview();
});

projectTypeInputs.forEach((input) => {
  input.addEventListener("change", updateCustomTypeVisibility);
});

projectFiles.addEventListener("change", updateFileList);
updateCustomTypeVisibility();

async function runReview() {
  startReviewProgress();
  statusSection.classList.remove("hidden");
  reportSection.classList.add("hidden");
  statusSection.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const report = USE_DEMO ? await buildReportFromDemo() : await requestAiReport();
    reportBadge.textContent = USE_DEMO ? "Demo数据" : "AI生成";
    window.VerityRenderer.renderReport(report, reportContent);
    window.VerityRenderer.renderHeroPreview(report, heroPreviewContent);
    stopReviewProgress();
    statusSection.classList.add("hidden");
    reportSection.classList.remove("hidden");
    reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    stopReviewProgress();
    showReviewError();
  }
}

function startReviewProgress() {
  reviewStartedAt = Date.now();
  submitButton.disabled = true;
  submitButton.textContent = "生成中...";
  submitButton.setAttribute("aria-busy", "true");
  statusNote.textContent = reviewHints[0];
  statusTimer.textContent = "已用时 0 秒";
  updateStatusSteps(0);
  clearReviewTimers();

  timerId = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - reviewStartedAt) / 1000);
    statusTimer.textContent = `已用时 ${elapsedSeconds} 秒`;
  }, 1000);

  stepTimerId = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - reviewStartedAt) / 1000);
    const activeIndex = Math.min(statusSteps.length - 1, Math.floor(elapsedSeconds / 4));
    updateStatusSteps(activeIndex);
  }, 800);

  hintTimerId = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - reviewStartedAt) / 1000);
    const hintIndex = Math.min(reviewHints.length - 1, Math.floor(elapsedSeconds / 7));
    statusNote.textContent = reviewHints[hintIndex];
  }, 1000);
}

function stopReviewProgress() {
  clearReviewTimers();
  submitButton.disabled = false;
  submitButton.textContent = "开始 AI 质检";
  submitButton.removeAttribute("aria-busy");
  updateStatusSteps(statusSteps.length - 1);
}

function clearReviewTimers() {
  window.clearInterval(timerId);
  window.clearInterval(stepTimerId);
  window.clearInterval(hintTimerId);
}

function updateStatusSteps(activeIndex) {
  statusSteps.forEach((step, index) => {
    step.classList.toggle("is-done", index < activeIndex);
    step.classList.toggle("is-active", index === activeIndex);
    step.classList.toggle("is-pending", index > activeIndex);
  });
}

async function requestAiReport() {
  if (!WORKER_URL) {
    throw new Error("Worker URL is not configured");
  }

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(await collectProjectPayload())
  });

  if (!response.ok) {
    throw new Error("Worker request failed");
  }

  const report = normalizeReport(await response.json());
  validateReportShape(report);

  return report;
}

async function buildReportFromDemo() {
  const report = normalizeReport(cloneReport(window.demoReport));
  const payload = await collectProjectPayload();

  report.meta.projectName = payload.name || report.meta.projectName;
  report.meta.projectType = payload.type || report.meta.projectType;

  return report;
}

async function collectProjectPayload() {
  const selectedType = document.querySelector("input[name='projectType']:checked").value;
  const customType = customProjectType.value.trim();
  const projectType = selectedType === "其他" && customType ? customType : selectedType;
  const content = document.querySelector("#projectIntro").value.trim();
  const files = await serializeFiles();

  if (!content && files.length === 0) {
    throw new Error("请填写项目简介或上传 DOCX/TXT 材料");
  }

  return {
    type: projectType,
    name: document.querySelector("#projectName").value.trim(),
    content,
    files,
    extra: {
      typeCategory: selectedType,
      customType,
      background: document.querySelector("#projectBackground").value.trim(),
      targetUsers: document.querySelector("#targetUsers").value.trim(),
      solution: document.querySelector("#solution").value.trim(),
      innovation: document.querySelector("#innovation").value.trim(),
      achievement: document.querySelector("#achievement").value.trim(),
      technicalRoute: document.querySelector("#technicalRoute").value.trim(),
      evidence: document.querySelector("#evidence").value.trim()
    }
  };
}

async function serializeFiles() {
  const files = Array.from(projectFiles.files || []);
  const allowedExtensions = [".docx", ".txt"];

  return Promise.all(files.map(async (file) => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new Error("当前仅支持 DOCX 和 TXT 材料");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("单个材料不能超过 5 MB");
    }

    return {
      name: file.name,
      type: file.type || extension,
      size: file.size,
      content: arrayBufferToBase64(await file.arrayBuffer())
    };
  }));
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function updateCustomTypeVisibility() {
  const selectedType = document.querySelector("input[name='projectType']:checked").value;
  const shouldShow = selectedType === "其他";

  customTypeField.classList.toggle("hidden", !shouldShow);
  customProjectType.toggleAttribute("required", shouldShow);
  customProjectType.disabled = !shouldShow;

  if (shouldShow) {
    window.requestAnimationFrame(() => customProjectType.focus());
  }
}

function validateReportShape(report) {
  const requiredKeys = [
    "meta",
    "summary",
    "evaluation",
    "dimensions",
    "strengths",
    "credibilityCheck",
    "risks",
    "judgeQuestions",
    "actionPlan",
    "optimization"
  ];

  const isValid = requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(report, key));

  if (!isValid) {
    throw new Error("Invalid Verity report JSON");
  }
}

function normalizeReport(report = {}) {
  const evaluation = report.evaluation || {};
  const credibilityCheck = report.credibilityCheck || { overall: "warning", items: [] };
  const risks = Array.isArray(report.risks) ? report.risks : deriveRisks(credibilityCheck.items);
  const actionPlan = normalizeActionPlan(report.actionPlan || report.actionList);
  const dimensions = normalizeDimensions(report.dimensions);
  const score = Number.isFinite(Number(evaluation.score)) ? Number(evaluation.score) : 0;
  const strengths = Array.isArray(report.strengths) ? report.strengths : [];
  const questions = Array.isArray(report.judgeQuestions) ? report.judgeQuestions : [];

  return {
    meta: {
      projectName: report.meta?.projectName || "未命名项目",
      projectType: report.meta?.projectType || "未指定",
      reviewMode: report.meta?.reviewMode || "竞赛评审"
    },
    summary: {
      overallComment: report.summary?.overallComment || evaluation.reason || evaluation.status || "材料已完成基础评审，建议结合风险项继续完善。",
      competitiveLevel: report.summary?.competitiveLevel || evaluation.level || evaluation.status || inferLevel(score),
      mainConcern: report.summary?.mainConcern || risks[0]?.risk || risks[0]?.problem || "材料未体现"
    },
    evaluation: {
      score,
      level: evaluation.level || evaluation.status || inferLevel(score),
      reason: evaluation.reason || evaluation.status || "材料已完成基础评审。",
      riskCount: Number.isFinite(Number(evaluation.riskCount)) ? Number(evaluation.riskCount) : risks.length,
      questionCount: Number.isFinite(Number(evaluation.questionCount)) ? Number(evaluation.questionCount) : questions.length,
      suggestionCount: Number.isFinite(Number(evaluation.suggestionCount)) ? Number(evaluation.suggestionCount) : countActions(actionPlan)
    },
    dimensions,
    strengths,
    credibilityCheck: {
      overall: credibilityCheck.overall || "warning",
      items: Array.isArray(credibilityCheck.items) ? credibilityCheck.items : []
    },
    risks,
    judgeQuestions: questions,
    actionPlan,
    optimization: {
      positioning: report.optimization?.positioning || "材料未体现",
      structureAdvice: Array.isArray(report.optimization?.structureAdvice) ? report.optimization.structureAdvice : [],
      rewriteExample: report.optimization?.rewriteExample || "材料未体现"
    },
    ...(report.projectProfile ? { projectProfile: normalizeProjectProfile(report.projectProfile) } : {}),
    ...(report.materialSummary ? { materialSummary: normalizeMaterialSummary(report.materialSummary) } : {}),
    ...(report.evidenceScore ? { evidenceScore: normalizeEvidenceScore(report.evidenceScore) } : {})
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
    understanding: summary.understanding || "材料未体现",
    keyEvidence: Array.isArray(summary.keyEvidence) ? summary.keyEvidence : [],
    criticalMissing: Array.isArray(summary.criticalMissing) ? summary.criticalMissing : []
  };
}

function normalizeEvidenceScore(score = {}) {
  return {
    score: Number.isFinite(Number(score.score)) ? Number(score.score) : 0,
    covered: Array.isArray(score.covered) ? score.covered : [],
    missing: Array.isArray(score.missing) ? score.missing : []
  };
}

function updateFileList() {
  const files = Array.from(projectFiles.files || []);

  fileList.classList.toggle("hidden", files.length === 0);
  fileList.innerHTML = files.map((file) => `
    <li>
      <span aria-hidden="true">✓</span>
      <strong>${escapeHtml(file.name)}</strong>
      <small>${formatFileSize(file.size)}</small>
    </li>
  `).join("");
}

function formatFileSize(size) {
  if (!size) return "待解析";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function normalizeDimensions(dimensions) {
  const names = ["创新性", "用户价值", "技术可信度", "商业价值", "表达完整度"];
  const source = Array.isArray(dimensions) ? dimensions : [];

  return names.map((name, index) => {
    const item = source[index] || source.find((dimension) => dimension?.name === name) || {};
    return {
      name,
      score: Number.isFinite(Number(item.score)) ? Number(item.score) : 0,
      maxScore: Number.isFinite(Number(item.maxScore)) ? Number(item.maxScore) : 20,
      level: item.level || "待评估",
      analysis: item.analysis || "材料未体现",
      evidence: item.evidence || item.suggestion || "材料未体现",
      risk: item.risk || "待核实"
    };
  });
}

function normalizeActionPlan(actionPlan = {}) {
  return ["S", "A", "B"].reduce((result, level) => {
    result[level] = Array.isArray(actionPlan?.[level])
      ? actionPlan[level].map((item) => typeof item === "string" ? { problem: "待明确", reason: "材料未体现", action: item } : {
        problem: item.problem || "待明确",
        reason: item.reason || "材料未体现",
        action: item.action || "材料未体现"
      })
      : [];
    return result;
  }, {});
}

function deriveRisks(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => ["warning", "danger"].includes(item?.status))
    .map((item) => ({
      level: item.status === "danger" ? "high" : "medium",
      title: item.type || "材料风险",
      risk: item.problem || item.content || "材料需要进一步核实",
      evidence: item.content || "材料未体现",
      action: item.suggestion || "补充来源或验证依据"
    }));
}

function countActions(actionPlan) {
  return ["S", "A", "B"].reduce((total, level) => total + (actionPlan[level]?.length || 0), 0);
}

function inferLevel(score) {
  if (score >= 90) return "优秀竞争项目";
  if (score >= 80) return "具备竞争力";
  if (score >= 70) return "基础较好";
  if (score >= 60) return "存在明显短板";
  return "需要重新梳理";
}

function showReviewError() {
  statusSection.classList.add("hidden");
  reportContent.innerHTML = `
    <article class="report-card full error-card">
      <h3>AI评审暂时失败</h3>
      <p>请稍后重试。</p>
    </article>
  `;
  reportSection.classList.remove("hidden");
  reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cloneReport(report) {
  if (window.structuredClone) {
    return structuredClone(report);
  }

  return JSON.parse(JSON.stringify(report));
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☾" : "☀";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "切换浅色模式" : "切换深色模式");
}
