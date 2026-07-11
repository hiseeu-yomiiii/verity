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

function renderHeroPreview(report, container) {
  const { evaluation } = report;

  container.innerHTML = `
    <div class="preview-header">
      <span class="report-dot"></span>
      <strong>AI评审报告</strong>
    </div>
    <div class="preview-score">
      <span>项目竞争力</span>
      <div>
        <strong>${evaluation.score}</strong>
        <em>/100</em>
      </div>
    </div>
    <dl class="preview-metrics">
      ${renderMetric("风险发现", `${evaluation.riskCount}项`)}
      ${renderMetric("评委追问", `${evaluation.questionCount}个`)}
      ${renderMetric("修改建议", `${evaluation.suggestionCount}条`)}
    </dl>
  `;
}

function renderReport(report, container) {
  container.innerHTML = `
    ${renderScoreSummary(report)}
    ${renderDimensions(report.dimensions)}
    ${renderCredibility(report.credibilityCheck)}
    ${renderJudgeQuestions(report.judgeQuestions)}
    ${renderActionList(report.actionList)}
    ${renderOptimization(report.optimization)}
  `;
}

function renderScoreSummary(report) {
  const { evaluation } = report;

  return `
    <article class="report-card score-card">
      <div class="score-number">
        <strong>${evaluation.score}</strong>
        <span>/100</span>
      </div>
      <div>
        <p class="score-kicker">项目竞争力</p>
        <h3>综合评分</h3>
        <p class="verdict">${evaluation.status}</p>
        <dl class="score-breakdown">
          ${renderMetric("风险发现", `${evaluation.riskCount}项`)}
          ${renderMetric("评委追问", `${evaluation.questionCount}个`)}
          ${renderMetric("修改建议", `${evaluation.suggestionCount}条`)}
        </dl>
      </div>
    </article>

    <article class="report-card">
      <h3>报告摘要</h3>
      <p class="impression">
        当前项目综合得分为 ${evaluation.score}/100，系统建议：${evaluation.status}。
        本轮识别出 ${evaluation.riskCount} 项风险、${evaluation.questionCount} 个评委可能追问和 ${evaluation.suggestionCount} 条修改建议。
      </p>
    </article>
  `;
}

function renderDimensions(dimensions) {
  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>五维评分卡</h3>
        <span class="report-badge">分数 / 分析 / 风险 / 建议</span>
      </div>
      <div class="dimension-grid">
        ${dimensions.map(renderDimension).join("")}
      </div>
    </article>
  `;
}

function renderDimension(item) {
  return `
    <section class="dimension-card">
      <h4>${item.name}</h4>
      <div class="dimension-score">
        <strong>${item.score}</strong>
        <span>/${item.maxScore}</span>
      </div>
      <dl class="detail-list">
        ${renderDetail("分析", item.analysis)}
        ${renderDetail("风险", item.risk)}
        ${renderDetail("建议", item.suggestion)}
      </dl>
    </section>
  `;
}

function renderCredibility(credibilityCheck) {
  return `
    <article class="report-card full">
      <div class="card-title-row">
        <h3>材料可信度扫描</h3>
        <span class="status-pill ${statusClassMap[credibilityCheck.overall] || "pending"}">
          ${statusLabelMap[credibilityCheck.overall] || "待核实"}
        </span>
      </div>
      <ul class="scan-grid">
        ${credibilityCheck.items.map(renderCredibilityItem).join("")}
      </ul>
    </article>
  `;
}

function renderCredibilityItem(item) {
  const statusClass = statusClassMap[item.status] || "advice";
  const statusLabel = statusLabelMap[item.status] || "优化建议";

  return `
    <li class="scan-item">
      <span class="status-pill ${statusClass}">${statusLabel}</span>
      <div>
        <strong>${item.content}</strong>
        <p>${item.problem}</p>
        <p>${item.suggestion}</p>
      </div>
    </li>
  `;
}

function renderJudgeQuestions(questions) {
  return `
    <article class="report-card">
      <h3>评委可能追问</h3>
      <ul class="question-list">
        ${questions.map((item) => `
          <li class="question-item">
            <strong>${item.question}</strong>
            <p>${item.reason}</p>
            <p>${item.prepare}</p>
          </li>
        `).join("")}
      </ul>
    </article>
  `;
}

function renderActionList(actionList) {
  return `
    <article class="report-card">
      <h3>S/A/B 修改行动清单</h3>
      <ul class="action-list">
        ${renderActionGroup("S", actionList.S)}
        ${renderActionGroup("A", actionList.A)}
        ${renderActionGroup("B", actionList.B)}
      </ul>
    </article>
  `;
}

function renderActionGroup(level, items) {
  return items.map((text) => `
    <li class="action-item">
      <span class="action-level">${level}</span>
      <span>${text}</span>
    </li>
  `).join("");
}

function renderOptimization(optimization) {
  return `
    <article class="report-card full">
      <h3>优化建议</h3>
      <div class="optimization-block">
        <h4>定位建议</h4>
        <p>${optimization.positioning}</p>
      </div>
      <ul class="suggestion-list">
        ${optimization.structureAdvice.map((suggestion) => `<li>${suggestion}</li>`).join("")}
      </ul>
      <div class="rewrite-example">
        <h4>示例改写</h4>
        <p>${optimization.rewriteExample}</p>
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

window.VerityRenderer = {
  renderHeroPreview,
  renderReport
};
