const statusLabelMap = {
  safe: "已确认",
  warning: "待核实",
  danger: "高风险",
  optimize: "优化建议"
};

const statusClassMap = {
  safe: "confirmed",
  warning: "pending",
  danger: "risk",
  optimize: "advice"
};

const riskLevelLabelMap = {
  high: "高风险",
  medium: "中风险",
  low: "低风险"
};

function renderHeroPreview(report, container) {
  const evaluation = report.evaluation || {};

  container.innerHTML = `
    <div class="preview-header">
      <span class="report-dot"></span>
      <strong>AI评审报告</strong>
    </div>
    <div class="preview-score">
      <span>项目竞争力</span>
      <div>
        <strong>${fallback(evaluation.score, 0)}</strong>
        <em>/100</em>
      </div>
    </div>
    <dl class="preview-metrics">
      ${renderMetric("风险发现", `${fallback(evaluation.riskCount, 0)}项`)}
      ${renderMetric("评委追问", `${fallback(evaluation.questionCount, 0)}个`)}
      ${renderMetric("修改建议", `${fallback(evaluation.suggestionCount, 0)}条`)}
    </dl>
  `;
}

function renderReport(report, container) {
  container.innerHTML = `
    ${renderScoreSummary(report)}
    ${renderSummary(report.summary)}
    ${renderProjectProfile(report.projectProfile)}
    ${renderMaterialSummary(report.materialSummary)}
    ${renderEvidenceScore(report.evidenceScore)}
    ${renderDimensions(report.dimensions)}
    ${renderStrengths(report.strengths)}
    ${renderCredibility(report.credibilityCheck)}
    ${renderRisks(report.risks)}
    ${renderJudgeQuestions(report.judgeQuestions)}
    ${renderActionPlan(report.actionPlan || report.actionList)}
    ${renderOptimization(report.optimization)}
  `;
}

function renderProjectProfile(profile) {
  if (!profile || !profileHasContent(profile)) {
    return "";
  }

  const basicInfo = profile.basicInfo || {};
  const problem = profile.problemAnalysis || {};
  const solution = profile.solution || {};
  const technology = profile.technology || {};
  const evidence = profile.evidence || {};

  return `
    <article class="report-card full profile-card">
      <div class="card-title-row">
        <div>
          <p class="eyebrow">Project Profile</p>
          <h3>项目理解摘要</h3>
        </div>
        <span class="report-badge">Verity 已识别</span>
      </div>
      <div class="profile-grid">
        ${renderProfileField("项目名称", basicInfo.name)}
        ${renderProfileField("项目领域", basicInfo.field)}
        ${renderProfileField("核心问题", problem.painPoint || problem.background)}
        ${renderProfileField("目标用户", problem.targetUsers)}
        ${renderProfileField("解决方案", solution.overview)}
        ${renderProfileField("技术路线", technology.technicalRoute)}
        ${renderProfileField("已有成果", evidence.existingResults || technology.implementationStatus)}
        ${renderProfileField("关键缺口", formatList(evidence.missingEvidence))}
      </div>
    </article>
  `;
}

function renderMaterialSummary(summary) {
  if (!summary || !summary.understanding) {
    return "";
  }

  return `
    <article class="report-card full material-summary-card">
      <h3>材料理解摘要</h3>
      <p class="impression">${fallback(summary.understanding, "材料未体现")}</p>
      <div class="summary-columns">
        <div>
          <h4>已识别证据</h4>
          ${renderTagList(summary.keyEvidence, "safe", "材料未体现")}
        </div>
        <div>
          <h4>关键缺口</h4>
          ${renderTagList(summary.criticalMissing, "warning", "材料未体现")}
        </div>
      </div>
    </article>
  `;
}

function renderEvidenceScore(evidenceScore) {
  if (!evidenceScore || !Number.isFinite(Number(evidenceScore.score))) {
    return "";
  }

  const score = Math.max(0, Math.min(100, Number(evidenceScore.score)));

  return `
    <article class="report-card full evidence-score-card">
      <div class="card-title-row">
        <div>
          <p class="eyebrow">Evidence Coverage</p>
          <h3>证据覆盖度</h3>
        </div>
        <div class="coverage-score"><strong>${score}</strong><span>%</span></div>
      </div>
      <div class="coverage-track" aria-label="材料完整度 ${score}%">
        <span style="width: ${score}%"></span>
      </div>
      <div class="summary-columns">
        <div>
          <h4>已有证据</h4>
          ${renderTagList(evidenceScore.covered, "safe", "材料未体现")}
        </div>
        <div>
          <h4>待补充</h4>
          ${renderTagList(evidenceScore.missing, "warning", "材料未体现")}
        </div>
      </div>
    </article>
  `;
}

