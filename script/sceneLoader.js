// -- sceneLoader.js: script that allows scenes to be populated with layers and objects.

// initialize object dictionary and initial scene data
var gameObjects = {}; // in-game representation of the object (color, scale, attributes, tags, etc.) {key: objectID, value: objectData}
var currentSceneIndex = 0; // current scene that the player is in - by default, the player will load into the first scene
var gameAudio = {}; // the audio being played {key: audioID, value: audioInterface}
var gameLayers = {}; // the current layers being displayed {key: layerID, value: layerData}
var game; // the variable holding the instance of the game

// load a level
function loadLevel(index) {
  
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
  let screenHeight = screen.width * (1 / heightRatio);
  
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
          y: projectBase.yGravity * projectBase.ptm,
          x: projectBase.xGravity * projectBase.ptm
        }
      }
    },
    scene: {
      preload: function() {}, // preload event does nothing yet
      create: function() {}, // create event does nothing yet
      update: function() {} // frame updates doesn't trigger anything yet
    },
    autoCenter: true,
  };
  
  // initialize game
  game = new Phaser.Game(config);
  
  // reset data
  gameAudio = {};
  gameLayers = {};
  gameObjects = {};
  
  // add layers and objects to structure
  levelData.layers.forEach(function(layer) {
    let data = levelData.layers[layer] || {};
    Object.keys(data.objects || {}).forEach(function(objectID) {
      gameObjects[objectID] = {};
      gameObjects[objectID].data = data.objects[objectID] || {};
      gameObjects[objectID].data.currentLayer = data.UUID;
    });
    delete data.objects;
    gameLayers[data.UUID] = {};
    gameLayers[data.UUID].data = data;
  });
  
  // sort layers by index (global and scene ui layers are on the top)
  let sortedLayers = [];
  let sortLayersIndex = {};
  levelData.layers.forEach(function(layer) {
    console.log(layer);
    sortLayersIndex[layer.zOrder * -1] = layer.UUID;
  });
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
  let layerIDs = sortedLayers;
  
  sortedLayers.forEach(function(index) {
    console.log("loading layer: " + index);
    let layerData = levelData.layers[sortLayersIndex[index]];
    gameLayers[layerData.UUID].instance = game.add.layer();
    Object.keys(layerData.objects).forEach(function(objectID) {
      let objData = Object.create(layerData.objects[objectID]);
      
      // hide layer if inactive
      gameLayers[layerData.UUID].instance.setActive(gameLayers[layerData.UUID].data.visible);
      
      // set up object for layer
      let object = game.add.sprite(objData.xPosition, objData.yPosition, objData.path); // positioning and asset used
      object.setBounce(objData.bounce || 0, objData.bounce || 0); // object bounce
      object.setFriction(objData.friction); // object friction
      object.setMass(objData.mass || 20); // object mass
      object.setAngle(objData.rotation - 90); // object rotation
      object.setBodySize(objData.widthPercentage * projectBase.ptm, objData.heightPercentage * projectBase.ptm); // scale
      object.setTint(Phaser.Display.Color.GetColor(objData.color[0], objData.color[1], objData.color[2], objData.color[3]); // color
      object.setOrigin(objData.xAnchor / 100, objData.yAnchor / 100); // anchor
      object.setDepth(objData.zOrder); // z order
      
      // visibility
      if (!objData.visible) {
        object.setVisible(false);
      }
      
      // flip
      object.setFlipX(object.flipX);
      object.setFlipY(object.flipY);
      
      // add object to layer
      gameLayers[layerData.UUID].instance.add([object]);
      
      // keep record of object 
      gameObjects[object.id] = {
        data: objData,
        instance: object
      };
      
    });
  });
  
  // manipulate the screen
  try {
    game.cameras.main.setZoom(levelData.zoom);
    game.cameras.main.centerOn(levelData.screenX, levelData.screenY);
  } catch(e) {
    console.error("Error setting screen: " + e);
  };
  
}

loadLevel(0);
