// 右侧标签栏管理器（修复版）
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
    if (!this.sidebar) {
      console.error("侧边栏元素未找到");
      return;
    }

    console.log("开始初始化侧边栏...");

    // 确保侧边栏可点击
    this.ensureSidebarClickable();
    this.ensureSidebarZIndex();

    // 修复事件绑定（不替换节点）
    this.bindEventsProperly();

    this.initSearchFunctionality();

    // 让 tab-icon 可聚焦（无障碍）
    this.sidebar.querySelectorAll(".tab-icon").forEach((icon) => {
      if (!icon.hasAttribute("tabindex")) icon.setAttribute("tabindex", "0");
    });

    // 初始渲染
    this.updateCluesList();
    this.updateCharactersGrid();

    console.log("侧边栏初始化完成");
  },

  // 修复的事件绑定方法
  bindEventsProperly: function () {
    console.log("绑定侧边栏事件...");

    // 标签图标点击事件 - 简化版本
    this.sidebar.querySelectorAll(".tab-icon").forEach((icon) => {
      // 移除可能存在的重复事件监听器
      icon.removeEventListener("click", this.handleTabIconClick);

      // 添加新的事件监听器
      icon.addEventListener("click", this.handleTabIconClick.bind(this));

      // 键盘支持
      icon.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleTabIconClick.call(this, e);
        }
      });
    });

    // 关闭按钮事件
    this.sidebar.querySelectorAll(".close-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = btn.closest(".sidebar-tab");
        if (tab) {
          tab.classList.remove("active");
          console.log("关闭标签:", tab.id);
        }
      });
    });

    // 角色模态框事件
    if (this.characterModal) {
      const closeBtn = this.characterModal.querySelector(".close-modal");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.hideCharacterModal();
        });
      }

      // 点击模态外部关闭
      this.characterModal.addEventListener("click", (e) => {
        if (e.target === this.characterModal) this.hideCharacterModal();
      });
    }

    console.log("侧边栏事件绑定完成");
  },

  // 标签图标点击处理
  handleTabIconClick: function (e) {
    // 轻微阻止默认行为，但不完全阻止冒泡
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const icon = e.currentTarget || e.target;
    const tab = icon.closest(".sidebar-tab");
    if (!tab) return;

    const isActive = tab.classList.contains("active");
    console.log("点击标签:", tab.id, "当前状态:", isActive);

    // 关闭所有标签
    this.closeAllTabs();

    // 切换当前标签
    if (!isActive) {
      tab.classList.add("active");
      this.updateTabContent(tab.id);
      console.log("打开标签:", tab.id);
    }
  },

  // 确保侧边栏可点击
  ensureSidebarClickable: function () {
    if (!this.sidebar) return;

    this.sidebar.style.pointerEvents = "auto";
    this.sidebar.style.zIndex = "10000";

    // 确保所有子元素也可点击
    const allElements = this.sidebar.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.pointerEvents = "auto";
    });

    // 特别确保标签内容可点击
    const tabContents = this.sidebar.querySelectorAll(".tab-content");
    tabContents.forEach((tab) => {
      tab.style.pointerEvents = "auto";
      tab.style.zIndex = "10003";
    });

    const tabIcons = this.sidebar.querySelectorAll(".tab-icon");
    tabIcons.forEach((icon) => {
      icon.style.pointerEvents = "auto";
      icon.style.zIndex = "10002";
      icon.style.cursor = "pointer";
    });
  },

  // 确保侧边栏层级
  ensureSidebarZIndex: function () {
    if (!this.sidebar) return;

    this.sidebar.style.position = "fixed";
    this.sidebar.style.right = "0";
    this.sidebar.style.top = "50%";
    this.sidebar.style.transform = "translateY(-50%)";
    this.sidebar.style.zIndex = "10000";

    console.log("侧边栏层级设置完成");
  },

  // 显示侧边栏
  showSidebar: function () {
    if (this.sidebar) {
      this.sidebar.style.display = "flex";
    }
  },

  // 隐藏侧边栏
  hideSidebar: function () {
    if (this.sidebar) {
      this.sidebar.style.display = "none";
    }
  },

  closeAllTabs: function () {
    document
      .querySelectorAll(".sidebar-tab")
      .forEach((t) => t.classList.remove("active"));
  },

  updateTabContent: function (tabId) {
    // 在显示标签内容前确保层级
    this.ensureSidebarZIndex();
    if (tabId === "clues-tab") {
      this.updateCluesList();
    } else if (tabId === "characters-tab") {
      this.updateCharactersGrid();
    }
  },

  // 搜索功能初始化
  initSearchFunctionality: function () {
    // 创建搜索框HTML
    this.createSearchBox();

    // 绑定搜索事件
    this.bindSearchEvents();
  },

  // 创建搜索框
  createSearchBox: function () {
    if (!this.cluesListEl) return;

    const searchHTML = `
    <div class="clue-search-container">
      <div class="search-input-wrapper">
        <input type="text" id="clue-search-input" placeholder="搜索线索..." class="clue-search-input">
        <span class="search-icon">🔍</span>
        <button id="clear-search" class="clear-search-btn" style="display: none;">×</button>
      </div>
      <div class="search-stats" id="search-stats"></div>
    </div>
  `;

    // 在线索列表前插入搜索框
    this.cluesListEl.insertAdjacentHTML("beforebegin", searchHTML);
  },

  // 绑定搜索事件
  bindSearchEvents: function () {
    const searchInput = document.getElementById("clue-search-input");
    const clearBtn = document.getElementById("clear-search");

    if (!searchInput) return;

    // 输入时实时搜索
    searchInput.addEventListener("input", (e) => {
      this.performSearch(e.target.value);
      clearBtn.style.display = e.target.value ? "block" : "none";
    });

    // 清除搜索
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      this.performSearch("");
      clearBtn.style.display = "none";
      searchInput.focus();
    });

    // 按ESC清除搜索
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        this.performSearch("");
        clearBtn.style.display = "none";
      }
    });
  },

  // 执行搜索
  performSearch: function (searchTerm) {
    if (!this.cluesListEl) return;

    const discoveredClues = gameState.getDiscoveredClues();
    const searchStats = document.getElementById("search-stats");

    // 如果没有搜索词，显示所有线索
    if (!searchTerm.trim()) {
      this.updateCluesList();
      if (searchStats) {
        searchStats.textContent = "";
      }
      return;
    }

    // 过滤线索
    const filteredClues = discoveredClues.filter(
      (clue) =>
        clue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 更新统计信息
    if (searchStats) {
      const total = discoveredClues.length;
      const found = filteredClues.length;
      searchStats.textContent = `找到 ${found}/${total} 个线索`;
      searchStats.className = `search-stats ${
        found === 0 ? "no-results" : "has-results"
      }`;
    }

    // 渲染过滤后的线索
    this.renderFilteredClues(filteredClues, searchTerm);
  },

  // 渲染过滤后的线索
  renderFilteredClues: function (clues, searchTerm) {
    if (!this.cluesListEl) return;

    this.cluesListEl.innerHTML = "";

    if (clues.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "clues-empty search-empty";
      emptyMessage.textContent = "没有找到匹配的线索";
      this.cluesListEl.appendChild(emptyMessage);
      return;
    }

    clues.forEach((clue) => {
      const item = this.createClueItem(clue, searchTerm);
      this.cluesListEl.appendChild(item);
    });
  },

  // 创建线索项（带高亮）
  createClueItem: function (clue, searchTerm) {
    const item = document.createElement("div");
    item.className = "clue-item found";
    item.setAttribute("data-clue-id", clue.id);

    const title = document.createElement("h4");
    title.innerHTML = this.highlightText(clue.title, searchTerm);

    const description = document.createElement("p");
    description.innerHTML = this.highlightText(clue.description, searchTerm);

    item.appendChild(title);
    item.appendChild(description);

    // 点击查看详情
    item.classList.add("clickable");
    item.addEventListener("click", () => {
      this.showClueDetails(clue.id);
    });

    return item;
  },

  // 高亮匹配文本
  highlightText: function (text, searchTerm) {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, "gi");
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  },

  // 转义正则特殊字符
  escapeRegex: function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  updateCluesList: function () {
    if (!this.cluesListEl) return;

    const searchInput = document.getElementById("clue-search-input");
    const searchTerm = searchInput ? searchInput.value : "";

    // 如果有搜索词，执行搜索；否则显示所有线索
    if (searchTerm.trim()) {
      this.performSearch(searchTerm);
    } else {
      // 先清空线索列表容器
      this.cluesListEl.innerHTML = "";

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

      // 有线索时，显示线索列表
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

      // 清空搜索统计
      const searchStats = document.getElementById("search-stats");
      if (searchStats) {
        searchStats.textContent = "";
      }
    }
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
    const cluesTabIcon = document.querySelector("#clues-tab .tab-icon");
    if (cluesTabIcon) {
      cluesTabIcon.textContent = "🔍"; // 只显示图标
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

    // 新增：在显示角色档案前隐藏所有立绘
    if (typeof illustrationManager !== "undefined") {
      illustrationManager.hideAllIllustrations();
    }

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
    console.log("显示角色详情:", character.name);
  },

  hideCharacterModal: function () {
    if (!this.characterModal) return;
    this.characterModal.style.display = "none";

    // 改进：关闭角色档案后，确保恢复当前对话的立绘
    if (gameState.isDialogActive) {
      const currentStep = prologueScript[gameState.currentStep];
      console.log("关闭角色档案，尝试恢复立绘，当前步骤:", currentStep);

      if (currentStep && typeof illustrationManager !== "undefined") {
        // 延迟执行确保弹窗完全关闭
        setTimeout(() => {
          // 根据当前步骤类型决定是否显示立绘
          if (currentStep.type === "dialog" || currentStep.type === "thought") {
            // 使用步骤中的立绘信息
            if (currentStep.illustration) {
              const {
                characterId,
                position = "left",
                expression = "normal",
              } = currentStep.illustration;
              illustrationManager.showIllustration(
                characterId,
                position,
                expression
              );
              console.log(
                "恢复立绘 - 使用步骤立绘信息:",
                characterId,
                position
              );
            }
            // 如果没有专门的立绘信息，使用角色ID
            else if (currentStep.characterId) {
              illustrationManager.showIllustration(
                currentStep.characterId,
                "left"
              );
              console.log("恢复立绘 - 使用角色ID:", currentStep.characterId);
            }
            // 如果只有说话者名字，尝试匹配角色
            else if (currentStep.speaker) {
              // 这里需要根据说话者名字找到对应的角色ID
              const character = gameState.characters.find(
                (c) => c.name === currentStep.speaker
              );
              if (character) {
                illustrationManager.showIllustration(character.id, "left");
                console.log(
                  "恢复立绘 - 通过说话者名字:",
                  currentStep.speaker,
                  character.id
                );
              }
            }
          } else {
            // 对于叙述性步骤，隐藏立绘
            illustrationManager.hideAllIllustrations();
            console.log("恢复立绘 - 隐藏所有立绘（叙述性步骤）");
          }
        }, 50); // 稍微增加延迟确保DOM更新完成
      }
    } else {
      console.log("关闭角色档案 - 没有活跃对话，不恢复立绘");
    }
  },

  // 发现新线索（在游戏进程中调用）
  discoverClue: function (clueId) {
    if (gameState.discoverClue(clueId)) {
      this.updateCluesList(); // 这会重新渲染整个线索列表
      this.showClueDiscovery(clueId);
      // 新增：播放线索发现音效
      if (typeof audioManager !== "undefined") {
        audioManager.playSound("clue_discover");
      }
      return true;
    }
    return false;
  },

  // 遇到新角色
  encounterCharacter: function (characterId) {
    if (gameState.encounterCharacter(characterId)) {
      this.updateCharactersGrid();
      this.showCharacterEncounter(characterId);

      // 新增：播放角色遇到音效
      if (typeof audioManager !== "undefined") {
        audioManager.playSound("character_encounter");
      }

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

  showClueDiscovery: function (clueId) {
    const clue = gameState.clues.find((c) => c.id === clueId);
    if (!clue) return;

    const notification = document.createElement("div");
    notification.className = "clue-notification";
    notification.innerHTML = `
      <span class="notification-icon">🔍</span>
      <div class="notification-content">
        <div class="notification-title">新线索发现</div>
        <div class="notification-clue">${clue.title}</div>
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

  // 显示角色遇到通知
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

  // 显示档案教学指引
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
        <p>点击右侧 <span class="tutorial-highlight">❓ 提示图标</span></p>
        <div class="tutorial-arrow">→</div>
        <p>查看游戏的操作帮助</p>
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
};
