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
    this.dialogElement.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    this.hideDialog();
  },

  // 在 dialogManager 对象中添加方法
  manageInteractionArea: function (show = true) {
    const interactionArea = document.getElementById("interaction-area");
    if (interactionArea) {
      if (show) {
        interactionArea.style.display = "flex";
        // 确保交互区域在对话框上方可见位置
        interactionArea.style.zIndex = "999";
      } else {
        interactionArea.style.display = "none";
      }
    }
  },

  // 新增：确保对话框层级的方法
  ensureDialogZIndex: function () {
    if (this.dialogElement) {
      this.dialogElement.style.zIndex = "2000";
    }
  },

  showDialog: function () {
    if (!this.dialogElement) return;
    // 强制修复定位
    this.fixDialogPosition();
    this.dialogElement.classList.remove("vn-dialog-hidden");
    this.dialogElement.classList.add("vn-dialog-visible");
    gameState.isDialogActive = true;

    this.manageInteractionArea(false);
  },

  hideDialog: function () {
    if (!this.dialogElement) return;
    this.manageInteractionArea(true);
    this.dialogElement.classList.remove("vn-dialog-visible");
    this.dialogElement.classList.add("vn-dialog-hidden");
    gameState.isDialogActive = false;

    // 隐藏立绘
    if (typeof illustrationManager !== "undefined") {
      illustrationManager.hideAllIllustrations();
    }
  },

  fixDialogPosition: function () {
    if (!this.dialogElement) return;

    // 确保对话框在底部固定定位
    this.dialogElement.style.position = "fixed";
    this.dialogElement.style.bottom = "0";
    this.dialogElement.style.left = "0";
    this.dialogElement.style.width = "100%";
  },

  setDialog: function (
    speaker,
    text,
    portrait = "",
    characterId = "",
    illustration = null
  ) {
    console.log("设置对话框 - 说话者:", speaker, "文本:", text);
    this.ensureDialogZIndex();
    this.manageInteractionArea(false);
    this.showDialog();

    // 如果有立绘信息，显示立绘
    if (illustration && typeof illustrationManager !== "undefined") {
      const {
        characterId: illuCharId,
        position = "left",
        expression = "normal",
      } = illustration;
      illustrationManager.showIllustration(illuCharId, position, expression);
    } else if (characterId && typeof illustrationManager !== "undefined") {
      // 默认显示说话者立绘在左侧
      illustrationManager.showIllustration(characterId, "left");
    }

    // 重置显示状态
    if (this.speakerNameElement) {
      this.speakerNameElement.style.display = "none";
      if (speaker) {
        console.log("显示说话者名字:", speaker);
        this.speakerNameElement.textContent = speaker;
        this.speakerNameElement.className = `speaker-${speaker.toLowerCase()}`;
        this.speakerNameElement.style.display = "block";
      } else {
        console.error("speakerNameElement 未找到!");
      }

      // 新增：如果有 characterId，解锁该角色
      if (characterId) {
        sidebarManager.encounterCharacter(characterId);
      }
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
    // 播放对话框前进音效
    if (typeof audioManager !== "undefined") {
      audioManager.playSound("dialog_advance");
    }

    // 推进游戏对话
    if (typeof advanceGameDialog === "function") {
      advanceGameDialog();
    } else {
      console.warn("advanceGameDialog 函数未定义");
    }
  },
};
