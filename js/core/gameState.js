const gameState = {
  currentStep: 0,
  currentChapter: "prologue",
  isDialogActive: false,
  // 引入新增：线索和角色数据
  clues: [],
  characters: [],
  // 新增：线索发现记录
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
};
