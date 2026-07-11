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

const reviewHints = [
  "AI 正在读取项目材料并组织评分依据，请稍候。",
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

window.VerityRenderer.renderHeroPreview(window.demoReport, heroPreviewContent);

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

updateCustomTypeVisibility();

async function runReview() {
  startReviewProgress();
  statusSection.classList.remove("hidden");
  reportSection.classList.add("hidden");
  statusSection.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const report = USE_DEMO ? buildReportFromDemo() : await requestAiReport();
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
    body: JSON.stringify(collectProjectPayload())
  });

  if (!response.ok) {
    throw new Error("Worker request failed");
  }

  const report = await response.json();
  validateReportShape(report);

  return report;
}

function buildReportFromDemo() {
  const report = cloneReport(window.demoReport);
  const payload = collectProjectPayload();

  report.meta.projectName = payload.name || report.meta.projectName;
  report.meta.projectType = payload.type || report.meta.projectType;

  return report;
}

function collectProjectPayload() {
  const selectedType = document.querySelector("input[name='projectType']:checked").value;
  const customType = customProjectType.value.trim();
  const projectType = selectedType === "其他" && customType ? customType : selectedType;

  return {
    type: projectType,
    name: document.querySelector("#projectName").value.trim(),
    content: document.querySelector("#projectIntro").value.trim(),
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
    "evaluation",
    "dimensions",
    "credibilityCheck",
    "judgeQuestions",
    "actionList",
    "optimization"
  ];

  const isValid = requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(report, key));

  if (!isValid) {
    throw new Error("Invalid Verity report JSON");
  }
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
