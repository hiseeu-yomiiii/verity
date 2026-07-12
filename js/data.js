const demoReport = {
  meta: {
    projectName: "面向乡村文旅的智能服务平台",
    projectType: "挑战杯",
    reviewMode: "竞赛评审"
  },

  summary: {
    overallComment: "项目方向具备公共价值和展示潜力，能回应乡村文旅数字化服务中的真实需求。当前材料已经形成基本方案，但证据链、创新差异和落地验证仍需要进一步补强。",
    competitiveLevel: "具备竞争力",
    mainConcern: "材料对目标用户调研、试点反馈和技术实现细节呈现不足，评委可能会追问项目是否已经经过真实场景验证。"
  },

  evaluation: {
    score: 82,
    level: "具备竞争力",
    reason: "项目方向较好，结构完整，但仍存在证据不足、创新表达不够锋利和成果展示不够直观的问题。",
    riskCount: 4,
    questionCount: 5,
    suggestionCount: 7
  },

  dimensions: [
    {
      name: "创新性",
      score: 17,
      maxScore: 20,
      level: "较强",
      analysis: "项目将文旅服务、用户需求识别和智能推荐结合，具备一定应用创新空间。",
      evidence: "材料体现了平台化服务思路，但尚未充分说明与已有文旅平台的关键差异。",
      risk: "如果只停留在“AI赋能文旅”的概念表达，容易被认为创新点不够具体。"
    },
    {
      name: "用户价值",
      score: 16,
      maxScore: 20,
      level: "较好",
      analysis: "目标场景明确，面向乡村游客、地方运营方或文旅管理者均有潜在价值。",
      evidence: "材料已描述服务对象和使用场景，但调研样本、访谈反馈和真实需求证据不足。",
      risk: "用户痛点主要来自团队判断，缺少可追溯的调研材料会削弱说服力。"
    },
    {
      name: "技术可信度",
      score: 16,
      maxScore: 20,
      level: "较好",
      analysis: "技术方向合理，适合通过原型、数据处理流程和推荐机制进行展示。",
      evidence: "材料体现了功能设想，但 Demo、模型效果、数据来源和系统架构展示仍不充分。",
      risk: "评委可能追问核心算法或智能服务是否已经实现，而不是停留在产品设想。"
    },
    {
      name: "商业价值",
      score: 17,
      maxScore: 20,
      level: "较强",
      analysis: "项目具备文旅推广、地方服务和实践转化价值，适合结合地方试点说明推广路径。",
      evidence: "材料体现了乡村文旅场景，但合作资源、试点范围和可复制路径需要进一步展开。",
      risk: "如果没有地方资源或试点反馈支撑，推广价值会显得偏概念。"
    },
    {
      name: "表达完整度",
      score: 16,
      maxScore: 20,
      level: "较好",
      analysis: "材料基本覆盖背景、问题、方案和价值，具备申报基础。",
      evidence: "主要模块已有雏形，但重点略分散，证据、成果和创新之间的对应关系还不够清楚。",
      risk: "评委可能难以在短时间内抓住项目最核心的竞争点。"
    }
  ],

  strengths: [
    {
      title: "选题具有公共价值",
      description: "乡村文旅数字化和地方服务能力提升是较容易被竞赛评委理解的方向。",
      evidence: "材料已明确项目面向乡村文旅场景。"
    },
    {
      title: "应用场景清晰",
      description: "项目能够围绕游客服务、资源展示、路线推荐或地方运营形成具体应用入口。",
      evidence: "材料体现了智能服务平台的基本形态。"
    },
    {
      title: "具备继续打磨为竞赛项目的基础",
      description: "只要补齐调研证据、试点结果和技术原型，项目竞争力会明显提升。",
      evidence: "当前已有项目背景、方案和价值表达。"
    }
  ],

  credibilityCheck: {
    overall: "warning",
    items: [
      {
        type: "data",
        status: "warning",
        content: "目标用户规模、调研样本和使用频率需要提供来源。",
        problem: "材料未体现具体样本量、调研时间或公开数据来源。",
        suggestion: "补充问卷数量、访谈对象、调研地点和结论摘要。"
      },
      {
        type: "source",
        status: "warning",
        content: "“用户需求明显”“地方推广价值较高”等判断需要依据。",
        problem: "判断可能成立，但当前缺少来源说明。",
        suggestion: "用访谈摘录、政策文件或地方案例支撑结论。"
      },
      {
        type: "expression",
        status: "optimize",
        content: "避免使用“首创”“领先”“填补空白”等绝对化表达。",
        problem: "若无检索或对比依据，绝对化表述容易被质疑。",
        suggestion: "改为“在某一场景下形成差异化服务机制”。"
      },
      {
        type: "achievement",
        status: "danger",
        content: "已有成果、原型和试点反馈需要明确展示。",
        problem: "材料未体现可验证成果，可能影响技术可信度和落地判断。",
        suggestion: "补充原型截图、试点记录、用户反馈或合作证明。"
      }
    ]
  },

  risks: [
    {
      level: "high",
      type: "evidence",
      title: "调研证据不足",
      description: "材料尚未说明目标用户需求来自多少样本、哪些对象和什么场景。",
      suggestion: "补充至少 3 类证据：问卷统计、访谈摘录、典型用户场景。"
    },
    {
      level: "medium",
      type: "innovation",
      title: "创新差异表达不够具体",
      description: "当前创新更像功能组合，尚未清楚说明区别于普通文旅平台的机制。",
      suggestion: "增加对比表，明确数据来源、推荐逻辑、服务对象和运营机制差异。"
    },
    {
      level: "medium",
      type: "technical",
      title: "技术实现路径需要更可验证",
      description: "如果没有 Demo 或流程图，评委难以判断智能服务是否已经落地。",
      suggestion: "补充系统架构图、核心流程、原型截图和最小可行验证结果。"
    },
    {
      level: "low",
      type: "expression",
      title: "摘要表达需要更聚焦",
      description: "材料有多个价值点，但第一印象不够集中。",
      suggestion: "把开头改成“为谁、解决什么问题、凭什么更好”的一句话。"
    }
  ],

  judgeQuestions: [
    {
      question: "你们如何证明乡村文旅服务中的这个痛点是真实存在的？",
      whyAsk: "评委需要判断问题不是团队主观设想，而是来自真实用户或地方场景。",
      recommendedAnswer: "准备问卷样本、访谈对象、调研地点和一两个具体用户故事。"
    },
    {
      question: "与已有文旅平台相比，你们的不可替代性是什么？",
      whyAsk: "竞赛评委会重点追问创新差异和竞争力。",
      recommendedAnswer: "用对比表说明目标用户、数据来源、推荐机制和地方适配方式。"
    },
    {
      question: "项目目前是否有 Demo、试点或用户反馈？",
      whyAsk: "技术可信度和落地可行性需要可展示成果支撑。",
      recommendedAnswer: "准备原型截图、测试记录、反馈摘要或合作单位证明。"
    },
    {
      question: "如果推广到其他乡村，哪些条件必须具备？",
      whyAsk: "评委会关注项目是否可复制，而不是只适合单一案例。",
      recommendedAnswer: "说明数据采集、地方资源、运营人员和平台部署的基本条件。"
    },
    {
      question: "项目最核心的创新点能否用一句话讲清楚？",
      whyAsk: "评委第一印象往往取决于团队能否快速讲清竞争点。",
      recommendedAnswer: "准备一句聚焦版本：面向某类用户，在某个场景下，用某种机制提升某项体验。"
    }
  ],

  actionPlan: {
    S: [
      {
        problem: "调研证据不足",
        reason: "没有样本、访谈或场景证据时，评委难以确认问题真实性。",
        action: "补充问卷数量、访谈对象、调研时间、关键结论，并在材料中引用。"
      },
      {
        problem: "已有成果展示不足",
        reason: "缺少 Demo、截图或试点反馈会削弱技术可信度。",
        action: "加入原型截图、核心流程图和至少一条真实反馈或测试记录。"
      }
    ],
    A: [
      {
        problem: "创新点表达偏概念",
        reason: "“智能平台”“AI赋能”容易被认为是常规包装。",
        action: "用对比表写清与已有文旅平台在数据、机制、对象上的差异。"
      },
      {
        problem: "推广路径不够清楚",
        reason: "项目价值需要从单点场景延伸到可复制路径。",
        action: "按“试点村镇-区域复制-平台化运营”补充推广阶段。"
      }
    ],
    B: [
      {
        problem: "摘要重点不够集中",
        reason: "评委短时间内需要快速抓住项目亮点。",
        action: "将项目简介开头改成“目标用户+核心痛点+解决机制+预期价值”。"
      },
      {
        problem: "材料模块之间衔接略弱",
        reason: "背景、创新、成果之间没有形成强证据链。",
        action: "按“问题-证据-方案-验证-价值”的顺序重排材料。"
      }
    ]
  },

  optimization: {
    positioning: "建议将项目定位为“面向乡村文旅场景的智能服务与运营辅助平台”，重点突出真实需求、地方适配和可复制推广价值。",
    rewriteExample: "本项目面向乡村文旅服务场景，针对游客获取信息分散、地方资源展示不足和运营反馈滞后的问题，构建智能服务平台，通过需求识别、路线推荐和反馈收集机制，帮助地方提升文旅服务效率与游客体验。"
  }
};

window.demoReport = demoReport;
