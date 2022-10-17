// usage of the new system variable
system.moveBy(object [OBJECT], x [NUMBER], y [NUMBER], relativePosition [BOOLEAN]);
system.moveBy(input.objectA, 10, 20, false);

system.moveToPoint(object [OBJECT], x [NUMBER], y [NUMBER], relativePosition [BOOLEAN]);
system.moveToPoint(input.objectA, 50, 50, true);

system.setAnchorPoint(object [OBJECT], x [NUMBER], y [NUMBER]);
system.setAnchorPoint(input.objectA, 50, 50);

system.spawnObject(object [DICTIONARY]);
system.spawnObject({
  xPosition: 300,
  yPosition: 250,
  relativePosition: false,
  type: "Empty",
  scaleXPercentage: 100,
  scaleYPercentage: 100,
  color: [0, 1, 0.5, 1],
  attributes: {},
  tags: [],
  // ... other properties here
});

system.setFlipX(object [OBJECT], state [BOOLEAN]);
system.setFlipX(input.objectA, true);

system.setFlipY(object [OBJECT], state [BOOLEAN]);
system.setFlipY(input.objectA, true);

system.setVisibility(object [OBJECT], state [BOOLEAN]);
system.setVisibility(input.objectA, false); // hide an object
system.setVisibility(input.objectA, true); // show an object

system.setZOrder(object [OBJECT], zOrder [NUMBER]);
system.setZOrder(input.objectA, 10);

system.setRotation(object [OBJECT], angle [NUMBER]);
system.setRotation(input.objectA, 90);

system.setScale(object [OBJECT], x [NUMBER], y [NUMBER], usePercentage [BOOL]);
system.setScale(input.objectA, 100, 100, true);

system.setColor(object [OBJECT], red [NUMBER], green [NUMBER], blue [NUMBER], alpha [NUMBER]);
system.setColor(input.objectA, 255, 0, 100, 255);

system.setBlendMode(object [OBJECT], mode [STRING]);
system.setBlendMode(input.objectA, "Dodge");
