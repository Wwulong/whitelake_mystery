// 场景管理器
const sceneManager = {
  currentScene: "",

  setScene: function (sceneKey) {
    const sceneBackground = document.getElementById("scene-background");
    if (!sceneBackground) return;

    const sceneImages = {
      "police-station-outside": "images/scenes/police-station-outside.jpg",
      "police-station-inside": "images/scenes/police-station-inside.jpg",
      "white-horse-lake": "images/scenes/white-horse-lake.jpg",
    };

    if (sceneImages[sceneKey]) {
      const img = new Image();
      img.onload = () => {
        sceneBackground.style.backgroundImage = `url('${sceneImages[sceneKey]}')`;
        sceneBackground.classList.remove("scene-placeholder");
        sceneBackground.textContent = ""; // 清空占位文本
      };
      img.onerror = () => {
        sceneBackground.classList.add("scene-placeholder");
        sceneBackground.textContent = `场景图加载失败: ${sceneKey}`;
      };
      img.src = sceneImages[sceneKey];
    } else {
      sceneBackground.classList.add("scene-placeholder");
      sceneBackground.textContent = `未找到场景: ${sceneKey}`;
    }

    this.currentScene = sceneKey;
  },
};
// 底部对话框管理器
const dialogManager = {
  currentDialogIndex: 0,
  isTyping: false,
  currentText: "",
  typewriterTimer: null,

  init: function () {
    this.dialogElement = document.getElementById("vn-dialog");
    this.speakerNameElement = document.getElementById("speaker-name");
    this.dialogTextElement = document.getElementById("dialog-text");
    this.portraitImgElement = document.getElementById("portrait-img");
    this.portraitPlaceholder = document.getElementById("portrait-placeholder");
    this.continueIndicator = document.getElementById("continue-indicator");

    this.dialogElement.addEventListener("click", this.advanceDialog.bind(this));
    this.hideDialog();
  },

  showDialog: function () {
    this.dialogElement.classList.remove("vn-dialog-hidden");
    this.dialogElement.classList.add("vn-dialog-visible");
    gameState.isDialogActive = true;
  },

  hideDialog: function () {
    this.dialogElement.classList.remove("vn-dialog-visible");
    this.dialogElement.classList.add("vn-dialog-hidden");
    gameState.isDialogActive = false;
  },

  setDialog: function (speaker, text, portrait = "") {
    this.showDialog();

    if (speaker) {
      this.speakerNameElement.textContent = speaker;
      this.speakerNameElement.className = `speaker-${speaker.toLowerCase()}`;
      this.speakerNameElement.style.display = "block";
    } else {
      this.speakerNameElement.style.display = "none";
    }

    if (portrait) {
      // 先显示占位符
      if (this.portraitPlaceholder) {
        this.portraitPlaceholder.style.display = "flex";
        this.portraitPlaceholder.textContent = "加载中...";
      }
      this.portraitImgElement.style.display = "none";

      // 预加载图片
      const img = new Image();
      img.onload = () => {
        this.portraitImgElement.src = portrait;
        this.portraitImgElement.style.display = "block";
        if (this.portraitPlaceholder) {
          this.portraitPlaceholder.style.display = "none";
        }
      };
      img.onerror = () => {
        // 图片加载失败，显示占位符
        this.portraitImgElement.style.display = "none";
        if (this.portraitPlaceholder) {
          this.portraitPlaceholder.style.display = "flex";
          this.portraitPlaceholder.textContent = speaker || "角色";
        }
      };
      img.src = portrait;
    } else {
      // 没有头像时显示占位符
      this.portraitImgElement.style.display = "none";
      if (this.portraitPlaceholder) {
        this.portraitPlaceholder.style.display = "flex";
        this.portraitPlaceholder.textContent = speaker || "角色";
      }
    }

    this.typeText(text);
  },

  typeText: function (text) {
    // 清除之前的计时器
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
    }

    this.isTyping = true;
    this.currentText = text;
    this.dialogTextElement.textContent = "";
    this.continueIndicator.style.display = "none";

    // 移除之前的打字机效果类
    this.dialogTextElement.classList.remove("typing-effect");

    let i = 0;
    const speed = 30;

    const typeWriter = () => {
      if (i < text.length) {
        this.dialogTextElement.textContent += text.charAt(i);
        i++;
        this.typewriterTimer = setTimeout(typeWriter, speed);
      } else {
        this.isTyping = false;
        this.continueIndicator.style.display = "block";
        // 添加光标闪烁效果
        this.dialogTextElement.classList.add("typing-effect");
        this.dialogTextElement.style.animation =
          "blink-caret 0.75s step-end infinite";
      }
    };

    typeWriter();
  },

  completeTyping: function () {
    if (this.isTyping) {
      this.isTyping = false;
      this.dialogTextElement.textContent = this.currentText;
      this.continueIndicator.style.display = "block";
      // 清除计时器
      if (this.typewriterTimer) {
        clearTimeout(this.typewriterTimer);
      }
      // 添加光标闪烁效果
      this.dialogTextElement.classList.add("typing-effect");
      this.dialogTextElement.style.animation =
        "blink-caret 0.75s step-end infinite";
    }
  },

  advanceDialog: function () {
    if (this.isTyping) {
      this.completeTyping();
      return;
    }
    advanceGameDialog();
  },
};

