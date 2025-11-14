const charactersData = [
  {
    id: 1,
    name: "狮子",
    avatar: "images/characters/lion-portrait.png",
    portrait: "images/characters/lion-portrait.png",
    // 新增立绘信息
    illustrations: {
      normal: "images/illustrations/lion_normal.png",
      serious: "images/illustrations/lion_serious.png",
      smile: "images/illustrations/lion_smile.png",
    },
    details: {
      age: "35岁",
      position: "栗枫市警察局刑警队长",
      description:
        "经验丰富的刑警队长，以敏锐的狮子直觉著称，没有任何线索能逃脱他的眼睛",
      background:
        "从警12年，破获“栗枫市獭宅水泥砌尸案”、“下城河遗尸案”等多起重大案件，以果断和正义感闻名。\n“刑警的能力不能用侦破数量来简单的概括，要是发生的案子能少一点，那就是最好的了。”",
    },
    encountered: false, // 添加这个属性
  },
  {
    id: 2,
    name: "小牛",
    avatar: "images/characters/xiaoniu-portrait.png",
    portrait: "images/characters/xiaoniu-portrait.png",
    illustrations: {
      normal: "images/illustrations/xiaoniu_normal.png",
      excited: "images/illustrations/xiaoniu_excited.png",
      worried: "images/illustrations/xiaoniu_worried.png",
    },
    details: {
      age: "24岁",
      position: "实习刑警",
      description: "充满热情的新人警官，狮子的徒弟",
      background: "警校优秀毕业生，正在积累实战经验",
    },
    encountered: false,
  },
  {
    id: 3,
    name: "猎豹",
    avatar: "images/characters/liebao-portrait.png",
    portrait: "images/characters/liebao-portrait.png",
    illustrations: {
      normal: "images/illustrations/liebao_normal.png",
      serious: "images/illustrations/liebao_serious.png",
      alert: "images/illustrations/liebao_alert.png",
    },
    details: {
      age: "32岁",
      position: "资深刑警",
      description: "行动迅速，擅长现场勘查",
      background: "特种部队退役，拥有出色的格斗和追踪能力",
    },
    encountered: false,
  },
  // ... 其他角色
];
