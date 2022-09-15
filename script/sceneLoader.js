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
      default: 'matter',
      matter: {
        gravity: { // use the project's gravity settings
          y: -1 * projectBase.yGravity,
          x: projectBase.xGravity,
          debug: true
        }
      }
    },
    scene: {
      preload: function() {}, // preload event does nothing yet
      create: function() {
        let game = this;
        
        // load blending
        const gl = game.sys.game.renderer.gl;
        const blendConstants = [
          gl.ZERO,
          gl.ONE,
          gl.SRC_COLOR,
          gl.ONE_MINUS_SRC_COLOR,
          gl.DST_COLOR,
          gl.ONE_MINUS_DST_COLOR,
          gl.SRC_ALPHA,
          gl.ONE_MINUS_DST_ALPHA,
          gl.DST_ALPHA,
          gl.ONE_MINUS_DST_ALPHA,
          gl.CONSTANT_COLOR,
          gl.ONE_MINUS_CONSTANT_COLOR,
          gl.CONSTANT_ALPHA,
          gl.ONE_MINUS_CONSTANT_ALPHA,
          gl.SRC_ALPHA_SATURATE
        ];
        const blendEquations = [
          gl.FUNC_ADD,
          gl.FUNCT_SUBTRACT,
          gl.FUNC_REVERSE_SUBTRACT
        ];
        let renderer = game.sys.game.renderer;
        window.rendererBlendModes = {};
        function addBlendingMode(name, params) {
          let srcRGBIndex = params[0]; // default: 1
          let dstRGBIndex = params[1]; // default: 7
          let srcAlphaIndex = params[2]; // default: 1 
          let dstAlphaIndex = params[3]; // default: 1
          let equationIndex = params[4]; // default: 0
          let newMode = [
            blendConstants[srcRGBIndex],
            blendConstants[dstRGBIndex],
            blendConstants[srcAlphaIndex],
            blendConstants[dstAlphaIndex]
          ];
          let modeIndex = renderer.addBlendMode(newMode, blendEquations[equationIndex]);
          window.rendererBlendModes[name] = modeIndex;
        }
        
        // add blend modes
        addBlendingMode("Normal", [1, 7, 1, 1, 0]);
        addBlendingMode("None", [1, 10, 1, 1, 0]);
        addBlendingMode("Screen", [2, 8, 1, 1, 0]);
        addBlendingMode("Dodge", [4, 1, 1, 1, 0]);
        addBlendingMode("Burn", [3, 7, 2, 1, 0]);
        
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

            // set up object for layer
            let xPos = objData.xPosition / 100;
            let yPos = screenHeight - (objData.yPosition / 100);
            
            // spawn object
            let object = null;
            let properties = {
              visible: objData.visible, // visibility
              angle: objData.rotation, // rotation
              origin: [objData.anchorX, objData.anchorY], // anchor
              depth: objData.zOrder, // z order
              flipX: objData.flipX, // x flip
              flipY: objData.flipY // y flip
            };
            if (objData.type == "Empty") {
              object = game.add.rectangle(xPos, yPos, objData.scaleXPercent * 0.64, objData.scaleYPercent * 0.64, properties); 
            }
            
            // for unsupported object types, spawn an empty object instead
            if (object == null) {
              object = game.add.rectangle(xPos, yPos, objData.scaleXPercent * 0.64, objData.scaleYPercent * 0.64, properties);
            }
            
            // additional object properties
            object.type = objData.type; // object type (Empty, Graphic, etc.)
            object.id = objData.id; // object id 
            object.setBlendMode(window.rendererBlendModes[objData.blendingMode]); // blend mode
            let color = objData.color;
            if (color[3] === undefined) {
              color[3] = 1;
            }
            for (let i = 0; i < 4; i++) {
              color[i] = Math.round(color[i] * 255);
            }  
            
            // add game object to matter.js as a rigid body for wall and physics objects
            if (objData.physicsMode == "Wall" || objData.physicsMode == "Physics") {
              game.matter.add.gameObject(object);
              
              // set physics properties
              object.setFriction(objData.friction);
              object.setBounce(objData.bounce);
              object.setStatic(objData.physicsMode == "Wall");
              
            }
            
            // matter.js properties
            setColor(object, color[0], color[1], color[2], color[3]);
            object.setAngle(Phaser.Math.RadToDeg(objData.rotation));

            // add object to layer group
            gameLayers[layerData.UUID].instance.add([object]);

            // keep record of object 
            gameObjects[objData.id] = {
              data: objData,
              instance: object
            };
            
            // debugging purposes
            console.log(object);

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
  window.game.canvas.style.left = "0px";
  window.game.canvas.style.width = "100%";
  console.log("Loaded game");
    
}

loadLevel(0);
