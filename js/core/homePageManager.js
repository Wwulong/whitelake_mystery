// 主页管理器
const homePageManager = {
  hasShownTutorial: false, // 新增：是否已显示过教学指引
  init: function () {
    this.homePage = document.getElementById("home-page");
    this.gameContainer = document.getElementById("game-container");

    // 确保游戏容器初始隐藏
    if (this.gameContainer) {
      this.gameContainer.classList.add("game-container-hidden");
    }

    this.bindEvents();
  },

  bindEvents: function () {
    // 开始新游戏
    document.getElementById("start-new-game").addEventListener("click", () => {
      this.startNewGame();
    });

    // 继续游戏
    document.getElementById("continue-game").addEventListener("click", () => {
      this.continueGame();
    });

    // 设置
    document.getElementById("home-settings").addEventListener("click", () => {
      this.showSettings();
    });

    // 关于
    document.getElementById("home-about").addEventListener("click", () => {
      this.showAbout();
    });
  },

  // homePageManager.js - 在开始新游戏时初始化玩家角色
  startNewGame: function () {
    // 重置游戏状态
    this.resetGameState();

    // 默认解锁玩家角色（狮子）
    const playerCharacter = gameState.characters.find((c) => c.id === 1);
    if (playerCharacter) {
      gameState.encounterCharacter(1); // 解锁狮子角色
    }

    // 切换到游戏界面
    this.showGame();

    // 初始化游戏
    initializeGame();

    // 显示档案教学指引（在游戏开始后）
    setTimeout(() => {
      sidebarManager.showArchiveTutorial();
    }, 1000);
  },

  continueGame: function () {
    if (this.hasSaveData()) {
      if (gameState.loadGame()) {
        this.showGame();
        sceneManager.setScene(gameState.currentScene);
        showCurrentStep();
        sidebarManager.updateCluesList();
        this.showNotification("游戏已加载！");
      } else {
        this.showNotification("加载存档失败");
      }
    } else {
      this.showNotification("没有找到存档文件");
    }
  },

  showSettings: function () {
    this.showNotification("设置功能开发中...");
  },

  showAbout: function () {
    const aboutText = `白马湖上的阴谋 v1.0

一个沉浸式推理游戏
在这个充满谜团的故事中，
您将扮演一名狮子警官，
揭开白马湖背后的真相...

开发团队：我靠就是我我老牛逼了
音乐：还没有呢太难了啊啊啊啊啊
美术：那当然还是我啦我是世界上最全能的人哇哈哈哈哈哈哈`;

    this.showNotification(aboutText);
  },

  showGame: function () {
    this.homePage.classList.remove("home-page-active");
    this.homePage.classList.add("home-page-hidden");
    this.gameContainer.classList.remove("game-container-hidden");
    this.gameContainer.classList.add("game-container-visible");
  },

  showHome: function () {
    this.homePage.classList.remove("home-page-hidden");
    this.homePage.classList.add("home-page-active");
    this.gameContainer.classList.remove("game-container-visible");
    this.gameContainer.classList.add("game-container-hidden");
  },

  resetGameState: function () {
    gameState.currentStep = 0;
    gameState.currentChapter = "prologue";
    gameState.discoveredClues = [];

    // 重置线索状态
    if (gameState.clues) {
      gameState.clues.forEach((clue) => {
        clue.found = false;
      });
    }
  },

  hasSaveData: function () {
    // 检查是否有存档数据
    // 这里可以根据您的存档系统实现
    return localStorage.getItem("gameSaveData") !== null;
  },

  showNotification: function (message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95);
      color: white;
      padding: 25px 35px;
      border-radius: 12px;
      z-index: 3000;
      font-size: 16px;
      border: 2px solid #3498db;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      text-align: center;
      max-width: 320px;
      word-wrap: break-word;
      line-height: 1.5;
      font-family: "Microsoft YaHei", sans-serif;
      white-space: pre-line;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
  },
};