// 右侧标签栏管理器（替换旧实现）
const sidebarManager = {
  init: function () {
    // 缓存节点
    this.sidebar = document.getElementById("right-sidebar");
    this.cluesTab = document.getElementById("clues-tab");
    this.charactersTab = document.getElementById("characters-tab");
    this.cluesListEl = document.getElementById("clues-list");
    this.charactersGridEl = document.getElementById("characters-grid");
    this.characterModal = document.getElementById("character-modal");
    this.characterDetailsEl = document.getElementById("character-details");

    // 如果没有侧栏，直接返回
    if (!this.sidebar) return;

    // 让 tab-icon 可聚焦（无障碍）
    this.sidebar.querySelectorAll(".tab-icon").forEach((icon) => {
      if (!icon.hasAttribute("tabindex")) icon.setAttribute("tabindex", "0");
    });

    // 点击 tab 图标：切换对应 sidebar-tab 的 active 类（显示/隐藏）
    this.sidebar.querySelectorAll(".tab-icon").forEach((icon) => {
      icon.addEventListener("click", (e) => {
        const tab = icon.closest(".sidebar-tab");
        if (!tab) return;
        const isActive = tab.classList.contains("active");

        // 关闭所有标签
        this.closeAllTabs();

        // 切换当前标签
        if (!isActive) {
          tab.classList.add("active");
          this.updateTabContent(tab.id);
        }
      });

      // 键盘支持：Enter / Space 激活
      icon.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          icon.click();
        }
      });
    });

    // 关闭按钮（×）
    this.sidebar.querySelectorAll(".close-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tab = btn.closest(".sidebar-tab");
        if (tab) tab.classList.remove("active");
      });
    });

    // 点击模态内的关闭 X（如果存在）
    if (this.characterModal) {
      const closeBtn = this.characterModal.querySelector(".close-modal");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.hideCharacterModal();
        });
      }

      // 点击模态外部关闭
      window.addEventListener("click", (e) => {
        if (e.target === this.characterModal) this.hideCharacterModal();
      });
    }

    // 初始渲染（懒渲染在打开时也会调用）
    this.updateCluesList();
    this.updateCharactersGrid();
  },

  closeAllTabs: function () {
    document
      .querySelectorAll(".sidebar-tab")
      .forEach((t) => t.classList.remove("active"));
  },

  updateTabContent: function (tabId) {
    if (tabId === "clues-tab") {
      this.updateCluesList();
    } else if (tabId === "characters-tab") {
      this.updateCharactersGrid();
    }
  },

  updateCluesList: function () {
    if (!this.cluesListEl) return;
    this.cluesListEl.innerHTML = ""; // 清空

    gameState.clues.forEach((clue) => {
      const item = document.createElement("div");
      item.className = "clue-item " + (clue.found ? "found" : "not-found");

      const h4 = document.createElement("h4");
      h4.textContent = clue.title;

      const p = document.createElement("p");
      p.textContent = clue.found ? clue.description : "？？？";

      item.appendChild(h4);
      item.appendChild(p);

      // 可选：点击未发现的线索不做事，点击已发现可添加额外行为
      item.addEventListener("click", () => {
        // 这里可以扩展：点击显示线索详情等
      });

      this.cluesListEl.appendChild(item);
    });
  },

  updateCharactersGrid: function () {
    if (!this.charactersGridEl) return;
    this.charactersGridEl.innerHTML = ""; // 清空

    gameState.characters.forEach((character) => {
      const item = document.createElement("div");
      item.className = "character-item";
      item.setAttribute("data-character-id", character.id);
      item.tabIndex = 0; // 可聚焦，便于键盘操作

      const img = document.createElement("img");
      img.className = "character-avatar";
      img.alt = character.name;
      img.src = character.avatar;

      // 头像加载失败处理：隐藏 img，显示名字占位
      img.onerror = () => {
        img.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className = "portrait-placeholder";
        fallback.textContent = character.name;
        item.insertBefore(fallback, item.firstChild);
      };

      const nameDiv = document.createElement("div");
      nameDiv.className = "character-name";
      nameDiv.textContent = character.name;

      item.appendChild(img);
      item.appendChild(nameDiv);

      // 点击或按回车打开详情
      item.addEventListener("click", () => {
        this.showCharacterDetails(character.id);
      });
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.showCharacterDetails(character.id);
        }
      });

      this.charactersGridEl.appendChild(item);
    });
  },

  showCharacterDetails: function (characterId) {
    const character = gameState.characters.find((c) => c.id === characterId);
    if (!character || !this.characterModal || !this.characterDetailsEl) return;

    // 使用安全的 DOM 方法构建模态内容（避免 innerHTML 注入风险）
    this.characterDetailsEl.innerHTML = ""; // 清空

    const header = document.createElement("div");
    header.className = "character-detail-header";

    const portrait = document.createElement("img");
    portrait.className = "character-detail-portrait";
    portrait.src = character.portrait;
    portrait.alt = character.name;
    portrait.onerror = () => (portrait.style.display = "none");

    const info = document.createElement("div");
    info.className = "character-detail-info";

    const h2 = document.createElement("h2");
    h2.textContent = character.name;

    const ageP = document.createElement("p");
    ageP.innerHTML = `<strong>年龄:</strong> ${character.details.age}`;

    const posP = document.createElement("p");
    posP.innerHTML = `<strong>职位:</strong> ${character.details.position}`;

    info.appendChild(h2);
    info.appendChild(ageP);
    info.appendChild(posP);

    header.appendChild(portrait);
    header.appendChild(info);

    const content = document.createElement("div");
    content.className = "character-detail-content";

    const descH = document.createElement("h3");
    descH.textContent = "人物描述";
    const descP = document.createElement("p");
    descP.textContent = character.details.description;

    const bgH = document.createElement("h3");
    bgH.textContent = "背景信息";
    const bgP = document.createElement("p");
    bgP.textContent = character.details.background;

    content.appendChild(descH);
    content.appendChild(descP);
    content.appendChild(bgH);
    content.appendChild(bgP);

    this.characterDetailsEl.appendChild(header);
    this.characterDetailsEl.appendChild(content);

    // 显示模态
    this.characterModal.style.display = "block";
  },

  hideCharacterModal: function () {
    if (!this.characterModal) return;
    this.characterModal.style.display = "none";
  },

  // 发现新线索（在游戏进程中调用）
  discoverClue: function (clueId) {
    const clue = gameState.clues.find((c) => c.id === clueId);
    if (clue && !clue.found) {
      clue.found = true;
      this.updateCluesList();
      this.showClueDiscovery(clue.title);
    }
  },

  showClueDiscovery: function (clueTitle) {
    const notification = document.createElement("div");
    notification.className = "clue-notification";
    notification.textContent = `🔍 新线索发现: ${clueTitle}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },
};
const gameState = {
  currentStep: 0,
  isDialogActive: false,
  // 新增：线索和角色数据
  clues: [
    {
      id: 1,
      title: "现场打斗痕迹",
      description: "白马湖边发现明显的打斗痕迹",
      found: true,
    },
    { id: 2, title: "目击者证词", description: "有待收集", found: false },
    {
      id: 3,
      title: "电话报警记录",
      description: "刚刚接到的紧急电话",
      found: true,
    },
  ],
  characters: [
    {
      id: 1,
      name: "狮子",
      avatar: "images/characters/lion-portrait.png",
      portrait: "images/characters/lion-portrait.png",
      details: {
        age: "35岁",
        position: "刑警队长",
        description: "经验丰富的刑警队长，以敏锐的直觉著称",
        background: "从警12年，破获多起重大案件，以果断和正义感闻名",
      },
    },
    {
      id: 2,
      name: "小牛",
      avatar: "images/characters/xiaoniu-portrait.png",
      portrait: "images/characters/xiaoniu-portrait.png",
      details: {
        age: "24岁",
        position: "实习刑警",
        description: "充满热情的新人警官，狮子的徒弟",
        background: "警校优秀毕业生，正在积累实战经验",
      },
    },
    {
      id: 3,
      name: "猎豹",
      avatar: "images/characters/liebao-portrait.png",
      portrait: "images/characters/liebao-portrait.png",
      details: {
        age: "32岁",
        position: "资深刑警",
        description: "行动迅速，擅长现场勘查",
        background: "特种部队退役，拥有出色的格斗和追踪能力",
      },
    },
  ],
};

// 序章脚本数据
const prologueScript = [
  {
    type: "narrator",
    content:
      "今天你一如往常的来到警局上班，栗枫市的冬天简直冷到骨子里，不知道今天又是怎样的一天呢？",
    interaction: "push-door",
    scene: "police-station-outside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content: "（急急冲上来）师傅你来了！",
    portrait: "images/characters/xiaoniu-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "（意外）诶？猎豹哪里去了？怎么只有你们在局里？",
    portrait: "images/characters/lion-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content:
      "师傅我正要说呢！就在刚刚接到电话，豹哥就出警去了！有目击者称在白马湖发现尸体！马姐也跟着去了！",
    portrait: "images/characters/xiaoniu-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "嗯嗯情况怎么样？",
    portrait: "images/characters/lion-portrait.png",
    next: "phone_ring",
    scene: "police-station-inside",
  },
  {
    type: "narrator",
    content: "（没等回答，桌子上座机响了起来。）",
    interaction: "answer_phone",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "猎豹",
    content:
      "队长！情况不简单，这里发现了一处打斗现场。白马河环境复杂，申请支援！",
    portrait: "images/characters/liebao-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "好，我马上出发！",
    portrait: "images/characters/lion-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "thought",
    speaker: "狮子",
    content: "小牛还是新人，需要锻炼一下，带着一起吧",
    portrait: "images/characters/lion-portrait.png",
    next: "take_xiaoniu",
    scene: "police-station-inside",
  },
  {
    type: "narrator",
    content: "（点击小牛）",
    interaction: "click_xiaoniu",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "狮子",
    content: "走，咱们一起。",
    portrait: "images/characters/lion-portrait.png",
    next: "auto",
    scene: "police-station-inside",
  },
  {
    type: "dialog",
    speaker: "小牛",
    content: "是！",
    portrait: "images/characters/xiaoniu-portrait.png",
    next: "complete",
    scene: "police-station-inside",
  },
];

// 游戏初始化
document.addEventListener("DOMContentLoaded", function () {
  dialogManager.init();
  sidebarManager.init();

  // 设置初始场景
  sceneManager.setScene("police-station-outside");

  // 初始交互：推门
  document.getElementById("push-door").addEventListener("click", function () {
    gameState.currentStep = 1;
    showCurrentStep();

    // 发现初始线索
    sidebarManager.discoverClue(3); // 电话报警记录
  });
});

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
        step.portrait
      );
    } else {
      dialogManager.setDialog(step.speaker, step.content, step.portrait);
    }
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
