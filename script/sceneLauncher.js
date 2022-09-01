// -- sceneLauncher.js: launches the phaser framework

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: function() {}, // preload event does nothing yet
    create: loadScene
  }
};

game = new Phaser.Game(config);
