//
//测试方法// 清除所有密码记录
//localStorage.removeItem("discoveredPasswords");
//console.log("密码记录已清除，刷新页面后生效");

// 或者重新加载页面
//location.reload();

const passwordManager = {
  discoveredPasswords: [],
  isInitialized: false,
  retryCount: 0,
  maxRetries: 5,

  init: function () {
    try {
      if (this.isInitialized) {
        console.log("密码管理器已经初始化");
        return;
      }

      console.log("开始初始化密码管理器...");

      // 检查依赖
      if (typeof passwordData === "undefined") {
        console.warn("密码数据未加载，等待重试...");
        this.retryInitialization();
        return;
      }
      if (typeof gameState === "undefined") {
        console.warn("游戏状态未初始化，等待重试...");
        this.retryInitialization();
        return;
      }

      // 验证密码数据格式
      this.validatePasswordData();

      // 延迟创建密码模态框，避免干扰侧边栏
      setTimeout(() => {
        this.createPasswordModal();
        this.createPasswordSidebar();

        // 只在有已解锁密码时才创建侧边栏
        if (this.discoveredPasswords.length > 0) {
          this.createPasswordSidebar();
        }
        this.bindEvents();
        this.loadDiscoveredPasswords();
        this.isInitialized = true;

        console.log(
          "密码管理器初始化完成，已发现密码:",
          this.discoveredPasswords.length
        );

        // 调试信息
        this.debugPasswords();
      }, 1000);
    } catch (error) {
      console.error("密码管理器初始化失败:", error);
      this.retryInitialization();
    }
  },

  // 新增：创建密码侧边栏
  createPasswordSidebar: function () {
    // 防止重复创建
    if (document.getElementById("passwords-tab")) {
      return;
    }

    const sidebarHTML = `
      <div class="sidebar-tab" id="passwords-tab">
        <div class="tab-icon">🔐</div>
        <div class="tab-content">
          <div class="tab-header">
            <h3>已解锁密码</h3>
            <span class="close-tab">×</span>
          </div>
          <div class="password-search-container">
            <div class="search-input-wrapper">
              <input type="text" id="password-search-input" placeholder="搜索密码..." class="password-search-input">
              <span class="search-icon">🔍</span>
              <button id="clear-password-search" class="clear-search-btn" style="display: none;">×</button>
            </div>
          </div>
          <div id="passwords-list" class="passwords-list">
            <!-- 动态生成的密码列表 -->
          </div>
        </div>
      </div>
    `;

    // 插入到右侧边栏
    const rightSidebar = document.getElementById("right-sidebar");
    if (rightSidebar) {
      rightSidebar.insertAdjacentHTML("beforeend", sidebarHTML);
      this.bindPasswordSidebarEvents();
      this.updatePasswordsList(); // 初始化列表
    }
  },

  // 新增：绑定密码侧边栏事件
  bindPasswordSidebarEvents: function () {
    const searchInput = document.getElementById("password-search-input");
    const clearBtn = document.getElementById("clear-password-search");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterPasswords(e.target.value);
        clearBtn.style.display = e.target.value ? "block" : "none";
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.filterPasswords("");
        clearBtn.style.display = "none";
        searchInput.focus();
      });
    }
    // 标签图标点击事件
    const tabIcon = document.querySelector("#passwords-tab .tab-icon");
    if (tabIcon) {
      tabIcon.addEventListener("click", this.handlePasswordTabClick.bind(this));
    }

    // 关闭按钮事件
    const closeBtn = document.querySelector("#passwords-tab .close-tab");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        document.getElementById("passwords-tab").classList.remove("active");
      });
    }
  },

  // 新增：处理密码标签点击
  handlePasswordTabClick: function () {
    const tab = document.getElementById("passwords-tab");
    const isActive = tab.classList.contains("active");

    // 关闭所有标签
    document
      .querySelectorAll(".sidebar-tab")
      .forEach((t) => t.classList.remove("active"));

    // 切换当前标签
    if (!isActive) {
      tab.classList.add("active");
      this.updatePasswordsList();
    }
  },

  // 新增：更新密码列表
  updatePasswordsList: function () {
    const passwordsList = document.getElementById("passwords-list");
    if (!passwordsList) return;

    passwordsList.innerHTML = "";

    if (this.discoveredPasswords.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "passwords-empty";
      emptyMessage.innerHTML = `
        <div class="empty-icon">🔐</div>
        <p>尚未解锁任何密码</p>
        <small>在密码系统中输入正确密码来解锁内容</small>
      `;
      passwordsList.appendChild(emptyMessage);
      return;
    }

    // 按类型分组密码
    const groupedPasswords = this.groupPasswordsByType();

    Object.keys(groupedPasswords).forEach((type) => {
      const group = groupedPasswords[type];
      const groupHeader = document.createElement("div");
      groupHeader.className = "password-group-header";
      groupHeader.innerHTML = `
        <h4>${this.getPasswordTypeLabel(type)}</h4>
        <span class="password-count">${group.length}</span>
      `;
      passwordsList.appendChild(groupHeader);

      group.forEach((passwordInfo) => {
        const passwordItem = this.createPasswordItem(passwordInfo);
        passwordsList.appendChild(passwordItem);
      });
    });
  },

  // 新增：按类型分组密码
  groupPasswordsByType: function () {
    const groups = {};

    this.discoveredPasswords.forEach((passwordInfo) => {
      const config = this.findPasswordConfig(passwordInfo.password);
      if (config) {
        const type = config.type || "other";
        if (!groups[type]) groups[type] = [];
        groups[type].push({
          password: passwordInfo.password,
          config: config,
          discoveredAt: passwordInfo.discoveredAt,
        });
      }
    });

    return groups;
  },

  // 新增：获取密码类型标签
  getPasswordTypeLabel: function (type) {
    const labels = {
      achievement: "🎯 成就密码",
      progress: "📊 进度密码",
      easterEgg: "🎁 彩蛋密码",
      secret: "🔒 秘密密码",
      hint: "💡 提示密码",
      other: "📝 其他密码",
    };
    return labels[type] || labels.other;
  },

  // 新增：创建密码项
  createPasswordItem: function (passwordInfo) {
    const item = document.createElement("div");
    item.className = "password-item";
    item.setAttribute("data-password", passwordInfo.password);

    const config = passwordInfo.config;
    const discoveredDate = new Date(
      passwordInfo.discoveredAt
    ).toLocaleDateString();

    let message = config.message;
    if (typeof message === "function") {
      message = message(gameState);
    }

    item.innerHTML = `
      <div class="password-item-header">
        <span class="password-type-icon">${this.getPasswordTypeIcon(
          config.type
        )}</span>
        <span class="password-name">${passwordInfo.password}</span>
        <span class="password-date">${discoveredDate}</span>
      </div>
      <div class="password-item-content">
        <p class="password-message">${message}</p>
        ${
          config.hint
            ? `<small class="password-hint-text">提示: ${config.hint}</small>`
            : ""
        }
      </div>
    `;

    // 点击查看详情
    item.addEventListener("click", () => {
      this.showPasswordDetails(passwordInfo);
    });

    return item;
  },

  // 新增：获取密码类型图标
  getPasswordTypeIcon: function (type) {
    const icons = {
      achievement: "🏆",
      progress: "📈",
      easterEgg: "🥚",
      secret: "🔍",
      hint: "💡",
      other: "🔑",
    };
    return icons[type] || icons.other;
  },

  // 新增：显示密码详情
  showPasswordDetails: function (passwordInfo) {
    const config = passwordInfo.config;
    let message = config.message;
    if (typeof message === "function") {
      message = message(gameState);
    }

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content password-detail-modal">
        <span class="close-modal">&times;</span>
        <div class="password-detail-header">
          <span class="password-detail-icon">${this.getPasswordTypeIcon(
            config.type
          )}</span>
          <h2>${passwordInfo.password}</h2>
          <span class="password-detail-type">${this.getPasswordTypeLabel(
            config.type
          )}</span>
        </div>
        <div class="password-detail-content">
          <div class="password-message-detail">
            <h3>密码效果</h3>
            <p>${message}</p>
          </div>
          <div class="password-meta">
            <div class="password-meta-item">
              <strong>解锁时间:</strong> ${new Date(
                passwordInfo.discoveredAt
              ).toLocaleString()}
            </div>
            ${
              config.hint
                ? `
            <div class="password-meta-item">
              <strong>密码提示:</strong> ${config.hint}
            </div>
            `
                : ""
            }
            <div class="password-meta-item">
              <strong>效果类型:</strong> ${config.effect || "无特殊效果"}
            </div>
          </div>
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

  // 新增：过滤密码
  filterPasswords: function (searchTerm) {
    const passwordsList = document.getElementById("passwords-list");
    if (!passwordsList) return;

    if (!searchTerm.trim()) {
      this.updatePasswordsList();
      return;
    }

    passwordsList.innerHTML = "";

    const filteredPasswords = this.discoveredPasswords.filter(
      (passwordInfo) => {
        const config = this.findPasswordConfig(passwordInfo.password);
        if (!config) return false;

        return (
          passwordInfo.password
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (typeof config.message === "string" &&
            config.message.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    );

    if (filteredPasswords.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "passwords-empty search-empty";
      emptyMessage.textContent = "没有找到匹配的密码";
      passwordsList.appendChild(emptyMessage);
      return;
    }

    filteredPasswords.forEach((passwordInfo) => {
      const config = this.findPasswordConfig(passwordInfo.password);
      if (config) {
        const passwordItem = this.createPasswordItem({
          password: passwordInfo.password,
          config: config,
          discoveredAt: passwordInfo.discoveredAt,
        });
        passwordsList.appendChild(passwordItem);
      }
    });
  },

  // 重试初始化
  retryInitialization: function () {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `密码管理器重试初始化 (${this.retryCount}/${this.maxRetries})...`
      );
      setTimeout(() => this.init(), 500);
    } else {
      console.error("密码管理器初始化失败，已达到最大重试次数");
    }
  },

  // 创建密码输入模态框
  createPasswordModal: function () {
    // 防止重复创建
    if (document.getElementById("password-modal")) {
      console.log("密码模态框已存在");
      return;
    }

    const modalHTML = `
      <div id="password-modal" class="modal">
        <div class="modal-content password-modal">
          <span class="close-modal">&times;</span>
          <div class="password-header">
            <h2>🎮 彩蛋密码系统</h2>
            <p>输入特殊密码解锁隐藏内容和成就</p>
          </div>
          <div class="password-input-container">
            <input type="text" id="password-input" placeholder="输入密码..." class="password-input" maxlength="20">
            <button id="submit-password" class="password-submit-btn">解锁</button>
          </div>
          <div id="password-result" class="password-result"></div>
          <div class="password-features">
            <div class="feature-item">
              <span class="feature-icon">🔍</span>
              <span class="feature-text">查看游戏进度</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span class="feature-text">获取调查提示</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎁</span>
              <span class="feature-text">发现隐藏彩蛋</span>
            </div>
          </div>
          <div class="password-stats">
            <div class="password-stat">
              <span class="stat-value" id="discovered-count">0</span>
              <span class="stat-label">已解锁密码</span>
            </div>
            <div class="password-hint">
              <small>试试输入：进度、我是福尔摩斯、开发者万岁</small>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  },

  // 绑定事件
  bindEvents: function () {
    const modal = document.getElementById("password-modal");
    if (!modal) {
      console.error("密码模态框未找到");
      return;
    }

    const closeBtn = modal.querySelector(".close-modal");
    const submitBtn = document.getElementById("submit-password");
    const passwordInput = document.getElementById("password-input");
    const passwordBtn = document.getElementById("password-btn");

    // 检查元素是否存在
    if (!closeBtn || !submitBtn || !passwordInput || !passwordBtn) {
      console.error("密码系统元素未找到:", {
        closeBtn,
        submitBtn,
        passwordInput,
        passwordBtn,
      });
      return;
    }

    // 密码按钮点击事件
    passwordBtn.addEventListener("click", () => {
      this.showPasswordModal();
    });

    // 关闭模态框
    closeBtn.addEventListener("click", () => {
      this.hidePasswordModal();
    });

    // 点击外部关闭
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hidePasswordModal();
      }
    });

    // 提交密码
    submitBtn.addEventListener("click", () => {
      this.checkPassword();
    });

    // 按回车提交
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.checkPassword();
      }
    });

    // 输入时清空结果
    passwordInput.addEventListener("input", () => {
      this.clearResult();
    });

    // ESC键关闭
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "block") {
        this.hidePasswordModal();
      }
    });

    console.log("密码系统事件绑定完成");
  },

  // 显示密码模态框
  showPasswordModal: function () {
    const modal = document.getElementById("password-modal");
    const passwordInput = document.getElementById("password-input");

    if (!modal || !passwordInput) {
      console.error("显示密码模态框时元素未找到");
      return;
    }

    modal.style.display = "block";
    passwordInput.focus();
    this.updateStats();

    // 播放音效
    if (typeof audioManager !== "undefined") {
      audioManager.playSound("menu_open");
    }
  },

  // 隐藏密码模态框
  hidePasswordModal: function () {
    const modal = document.getElementById("password-modal");
    if (!modal) return;

    modal.style.display = "none";
    this.clearResult();

    // 播放音效
    if (typeof audioManager !== "undefined") {
      audioManager.playSound("menu_close");
    }
  },

  // 创建一个统一的密码验证函数
  validatePassword: function (password) {
    if (!password.trim()) {
      return { valid: false, message: "请输入密码" };
    }

    // 检查是否已经解锁过
    const alreadyDiscovered = this.discoveredPasswords.find(
      (p) => p.password === password
    );
    if (alreadyDiscovered) {
      return { valid: false, message: "这个密码已经解锁过了！" };
    }

    const config = this.findPasswordConfig(password);
    if (!config) {
      return {
        valid: false,
        message:
          "密码错误！请检查输入是否正确，或者尝试其他密码。\n提示：注意大小写和特殊字符。",
      };
    }

    return { valid: true, config: config };
  },

  // 验证密码数据格式
  validatePasswordData: function () {
    const requiredSections = ["global", "chapters", "easterEggs"];
    const missingSections = [];

    for (const section of requiredSections) {
      if (!passwordData[section]) {
        missingSections.push(section);
        console.warn(`密码数据缺少 ${section} 部分`);
      }
    }

    if (missingSections.length > 0) {
      console.warn("密码数据不完整，可能影响功能");
    }
  },

  // 检查密码
  checkPassword: function () {
    console.log("checkPassword 被调用");

    const passwordInput = document.getElementById("password-input");
    const resultEl = document.getElementById("password-result");

    console.log("passwordInput:", passwordInput);
    console.log("resultEl:", resultEl);

    if (!passwordInput || !resultEl) {
      console.error("密码输入元素未找到");
      return;
    }

    const password = passwordInput.value.trim();

    if (!password) {
      this.showResult("请输入密码", "error");
      return;
    }

    // 使用统一的验证函数
    const validation = this.validatePassword(password);

    if (validation.valid) {
      this.processValidPassword(password, validation.config);
    } else {
      // 显示错误消息
      this.showResult(validation.message, "error");

      // 播放错误音效
      if (typeof audioManager !== "undefined") {
        audioManager.playSound("password_wrong");
      }

      // 错误时震动输入框
      passwordInput.classList.add("shake");
      setTimeout(() => {
        passwordInput.classList.remove("shake");
      }, 500);
    }
  },

  // 查找密码配置
  findPasswordConfig: function (password) {
    // 安全检查
    if (!passwordData) {
      console.error("passwordData 未定义");
      return null;
    }

    // 检查全局密码
    if (passwordData.global && passwordData.global[password]) {
      return passwordData.global[password];
    }

    // 检查章节密码
    if (passwordData.chapters && gameState.currentChapter) {
      const chapterPasswords = passwordData.chapters[gameState.currentChapter];
      if (chapterPasswords && chapterPasswords[password]) {
        return chapterPasswords[password];
      }
    }

    // 检查彩蛋密码
    if (passwordData.easterEggs && passwordData.easterEggs[password]) {
      return passwordData.easterEggs[password];
    }

    return null;
  },

  // 处理有效密码
  processValidPassword: function (password, config) {
    this.markPasswordDiscovered(password);

    let message = config.message;
    if (typeof message === "function") {
      message = message(gameState);
    }

    this.showResult(message, "success", config.effect);
    this.playPasswordEffects(config.type, config.effect);
    this.updateStats();

    // 清空输入框
    const passwordInput = document.getElementById("password-input");
    if (passwordInput) {
      passwordInput.value = "";
    }
  },

  // 显示结果
  showResult: function (message, type, effect = "") {
    const resultEl = document.getElementById("password-result");
    if (!resultEl) {
      console.error("password-result 元素未找到");
      return;
    }

    resultEl.textContent = message;
    resultEl.className = `password-result ${type}`;

    if (effect) {
      resultEl.classList.add(effect);
    }

    // 确保结果显示
    resultEl.style.display = "block";
    resultEl.style.opacity = "1";

    // 自动清除消息（错误消息保留时间更长）
    const clearTime = type === "error" ? 3000 : 5000;
    setTimeout(() => {
      if (resultEl.textContent === message) {
        this.clearResult();
      }
    }, clearTime);
  },

  // 清除结果
  clearResult: function () {
    const resultEl = document.getElementById("password-result");
    if (resultEl) {
      resultEl.textContent = "";
      resultEl.className = "password-result";
    }
  },

  // 播放密码效果
  playPasswordEffects: function (passwordType, effectType) {
    // 播放音效
    if (typeof audioManager !== "undefined") {
      const soundMap = {
        achievement: "achievement_unlock",
        progress: "progress_update",
        easterEgg: "secret_found",
        secret: "secret_found",
        hint: "password_correct",
      };

      const sound = soundMap[passwordType] || "password_correct";
      audioManager.playSound(sound);
    }

    // 视觉反馈
    const resultEl = document.getElementById("password-result");
    if (resultEl) {
      resultEl.classList.add("active");
      setTimeout(() => {
        resultEl.classList.remove("active");
      }, 2000);
    }
  },

  // 标记密码为已发现
  markPasswordDiscovered: function (password) {
    if (!this.discoveredPasswords.find((p) => p.password === password)) {
      this.discoveredPasswords.push({
        password: password,
        discoveredAt: Date.now(),
      });
      this.saveDiscoveredPasswords();
      console.log(`新密码发现: ${password}`);

      // 如果是第一个密码，创建侧边栏
      if (this.discoveredPasswords.length === 1) {
        this.createPasswordSidebar();
      }

      // 更新密码列表
      this.updatePasswordsList();

      // 显示发现通知
      this.showPasswordDiscoveryNotification(password);
    }
  },

  // 新增：显示密码发现通知
  showPasswordDiscoveryNotification: function (password) {
    const config = this.findPasswordConfig(password);
    if (!config) return;

    const notification = document.createElement("div");
    notification.className = "password-notification";
    notification.innerHTML = `
      <span class="notification-icon">${this.getPasswordTypeIcon(
        config.type
      )}</span>
      <div class="notification-content">
        <div class="notification-title">新密码解锁</div>
        <div class="notification-password">${password}</div>
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

  // 加载已发现的密码
  loadDiscoveredPasswords: function () {
    try {
      const saved = localStorage.getItem("discoveredPasswords");
      if (saved) {
        const parsed = JSON.parse(saved);
        // 兼容旧版本（字符串数组）
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === "string"
        ) {
          this.discoveredPasswords = parsed.map((password) => ({
            password: password,
            discoveredAt: Date.now(), // 为旧数据设置默认时间
          }));
          this.saveDiscoveredPasswords(); // 立即保存为新格式
        } else {
          this.discoveredPasswords = parsed;
        }
        console.log(`加载了 ${this.discoveredPasswords.length} 个已发现密码`);
      }
    } catch (e) {
      console.warn("加载密码记录失败:", e);
      this.discoveredPasswords = [];
    }
  },

  // 保存已发现的密码
  saveDiscoveredPasswords: function () {
    try {
      localStorage.setItem(
        "discoveredPasswords",
        JSON.stringify(this.discoveredPasswords)
      );
    } catch (e) {
      console.warn("保存密码记录失败:", e);
    }
  },

  // 更新统计信息
  updateStats: function () {
    const stats = this.getPasswordDiscoveryStats();
    const countEl = document.getElementById("discovered-count");
    if (countEl) {
      countEl.textContent = `${stats.discovered}/${stats.total}`;
    }
  },

  // 获取密码发现统计
  getPasswordDiscoveryStats: function () {
    let total = 0;

    // 计算所有类型的密码总数
    if (passwordData.global) total += Object.keys(passwordData.global).length;
    if (passwordData.easterEggs)
      total += Object.keys(passwordData.easterEggs).length;

    // 当前章节密码
    if (passwordData.chapters && gameState.currentChapter) {
      const chapterPasswords = passwordData.chapters[gameState.currentChapter];
      if (chapterPasswords) total += Object.keys(chapterPasswords).length;
    }

    return {
      discovered: this.discoveredPasswords.length,
      total: total,
    };
  },

  // === 密码系统相关方法 ===

  // 检查秘密密码
  checkSecretPassword: function (searchTerm) {
    const password = searchTerm.trim();

    // 使用统一的验证函数
    const validation = this.validatePassword(password);

    if (validation.valid) {
      this.markPasswordDiscovered(password);
      return this.processPasswordResponse(validation.config);
    }

    return null;
  },

  // 处理密码响应
  processPasswordResponse: function (passwordConfig) {
    let message = passwordConfig.message;

    // 如果消息是函数，执行它获取动态内容
    if (typeof message === "function") {
      message = message(gameState);
    }

    // 根据密码类型添加不同效果
    this.showPasswordEffect(passwordConfig.type, passwordConfig.effect);

    return message;
  },

  // 显示密码效果
  showPasswordEffect: function (passwordType, effectType) {
    const searchStats = document.getElementById("search-stats");

    if (!searchStats) return;

    // 添加基础效果类
    searchStats.classList.add("password-activated", `effect-${effectType}`);

    // 根据密码类型播放不同音效
    if (typeof audioManager !== "undefined") {
      const soundMap = {
        achievement: "achievement_unlock",
        progress: "progress_update",
        easterEgg: "secret_found",
        secret: "secret_found",
      };

      audioManager.playSound(soundMap[passwordType] || "password_correct");
    }

    // 3秒后移除效果
    setTimeout(() => {
      searchStats.classList.remove(
        "password-activated",
        `effect-${effectType}`
      );
    }, 3000);
  },

  // 调试方法
  debugPasswords: function () {
    console.log("=== 密码系统调试信息 ===");
    console.log("已初始化:", this.isInitialized);
    console.log("已发现密码:", this.discoveredPasswords);
    console.log("密码数据结构:", {
      global: passwordData.global ? Object.keys(passwordData.global) : "未定义",
      chapters: passwordData.chapters
        ? Object.keys(passwordData.chapters)
        : "未定义",
      easterEggs: passwordData.easterEggs
        ? Object.keys(passwordData.easterEggs)
        : "未定义",
    });

    // 测试密码查找
    const testPassword = "乌龙不是乌冬";
    const config = this.findPasswordConfig(testPassword);
    console.log(`"${testPassword}" 查找结果:`, config);
  },

  // 修改：重置密码系统（新增章节重置逻辑）
  resetProgressPasswords: function () {
    console.log("重置进度类密码...");

    const progressPasswords = this.discoveredPasswords.filter(
      (passwordInfo) => {
        const config = this.findPasswordConfig(passwordInfo.password);
        return config && config.type === "progress";
      }
    );

    if (progressPasswords.length > 0) {
      console.log(`找到 ${progressPasswords.length} 个进度类密码需要重置`);

      // 从已发现密码中移除进度类密码
      this.discoveredPasswords = this.discoveredPasswords.filter(
        (passwordInfo) => {
          const config = this.findPasswordConfig(passwordInfo.password);
          return !config || config.type !== "progress";
        }
      );

      this.saveDiscoveredPasswords();
      this.updatePasswordsList();
      this.updateStats();

      console.log("进度类密码重置完成");
    }
  },
};
