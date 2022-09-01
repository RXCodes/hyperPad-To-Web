// -- colorConverter.js: converts RGB to/from Hex values - useful for object colors

// convert RGB values to hex
function rgbToHex(r, g, b, a) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) + ((a || 255).toString(16) || "FF");
}

// convert color hex values back to RGB
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
      let r = parseInt(result[1], 16);
      let g = parseInt(result[2], 16);
      let b = parseInt(result[3], 16);
      let a = parseInt(result[4] || "FF", 16);
      return [r, g, b, a];
  } 
  return null;
}
