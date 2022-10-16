// -- objectManipulator.js: extended functionality to help manipulate objects

// the system variable, responsible for holding global functions
var system = {};

// move an object from its current position
system.moveBy = function(object, x, y, useRelativePosition) { 
  if (useRelativePosition) {
    x *= window.screenWidth / 100;
    y *= window.screenHeight / 100;
  }
  let xPos = object.x + x;
  let yPos = object.y + y;
  object.setPosition(xPos, yPos);
  object.data.xPosition = xPos;
  object.data.yPosition = yPos;
}

// move an object to a point
system.moveToPoint = function(object, x, y, useRelativePosition) { 
  let xPos = x;
  let yPos = window.screenHeight - y;
  if (useRelativePosition) {
    xPos = window.screenWidth * (x / 100);
    yPos = window.screenHeight - (window.screenHeight * (y / 100));      
  }
  object.setPosition(xPos, yPos);
  object.data.xPosition = xPos;
  object.data.yPosition = yPos;
}

system.setAnchorPoint = function(object, x, y) {
  let collisionOffsetX = (object.data.collisionCenterX - 32) / 32;
  let collisionOffsetY = (object.data.collisionCenterY - 32) / 32;
  object.setOrigin((x / 100) + collisionOffsetX, (y / 100)) + collisionOffsetY;
  object.data.xAnchor = x;
  object.data.yAnchor = y;
}

// spawn an object
system.spawnObject = function(objData) {
             
  // calculate position
  let xPos = objData.xPosition;
  let yPos = window.screenHeight - objData.yPosition;
  if (objData.relativePosition) {
    xPos = window.screenWidth * (objData.xPosition / 100);
    yPos = window.screenHeight - (window.screenHeight * (objData.yPosition / 100));      
  }
  
  let object = null;
  let properties = { // physical properties
    label: objData.id, // object id     
    shape: { // collisions    
      type: 'rectangle',      
      width: 64,
      height: 64          
    }
  };
  
  if (objData.type == "Empty") {
  
    switch (objData.shape) {
    
      case "Circle":
        object = game.add.circle(xPos, yPos, objData.collisionArea[0][0], 1, 1);
        properties.shape = {
          type: 'circle',
          radius: objData.collisionArea[0][0]
        };
        break;
        
      case "Polygon":
        let poly = [];
        objData.polygonCollisions.forEach(function(pos) {
          poly.push(pos[0]);
          poly.push((pos[1] * -1));
        });
        object = game.add.polygon(0, 0, poly, 1, 1);
        properties.shape = {
          type: 'fromVertices',
          verts: objData.polygonCollisions,
          flagInternal: true
        };
        break;
        
      default:   
        object = game.add.rectangle(xPos, yPos, 64, 64, 1, 1);      
        properties.shape = {
          type: 'rectangle',          
          width: 64,          
          height: 64
        };        
    }    
    object.shape = objData.shape; 
  }
  
  // for unsupported object types, spawn an empty object instead
  if (object == null) {
    object = game.add.rectangle(xPos, yPos, 64, 64); 
  }
  
  // add game object to matter.js as a rigid body for wall and physics  
  if (objData.physicsMode == "Wall" || objData.physicsMode == "Physics") {
    game.matter.add.gameObject(object);
    
    // set physics properties
    object.setFriction(objData.friction);
    object.setBounce(objData.bounce);
    object.setMass(objData.mass);
    object.setStatic(objData.physicsMode == "Wall");  
  }
  
  // object properties
  object.data = objData;
  system.setAnchorPoint(object, objData.anchorX, objData.anchorY); 
  system.moveToPoint(object, objData.xPosition, objData.yPosition, objData.relativePosition); // move the object to its position
  system.setBlendMode(object, objData.blendingMode); // blend mode
  system.setScale(object, objData.scaleXPercent, objData.scaleYPercent, true); // scale (last parameter enables percentage)
  let color = objData.color;
  if (color[3] === undefined) {
    color[3] = 1; 
  }
  for (let i = 0; i < 4; i++) {
    color[i] = Math.round(color[i] * 255);
  }  
  system.setColor(object, color[0], color[1], color[2], color[3]); // color
  system.setRotation(object, objData.rotation); // rotation
  system.setZOrder(object, objData.zOrder); // z order
  // system.setVisibility(object, objData.visible); // object visibility
  system.setFlipX(object, objData.flipX); // x flip
  system.setFlipY(object, objData.flipY); // y flip
  return object;
};

system.setFlipY = function(object, bool) {
  object.flipY = bool;
  object.data.flipY = bool;
}

system.setFlipX = function(object, bool) {
  object.flipX = bool;
  object.data.flipX = bool;
}

system.setVisibility = function(object, state) {
  object.visible = state;
  object.data.visible = state;
}

system.setZOrder = function(object, z) {
  object.setDepth(z);
  object.data.zOrder = z;
}

system.setRotation = function(object, angle) {
  object.setAngle(angle);
  object.data.rotation = angle;
}

system.setScale = function(object, x, y, usePercentage = false) {
  if (usePercentage) {
    object.setScale(x / 100, y / 100);
    object.data.scaleXPercentage = x;
    object.data.scaleYPercentage = y;
  } else {
    object.setScale(
      (x * window.projectBase.ptmRatio) / object.width, 
      (y * window.projectBase.ptmRatio) / object.height
    );
    object.data.scaleXPercentage = ((x * window.projectBase.ptmRatio) / object.width) * 100;
    object.data.scaleYPercentage = ((y * window.projectBase.ptmRatio) / object.height) * 100;
  }
}

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
  
  object.data.color = [r, g, b, a];
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
  object.data.blendMode = mode;
}
