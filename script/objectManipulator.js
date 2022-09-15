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
  }
}
