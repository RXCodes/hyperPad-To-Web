// -- sceneLauncher.js: launches the phaser framework with global project data and device data

// load a level by index or id
function loadLevel(index) {
  
  // kill previous game instance if any
  try {
    game.destroy(true, false)
  } catch(e) {};
  window.currentSceneIndex = index || 0;
  
  // determine index or scene ID
  let currentSceneIndex = 0;
  let isNumeric = Number(index) == index;
  if (isNumeric) {
    currentSceneIndex = Number(index);
  } else {
    let sceneIndex = 0;
    Object.keys(projectBase.levels).forEach(function(scene) {
      if (scene.UUID == index) {
        currentSceneIndex = sceneIndex;
      }
      sceneIndex++;
    });
  }
  
  // load the level data
  let levelData = projectBase.levels[currentSceneIndex] || {};
  
  // find most compatible aspect ratio
  let supportedAspectRatios = {
     "4:3": 4/3,
     "16:9": 16/9,
     "19.5:9": 19.5/9,
     "199:139": 199/139,
     "3:2": 3/2,
     "16:10": 16/10
  };
  let diff = 999;
  let currentAspectRatio;
  let heightRatio;
  let aspectRatio = screen.width / screen.height;
  Object.keys(supportedAspectRatios).forEach(function(ratio) {
    let value = supportedAspectRatios[ratio];
    if ((Math.abs(value - aspectRatio)) < diff) {
      diff = Math.abs(value - aspectRatio);
      currentAspectRatio = ratio;
      heightRatio = value;
    }
  });
  
  // determine window size for game
  let screenWidth = screen.width;
  let screenHeight = screen.width * heightRatio;
  
  // configure phaser scene loader
  let config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: rgbToHex(levelData.backgroundColor[0], levelData.backgroundColor[1], levelData.backgroundColor[2], levelData.backgroundColor[3]),
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { // use the project's gravity settings
          y: projectBase.yGravity * projectBase.ptm,
          x: projectBase.xGravity * projectBase.ptm
        }
      }
    },
    scene: {
      preload: function() {}, // preload event does nothing yet
      create: loadLevelHandler()
    },
    autoCenter: true,
  };
  
  // initialize game
  game = new Phaser.Game(config);
  
}

// load the very first scene
loadLevel(0);
