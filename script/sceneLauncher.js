// -- sceneLauncher.js: launches the phaser framework with global project data

// load a level by index or id
function loadLevel(level) {
  
  // kill previous game instance if any
  
  
  // configure phaser scene loader
  let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
      create: loadLevelHandler(level || 0)
    }
  };
  
  
  
}

// load the very first scene
loadLevel(0);
