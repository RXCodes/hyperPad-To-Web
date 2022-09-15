// -- objectManipulator.js: extended functionality to help manipulate objects

// change color of object regardless of type
function setColor(object, r, g, b, a) {
  
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
function setBlendMode(object, mode) {
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
