// -- objectManipulator.js: extended functionality to help manipulate objects

// spawn an object
system.spawnObject = function(objData) {
             
  // calculate position
  let xPos = objData.xPosition;
  let yPos = screenHeight - objData.yPosition;
  if (objData.relativePosition) {
    xPos = screenWidth * (objData.xPosition / 100);
    yPos = screenHeight - (screenHeight * (objData.yPosition / 100));      
  }
  
  let object = null;
  let properties = {
    visible: objData.visible, // visibility
    angle: objData.rotation, // rotation
    origin: [objData.anchorX, objData.anchorY], // anchor
    depth: objData.zOrder, // z order 
    flipX: objData.flipX, // x flip
    flipY: objData.flipY, // y flip         
    label: objData.id, // object id     
    shape: { // collisions    
      type: 'rectangle',      
      width: objData.scaleXPercent * 0.64,            
      height: objData.scaleYPercent * 0.64          
    },          
    zOrder: objData.zOrder // z order          
  };
  
  if (objData.type == "Empty") {
  
    switch (objData.shape) {
    
      case "Circle":
        object = game.add.circle(xPos, yPos, objData.collisionArea[0][0] * (objData.scaleYPercent / 100), 1, 1);
        properties.shape = {
          type: 'circle',
          radius: objData.collisionArea[0][0]
        };
        break;
        
      case "Polygon":
        object = game.add.polygon(0, 0, objData.polygonCollisions, 1, 1);
        object.setPosition(xPos, yPos, objData.zOrder);
        properties.shape = {
          type: 'fromVertices',
          verts: objData.polygonCollisions,
          flagInternal: true
        };
        object.setScale(objData.scaleXPercent / 100, objData.scaleYPercent / -100);     
        break;
        
      default:   
        object = game.add.rectangle(xPos, yPos, objData.scaleXPercent * 0.64, objData.scaleYPercent * 0.64, 1, 1);      
        properties.shape = {
          type: 'rectangle',          
          width: objData.scaleXPercent * 0.64,          
          height: objData.scaleYPercent * 0.64
        };        
    }    
    object.shape = objData.shape; 
  }
  
  // for unsupported object types, spawn an empty object instead
  if (object == null) {
    object = game.add.rectangle(xPos, yPos, objData.scaleXPercent * 0.64, objData.scaleYPercent * 0.64); 
  }
  
  // additional object properties
  object.type = objData.type; // object type (Empty, Graphic, etc.)
  object.id = objData.id; // object id 
  system.setBlendMode(object, objData.blendingMode); // blend mode
  
  // add game object to matter.js as a rigid body for wall and physics objects
  if (objData.physicsMode == "Wall" || objData.physicsMode == "Physics") {
    game.matter.add.gameObject(object);
    
    // set physics properties
    object.setFriction(objData.friction);
    object.setBounce(objData.bounce);
    object.setMass(objData.mass);
    object.setStatic(objData.physicsMode == "Wall");  
  }
  
  // visual object properties
  let color = objData.color;
  if (color[3] === undefined) {
    color[3] = 1; 
  }
  for (let i = 0; i < 4; i++) {
    color[i] = Math.round(color[i] * 255);
  }  
  system.setColor(object, color[0], color[1], color[2], color[3]);
  object.setAngle(objData.rotation);
  object.setDepth(objData.zOrder);
  object.setOrigin(objData.anchorX / 100, objData.anchorY / 100); 
  object.visible = objData.visible;  
  object.flipX = objData.flipX;  
  object.flipY = (objData.flipY !== true);
  return object;
};

// change color of object regardless of type
system.setColor = function(object, r, g, b, a) {
  
  // graphic objects
  if (object.type == "Graphic") {
    object.setTint(Phaser.Display.Color.GetColor32(
      r, g, b, a
    ));    
  }
  
  // empty objects
  if (object.type == "Empty") {
    object.fillColor = Phaser.Display.Color.GetColor32(
      r, g, b, a
    );  
    object.setAlpha(a / 255);
  }
}


// change blending mode of an object
system.setBlendMode = function(object, mode) {
  switch (mode) {
    case "Normal":
      object.setBlendMode(Phaser.BlendModes.NORMAL);
      break;
    case "Burn": 
      object.setBlendMode(Phaser.BlendModes.MULTIPLY);
      break;
    case "Screen":
      object.setBlendMode(Phaser.BlendModes.SCREEN);
      break;
    case "Dodge":
      object.setBlendMode(Phaser.BlendModes.ADD);
      break;
    case "None":
      object.setBlendMode(Phaser.BlendModes.NORMAL);
      break;
  }
}
