// 序章脚本数据
const prologueScript = [
  {
    type: "narrator",
    content:
      "今天你一如往常的来到警局上班，栗枫市的冬天简直冷到骨子里，不知道今天又是怎样的一天呢？",
    interaction: "push-door",
    scene: "police-station-outside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content: "（急急冲上来）师傅你来了！",
    portrait: "images/characters/xiaoniu-portrait.png",
    characterId: 2, // 第一个遇到的角色，触发教学指引
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "（意外）诶？猎豹哪里去了？怎么只有你们在局里？",
    portrait: "images/characters/lion-portrait.png",
    characterId: 1, // 玩家角色，已经默认解锁
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content:
      "师傅我正要说呢！就在刚刚接到电话，豹哥就出警去了！有目击者称在白马湖发现尸体！马姐也跟着去了！",
    portrait: "images/characters/xiaoniu-portrait.png",
    next: "auto",
    scene: "police-station-inside",
    discoverClues: [3], // 新增：发现线索3：电话报警记录
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "嗯嗯情况怎么样？",
    portrait: "images/characters/lion-portrait.png",
    next: "phone_ring",
    scene: "police-station-inside",
  },
  {
    type: "narrator",
    content: "（没等回答，桌子上座机响了起来。）",
    interaction: "answer_phone",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "猎豹",
    content:
      "队长！情况不简单，这里发现了一处打斗现场。白马河环境复杂，申请支援！",
    portrait: "images/characters/liebao-portrait.png",
    characterId: 3, // 第三个角色
    next: "auto",
    scene: "police-station-inside",
    discoverClues: [1],
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "好，我马上出发！",
    portrait: "images/characters/lion-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "thought",
    speaker: "狮子",
    content: "小牛还是新人，需要锻炼一下，带着一起吧",
    portrait: "images/characters/lion-portrait.png",
    next: "take_xiaoniu",
    scene: "police-station-inside",
  },
  {
    type: "narrator",
    content: "（点击小牛）",
    interaction: "click_xiaoniu",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "走，咱们一起。",
    portrait: "images/characters/lion-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content: "是！",
    portrait: "images/characters/xiaoniu-portrait.png",
    next: "complete",
    scene: "police-station-inside",
  },
];
