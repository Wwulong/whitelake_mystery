// ===== 菜单管理器 =====
const menuManager = {
  init: function () {
    console.log("开始初始化菜单管理器...");

    // 获取菜单元素
    this.menuBtn = document.getElementById("menu-btn");
    this.gameMenu = document.getElementById("game-menu");

    // 如果菜单元素不存在，则创建
    if (!this.menuBtn || !this.gameMenu) {
      this.createMenuElements();
    }

    // 确保获取所有按钮引用
    this.closeMenuBtn = document.getElementById("close-menu");
    this.saveGameBtn = document.getElementById("save-game");
    this.loadGameBtn = document.getElementById("load-game");
    this.settingsBtn = document.getElementById("settings-btn");
    this.backToTitleBtn = document.getElementById("back-to-title");
    this.aboutBtn = document.getElementById("about-btn");

    // 调试：检查所有按钮是否都找到了
    console.log("菜单按钮状态:", {
      menuBtn: !!this.menuBtn,
      gameMenu: !!this.gameMenu,
      closeMenuBtn: !!this.closeMenuBtn,
      saveGameBtn: !!this.saveGameBtn,
      loadGameBtn: !!this.loadGameBtn,
      settingsBtn: !!this.settingsBtn,
      backToTitleBtn: !!this.backToTitleBtn,
      aboutBtn: !!this.aboutBtn,
    });

    // 确保菜单按钮初始状态正确
    if (this.menuBtn) {
      this.menuBtn.style.display = "flex"; // 在主页时隐藏
    }

    // 确保菜单容器初始状态正确
    if (this.gameMenu) {
      this.gameMenu.classList.add("menu-hidden");
      this.gameMenu.style.display = "none";
    }

    this.bindEvents();

    console.log("菜单管理器初始化完成");
  },

  // 添加专门的方法来控制菜单按钮显示
  setMenuButtonVisibility: function (visible) {
    if (this.menuBtn) {
      this.menuBtn.style.display = visible ? "flex" : "none";
      console.log(`菜单按钮 ${visible ? "显示" : "隐藏"}`);
    }
  },

  createMenuElements: function () {
    console.log("创建菜单元素...");

    // 只在元素不存在时创建菜单按钮
    if (!document.getElementById("menu-btn")) {
      const menuBtn = document.createElement("button");
      menuBtn.id = "menu-btn";
      menuBtn.className = "menu-toggle";
      menuBtn.innerHTML = "☰";
      menuBtn.title = "游戏菜单";
      document.body.appendChild(menuBtn);
      console.log("菜单按钮已创建");
    }

    // 只在元素不存在时创建菜单容器
    if (!document.getElementById("game-menu")) {
      const gameMenu = document.createElement("div");
      gameMenu.id = "game-menu";
      gameMenu.className = "menu-hidden";
      gameMenu.style.display = "none";
      gameMenu.innerHTML = `
      <div class="menu-content">
        <div class="menu-header">
          <h2>游戏菜单</h2>
          <span id="close-menu" class="close-menu">&times;</span>
        </div>
        <div class="menu-body">
          <button id="save-game" class="menu-btn">💾 保存游戏</button>
          <button id="load-game" class="menu-btn">📂 读取游戏</button>
          <button id="settings-btn" class="menu-btn">⚙️ 游戏设置</button>
          <button id="back-to-title" class="menu-btn">🏠 返回标题</button>
          <div class="menu-divider"></div>
          <button id="about-btn" class="menu-btn">ℹ️ 关于游戏</button>
        </div>
      </div>
    `;
      document.body.appendChild(gameMenu);
      console.log("菜单容器已创建");
    }

    // 重新获取元素引用
    this.menuBtn = document.getElementById("menu-btn");
    this.gameMenu = document.getElementById("game-menu");
    this.closeMenuBtn = document.getElementById("close-menu");
    this.saveGameBtn = document.getElementById("save-game");
    this.loadGameBtn = document.getElementById("load-game");
    this.settingsBtn = document.getElementById("settings-btn");
    this.backToTitleBtn = document.getElementById("back-to-title");
    this.aboutBtn = document.getElementById("about-btn");
  },

  bindEvents: function () {
    console.log("绑定菜单事件...");
    // 确保元素存在
    if (!this.menuBtn || !this.gameMenu) {
      console.error("菜单元素未找到");
      return;
    }

    // 菜单按钮点击事件
    this.menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showMenu();
    });

    // 安全地绑定关闭菜单按钮事件
    if (this.closeMenuBtn) {
      this.closeMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideMenu();
      });
    } else {
      console.warn("关闭菜单按钮未找到");
    }

    // 点击菜单外部关闭
    this.gameMenu.addEventListener("click", (e) => {
      if (e.target === this.gameMenu) {
        this.hideMenu();
      }
    });

    // 安全地绑定菜单功能按钮事件
    const buttons = [
      {
        element: this.saveGameBtn,
        id: "save-game",
        action: () => this.saveGame(),
      },
      {
        element: this.loadGameBtn,
        id: "load-game",
        action: () => this.loadGame(),
      },
      {
        element: this.settingsBtn,
        id: "settings-btn",
        action: () => this.showSettings(),
      },
      {
        element: this.backToTitleBtn,
        id: "back-to-title",
        action: () => this.backToTitle(),
      },
      {
        element: this.aboutBtn,
        id: "about-btn",
        action: () => this.showAbout(),
      },
    ];

    buttons.forEach((btn) => {
      if (btn.element) {
        btn.element.addEventListener("click", (e) => {
          e.stopPropagation();
          // 播放按钮点击音效
          if (typeof audioManager !== "undefined") {
            audioManager.playSound("button_click");
          }
          btn.action();
        });
      } else {
        console.warn(`菜单按钮未找到: ${btn.id}`);
      }
    });

    // ESC键关闭菜单
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !this.gameMenu.classList.contains("menu-hidden")
      ) {
        this.hideMenu();
      }
    });

    console.log("菜单事件绑定完成");
  },

  showMenu: function () {
    if (this.gameMenu) {
      this.gameMenu.style.display = "flex";
      this.gameMenu.classList.remove("menu-hidden");
      gameState.isMenuOpen = true;

      // 新增：根据当前页面调整菜单选项
      this.adjustMenuForCurrentPage();
      console.log("菜单已显示");
    }
  },

  // 新增：根据当前页面调整菜单选项
  adjustMenuForCurrentPage: function () {
    const homePage = document.getElementById("home-page");
    const isHomePage =
      homePage && homePage.classList.contains("home-page-active");

    if (isHomePage) {
      // 在主页时，禁用保存和加载游戏按钮
      if (this.saveGameBtn) {
        this.saveGameBtn.disabled = true;
        this.saveGameBtn.style.opacity = "0.5";
        this.saveGameBtn.title = "在标题页面不可用";
      }
      if (this.loadGameBtn) {
        this.loadGameBtn.disabled = true;
        this.loadGameBtn.style.opacity = "0.5";
        this.loadGameBtn.title = "在标题页面不可用";
      }
      // 修改返回标题按钮的文本
      if (this.backToTitleBtn) {
        this.backToTitleBtn.textContent = "🏠 刷新页面";
        this.backToTitleBtn.title = "刷新页面";
      }
    } else {
      // 在游戏页面时，恢复按钮状态
      if (this.saveGameBtn) {
        this.saveGameBtn.disabled = false;
        this.saveGameBtn.style.opacity = "1";
        this.saveGameBtn.title = "";
      }
      if (this.loadGameBtn) {
        this.loadGameBtn.disabled = false;
        this.loadGameBtn.style.opacity = "1";
        this.loadGameBtn.title = "";
      }
      // 恢复返回标题按钮的文本
      if (this.backToTitleBtn) {
        this.backToTitleBtn.textContent = "🏠 返回标题";
        this.backToTitleBtn.title = "返回标题画面";
      }
    }
  },
  hideMenu: function () {
    if (this.gameMenu) {
      this.gameMenu.style.display = "none";
      this.gameMenu.classList.add("menu-hidden");
      gameState.isMenuOpen = false;
      console.log("菜单已隐藏");
    }
  },

  isMenuVisible: function () {
    return this.gameMenu && this.gameMenu.style.display === "flex";
  },

  showMenuButton: function () {
    if (this.menuBtn) {
      this.menuBtn.style.display = "flex";
      console.log("菜单按钮已显示");
    }
  },

  hideMenuButton: function () {
    if (this.menuBtn) {
      this.menuBtn.style.display = "none";
      console.log("菜单按钮已隐藏");
    }
  },

  saveGame: function () {
    if (gameState.saveGame) {
      gameState.saveGame();
      this.showNotification("游戏已保存！");
    } else {
      this.showNotification("存档功能开发中...");
    }
    this.hideMenu();
  },

  loadGame: function () {
    if (gameState.loadGame && gameState.loadGame()) {
      this.showNotification("游戏已加载！");
      sceneManager.setScene(gameState.currentScene);
      showCurrentStep();
      sidebarManager.updateCluesList();
    } else {
      this.showNotification("没有找到存档文件");
    }
    this.hideMenu();
  },

  showSettings: function () {
    // 显示设置模态框
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      settingsModal.style.display = "block";

      // 初始化设置界面
      this.initSettingsUI();
    }
    this.hideMenu();
  },

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

  // menuManager.js - 修改 backToTitle 方法
  backToTitle: function () {
    // 如果已经在主页，不重复执行
    const homePage = document.getElementById("home-page");
    if (homePage && homePage.classList.contains("home-page-active")) {
      this.showNotification("您已经在标题页面");
      this.hideMenu();
      return;
    }

    if (confirm("确定要返回标题画面吗？未保存的进度将会丢失。")) {
      // 使用主页管理器返回主页
      if (typeof homePageManager !== "undefined") {
        homePageManager.showHome();
        this.showNotification("已返回标题画面");
      } else {
        this.showNotification("返回标题失败");
      }
      this.hideMenu();
    }
  },

  showAbout: function () {
    this.showNotification(
      "白马湖上的阴谋 v1.0\\n一个沉浸式推理游戏诞生地还挺艰难的"
    );
    this.hideMenu();
  },

  showNotification: function (message) {
    // 移除已存在的通知
    const existingNotification = document.getElementById("menu-notification");
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement("div");
    notification.id = "menu-notification";
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
    }, 2000);
  },
};
