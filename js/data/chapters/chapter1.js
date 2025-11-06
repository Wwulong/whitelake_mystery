const chapter1Script = [
  {
    type: "narrator",
    content: "你们驱车来到白马湖边，寒冷的湖风吹拂着脸庞",
    scene: "white-horse-lake",
    discoverClues: [1], // 发现现场打斗痕迹
  },
  {
    type: "dialog",
    speaker: "猎豹",
    content: "队长，这里！发现受害者的身份证",
    portrait: "images/characters/liebao-portrait.png",
    next: "auto",
    discoverClues: [4], // 发现受害者身份
  },
  // ... 第一章其他步骤
];
