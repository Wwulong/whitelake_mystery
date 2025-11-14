const illustrationManager = {
  init: function () {
    console.log("初始化立绘管理器...");

    this.illustrations = {
      left: document.querySelector(".illustration-left"),
      right: document.querySelector(".illustration-right"),
      center: document.querySelector(".illustration-center"),
    };
    // 确保立绘层级低于侧边栏
    Object.values(this.illustrations).forEach((illustration) => {
      if (illustration) {
        illustration.style.zIndex = "900";
      }
    });

    // 调试：检查是否找到立绘容器
    console.log("立绘容器:", this.illustrations);

    this.currentIllustrations = {
      left: null,
      right: null,
      center: null,
    };
    console.log("立绘管理器初始化完成");
  },

  // 显示角色立绘
  showIllustration: function (
    characterId,
    position = "left",
    expression = "normal"
  ) {
    // 先隐藏所有立绘
    this.hideAllIllustrations();
    // 显示指定位置的立绘
    const illustration = document.querySelector(`.illustration-${position}`);
    if (illustration) {
      // 设置立绘图片等逻辑
      illustration.style.display = "block";
    }
    console.log(
      `显示立绘 - 角色: ${characterId}, 位置: ${position}, 表情: ${expression}`
    );

    const character = gameState.characters.find((c) => c.id === characterId);
    if (!character || !character.illustrations) return;

    const illustrationPath =
      character.illustrations[expression] || character.illustrations.normal;
    if (!illustrationPath) return;

    const container = this.illustrations[position];
    if (!container) return;

    // 隐藏当前立绘
    this.hideIllustration(position);

    // 设置立绘
    const img = container.querySelector(".illustration-img");
    img.src = illustrationPath;
    img.alt = character.name;

    // 添加角色类名用于特殊样式
    container.className = `illustration illustration-${position} ${character.name.toLowerCase()}`;

    // 显示立绘
    container.style.display = "block";

    // 添加激活动画
    setTimeout(() => {
      container.classList.add("active");
    }, 50);

    this.currentIllustrations[position] = characterId;
  },

  // 隐藏立绘
  hideIllustration: function (position) {
    const container = this.illustrations[position];
    if (container) {
      container.classList.remove("active");

      container.style.display = "none";
    }

    this.currentIllustrations[position] = null;
  },

  // 隐藏所有立绘
  hideAllIllustrations: function () {
    Object.keys(this.illustrations).forEach((position) => {
      this.hideIllustration(position);
    });
    const illustrations = document.querySelectorAll(".illustration");
    illustrations.forEach((illustration) => {
      illustration.style.display = "none";
    });
  },

  // 根据说话者自动安排立绘位置
  arrangeIllustration: function (speakerCharacterId, otherCharacterId = null) {
    // 简单的自动布局逻辑
    if (otherCharacterId) {
      // 两个角色对话：主角在左，对方在右
      this.showIllustration(speakerCharacterId, "left");
      this.showIllustration(otherCharacterId, "right");
    } else {
      // 单个角色：居中显示
      this.showIllustration(speakerCharacterId, "center");
    }
  },
};