function renderProfileField(label, value) {
  if (!value) return "";

  return `
    <div class="profile-field">
      <dt>${label}</dt>
      <dd>${fallback(value, "材料未体现")}</dd>
    </div>
  `;
}

function renderTagList(items, tone, emptyText) {
  const list = safeArray(items);

  if (!list.length) {
    return `<p class="empty-inline">${emptyText}</p>`;
  }

  return `<ul class="tag-list ${tone}">${list.map((item) => `<li>${fallback(item, emptyText)}</li>`).join("")}</ul>`;
}

function profileHasContent(profile) {
  return Object.values(profile || {}).some((section) => {
    if (!section || typeof section !== "object") return Boolean(section);
    return Object.values(section).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value));
  });
}

function formatList(value) {
  return Array.isArray(value) ? value.join("、") : value;
}

function renderScoreSummary(report) {
  const evaluation = report.evaluation || {};

  return `
    <article class="report-card score-card">
      <div class="score-number">
        <strong>${fallback(evaluation.score, 0)}</strong>
        <span>/100</span>
      </div>
      <div>
        <p class="score-kicker">项目竞争力</p>
        <h3>综合评分</h3>
        <p class="verdict">${fallback(evaluation.level || evaluation.status, "建议优化后提交")}</p>
        <p class="score-reason">${fallback(evaluation.reason, "")}</p>
        <dl class="score-breakdown">
          ${renderMetric("风险发现", `${fallback(evaluation.riskCount, 0)}项`)}
          ${renderMetric("评委追问", `${fallback(evaluation.questionCount, 0)}个`)}
          ${renderMetric("修改建议", `${fallback(evaluation.suggestionCount, 0)}条`)}
        </dl>
      </div>
    </article>
  `;
}

function renderSummary(summary = {}) {
  return `
    <article class="report-card summary-card">
      <h3>评委综合评价</h3>
      <p class="impression">${fallback(summary.overallComment, "材料未体现")}</p>
      <dl class="detail-list">
        ${renderDetail("竞争力判断", fallback(summary.competitiveLevel, "材料未体现"))}
        ${renderDetail("主要关注点", fallback(summary.mainConcern, "材料未体现"))}
      </dl>
    </article>
  `;
}

function renderDimensions(dimensions) {
  const items = safeArray(dimensions);

  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>五维评分卡</h3>
        <span class="report-badge">分数 / 分析 / 依据 / 风险</span>
      </div>
      <div class="dimension-grid">
        ${items.map(renderDimension).join("") || renderEmpty("材料未体现五维评分。")}
      </div>
    </article>
  `;
}

function renderDimension(item = {}) {
  return `
    <section class="dimension-card">
      <div class="dimension-title-row">
        <h4>${fallback(item.name, "未命名维度")}</h4>
        ${item.level ? `<span class="report-badge">${item.level}</span>` : ""}
      </div>
      <div class="dimension-score">
        <strong>${fallback(item.score, 0)}</strong>
        <span>/${fallback(item.maxScore, 20)}</span>
      </div>
      <dl class="detail-list">
        ${renderDetail("分析", fallback(item.analysis, "材料未体现"))}
        ${renderDetail("依据", fallback(item.evidence || item.suggestion, "材料未体现"))}
        ${renderDetail("风险", fallback(item.risk, "材料未体现"))}
      </dl>
    </section>
  `;
}

function renderStrengths(strengths) {
  const items = safeArray(strengths);

  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>项目优势</h3>
        <span class="report-badge">${items.length} 项</span>
      </div>
      <ul class="strength-list">
        ${items.map(renderStrength).join("") || renderEmpty("材料未体现明确优势。")}
      </ul>
    </article>
  `;
}

function renderStrength(item = {}) {
  return `
    <li class="strength-item">
      <strong>${fallback(item.title, "材料未体现")}</strong>
      <p>${fallback(item.description, "材料未体现")}</p>
      <span>${fallback(item.evidence, "材料未体现")}</span>
    </li>
  `;
}

