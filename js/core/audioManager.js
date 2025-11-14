// 音频管理器
const audioManager = {
  // 音频元素
  bgmPlayer: null,
  soundEffectPlayer: null,

  // 当前设置
  settings: {
    bgmEnabled: true,
    sfxEnabled: true,
    bgmVolume: 0.5,
    sfxVolume: 0.7,
  },

  // 主页背景音乐映射
  homeBgm: {
    "main-menu": "audio/bgm/J_outside.mp3", // 主页背景音乐
  },

  // 场景背景音乐映射
  sceneBgm: {
    "police-station-outside": "audio/bgm/J_outside.mp3",
    "police-station-inside": "audio/bgm/J_outside.mp3",
    "white-horse-lake": "audio/bgm/lake.m4a",
    // 可以继续添加其他场景的背景音乐
  },

  // 音效映射
  soundEffects: {
    dialog_advance: "audio/sfx/dialog_click.mp3",
    button_click: "audio/sfx/button_click.MP3",
    clue_discover: "audio/sfx/clue_discover.MP3",
    character_encounter: "audio/sfx/character_encounter.MP3",
  },

  init: function () {
    this.bgmPlayer = document.getElementById("bgm-player");
    this.soundEffectPlayer = document.getElementById("sound-effect");

    // 如果音频元素不存在，创建它们
    if (!this.bgmPlayer) {
      this.bgmPlayer = document.createElement("audio");
      this.bgmPlayer.id = "bgm-player";
      this.bgmPlayer.loop = true;
      document.body.appendChild(this.bgmPlayer);
    }

    if (!this.soundEffectPlayer) {
      this.soundEffectPlayer = document.createElement("audio");
      this.soundEffectPlayer.id = "sound-effect";
      document.body.appendChild(this.soundEffectPlayer);
    }

    // 从本地存储加载设置
    this.loadSettings();

    // 应用初始设置
    this.applySettings();

    console.log("音频管理器初始化完成");
  },

  // 播放主页背景音乐
  playHomeBgm: function () {
    if (!this.settings.bgmEnabled || !this.bgmPlayer) return;

    // 优先使用主页专用音乐，如果不存在则使用备用音乐
    let bgmPath = this.homeBgm["main-menu"];

    // 检查音乐文件是否存在，如果不存在则使用备用
    // 这里可以添加文件存在性检查，或者直接使用备用
    if (!bgmPath) {
      bgmPath = this.homeBgm["fallback"];
    }

    if (!bgmPath) {
      console.warn("未找到主页背景音乐");
      return;
    }

    try {
      // 如果已经在播放相同的音乐，则不重新播放
      if (this.bgmPlayer.src.includes(bgmPath) && !this.bgmPlayer.paused) {
        return;
      }

      this.bgmPlayer.src = bgmPath;
      this.bgmPlayer.volume = this.settings.bgmVolume;

      const playPromise = this.bgmPlayer.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("主页背景音乐自动播放被阻止:", error);

          // 添加一个提示，告诉用户点击页面任意位置启用音乐
          this.showAutoplayPrompt();
        });
      }
    } catch (error) {
      console.error("播放背景音乐时出错:", error);
      // 尝试使用备用音乐
      if (bgmPath !== this.homeBgm["fallback"]) {
        console.log("尝试使用备用音乐...");
        this.homeBgm["main-menu"] = this.homeBgm["fallback"];
        this.playHomeBgm();
      }
    }
  },
  // 修复停止方法
  stopAllBgm: function () {
    if (this.bgmPlayer) {
      this.bgmPlayer.pause();
      this.bgmPlayer.currentTime = 0;
    }
  },

  // 显示自动播放提示
  showAutoplayPrompt: function () {
    const prompt = document.createElement("div");
    prompt.id = "autoplay-prompt";
    prompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 3000;
    border: 2px solid #3498db;
  `;
    prompt.innerHTML = `
    <p>点击任意位置启用背景音乐</p>
  `;

    document.body.appendChild(prompt);

    // 点击页面任意位置后移除提示并尝试播放音乐
    const enableMusic = () => {
      this.bgmPlayer.play().catch(console.error);
      prompt.remove();
      document.removeEventListener("click", enableMusic);
    };

    document.addEventListener("click", enableMusic);

    // 5秒后自动移除提示
    setTimeout(() => {
      if (document.getElementById("autoplay-prompt")) {
        prompt.remove();
        document.removeEventListener("click", enableMusic);
      }
    }, 5000);
  },

  // 停止所有音乐（包括主页音乐）
  stopAllBgm: function () {
    this.bgmPlayer.pause();
    this.bgmPlayer.currentTime = 0;
  },

  // 播放场景背景音乐
  playSceneBgm: function (sceneKey) {
    if (!this.settings.bgmEnabled) return;

    const bgmPath = this.sceneBgm[sceneKey];
    if (!bgmPath) {
      console.warn(`未找到场景 ${sceneKey} 的背景音乐`);
      return;
    }

    // 如果已经在播放相同的音乐，则不重新播放
    if (this.bgmPlayer.src.includes(bgmPath) && !this.bgmPlayer.paused) {
      return;
    }

    this.bgmPlayer.src = bgmPath;
    this.bgmPlayer.volume = this.settings.bgmVolume;

    this.bgmPlayer.play().catch((error) => {
      console.warn("背景音乐自动播放被阻止:", error);
    });
  },

  // 停止背景音乐
  stopBgm: function () {
    this.bgmPlayer.pause();
    this.bgmPlayer.currentTime = 0;
  },

  // 暂停背景音乐
  pauseBgm: function () {
    this.bgmPlayer.pause();
  },

  // 恢复背景音乐
  resumeBgm: function () {
    if (this.settings.bgmEnabled && this.bgmPlayer.src) {
      this.bgmPlayer.play().catch(console.error);
    }
  },

  // 播放音效
  playSound: function (soundKey) {
    if (!this.settings.sfxEnabled) return;

    const soundPath = this.soundEffects[soundKey];
    if (!soundPath) {
      console.warn(`未找到音效: ${soundKey}`);
      return;
    }

    // 创建新的音频元素避免重叠播放问题
    const sound = new Audio(soundPath);
    sound.volume = this.settings.sfxVolume;
    sound.play().catch(console.error);
  },

  // 设置背景音乐音量
  setBgmVolume: function (volume) {
    this.settings.bgmVolume = volume / 100;
    this.bgmPlayer.volume = this.settings.bgmVolume;
    this.saveSettings();
  },

  // 设置音效音量
  setSfxVolume: function (volume) {
    this.settings.sfxVolume = volume / 100;
    this.saveSettings();
  },

  // 切换背景音乐开关
  toggleBgm: function () {
    this.settings.bgmEnabled = !this.settings.bgmEnabled;

    if (this.settings.bgmEnabled) {
      this.resumeBgm();
    } else {
      this.pauseBgm();
    }

    this.saveSettings();
    return this.settings.bgmEnabled;
  },

  // 切换音效开关
  toggleSfx: function () {
    this.settings.sfxEnabled = !this.settings.sfxEnabled;
    this.saveSettings();
    return this.settings.sfxEnabled;
  },

  // 应用设置到UI
  applySettings: function () {
    this.bgmPlayer.volume = this.settings.bgmEnabled
      ? this.settings.bgmVolume
      : 0;

    // 更新滑块
    const bgmSlider = document.getElementById("bgm-volume");
    const sfxSlider = document.getElementById("sfx-volume");

    if (bgmSlider) bgmSlider.value = this.settings.bgmVolume * 100;
    if (sfxSlider) sfxSlider.value = this.settings.sfxVolume * 100;

    // 更新音量文本
    this.updateVolumeText();

    // 更新静音按钮状态
    this.updateMuteButtons();
  },

  // 更新音量显示文本
  updateVolumeText: function () {
    const bgmText = document.getElementById("bgm-volume-text");
    const sfxText = document.getElementById("sfx-volume-text");

    if (bgmText)
      bgmText.textContent = Math.round(this.settings.bgmVolume * 100) + "%";
    if (sfxText)
      sfxText.textContent = Math.round(this.settings.sfxVolume * 100) + "%";
  },

  // 更新静音按钮状态
  updateMuteButtons: function () {
    const bgmToggle = document.getElementById("bgm-toggle");
    const sfxToggle = document.getElementById("sfx-toggle");

    if (bgmToggle) {
      bgmToggle.textContent = this.settings.bgmEnabled ? "🔊" : "🔇";
    }
    if (sfxToggle) {
      sfxToggle.textContent = this.settings.sfxEnabled ? "🔊" : "🔇";
    }
  },

  // 保存设置到本地存储
  saveSettings: function () {
    try {
      localStorage.setItem("gameAudioSettings", JSON.stringify(this.settings));
    } catch (error) {
      console.warn("无法保存音频设置:", error);
    }
  },

  // 从本地存储加载设置
  loadSettings: function () {
    try {
      const saved = localStorage.getItem("gameAudioSettings");
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn("无法加载音频设置:", error);
    }
  },

  // 预加载音频文件（可选）
  preloadAudio: function () {
    // 预加载常用的音效
    Object.values(this.soundEffects).forEach((soundPath) => {
      const audio = new Audio();
      audio.src = soundPath;
      audio.preload = "auto";
    });
  },
};
