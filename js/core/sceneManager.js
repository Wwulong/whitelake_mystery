// 场景管理器
const sceneManager = {
  currentScene: "",

  setScene: function (sceneKey) {
    const sceneBackground = document.getElementById("scene-background");
    if (!sceneBackground) {
      console.error("找不到 scene-background 元素");
      return;
    }

    const sceneImages = {
      "police-station-outside": "images/scenes/police-station-outside.jpg",
      "police-station-inside": "images/scenes/police-station-inside.jpg",
      "white-horse-lake": "images/scenes/white-horse-lake.jpg",
    };

    if (sceneImages[sceneKey]) {
      console.log("设置场景:", sceneKey, "路径:", sceneImages[sceneKey]);

      const img = new Image();
      img.onload = () => {
        console.log("场景图片加载成功");
        sceneBackground.style.backgroundImage = `url('${sceneImages[sceneKey]}')`;
        sceneBackground.classList.remove("scene-placeholder");
        sceneBackground.textContent = "";
      };
      img.onerror = () => {
        console.error("场景图片加载失败:", sceneImages[sceneKey]);
        sceneBackground.classList.add("scene-placeholder");
        sceneBackground.textContent = `场景图加载失败: ${sceneKey}`;
      };
      img.src = sceneImages[sceneKey];
    } else {
      console.error("未找到场景:", sceneKey);
      sceneBackground.classList.add("scene-placeholder");
      sceneBackground.textContent = `未找到场景: ${sceneKey}`;
    }

    this.currentScene = sceneKey;
  },
};
