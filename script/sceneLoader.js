// -- sceneLoader.js: script that allows scenes to be populated with layers and objects.

// initialize object dictionary and initial scene data
var gameObjects = {}; // in-game representation of the object (color, scale, attributes, tags, etc.) {key: objectID, value: objectData}
var currentSceneIndex = 0; // current scene that the player is in - by default, the player will load into the first scene
var gameAudio = {}; // the audio being played {key: audioID, value: audioInterface}
var gameLayers = {}; // the current layers being displayed {key: layerID, value: layerData}
var game; // the variable holding the instance of the game
window.Phaser = Phaser; // add reference to the plugin to the main window
window.projectBase = projectBase; // add reference to the project database to the main window

// load a level
async function loadLevel(index) {
  
  // kill previous game instance if any
  try {
    window.game.destroy(true, false)
  } catch(e) {};
  window.currentSceneIndex = index || 0;
  
  // determine index or scene ID
  let currentSceneIndex = 0;
  let isNumeric = (Number(index) == index);
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
  console.log(levelData);

  // find most compatible aspect ratio
  let supportedAspectRatios = {
     "1024,768": 4/3,
     "1024,579": 16/9,
     "1024,472": 19.5/9,
     "1194,834": 199/139,
     "1023,682": 3/2,
     "1024,640": 16/10
  };
  let diff = 999;
  let currentAspectRatio;
  let aspectRatio = screen.width / screen.height;
  Object.keys(supportedAspectRatios).forEach(function(ratio) {
    let value = supportedAspectRatios[ratio];
    if ((Math.abs(value - aspectRatio)) < diff) {
      diff = Math.abs(value - aspectRatio);
      currentAspectRatio = ratio;
    }
  });

  // determine window size for game
  let screenWidth = parseInt(currentAspectRatio.split(",")[0]);
  let screenHeight = parseInt(currentAspectRatio.split(",")[1]);
  
  // reset data
  gameAudio = {};
  gameLayers = {};
  gameObjects = {};  
    
  // configure phaser scene loader
  let config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: Phaser.Display.Color.GetColor32(levelData.backgroundColor[0], levelData.backgroundColor[1], levelData.backgroundColor[2], levelData.backgroundColor[3]),
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { // use the project's gravity settings
          y: -1 * projectBase.yGravity * projectBase.ptmRatio,
          x: projectBase.xGravity * projectBase.ptmRatio
        }
      }
    },
    scene: {
      preload: function() {}, // preload event does nothing yet
      create: function() {
        let game = this;
        
        // add layers and objects to structure
        levelData.layers.forEach(function(data) {
          Object.keys(data.objects || {}).forEach(function(objectID) {
            gameObjects[objectID] = {};
            gameObjects[objectID].data = data.objects[objectID];
            gameObjects[objectID].data.currentLayer = data.UUID;
          });
          data.objects = Object.keys(data.objects);
          gameLayers[data.UUID] = {};
          gameLayers[data.UUID].data = data;
        });

        // sort layers by index (global and scene ui layers are on the top)
        let sortedLayers = [];
        let sortLayersIndex = {};
        levelData.layers.forEach(function(layer) {
          console.log(layer);
          sortLayersIndex[layer.zOrder * -1] = layer;
        });
        console.log(sortLayersIndex);
        let sortedLayersIndex = Object.keys(sortLayersIndex).sort(function(a, b) {
          if (a === Infinity) 
            return 1; 
          else if (isNaN(a)) 
            return -1;
          else 
            return a - b;
        });
        sortedLayersIndex.forEach(function(index) {
          sortedLayers.push(sortLayersIndex[index]);
        });
        
        // load layers with objects
        sortedLayers.forEach(function(layerData) {
          console.log("loading layer: " + layerData);
          gameLayers[layerData.UUID].instance = game.add.layer(); // add layer
          console.log(layerData);
          layerData.objects.forEach(function(objectID) {
            let objData = JSON.parse(JSON.stringify(gameObjects[objectID].data));
            console.log(JSON.stringify(objData));

            // hide layer if inactive
            gameLayers[layerData.UUID].instance.setActive(layerData.visible);
            console.log("set active");

            // set up object for layer
            let object = game.physics.add.image(objData.xPosition / 100, objData.yPosition / 100, "empty"); // spawn object
            
            object.setBounce(objData.bounce || 0, objData.bounce || 0); // object bounce
            object.setFriction(objData.friction); // object friction
            object.setMass(objData.mass || 20); // object mass
            object.setAngle(objData.rotation - 90); // object rotation
            object.setTint(Phaser.Display.Color.GetColor32(
              Math.round(objData.color[0] * 255), 
              Math.round(objData.color[1] * 255), 
              Math.round(objData.color[2] * 255), 
              Math.round(objData.color[3] * 255)
            )); // color
           
            object.displayWidth = objData.scaleXPercent; // scale x
            object.displayHeight = objData.scaleYPercent; // scale y
            
            // empty object scaling
            if (objData.type == "Empty") {
              object.displayWidth = objData.scaleXPercent * 0.64; // scale x
              object.displayHeight = objData.scaleYPercent * 0.64; // scale y
            }
            
            object.setOrigin(objData.anchorX / 100, objData.anchorY / 100);
            
            object.setDepth(objData.zOrder); // z order
            object.allowRotation = true;
            
            // physics object
            if (objData.physicsMode == "Physics") {
              object.allowGravity = true;
              object.immovable = false;
              object.moves = true;
              object.onCollide = true;
            }
            
            // wall object
            if (objData.physicsMode == "Wall") {
              object.allowGravity = false;
              object.immovable = true;
              object.onCollide = true;
            }
            
            // scenery object
            if (objData.physicsMode == "Scenery") {
              object.allowGravity = false;
              object.immovable = true;
            }

            // visibility
            if (!objData.visible) {
              object.setVisible(false);
            }

            // flip
            object.setFlipX(object.flipX);
            object.setFlipY(object.flipY);
            console.log(object);

            // add object to layer
            gameLayers[layerData.UUID].instance.add([object]);

            // keep record of object 
            gameObjects[objData.id] = {
              data: objData,
              instance: object
            };

          });
        });
        
        // manipulate the screen
        try {
          game.cameras.main.setZoom(levelData.zoom);
          game.cameras.main.worldView.left = levelData.screenX
          game.cameras.main.worldView.bottom = levelData.screenY;
          game.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(
            Math.round(levelData.backgroundColor[0] * 255),
            Math.round(levelData.backgroundColor[1] * 255),
            Math.round(levelData.backgroundColor[2] * 255)
          ));
        } catch(e) {
          console.error("Error setting screen: " + e);
        };
        
      },
      update: function() {
        
      } // frame updates doesn't trigger anything yet
    },
    autoCenter: true,
  };
  
  // initialize game
  window.game = new Phaser.Game(config);
  window.game.canvas.style.position = "fixed";
  window.game.canvas.style.top = "0px";
  window.game.canvas.style.width = "100%";
  console.log("Loaded game");
    
}

loadLevel(0);