function renderCredibility(credibilityCheck = {}) {
  const items = safeArray(credibilityCheck.items);

  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>证据完整度分析</h3>
        <span class="status-pill ${statusClassMap[credibilityCheck.overall] || "pending"}">
          ${statusLabelMap[credibilityCheck.overall] || "待核实"}
        </span>
      </div>
      <ul class="scan-grid">
        ${items.map(renderCredibilityItem).join("") || renderEmpty("材料未体现可信度扫描结果。")}
      </ul>
    </article>
  `;
}

function renderCredibilityItem(item = {}) {
  const statusClass = statusClassMap[item.status] || "advice";
  const statusLabel = statusLabelMap[item.status] || "优化建议";

  return `
    <li class="scan-item">
      <span class="status-pill ${statusClass}">${statusLabel}</span>
      <div>
        <strong>${fallback(item.content, "材料未体现")}</strong>
        <p>${fallback(item.problem, "材料未体现")}</p>
        <p>${fallback(item.suggestion, "建议补充依据")}</p>
      </div>
    </li>
  `;
}

function renderRisks(risks) {
  const items = safeArray(risks);

  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>核心风险</h3>
        <span class="report-badge">${items.length} 项</span>
      </div>
      <ul class="risk-list">
        ${items.map(renderRisk).join("") || renderEmpty("材料未体现核心风险。")}
      </ul>
    </article>
  `;
}

function renderRisk(item = {}) {
  const level = item.level || "medium";

  return `
    <li class="risk-item">
      <span class="risk-level ${level}">${riskLevelLabelMap[level] || "中风险"}</span>
      <div>
        <strong>${fallback(item.title, "材料未体现")}</strong>
        <p>${fallback(item.description, "材料未体现")}</p>
        <p>${fallback(item.suggestion, "建议补充依据")}</p>
      </div>
    </li>
  `;
}

function renderJudgeQuestions(questions) {
  const items = safeArray(questions);

  return `
    <article class="report-card">
      <h3>评委可能追问</h3>
      <ul class="question-list">
        ${items.map(renderJudgeQuestion).join("") || renderEmpty("材料未体现评委追问。")}
      </ul>
    </article>
  `;
}

function renderJudgeQuestion(item = {}) {
  return `
    <li class="question-item">
      <strong>${fallback(item.question, "材料未体现")}</strong>
      <p><b>为什么会问：</b>${fallback(item.whyAsk || item.reason, "材料未体现")}</p>
      <p><b>建议准备：</b>${fallback(item.recommendedAnswer || item.prepare, "材料未体现")}</p>
    </li>
  `;
}

function renderActionPlan(actionPlan = {}) {
  return `
    <article class="report-card">
      <h3>S/A/B 修改行动清单</h3>
      <ul class="action-list">
        ${renderActionGroup("S", actionPlan.S)}
        ${renderActionGroup("A", actionPlan.A)}
        ${renderActionGroup("B", actionPlan.B)}
      </ul>
    </article>
  `;
}

function renderActionGroup(level, items) {
  return safeArray(items).map((item) => {
    const action = typeof item === "string"
      ? { problem: item, reason: "", action: item }
      : item || {};

    return `
      <li class="action-item">
        <span class="action-level">${level}</span>
        <div class="action-detail">
          <strong>${fallback(action.problem, "材料未体现")}</strong>
          ${action.reason ? `<p>${fallback(action.reason, "")}</p>` : ""}
          <p>${fallback(action.action, "建议明确修改动作")}</p>
        </div>
      </li>
    `;
  }).join("");
}

function renderOptimization(optimization = {}) {
  const structureAdvice = safeArray(optimization.structureAdvice);

  return `
    <article class="report-card full">
      <h3>优化建议</h3>
      <div class="optimization-block">
        <h4>定位建议</h4>
        <p>${fallback(optimization.positioning, "材料未体现")}</p>
      </div>
      ${structureAdvice.length ? `
        <ul class="suggestion-list">
          ${structureAdvice.map((suggestion) => `<li>${fallback(suggestion, "材料未体现")}</li>`).join("")}
        </ul>
      ` : ""}
      <div class="rewrite-example">
        <h4>示例改写</h4>
        <p>${fallback(optimization.rewriteExample, "材料未体现")}</p>
      </div>
    </article>
  `;
}

function renderMetric(label, value) {
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderDetail(label, value) {
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderEmpty(text) {
  return `<li class="empty-state">${text}</li>`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function fallback(value, defaultValue) {
  if (value === 0) {
    return 0;
  }

  const output = value || defaultValue;
  return String(output).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

window.VerityRenderer = {
  renderHeroPreview,
  renderReport
};
