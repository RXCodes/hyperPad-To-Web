// initialize object dictionary and initial scene data
var currentObjects = {}; // in-game representation of the object (color, scale, attributes, tags, etc.) {key: objectID, value: objectData}
var currentSceneIndex = 0; // current scene that the player is in - by default, the player will load into the first scene
var playingAudio = {}; // the audio being played {key: audioID, value: audioInterface}
var currentLayers = {}; // the current layers being displayed {key: layerID, value: layerData}
var phaserObjects = {}; // object instances in phaser that can make changes to what is being displayed {key: objectID, value: PhaserObjectInstance}

// load a level
function loadLevel() {
  
  // scene index
  let index = currentSceneIndex;
  
  // remove all objects and behaviors
  Object.keys(phaserObjects).forEach(function(objectID) {
    try {
      phaserObjects[objectID].destroy();
    } catch(e) {}
  });
  currentObjects = {};
  phaserObjects = {};
  currentLayers = {};
  
  // stop all audio
  Object.keys(playingAudio).forEach(function(soundID) {
    playingAudio[soundID].audio.stop();
  });
  playingAudio = [];
  
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
  currentObjects = {};
  console.log(levelData);
  
  // add layers and objects to structure
  levelData.layers.forEach(function(layer) {
    let data = levelData.layers[layer];
    Object.keys(data.objects).forEach(function(objectID) {
      currentObjects[objectID] = data.objects[objectID];
      currentObjects[objectID].currentLayer = data.UUID;
    });
    delete data.objects;
    currentLayers[data.UUID] = data;
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
    currentLayers[layerData.UUID].phaserLayer = this.add.layer();
    Object.keys(layerData.objects).forEach(function(objectID) {
      let objData = layerData.objects[objectID];
      
      // add object for layer
      let object = this.add.sprite(objData.widthPercentage * projectBase.ptm, objData.heightPercentage * projectBase, objData.path || "_Empty");
      object.setBounce(objData.bounce || 0, objData.bounce || 0);
      object.setMass(objData.mass || 20);
      currentLayers[layerData.UUID].phaserLayer.add([object]);
      
    });
  });
  
}

loadScene(0);
