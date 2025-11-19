const gameState = {
  currentStep: 0,
  currentChapter: "prologue",
  isDialogActive: false,
  // 线索和角色数据
  clues: [],
  characters: [],
  discoveredClues: [],
  encounteredCharacters: [],

  // 新增：发现线索的方法
  discoverClue: function (clueId) {
    const clue = this.clues.find((c) => c.id === clueId);
    if (clue && !clue.found) {
      clue.found = true;
      this.discoveredClues.push(clueId);
      console.log(`线索发现: ${clue.title}`);
      return true;
    }
    return false;
  },

  // 新增：获取已发现线索
  getDiscoveredClues: function () {
    return this.clues.filter((clue) => clue.found);
  },

  init: function () {
    console.log("初始化游戏状态...");
    // 初始化角色数据
    this.characters = charactersData.map((character) => ({
      ...character,
      encountered: character.encountered || false,
    }));

    // 默认解锁玩家角色（狮子）
    const playerCharacter = this.characters.find((c) => c.id === 1);
    if (playerCharacter && !playerCharacter.encountered) {
      playerCharacter.encountered = true;
      this.encounteredCharacters.push(1);
    }

    // 初始化线索数据
    this.clues = cluesData.map((clue) => ({
      ...clue,
      found: clue.found || false,
    }));

    this.discoveredClues = [];
    console.log("游戏状态初始化完成");
  },

  // 重置游戏状态（开始新游戏时调用）
  resetGameState: function () {
    console.log("重置游戏状态...");

    this.currentStep = 0;
    this.currentChapter = "prologue";
    this.isDialogActive = false;
    this.discoveredClues = [];
    this.encounteredCharacters = [];

    // 重置线索状态
    if (this.clues) {
      this.clues.forEach((clue) => {
        clue.found = false;
      });
    }

    // 重置角色状态（除了玩家角色）
    if (this.characters) {
      this.characters.forEach((character) => {
        // 保留玩家角色（狮子）的解锁状态
        if (character.id !== 1) {
          character.encountered = false;
        }
      });
    }

    // 重新解锁玩家角色
    const playerCharacter = this.characters.find((c) => c.id === 1);
    if (playerCharacter) {
      playerCharacter.encountered = true;
      if (!this.encounteredCharacters.includes(1)) {
        this.encounteredCharacters.push(1);
      }
    }

    console.log("游戏状态重置完成");
  },

  // 发现线索
  discoverClue: function (clueId) {
    const clue = this.clues.find((c) => c.id === clueId);
    if (clue && !clue.found) {
      clue.found = true;
      this.discoveredClues.push(clueId);
      return true;
    }
    return false;
  },

  // 遇到角色
  encounterCharacter: function (characterId) {
    const character = this.characters.find((c) => c.id === characterId);
    if (character && !character.encountered) {
      character.encountered = true;
      this.encounteredCharacters.push(characterId);
      return true;
    }
    return false;
  },

  // 获取已发现线索
  getDiscoveredClues: function () {
    return this.clues.filter((clue) => clue.found);
  },

  // 获取已遇到角色
  getEncounteredCharacters: function () {
    return this.characters.filter((character) => character.encountered);
  },

  // 检查是否拥有线索
  hasClue: function (clueId) {
    return this.discoveredClues.includes(clueId);
  },

  // 检查是否遇到角色
  hasEncounteredCharacter: function (characterId) {
    return this.encounteredCharacters.includes(characterId);
  },

  // 推进游戏进度
  advanceStep: function () {
    this.currentStep++;
    console.log(`游戏进度推进到步骤: ${this.currentStep}`);
  },

  // 设置当前章节
  setChapter: function (chapter) {
    this.currentChapter = chapter;
    console.log(`切换到章节: ${chapter}`);

    // 重置进度类密码
    if (typeof passwordManager !== "undefined") {
      passwordManager.resetProgressPasswords();
    }
  },

  // 设置对话框状态
  setDialogActive: function (active) {
    this.isDialogActive = active;
  },
};

// 自动初始化
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    if (
      typeof gameState !== "undefined" &&
      typeof gameState.init === "function"
    ) {
      gameState.init();
    }
  }, 100);
});
