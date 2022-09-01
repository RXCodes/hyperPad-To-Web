// -- sceneLoader.js: script that allows scenes to be populated with layers and objects.

// initialize object dictionary and initial scene data
var gameObjects = {}; // in-game representation of the object (color, scale, attributes, tags, etc.) {key: objectID, value: objectData}
var currentSceneIndex = 0; // current scene that the player is in - by default, the player will load into the first scene
var gameAudio = {}; // the audio being played {key: audioID, value: audioInterface}
var gameLayers = {}; // the current layers being displayed {key: layerID, value: layerData}
var game; // the variable holding the instance of the game

// load a level
function loadLevelHandler() {
  
  // scene index
  let index = window.currentSceneIndex;
  gameAudio = {};
  gameLayers = {};
  gameObjects = {};
  
  // determine index or scene ID
  let currentSceneIndex = 0;
  let isNumeric = Number(index) == index;
  if (isNumeric) {
    currentSceneIndex = Number(index);
  } else {
    let sceneIndex = 0;
    Object.keys(projectBase.scenes).forEach(function(scene) {
      if (scene.UUID == index) {
        currentSceneIndex = sceneIndex;
      }
      sceneIndex++;
    });
  }
  
  // load the level data
  let levelData = projectBase.scenes[currentSceneIndex] || {};
  console.log(levelData);
  
  // manipulate the screen
  this.cameras.main.midPoint.x = levelData.screenX; 
  this.cameras.main.midPoint.y = levelData.screenY; 
  this.cameras.main.zoom = levelData.zoom; 
  
  // add layers and objects to structure
  levelData.layers.forEach(function(layer) {
    let data = levelData.layers[layer];
    Object.keys(data.objects).forEach(function(objectID) {
      gameObjects[objectID] = {};
      gameObjects[objectID].data = data.objects[objectID];
      gameObjects[objectID].data.currentLayer = data.UUID;
    });
    delete data.objects;
    gameLayers[data.UUID] = {};
    gameLayers[data.UUID].data = data;
  });
  
  // sort layers by index (global and scene ui layers are on the top)
  let sortedLayers = [];
  let sortLayersIndex = {};
  Object.keys(levelData.layers).forEach(function(layer) {
    sortLayersIndex[layer.index * -1] = layer.UUID;
  });
  let sortedLayersIndex = Object.keys(sortedLayersIndex).sort(function(a, b) {
    if (a === Infinity) 
      return 1; 
    else if (isNaN(a)) 
      return -1;
    else 
      return a - b;
  });
  sortedLayersIndex.forEach(function(index) {
    sortedLayers.push(sortLayersIndex[index].UUID);
  });
  
  // load layers with objects
  let layerIDs = sortedLayers;
  
  sortedLayers.forEach(function(index) {
    let layerData = levelData.layers[index];
    gameLayers[layerData.UUID].instance = this.add.layer();
    Object.keys(layerData.objects).forEach(function(objectID) {
      let objData = Object.create(layerData.objects[objectID]);
      
      // hide layer if inactive
      gameLayers[layerData.UUID].instance.setActive(gameLayers[layerData.UUID].data.visible);
      
      // set up object for layer
      let object = this.add.sprite(objData.xPosition, objData.yPosition, objData.path); // positioning and asset used
      object.setBounce(objData.bounce || 0, objData.bounce || 0); // object bounce
      object.setFriction(objData.friction); // object friction
      object.setMass(objData.mass || 20); // object mass
      object.setAngle(objData.rotation - 90); // object rotation
      object.setBodySize(objData.widthPercentage * projectBase.ptm, objData.heightPercentage * projectBase.ptm); // scale
      object.setTint(parseInt(rgbToHex(objData.color[0], objData.color[1], objData.color[2], objData.color[3]), 16)); // color
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
  
}
