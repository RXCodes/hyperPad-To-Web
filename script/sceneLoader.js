// initialize object dictionary and initial scene data
var currentObjects = {};
var currentSceneIndex = 0;
var playingAudio = {};
var activeLayers = {};
var activeObjects = {};
var kaboomObjects = {};

// load a level
function loadLevel(index) {
  
  // remove all objects and behaviors
  Object.keys(kaboomObjects).forEach(function(objectID) {
    try {
      kaboomObjects[objectID].destroy();
    } catch(e) {}
  });
  kaboomObjects = {};
  
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
  activeLayers = {};
  activeObjects = {};
  console.log(levelData);
  
  // add layers and objects to structure
  levelData.layers.forEach(function(layer) {
    let data = levelData.layers[layer];
    Object.keys(data.objects).forEach(function(objectID) {
      activeObjects[objectID] = data.objects[objectID];
      activeObjects[objectID].currentLayer = data.UUID;
    });
    delete data.objects;
    activeLayers[data.UUID] = data;
  });
  
  // sort layers by index (global and scene ui layers are on the top)
  let sortedLayers = [];
  let sortLayersIndex = {};
  Object.keys(levelData.layers).forEach(function(layer) {
    sortLayersIndex[layer.index * -1] = layer.UUID;
  });
  let sortedLayersIndex = Object.keys(sortedLayersIndex).sort(function(a, b) {
    if( a === Infinity ) 
      return 1; 
    else if( isNaN(a)) 
      return -1;
    else 
      return a - b;
  });
  sortedLayersIndex.forEach(function(index) {
    sortedLayers.push(sortLayersIndex[index].UUID);
  });
  
  // load layers with objects into kaboom
  sortedLayers.forEach(function(index) {
    let layer = levelData.layers[index];
  });
  
  // set scene background
  
}

loadScene(0);
