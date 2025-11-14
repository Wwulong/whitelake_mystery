// ===== 菜单管理器 =====
const menuManager = {
  // 元素引用
  menuBtn: null,
  gameMenu: null,
  closeMenuBtn: null,
  saveGameBtn: null,
  loadGameBtn: null,
  settingsBtn: null,
  backToTitleBtn: null,
  aboutBtn: null,

  // ===== 1. 初始化方法 =====

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
      this.menuBtn.style.display = "flex";
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
      this.createMenuElements();
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

  // ===== 2. 菜单显示控制 =====

  showMenu: function () {
    if (this.gameMenu) {
      this.gameMenu.style.display = "flex";
      this.gameMenu.classList.remove("menu-hidden");
      gameState.isMenuOpen = true;

      // 新增：打开菜单时关闭所有侧边栏标签
      if (typeof sidebarManager !== "undefined") {
        sidebarManager.closeAllTabs();
      }

      // 新增：根据当前页面调整菜单选项
      this.adjustMenuForCurrentPage();
      console.log("菜单已显示");
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

  // 新增：根据当前页面调整菜单选项
  adjustMenuForCurrentPage: function () {
    const homePage = document.getElementById("home-page");
    const isHomePage =
      homePage && homePage.classList.contains("home-page-active");

    const buttons = [
      {
        element: this.saveGameBtn,
        enabled: !isHomePage,
        homeText: "在主页面不可存档",
        gameText: "💾 保存游戏",
      },
      {
        element: this.loadGameBtn,
        enabled: !isHomePage,
        homeText: "主页面请直接点继续游戏读取存档",
        gameText: "📂 读取游戏",
      },
      {
        element: this.backToTitleBtn,
        enabled: true,
        homeText: "🏠 刷新页面",
        gameText: "🏠 返回标题",
      },
    ];

    buttons.forEach((btn) => {
      if (btn.element) {
        if (isHomePage) {
          btn.element.disabled = !btn.enabled;
          btn.element.style.opacity = btn.enabled ? "1" : "0.5";
          btn.element.title = btn.homeText;
          if (btn.homeText) btn.element.textContent = btn.homeText;
        } else {
          btn.element.disabled = false;
          btn.element.style.opacity = "1";
          btn.element.title = "";
          if (btn.gameText) btn.element.textContent = btn.gameText;
        }
      }
    });
  },

  // ===== 3. 存档系统方法 =====

  saveGame: function () {
    this.showSaveSlots("save");
  },

  loadGame: function () {
    this.showSaveSlots("load");
  },

  showSaveSlots: function (mode) {
    const modal = document.createElement("div");
    modal.className = "save-load-modal";

    // 预先获取所有存档槽信息
    const slotsInfo = Array(saveManager.config.saveSlots)
      .fill()
      .map((_, index) => ({
        index,
        info: saveManager.getSaveSlotInfo(index),
      }));

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${mode === "save" ? "💾 保存游戏" : "📂 读取游戏"}</h2>
          <span class="close-modal">&times;</span>
        </div>
        
         ${
           mode === "save"
             ? `
        <div class="save-notice">
          <p>💡 <strong>提示：</strong>快速存档将使用第一个可用槽位，手动保存可选择任意槽位。</p>
        </div>
      `
             : ""
         }
      
        <div class="save-slots-container">
          ${slotsInfo
            .map(
              ({ index, info }) => `
            <div class="save-slot ${
              !info ? "empty-slot" : ""
            }" data-slot="${index}">
              ${
                !info
                  ? this.renderEmptySlot(mode)
                  : this.renderSaveSlot(info, mode)
              }
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="modal-footer">
          ${this.renderFooterButtons(mode)}
          <button class="modal-btn cancel-btn">取消</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.bindSaveSlotEvents(modal, mode);
  },

  // 渲染空存档槽
  renderEmptySlot: function (mode) {
    if (mode === "save") {
      return `
      <div class="slot-header">
        <span class="slot-number">空存档位</span>
        <span class="slot-date">未使用</span>
      </div>
      <div class="slot-info">
        <div class="slot-info-item">
          <span>点击保存当前进度</span>
        </div>
      </div>
      <div class="slot-actions">
        <button class="slot-btn save-btn">保存到此</button>
      </div>
    `;
    } else {
      return `
      <div class="empty-slot-icon">📁</div>
      <div class="empty-slot-text">空存档位</div>
    `;
    }
  },

  // 渲染有内容的存档槽
  renderSaveSlot: function (slotInfo, mode) {
    return `
      <div class="slot-header">
        <span class="slot-number">存档 ${slotInfo.slot + 1}</span>
        <span class="slot-date">${slotInfo.date}</span>
      </div>
      <div class="slot-info">
        <div class="slot-info-item">
          <span>${this.getChapterName(slotInfo.chapter)}</span>
        </div>
        <div class="slot-info-item">
          <span>${slotInfo.clueCount} 个线索</span>
        </div>
        <div class="slot-info-item">
          <span>${this.formatPlayTime(slotInfo.playTime)}</span>
        </div>
      </div>
      <div class="slot-actions">
        ${
          mode === "save"
            ? `<button class="slot-btn save-btn">保存</button>`
            : `<button class="slot-btn load-btn">读取</button>`
        }
        <button class="slot-btn delete-btn">删除</button>
      </div>
    `;
  },

  // 渲染底部按钮
  renderFooterButtons: function (mode) {
    const quickSaveSlot = saveManager.getSaveSlotInfo(
      saveManager.config.saveSlots - 1
    );

    if (mode === "save") {
      return `<button class="modal-btn quick-save-btn">快速存档</button>`;
    } else {
      return `
        <button class="modal-btn quick-load-btn" ${
          !quickSaveSlot ? "disabled" : ""
        }>
          快速读档
        </button>
      `;
    }
  },

  // 绑定存档槽事件
  bindSaveSlotEvents: function (modal, mode) {
    // 关闭按钮事件
    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.querySelector(".cancel-btn").onclick = () => modal.remove();

    // 存档槽事件
    modal.querySelectorAll(".save-slot").forEach((slot) => {
      const slotIndex = parseInt(slot.dataset.slot);

      if (mode === "save") {
        this.bindSaveEvents(slot, slotIndex, modal);
      } else {
        this.bindLoadEvents(slot, slotIndex, modal);
      }

      // 删除事件（两种模式都需要）
      this.bindDeleteEvent(slot, slotIndex, modal, mode);
    });

    // 快速操作事件
    this.bindQuickActionEvents(modal, mode);

    // 点击外部关闭
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },

  // 绑定保存事件
  bindSaveEvents: function (slot, slotIndex, modal) {
    const saveBtn = slot.querySelector(".save-btn");
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.stopPropagation(); // 防止事件冒泡

        // 添加加载状态
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "保存中...";
        saveBtn.disabled = true;

        setTimeout(() => {
          if (saveManager.saveGame(slotIndex)) {
            this.showNotification("游戏已保存！");
            modal.remove();
            this.hideMenu();
          } else {
            this.showNotification("保存失败，请重试");
            // 恢复按钮状态
            saveBtn.textContent = "保存";
            saveBtn.disabled = false;
          }
        }, 300);
      };
    }
  },

  // 绑定加载事件
  bindLoadEvents: function (slot, slotIndex, modal) {
    const loadBtn = slot.querySelector(".load-btn");
    if (loadBtn && !loadBtn.disabled) {
      loadBtn.onclick = () => {
        if (this.loadGameFromSlot(slotIndex)) {
          modal.remove();
          this.hideMenu();
        }
      };
    }
  },

  // 绑定删除事件
  bindDeleteEvent: function (slot, slotIndex, modal, mode) {
    const deleteBtn = slot.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        const slotInfo = saveManager.getSaveSlotInfo(slotIndex);
        const confirmMessage = slotInfo
          ? `确定要删除存档 ${slotIndex + 1} 吗？\n章节: ${this.getChapterName(
              slotInfo.chapter
            )}\n时间: ${slotInfo.date}`
          : "确定要删除这个存档吗？";

        if (confirm(confirmMessage)) {
          if (saveManager.deleteSave(slotIndex)) {
            this.showNotification("存档已删除");
            modal.remove();
            // 重新打开存档界面
            this.showSaveSlots(mode);
          } else {
            this.showNotification("删除失败");
          }
        }
      };
    }
  },

  // 绑定快速操作事件
  bindQuickActionEvents: function (modal, mode) {
    if (mode === "save") {
      const quickSaveBtn = modal.querySelector(".quick-save-btn");
      if (quickSaveBtn) {
        quickSaveBtn.onclick = () => {
          // 添加加载状态
          quickSaveBtn.textContent = "保存中...";
          quickSaveBtn.disabled = true;

          setTimeout(() => {
            if (saveManager.quickSave()) {
              this.showNotification("快速存档完成！");
              modal.remove();
              this.hideMenu();
            } else {
              this.showNotification("快速存档失败");
              quickSaveBtn.textContent = "快速存档";
              quickSaveBtn.disabled = false;
            }
          }, 300);
        };
      }
    } else {
      const quickLoadBtn = modal.querySelector(".quick-load-btn");
      if (quickLoadBtn && !quickLoadBtn.disabled) {
        quickLoadBtn.onclick = () => {
          // 添加加载状态
          quickLoadBtn.textContent = "加载中...";
          quickLoadBtn.disabled = true;

          setTimeout(() => {
            if (this.loadGameFromSlot(saveManager.config.saveSlots - 1)) {
              modal.remove();
              this.hideMenu();
            } else {
              quickLoadBtn.textContent = "快速读档";
              quickLoadBtn.disabled = false;
            }
          }, 300);
        };
      }
    }
  },

  // 从指定槽位加载游戏
  loadGameFromSlot: function (slotIndex) {
    if (saveManager.loadGame(slotIndex)) {
      this.showNotification("游戏已加载！");

      // 新增：检查当前是否在主页，如果是则切换到游戏界面
      const homePage = document.getElementById("home-page");
      const gameContainer = document.getElementById("game-container");

      if (homePage && homePage.classList.contains("home-page-active")) {
        console.log("检测到在主页加载存档，切换到游戏界面");

        // 切换到游戏界面
        homePage.classList.remove("home-page-active");
        homePage.classList.add("home-page-hidden");

        if (gameContainer) {
          gameContainer.classList.remove("game-container-hidden");
          gameContainer.classList.add("game-container-visible");
        }
      }
      // 恢复游戏界面状态
      this.restoreGameInterface();

      return true;
    } else {
      this.showNotification("加载失败，存档可能已损坏");
      return false;
    }
  },

  // 恢复游戏界面状态
  restoreGameInterface: function () {
    // 恢复场景
    if (typeof sceneManager !== "undefined") {
      sceneManager.setScene(gameState.currentScene);
    }

    // 恢复游戏进度显示
    if (typeof showCurrentStep === "function") {
      showCurrentStep();
    }

    // 更新侧边栏
    if (typeof sidebarManager !== "undefined") {
      sidebarManager.updateCluesList();
      sidebarManager.updateCharactersGrid();
    }

    // 确保菜单按钮显示
    this.setMenuButtonVisibility(true);

    // 停止主页音乐
    if (typeof homePageManager !== "undefined") {
      homePageManager.stopHomeBgm();
    }

    console.log("从主页成功切换到游戏界面");
  },

  // ===== 4. 其他功能方法 =====

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
      "白马湖上的阴谋 v1.0\n一个沉浸式推理游戏诞生地还挺艰难的"
    );
    this.hideMenu();
  },

  // ===== 5. 工具方法 =====

  // 获取章节显示名称
  getChapterName: function (chapter) {
    const chapters = {
      prologue: "序章",
      chapter1: "第一章",
      chapter2: "第二章",
    };
    return chapters[chapter] || chapter;
  },

  // 格式化游戏时间
  formatPlayTime: function (seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
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
