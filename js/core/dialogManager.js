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

  setDialog: function (speaker, text, portrait = "", characterId = "") {
    this.showDialog();

    if (speaker) {
      this.speakerNameElement.textContent = speaker;
      this.speakerNameElement.className = `speaker-${speaker.toLowerCase()}`;
      this.speakerNameElement.style.display = "block";
    } else {
      this.speakerNameElement.style.display = "none";
    }

    // 新增：如果有 characterId，解锁该角色
    if (characterId) {
      sidebarManager.encounterCharacter(characterId);
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
