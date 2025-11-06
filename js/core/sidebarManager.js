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

  hasShownTutorial: false, // 新增：是否已显示过教学指引

  // 修改：遇到新角色的方法
  encounterCharacter: function (characterId) {
    if (gameState.encounterCharacter(characterId)) {
      this.updateCharactersGrid();
      this.showCharacterEncounter(characterId);

      // 如果是第一个角色且未显示过教学指引，显示档案指引
      if (
        !this.hasShownTutorial &&
        gameState.getEncounteredCharacters().length === 1
      ) {
        this.showArchiveTutorial();
        this.hasShownTutorial = true;
      }

      return true;
    }
    return false;
  },

  // 新增：显示档案教学指引
  showArchiveTutorial: function () {
    // 防止重复显示
    if (this.hasShownTutorial) return;
    this.hasShownTutorial = true;

    const tutorial = document.createElement("div");
    tutorial.className = "archive-tutorial";
    tutorial.innerHTML = `
      <div class="tutorial-content">
      <div class="tutorial-header">
        <h3>📖 角色档案系统</h3>
        <span class="close-tutorial">×</span>
      </div>
      <div class="tutorial-body">
        <p><strong>欢迎来到白马湖上的阴谋！</strong></p>
        <p>您已解锁第一个角色档案！</p>
        <p>点击右侧 <span class="tutorial-highlight">👥 角色图标</span></p>
        <div class="tutorial-arrow">→</div>
        <p>查看角色的详细信息、背景故事和关系网</p>
        <p class="tutorial-tip">随着剧情推进，会遇到更多角色并解锁他们的档案</p>
      </div>
      <div class="tutorial-footer">
        <button class="tutorial-confirm">开始调查</button>
      </div>
    </div>
    `;

    document.body.appendChild(tutorial);

    // 关闭按钮事件
    const closeBtn = tutorial.querySelector(".close-tutorial");
    const confirmBtn = tutorial.querySelector(".tutorial-confirm");

    const closeTutorial = () => {
      tutorial.classList.add("fade-out");
      setTimeout(() => {
        if (tutorial.parentNode) {
          tutorial.parentNode.removeChild(tutorial);
        }
      }, 300);
    };

    closeBtn.addEventListener("click", closeTutorial);
    confirmBtn.addEventListener("click", closeTutorial);

    // 8秒后自动关闭（可选）
    setTimeout(closeTutorial, 8000);
  },

  // 修改：显示角色遇到通知（简化版）
  showCharacterEncounter: function (characterId) {
    const character = gameState.characters.find((c) => c.id === characterId);
    if (!character) return;

    const notification = document.createElement("div");
    notification.className = "character-notification";
    notification.innerHTML = `
      <span class="notification-icon">👥</span>
      <div class="notification-content">
        <div class="notification-title">新角色档案</div>
        <div class="notification-character">${character.name}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 3000);
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

    // 获取已发现的线索
    const discoveredClues = gameState.getDiscoveredClues();

    // 如果没有发现任何线索，显示提示信息
    if (discoveredClues.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "clues-empty";
      emptyMessage.textContent = "尚未发现任何线索";
      this.cluesListEl.appendChild(emptyMessage);
      return;
    }

    discoveredClues.forEach((clue) => {
      const item = document.createElement("div");
      item.className = "clue-item found";
      item.setAttribute("data-clue-id", clue.id);

      const title = document.createElement("h4");
      title.textContent = clue.title;

      const description = document.createElement("p");
      description.textContent = clue.description;

      item.appendChild(title);
      item.appendChild(description);

      // 点击已发现的线索可以查看详情
      item.classList.add("clickable");
      item.addEventListener("click", () => {
        this.showClueDetails(clue.id);
      });

      this.cluesListEl.appendChild(item);
    });
    // 更新线索计数
    this.updateClueCounter();
  },

  // 显示线索详情
  showClueDetails: function (clueId) {
    const clue = gameState.clues.find((c) => c.id === clueId);
    if (!clue) return;

    // 创建线索详情弹窗
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content clue-modal">
        <span class="close-modal">&times;</span>
        <div class="clue-detail-header">
          <h2>${clue.title}</h2>
        </div>
        <div class="clue-detail-content">
          <p><strong>描述:</strong> ${clue.description}</p>
          <p><strong>关联信息:</strong> 此线索可能与案件的关键环节有关</p>
        </div>
        <div class="clue-notes">
          <h3>侦查笔记</h3>
          <textarea placeholder="记录关于这个线索的想法..."></textarea>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 关闭按钮事件
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    // 点击外部关闭
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  // 更新线索计数器
  updateClueCounter: function () {
    const discoveredCount = gameState.getDiscoveredClues().length;
    const totalCount = gameState.clues.length;

    // 更新标签图标显示计数
    const cluesTabIcon = document.querySelector("#clues-tab .tab-icon");
    if (cluesTabIcon) {
      cluesTabIcon.textContent = `🔍 ${discoveredCount}/${totalCount}`;
    }
  },

  updateCharactersGrid: function () {
    if (!this.charactersGridEl) return;
    this.charactersGridEl.innerHTML = ""; // 清空
    // 只显示已遇到的角色
    const encounteredCharacters = gameState.getEncounteredCharacters();

    // 如果没有遇到任何角色，显示提示信息
    if (encounteredCharacters.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "characters-empty";
      emptyMessage.textContent = "尚未遇到任何角色";
      this.charactersGridEl.appendChild(emptyMessage);
      return;
    }

    encounteredCharacters.forEach((character) => {
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
    if (gameState.discoverClue(clueId)) {
      this.updateCluesList(); // 这会重新渲染整个线索列表
      this.showClueDiscovery(clueId);
      return true;
    }
    return false;
  },

  showClueDiscovery: function (clueTitle) {
    const notification = document.createElement("div");
    notification.className = "clue-notification";
    notification.textContent = `🔍 新线索发现: ${clueTitle}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },
};
