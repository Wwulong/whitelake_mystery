// 游戏主入口
document.addEventListener("DOMContentLoaded", function () {
  initGame();
});

function initGame() {
  console.log("开始初始化游戏...");

  // 1. 先加载数据到 gameState
  gameState.clues = cluesData;
  gameState.characters = charactersData;
  gameState.currentScript = prologueScript;

  console.log("线索数据加载:", cluesData.length, "条");
  console.log("角色数据加载:", charactersData.length, "个");
  console.log("脚本数据加载:", prologueScript.length, "步");

  // 2. 初始化主页
  homePageManager.init();

  // 3. 初始化管理器（但不立即显示游戏）
  dialogManager.init();
  sidebarManager.init();
  menuManager.init();

  console.log("游戏初始化完成 - 显示主页");
}

// 从主页管理器调用的初始化游戏函数
function initializeGame() {
  // 设置初始场景
  console.log("准备设置初始场景...");
  sceneManager.setScene("police-station-outside");

  // 绑定事件
  bindInitialEvents();

  console.log("游戏开始！");
}

function bindInitialEvents() {
  const pushDoorBtn = document.getElementById("push-door");
  if (pushDoorBtn) {
    pushDoorBtn.addEventListener("click", function () {
      gameState.currentStep = 1;
      showCurrentStep();
    });
  }
}

function showCurrentStep() {
  const step = prologueScript[gameState.currentStep];
  const mainText = document.getElementById("main-text");
  const interactionArea = document.getElementById("interaction-area");
  const dynamicOptions = document.getElementById("dynamic-options");

  dynamicOptions.innerHTML = "";

  // 设置场景
  if (step.scene) {
    sceneManager.setScene(step.scene);
  }

  if (step.type === "narrator") {
    // 叙述性文本
    dialogManager.setDialog("", step.content);
    mainText.style.display = "none";

    // 设置交互按钮
    if (step.interaction === "push-door") {
      document.getElementById("push-door").style.display = "block";
    } else {
      createInteractionButton(step.interaction);
    }
  } else if (step.type === "dialog" || step.type === "thought") {
    // 对话或内心独白
    mainText.style.display = "none";
    document.getElementById("push-door").style.display = "none";

    if (step.type === "thought") {
      // 内心独白特殊处理
      dialogManager.setDialog(
        step.speaker,
        `（心想：${step.content}）`,
        step.portrait,
        step.characterId // 新增：传递角色ID
      );
    } else {
      dialogManager.setDialog(
        step.speaker,
        step.content,
        step.portrait,
        step.characterId
      );
    }
  }

  // 处理线索发现
  if (step.discoverClues && step.discoverClues.length > 0) {
    step.discoverClues.forEach((clueId) => {
      sidebarManager.discoverClue(clueId);
    });
  }
}

function advanceGameDialog() {
  const currentStep = prologueScript[gameState.currentStep];

  if (currentStep.next === "auto") {
    gameState.currentStep++;
    if (gameState.currentStep < prologueScript.length) {
      showCurrentStep();

      // 在特定步骤发现线索
      if (gameState.currentStep === 3) {
        // 小牛提到尸体
        sidebarManager.discoverClue(1); // 现场打斗痕迹
      }
    } else {
      completePrologue();
    }
  } else {
    handleSpecialEvent(currentStep.next);
  }
}

function completePrologue() {
  dialogManager.hideDialog();
  document.getElementById("main-text").style.display = "block";
  document.getElementById("main-text").textContent =
    "序章完成！即将前往白马湖现场...";
  document.getElementById("push-door").style.display = "none";
  document.getElementById("dynamic-options").innerHTML = "";

  // 添加继续按钮
  const continueBtn = document.createElement("button");
  continueBtn.className = "interaction-btn";
  continueBtn.textContent = "继续游戏";
  continueBtn.onclick = function () {
    alert("游戏进入下一章：白马湖现场调查");
    // 这里可以跳转到下一章
  };
  document.getElementById("interaction-area").appendChild(continueBtn);
}

function handleSpecialEvent(eventType) {
  switch (eventType) {
    case "phone_ring":
      gameState.currentStep = 5;
      showCurrentStep();
      break;
    case "take_xiaoniu":
      gameState.currentStep = 9;
      showCurrentStep();
      break;
    case "complete":
      completePrologue();
      break;
  }
}

function createInteractionButton(interactionType) {
  const dynamicOptions = document.getElementById("dynamic-options");
  const button = document.createElement("button");
  button.className = "interaction-btn";
  button.textContent = getInteractionText(interactionType);
  button.onclick = function () {
    handleInteraction(interactionType);
  };
  dynamicOptions.appendChild(button);
}

