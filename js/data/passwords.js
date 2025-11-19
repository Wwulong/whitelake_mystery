// js/data/passwords.js - 密码系统数据
//type: "achievement"  // 成就类密码
//type: "progress"     // 进度统计类密码
//type: "secret"       // 秘密/彩蛋类密码
//type: "hint"         // 提示类密码
//type: "easterEgg"    // 彩蛋类密码
const passwordData = {
  // 全局通用密码
  global: {
    showmetruth: {
      message: "🔍 侦探模式激活！",
      type: "achievement",
      effect: "sparkle",
    },
    全部线索: {
      message: (gameState) => {
        const discovered = gameState.getDiscoveredClues().length;
        const total = gameState.clues.length;
        return `总进度: ${discovered}/${total} 个线索`;
      },
      type: "progress",
      effect: "pulse",
    },
    我是福尔摩斯: {
      message: "🔍 向伟大的侦探致敬！继续追寻真相吧！",
      type: "easterEgg",
      effect: "glow",
    },
    进度: {
      message: (gameState) => {
        const discovered = gameState.getDiscoveredClues().length;
        const total = gameState.clues.length;
        const percentage = Math.round((discovered / total) * 100);
        return `调查完成度: ${percentage}% (${discovered}/${total})`;
      },
      type: "progress",
      effect: "pulse",
    },
  },

  // 章节专属密码
  chapters: {
    prologue: {
      警局密码: {
        message: (gameState) => {
          const count = getChapterClueCount(gameState, "prologue");
          return `序章线索: ${count}`;
        },
        type: "progress",
        effect: "pulse",
        hint: "在警局内部文件中找到",
      },
      开始调查: {
        message: "📝 调查提示：注意收集现场的所有物证和证言，细节决定成败",
        type: "hint",
        effect: "glow",
      },
    },
    chapter1: {
      湖边秘密: {
        message: (gameState) => {
          const count = getChapterClueCount(gameState, "chapter1");
          return `第一章线索: ${count}`;
        },
        type: "progress",
        effect: "pulse",
        hint: "隐藏在湖边场景的某个角落",
      },
      鸿叶集团: {
        message:
          "🏢 调查提示：关注董事长鹈鹕的社会关系和商业对手，金钱往往是动机",
        type: "hint",
        effect: "glow",
      },
      白马湖: {
        message: "🌊 场景提示：仔细检查湖边的每一个角落，真相可能就在眼前",
        type: "hint",
        effect: "glow",
      },
    },
  },

  // 彩蛋密码（隐藏内容）
  easterEggs: {
    开发者万岁: {
      message: "😊 感谢游玩！祝你推理愉快！",
      type: "secret",
      effect: "sparkle",
    },
    乌龙不是乌冬: {
      message:
        "👋 嘿，你找到我了！继续探索更多秘密吧！我勒个豆可难死我了，做个游戏累死累活的好好好",
      type: "secret",
      effect: "sparkle",
    },
    名侦探: {
      message: "🎩 你有着侦探的直觉！继续保持观察力！",
      type: "secret",
      effect: "sparkle",
    },
  },
};

// 辅助函数：获取章节线索统计
function getChapterClueCount(gameState, chapter) {
  const chapterClues = gameState.clues.filter(
    (clue) => clue.chapter === chapter && clue.found
  );
  const totalChapterClues = gameState.clues.filter(
    (clue) => clue.chapter === chapter
  );
  return `${chapterClues.length}/${totalChapterClues.length}`;
}
