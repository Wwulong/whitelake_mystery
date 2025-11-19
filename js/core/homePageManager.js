// 主页管理器
const homePageManager = {
  hasShownTutorial: false,

  init: function () {
    this.homePage = document.getElementById("home-page");
    this.gameContainer = document.getElementById("game-container");

    // 确保游戏容器初始隐藏
    if (this.gameContainer) {
      this.gameContainer.classList.add("game-container-hidden");
    }

    this.bindEvents();
    this.ensureMenuButtonVisible();

    // 初始化完成后播放主页音乐
    this.playHomeBgm();
  },

  // 简化继续游戏逻辑
  continueGame: function () {
    if (!saveManager.hasSaveData()) {
      this.showNotification("没有找到存档文件");
      return;
    }

    // 统一使用菜单管理器的存档界面
    if (typeof menuManager !== "undefined") {
      menuManager.showSaveSlots("load");
    } else {
      this.showNotification("菜单系统未初始化");
    }
  },

  // 新增：确保菜单按钮可见的方法
  ensureMenuButtonVisible: function () {
    if (typeof menuManager !== "undefined") {
      menuManager.setMenuButtonVisibility(true);
    } else {
      // 如果菜单管理器还未初始化，延迟设置
      setTimeout(() => {
        if (typeof menuManager !== "undefined") {
          menuManager.setMenuButtonVisibility(true);
        }
      }, 100);
    }
  },

  bindEvents: function () {
    const buttons = [
      { id: "start-new-game", action: () => this.startNewGame() },
      { id: "continue-game", action: () => this.continueGame() },
      { id: "home-settings", action: () => this.showSettings() },
      { id: "home-about", action: () => this.showAbout() },
    ];

    buttons.forEach((btn) => {
      const element = document.getElementById(btn.id);
      if (element) {
        element.addEventListener("click", () => {
          if (typeof audioManager !== "undefined") {
            audioManager.playSound("button_click");
          }
          btn.action();
        });
      }
    });
  },

  startNewGame: function () {
    // 重置游戏状态
    if (
      typeof gameState !== "undefined" &&
      typeof gameState.resetGameState === "function"
    ) {
      gameState.resetGameState();
    }

    this.stopHomeBgm();

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
    if (!saveManager.hasSaveData()) {
      this.showNotification("没有找到存档文件");
      return;
    }

    // 确保菜单管理器已初始化
    if (typeof menuManager !== "undefined") {
      menuManager.showSaveSlots("load");
    } else {
      console.warn("菜单管理器未初始化，尝试重新初始化");
      setTimeout(() => {
        if (typeof menuManager !== "undefined") {
          menuManager.showSaveSlots("load");
        } else {
          this.showNotification("菜单系统初始化失败");
        }
      }, 100);
    }
  },

  showSettings: function () {
    // 显示设置模态框
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      settingsModal.style.display = "block";

      // 初始化设置界面
      this.initSettingsUI();
    }
  },

  // 新增：初始化设置界面
  initSettingsUI: function () {
    // 获取UI元素
    const bgmSlider = document.getElementById("bgm-volume");
    const sfxSlider = document.getElementById("sfx-volume");
    const bgmToggle = document.getElementById("bgm-toggle");
    const sfxToggle = document.getElementById("sfx-toggle");
    const applyBtn = document.getElementById("apply-settings");
    const closeBtn = document.getElementById("close-settings");
    const settingsModal = document.getElementById("settings-modal");

    // 初始化滑块和按钮状态
    if (typeof audioManager !== "undefined") {
      audioManager.applySettings();
    }

    // 绑定事件
    if (bgmSlider) {
      bgmSlider.addEventListener("input", (e) => {
        const value = e.target.value;
        const volumeText = document.getElementById("bgm-volume-text");
        if (volumeText) volumeText.textContent = value + "%";
        if (typeof audioManager !== "undefined") {
          audioManager.setBgmVolume(parseInt(value));
        }
      });
    }

    if (sfxSlider) {
      sfxSlider.addEventListener("input", (e) => {
        const value = e.target.value;
        const volumeText = document.getElementById("sfx-volume-text");
        if (volumeText) volumeText.textContent = value + "%";
        if (typeof audioManager !== "undefined") {
          audioManager.setSfxVolume(parseInt(value));
        }
      });
    }

    if (bgmToggle) {
      bgmToggle.addEventListener("click", () => {
        if (typeof audioManager !== "undefined") {
          const isEnabled = audioManager.toggleBgm();
          bgmToggle.textContent = isEnabled ? "🔊" : "🔇";
        }
      });
    }

    if (sfxToggle) {
      sfxToggle.addEventListener("click", () => {
        if (typeof audioManager !== "undefined") {
          const isEnabled = audioManager.toggleSfx();
          sfxToggle.textContent = isEnabled ? "🔊" : "🔇";
        }
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        if (typeof audioManager !== "undefined") {
          audioManager.saveSettings();
        }
        this.showNotification("设置已应用");
        if (settingsModal) settingsModal.style.display = "none";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        // 重新加载设置以取消未应用的更改
        if (typeof audioManager !== "undefined") {
          audioManager.loadSettings();
          audioManager.applySettings();
        }
        if (settingsModal) settingsModal.style.display = "none";
      });
    }

    // 点击外部关闭
    if (settingsModal) {
      settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
          if (typeof audioManager !== "undefined") {
            audioManager.loadSettings();
            audioManager.applySettings();
          }
          settingsModal.style.display = "none";
        }
      });
    }

    // 关闭按钮
    const modalClose = settingsModal
      ? settingsModal.querySelector(".close-modal")
      : null;
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        if (typeof audioManager !== "undefined") {
          audioManager.loadSettings();
          audioManager.applySettings();
        }
        if (settingsModal) settingsModal.style.display = "none";
      });
    }
  },

  showAbout: function () {
    const aboutText = `白马湖上的阴谋 v1.0

一个沉浸式推理游戏
在这个充满谜团的故事中，
您将从狮子警官的视角，
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

    // 在游戏界面显示侧边栏
    if (typeof sidebarManager !== "undefined") {
      sidebarManager.showSidebar();
    }
    // 确保菜单按钮显示
    this.ensureMenuButtonVisible();

    console.log("切换到游戏界面完成");
  },

  showHome: function () {
    this.homePage.classList.remove("home-page-hidden");
    this.homePage.classList.add("home-page-active");
    this.gameContainer.classList.remove("game-container-hidden");
    this.gameContainer.classList.add("game-container-visible");

    if (typeof dialogManager !== "undefined") {
      dialogManager.hideDialog();
    }

    // 在主页隐藏侧边栏
    if (typeof sidebarManager !== "undefined") {
      sidebarManager.hideSidebar();
    }

    // 隐藏密码按钮
    if (typeof passwordManager !== "undefined") {
      passwordManager.setPasswordButtonVisibility(false);
    }

    this.ensureMenuButtonVisible();

    // 返回主页时播放主页音乐
    this.playHomeBgm();
  },

  // 在隐藏主页时显示密码按钮
  hideHome: function () {
    // 显示密码按钮
    if (typeof passwordManager !== "undefined") {
      passwordManager.setPasswordButtonVisibility(true);
    }
  },

  // 播放主页背景音乐
  playHomeBgm: function () {
    // 延迟执行，确保音频管理器已初始化
    setTimeout(() => {
      if (typeof audioManager !== "undefined") {
        console.log("尝试播放主页背景音乐");
        audioManager.playHomeBgm();
      } else {
        console.warn("音频管理器未初始化，无法播放主页音乐");
      }
    }, 500);
  },

  // 停止主页背景音乐
  stopHomeBgm: function () {
    if (typeof audioManager !== "undefined") {
      audioManager.stopAllBgm();
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
  bindEvents: function () {
    const buttons = [
      { id: "start-new-game", action: () => this.startNewGame() },
      { id: "continue-game", action: () => this.continueGame() },
      { id: "home-settings", action: () => this.showSettings() },
      { id: "home-about", action: () => this.showAbout() },
    ];

    buttons.forEach((btn) => {
      const element = document.getElementById(btn.id);
      if (element) {
        element.addEventListener("click", () => {
          // 播放按钮点击音效
          if (typeof audioManager !== "undefined") {
            audioManager.playSound("button_click");
          }
          btn.action();
        });
      }
    });
  },
};
