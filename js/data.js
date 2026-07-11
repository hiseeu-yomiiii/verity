const demoReport = {
  meta: {
    projectName: "面向乡村文旅的智能服务平台",
    projectType: "挑战杯"
  },

  evaluation: {
    score: 82,
    status: "建议优化后提交",
    riskCount: 3,
    questionCount: 5,
    suggestionCount: 8
  },

  dimensions: [
    {
      name: "问题洞察力",
      score: 18,
      maxScore: 20,
      analysis: "能抓住真实场景中的痛点，问题描述具备公共价值和评审关注度。",
      risk: "部分痛点仍停留在概括层面，缺少样本、访谈或场景证据支撑。",
      suggestion: "补充用户调研、政策依据或典型案例，让问题更具体、更可验证。"
    },
    {
      name: "方案竞争力",
      score: 16,
      maxScore: 20,
      analysis: "方案结构完整，能够回应项目简介中的主要问题。",
      risk: "与已有工具或常规服务的差异还不够锋利。",
      suggestion: "用对比表说明目标用户、功能边界和关键优势。"
    },
    {
      name: "创新可信度",
      score: 15,
      maxScore: 20,
      analysis: "创新点有表达空间，但目前更像功能组合而非明确突破。",
      risk: "容易被评委追问“新在哪里”和“为什么可验证”。",
      suggestion: "将创新点拆成方法创新、应用创新和机制创新，并配对应证据。"
    },
    {
      name: "落地可行性",
      score: 17,
      maxScore: 20,
      analysis: "实施路径较清楚，适合继续做原型验证和场景试点。",
      risk: "资源需求、执行周期和风险预案还不充分。",
      suggestion: "加入阶段计划、合作资源和最小可行验证路径。"
    },
    {
      name: "材料说服力",
      score: 16,
      maxScore: 20,
      analysis: "整体叙述完整，有形成正式申报材料的基础。",
      risk: "论证层级略平，关键结论缺少高亮和证据回扣。",
      suggestion: "把材料改成“问题-证据-方案-成果-价值”的递进结构。"
    }
  ],

  credibilityCheck: {
    overall: "warning",
    items: [
      {
        type: "scope",
        status: "safe",
        content: "项目类型、项目目标和基本应用场景已表达清楚。",
        problem: "暂无明显缺口。",
        suggestion: "保持当前表述，并在摘要中进一步压缩核心价值。"
      },
      {
        type: "data",
        status: "warning",
        content: "目标用户规模、调研样本和使用频率需要提供来源。",
        problem: "数据依据较弱，容易被追问真实性。",
        suggestion: "补充样本数量、访谈对象、调研时间或公开数据来源。"
      },
      {
        type: "innovation",
        status: "danger",
        content: "创新点如果只写“AI 赋能”，容易被认为表述空泛。",
        problem: "创新表达过于泛化，缺少可比较对象。",
        suggestion: "明确技术路径、应用机制或服务模式上的差异。"
      },
      {
        type: "evidence",
        status: "optimize",
        content: "建议增加已有成果截图、访谈摘录或试点反馈摘要。",
        problem: "成果证明材料不够直观。",
        suggestion: "用图片、表格或短证言提高材料可信度。"
      }
    ]
  },

  judgeQuestions: [
    {
      question: "你们如何证明这个问题是真实存在且值得解决的？",
      reason: "评委会优先判断问题是否真实、是否有公共价值。",
      prepare: "准备调研数据、访谈摘录和典型场景说明。"
    },
    {
      question: "与已有平台或同类项目相比，你们的不可替代性是什么？",
      reason: "方案竞争力需要通过对比建立。",
      prepare: "准备竞品对比表，突出目标用户和功能边界差异。"
    },
    {
      question: "项目当前有哪些真实用户或实践场景验证？",
      reason: "落地能力是竞赛项目的重要评分点。",
      prepare: "准备试点记录、反馈截图或合作单位证明。"
    },
    {
      question: "如果数据不足或技术效果不稳定，项目如何继续推进？",
      reason: "评委会关注风险预案和可持续推进能力。",
      prepare: "准备阶段计划、备选方案和后续验证路径。"
    },
    {
      question: "项目的核心创新能否用一句话讲清楚？",
      reason: "表达效率会影响评委第一印象。",
      prepare: "准备一句“为谁解决什么问题、为什么更好”的版本。"
    }
  ],

  actionList: {
    S: [
      "补充 3-5 条可追溯证据，包括调研数据、访谈记录或实践反馈。",
      "重写创新点，避免泛化表达，改成可验证、可比较的具体机制。"
    ],
    A: [
      "优化项目简介开头，让评委更快理解问题、对象和方案价值。",
      "增加竞品或同类方案对比，突出差异化优势。"
    ],
    B: [
      "统一材料中的项目名称、目标用户和成果表述。",
      "压缩重复背景描述，把篇幅留给证据和成果。"
    ]
  },

  optimization: {
    positioning: "项目应定位为面向明确场景的材料质检与决策辅助工具，而不是泛泛的 AI 平台。",
    structureAdvice: [
      "开头先说明目标用户和真实问题，再进入解决方案。",
      "创新点与证据材料一一对应，避免只写概念。",
      "成果部分按“已完成、已验证、待推进”分层展示。"
    ],
    rewriteExample: "本项目面向竞赛与科研申报场景，帮助团队在提交前识别材料中的逻辑断点、创新表达风险和证据缺口，从而提升项目材料的评审通过率。"
  }
};

window.demoReport = demoReport;
