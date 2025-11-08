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

  // 初始化游戏状态
  if (typeof gameState.init === "function") {
    gameState.init();
  }

  console.log("线索数据加载:", cluesData.length, "条");
  console.log("角色数据加载:", charactersData.length, "个");
  console.log("脚本数据加载:", prologueScript.length, "步");

  // 2. 初始化管理器
  menuManager.init(); // 先初始化菜单管理器
  homePageManager.init(); // 然后初始化主页
  dialogManager.init();
  sidebarManager.init();
  audioManager.init();
  console.log("游戏初始化完成 - 显示主页");
}

// 从主页管理器调用的初始化游戏函数
function initializeGame() {
  // 设置初始场景
  console.log("准备设置初始场景...");
  sceneManager.setScene("police-station-outside");

  // 绑定事件
  bindInitialEvents();

  // 确保菜单按钮显示
  if (typeof menuManager !== "undefined") {
    menuManager.setMenuButtonVisibility(true);
  }
  // 调试：检查菜单状态
  console.log("游戏开始 - 菜单状态检查:");
  const menuBtn = document.getElementById("menu-btn");
  console.log("菜单按钮:", menuBtn);
  console.log("菜单按钮显示状态:", menuBtn ? menuBtn.style.display : "未找到");

  if (menuBtn && menuBtn.style.display !== "flex") {
    console.log("修复菜单按钮显示状态");
    menuBtn.style.display = "flex";
  }
  // 确保菜单按钮显示
  if (typeof menuManager !== "undefined") {
    menuManager.setMenuButtonVisibility(true);
  }

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
    alert("下一章：白马湖现场调查");
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
