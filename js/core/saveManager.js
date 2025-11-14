const saveManager = {
  // 存档系统配置
  config: {
    saveSlots: 3,
    autoSaveSlot: 0, // 自动存档使用的槽位
    version: "1.0",
    dataKey: "gameSaveData",
  },

  // 初始化存档系统
  init: function () {
    console.log("初始化存档管理器...");
    if (!this.getSaveData()) {
      this.initializeSaveData();
    }
    console.log("存档管理器初始化完成");
  },

  // 初始化存档数据结构
  initializeSaveData: function () {
    const saveData = {
      slots: Array(this.config.saveSlots).fill(null),
      settings: {
        bgmVolume: 50,
        sfxVolume: 70,
        bgmEnabled: true,
        sfxEnabled: true,
        textSpeed: 5,
        autoSpeed: 5,
      },
      metadata: {
        version: this.config.version,
        createdAt: Date.now(),
        lastPlayed: null,
      },
    };
    this.setSaveData(saveData);
    return saveData;
  },

  // 获取完整的存档数据
  getSaveData: function () {
    try {
      const data = localStorage.getItem(this.config.dataKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("读取存档数据失败:", error);
      return null;
    }
  },

  // 设置完整的存档数据
  setSaveData: function (saveData) {
    try {
      localStorage.setItem(this.config.dataKey, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error("保存存档数据失败:", error);
      return false;
    }
  },

  // 创建存档快照
  createSaveSnapshot: function () {
    if (typeof gameState === "undefined") {
      console.error("游戏状态未定义，无法创建存档快照");
      return null;
    }

    try {
      return {
        timestamp: Date.now(),
        version: this.config.version,

        // 游戏进度
        currentStep: gameState.currentStep,
        currentChapter: gameState.currentChapter,
        currentScene: sceneManager.currentScene,

        // 收集要素
        discoveredClues: [...(gameState.discoveredClues || [])],
        encounteredCharacters: [...(gameState.encounteredCharacters || [])],

        // 玩家信息
        playerName: gameState.playerName || "狮子警官",
        playTime: gameState.playTime || 0,

        // 游戏状态标志
        flags: gameState.flags ? { ...gameState.flags } : {},

        // 额外元数据用于界面显示
        metadata: {
          clueCount: gameState.discoveredClues
            ? gameState.discoveredClues.length
            : 0,
          characterCount: gameState.encounteredCharacters
            ? gameState.encounteredCharacters.length
            : 0,
          sceneName: this.getSceneDisplayName(sceneManager.currentScene),
        },
      };
    } catch (error) {
      console.error("创建存档快照失败:", error);
      return null;
    }
  },

  // 保存游戏到指定槽位
  saveGame: function (slot = 0) {
    if (slot < 0 || slot >= this.config.saveSlots) {
      console.error("无效的存档槽位:", slot);
      return false;
    }

    const saveData = this.getSaveData();
    if (!saveData) {
      console.error("存档数据不存在");
      return false;
    }

    const saveSnapshot = this.createSaveSnapshot();
    if (!saveSnapshot || !this.validateSaveData(saveSnapshot)) {
      console.error("存档数据验证失败");
      return false;
    }

    // 保存到指定槽位
    saveData.slots[slot] = saveSnapshot;
    saveData.metadata.lastPlayed = Date.now();

    if (this.setSaveData(saveData)) {
      console.log(`游戏已保存到槽位 ${slot + 1}`, saveSnapshot);
      this.dispatchSaveEvent("save", slot, saveSnapshot);
      return true;
    }

    return false;
  },

  // 检查是否有有效存档
  hasSaveData: function () {
    const saveData = this.getSaveData();
    if (!saveData) return false;

    return saveData.slots.some(
      (slot) => slot !== null && this.validateSaveData(slot)
    );
  },

  // 从指定槽位加载游戏
  loadGame: function (slot = 0) {
    if (slot < 0 || slot >= this.config.saveSlots) {
      console.error("无效的存档槽位:", slot);
      return false;
    }

    const saveData = this.getSaveData();
    if (!saveData || !saveData.slots[slot]) {
      console.log("该存档槽位为空");
      return false;
    }

    const saveSnapshot = saveData.slots[slot];

    // 验证存档版本兼容性
    if (saveSnapshot.version !== this.config.version) {
      console.warn("存档版本不匹配，尝试加载:", saveSnapshot.version);
      if (!this.migrateSaveData(saveSnapshot)) {
        console.error("存档数据迁移失败");
        return false;
      }
    }

    // 恢复游戏状态
    this.restoreGameState(saveSnapshot);

    console.log(`从槽位 ${slot + 1} 加载游戏`, saveSnapshot);
    this.dispatchSaveEvent("load", slot, saveSnapshot);
    return true;
  },

  // 恢复游戏状态
  restoreGameState: function (saveSnapshot) {
    if (typeof gameState === "undefined") {
      console.error("游戏状态未定义，无法恢复");
      return false;
    }

    // 恢复基本进度
    gameState.currentStep = saveSnapshot.currentStep;
    gameState.currentChapter = saveSnapshot.currentChapter;

    // 恢复收集要素
    gameState.discoveredClues = saveSnapshot.discoveredClues || [];
    gameState.encounteredCharacters = saveSnapshot.encounteredCharacters || [];

    // 恢复玩家信息
    gameState.playerName = saveSnapshot.playerName;
    gameState.playTime = saveSnapshot.playTime || 0;

    // 恢复游戏标志
    gameState.flags = saveSnapshot.flags || {};

    return true;
  },

  // 存档数据迁移（用于版本更新）
  migrateSaveData: function (saveSnapshot) {
    // 这里可以实现版本迁移逻辑
    // 例如从旧版本格式转换到新版本格式
    console.log(
      "执行存档数据迁移:",
      saveSnapshot.version,
      "->",
      this.config.version
    );

    // 简单的版本迁移示例
    if (!saveSnapshot.version) {
      // 假设是v1.0之前的版本
      saveSnapshot.version = this.config.version;
    }

    // 添加缺失的字段
    if (!saveSnapshot.flags) saveSnapshot.flags = {};
    if (!saveSnapshot.playTime) saveSnapshot.playTime = 0;

    return true;
  },

  // 检查是否有任何存档存在
  hasSaveData: function () {
    const saveData = this.getSaveData();
    if (!saveData) return false;

    return saveData.slots.some((slot) => slot !== null);
  },

  // 获取指定槽位的存档信息
  getSaveSlotInfo: function (slot) {
    const saveData = this.getSaveData();
    if (!saveData || !saveData.slots[slot]) {
      return null;
    }

    const save = saveData.slots[slot];
    return {
      exists: true,
      slot: slot,
      timestamp: save.timestamp,
      date: new Date(save.timestamp).toLocaleString(),
      chapter: save.currentChapter,
      step: save.currentStep,
      scene: save.currentScene,
      clueCount: save.discoveredClues ? save.discoveredClues.length : 0,
      characterCount: save.encounteredCharacters
        ? save.encounteredCharacters.length
        : 0,
      playTime: save.playTime || 0,
      playerName: save.playerName,
      sceneName:
        save.metadata?.sceneName || this.getSceneDisplayName(save.currentScene),
    };
  },

  // 获取场景显示名称
  getSceneDisplayName: function (sceneId) {
    const sceneNames = {
      "police-station-outside": "警局外部",
      "police-station-inside": "警局内部",
      "white-horse-lake": "白马湖现场",
    };
    return sceneNames[sceneId] || sceneId;
  },

  // 获取所有存档槽位信息
  getAllSaveSlots: function () {
    return Array(this.config.saveSlots)
      .fill()
      .map((_, index) => {
        return this.getSaveSlotInfo(index);
      });
  },

  // 增强存档验证
  validateSaveData: function (saveSnapshot) {
    if (!saveSnapshot) return false;

    const requiredFields = [
      "timestamp",
      "version",
      "currentStep",
      "currentChapter",
    ];
    return requiredFields.every((field) => saveSnapshot[field] !== undefined);
  },

  // 删除指定槽位的存档
  deleteSave: function (slot) {
    const saveData = this.getSaveData();
    if (!saveData) return false;

    saveData.slots[slot] = null;

    if (this.setSaveData(saveData)) {
      console.log(`已删除槽位 ${slot + 1} 的存档`);
      this.dispatchSaveEvent("delete", slot);
      return true;
    }

    return false;
  },

  // 自动存档
  autoSave: function () {
    return this.saveGame(this.config.autoSaveSlot);
  },

  // 快速存档（最后一个槽位）
  quickSave: function () {
    const saveData = this.getSaveData();
    if (!saveData) return false;

    // 查找第一个空槽位
    for (let i = 0; i < this.config.saveSlots; i++) {
      if (!saveData.slots[i]) {
        console.log(`快速存档到空槽位: ${i}`);
        return this.saveGame(i);
      }
    }

    // 如果没有空槽位，使用最后一个槽位（覆盖）
    console.log(`所有槽位已满，快速存档覆盖槽位: ${this.config.saveSlots - 1}`);
    const quickSaveSlot = this.config.saveSlots - 1;
    return this.saveGame(quickSaveSlot);
  },

  // 快速读档
  quickLoad: function () {
    const quickSaveSlot = this.config.saveSlots - 1;
    return this.loadGame(quickSaveSlot);
  },

  // 保存游戏设置
  saveSettings: function (settings) {
    const saveData = this.getSaveData();
    if (!saveData) return false;

    saveData.settings = { ...saveData.settings, ...settings };
    saveData.metadata.lastPlayed = Date.now();

    return this.setSaveData(saveData);
  },

  // 加载游戏设置
  loadSettings: function () {
    const saveData = this.getSaveData();
    return saveData ? saveData.settings : null;
  },

  // 导出存档数据（用于备份）
  exportSaveData: function () {
    const saveData = this.getSaveData();
    if (!saveData) return null;

    const exportData = {
      ...saveData,
      exportTime: Date.now(),
      exportVersion: this.config.version,
    };

    return JSON.stringify(exportData);
  },

  // 导入存档数据（用于恢复备份）
  importSaveData: function (importString) {
    try {
      const importData = JSON.parse(importString);

      // 验证导入数据
      if (!importData.slots || !importData.settings) {
        throw new Error("无效的存档数据格式");
      }

      if (this.setSaveData(importData)) {
        console.log("存档数据导入成功");
        this.dispatchSaveEvent("import");
        return true;
      }
    } catch (error) {
      console.error("导入存档数据失败:", error);
    }

    return false;
  },

  // 清空所有存档
  clearAllSaves: function () {
    if (confirm("确定要清空所有存档吗？此操作不可恢复！")) {
      const saveData = this.getSaveData();
      if (!saveData) return false;

      saveData.slots = Array(this.config.saveSlots).fill(null);

      if (this.setSaveData(saveData)) {
        console.log("所有存档已清空");
        this.dispatchSaveEvent("clearAll");
        return true;
      }
    }

    return false;
  },

  // 分发存档事件
  dispatchSaveEvent: function (eventType, slot = null, data = null) {
    const event = new CustomEvent("saveManagerEvent", {
      detail: {
        type: eventType,
        slot: slot,
        data: data,
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);
  },

  // 获取存档统计信息
  getSaveStats: function () {
    const saveData = this.getSaveData();
    if (!saveData) return null;

    const slots = saveData.slots;
    const usedSlots = slots.filter((slot) => slot !== null).length;
    const latestSave = slots.reduce((latest, slot) => {
      if (slot && slot.timestamp > (latest?.timestamp || 0)) {
        return slot;
      }
      return latest;
    }, null);

    return {
      totalSlots: this.config.saveSlots,
      usedSlots: usedSlots,
      freeSlots: this.config.saveSlots - usedSlots,
      latestSave: latestSave ? new Date(latestSave.timestamp) : null,
      totalPlayTime: slots.reduce(
        (total, slot) => total + (slot?.playTime || 0),
        0
      ),
      totalCluesFound: slots.reduce(
        (total, slot) => total + (slot?.discoveredClues?.length || 0),
        0
      ),
      totalCharactersMet: slots.reduce(
        (total, slot) => total + (slot?.encounteredCharacters?.length || 0),
        0
      ),
    };
  },
};

// 自动初始化
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    if (typeof saveManager !== "undefined") {
      saveManager.init();
    }
  }, 100);
});