function handleInteraction(interactionType) {
  // 先隐藏对话框
  dialogManager.hideDialog();

  switch (interactionType) {
    case "answer_phone":
      gameState.currentStep = 6;
      showCurrentStep();
      break;
    case "click_xiaoniu":
      gameState.currentStep = 10;
      showCurrentStep();
      break;
  }
}

function getInteractionText(interactionType) {
  const texts = {
    answer_phone: "接听电话",
    click_xiaoniu: "点击小牛",
  };
  return texts[interactionType] || "继续";
}

// 辅助函数：文本中的强调效果
function formatDialogText(text) {
  // 将（括号内容）变为斜体
  return text.replace(/（([^）]+)）/g, "<em>（$1）</em>");
}

// 特殊对话框效果
function showNarratorText(text) {
  dialogManager.setDialog("", text);
  // 叙述性文本可以有不同的样式
  document.getElementById("speaker-name").style.display = "none";
}

function showThoughtText(character, text) {
  // 内心独白可以用不同样式
  dialogManager.setDialog(character, `（心想：${text}）`);
  document.getElementById("speaker-name").classList.add("thought-bubble");
}

//菜单
// ===== 修复版菜单管理器 =====
const menuManager = {
  init: function () {
    // 先移除可能已存在的菜单元素（避免重复）
    const existingMenu = document.getElementById("game-menu");
    const existingMenuBtn = document.getElementById("menu-btn");
    if (existingMenu) existingMenu.remove();
    if (existingMenuBtn) existingMenuBtn.remove();

    // 创建菜单元素
    this.createMenuElements();
    this.bindEvents();
  },

  createMenuElements: function () {
    // 创建菜单按钮
    const menuBtn = document.createElement("button");
    menuBtn.id = "menu-btn";
    menuBtn.className = "menu-toggle";
    menuBtn.innerHTML = "☰";
    menuBtn.title = "游戏菜单";
    document.body.appendChild(menuBtn);

    // 创建菜单容器
    const gameMenu = document.createElement("div");
    gameMenu.id = "game-menu";
    gameMenu.className = "menu-hidden";
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

    // 重新获取元素引用
    this.menuBtn = document.getElementById("menu-btn");
    this.gameMenu = document.getElementById("game-menu");
    this.closeMenuBtn = document.getElementById("close-menu");
    this.saveGameBtn = document.getElementById("save-game");
    this.loadGameBtn = document.getElementById("load-game");
    this.settingsBtn = document.getElementById("settings-btn");
    this.backToTitleBtn = document.getElementById("back-to-title");
    this.aboutBtn = document.getElementById("about-btn");

    // 添加菜单CSS样式
    this.addMenuStyles();
  },

  addMenuStyles: function () {
    // 移除可能已存在的样式
    const existingStyle = document.getElementById("menu-styles");
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = "menu-styles";
    style.textContent = this.getMenuStyles();
    document.head.appendChild(style);
  },

  getMenuStyles: function () {
    return `
    `;
  },

  bindEvents: function () {
    // 菜单按钮点击事件
    this.menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showMenu();
    });

    // 关闭菜单
    this.closeMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideMenu();
    });

    // 点击菜单外部关闭
    this.gameMenu.addEventListener("click", (e) => {
      if (e.target === this.gameMenu) {
        this.hideMenu();
      }
    });

    // 菜单功能按钮
    const buttons = [
      { element: this.saveGameBtn, action: () => this.saveGame() },
      { element: this.loadGameBtn, action: () => this.loadGame() },
      { element: this.settingsBtn, action: () => this.showSettings() },
      { element: this.backToTitleBtn, action: () => this.backToTitle() },
      { element: this.aboutBtn, action: () => this.showAbout() },
    ];

    buttons.forEach((btn) => {
      if (btn.element) {
        btn.element.addEventListener("click", (e) => {
          e.stopPropagation();
          btn.action();
        });
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
  },

  showMenu: function () {
    this.gameMenu.classList.remove("menu-hidden");
    gameState.isMenuOpen = true;
  },

  hideMenu: function () {
    this.gameMenu.classList.add("menu-hidden");
    gameState.isMenuOpen = false;
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
    this.showNotification("设置功能开发中...");
    this.hideMenu();
  },

  backToTitle: function () {
    if (confirm("确定要返回标题画面吗？未保存的进度将会丢失。")) {
      // 使用主页管理器返回主页
      homePageManager.showHome();
      this.showNotification("已返回标题画面");
      this.hideMenu();
    }
  },

  showAbout: function () {
    this.showNotification("白马湖上的阴谋 v1.0\\n一个沉浸式推理游戏");
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
