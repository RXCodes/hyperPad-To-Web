// get all behaviors and put in a list
var behaviorList = behaviors.all.list();

// remove unimportant behaviors
behaviors.search.includesName("ignoreBehaviorStorage").list()
  .forEach(function(behavior) {
      delete behaviorList.splice(behaviorList.indexOf(behavior), 1);
  })
  
// make a dictionary with behaviors
var dictionary = {};
behaviorList.forEach(function(behavior) {
  let data = behaviors.search.withName(behavior);
  let inputData = data.listInternal()[behavior].ZACTIONS;
  let deleteKeys = ["active", "behaviourCategory", "alias",
                    "[object Object]"];
  
  deleteKeys.forEach(function(key) {
    delete inputData[key];
  });
  
  dictionary[behavior] = {
    alias: behavior,
    inputs: inputData,
    outputs: [],
    behavior: data.listInternal()[behavior].ZNAME
  }
})

// categorize
function categorize(category) {
  b = behaviors.search.objectOf(category).list();
  console.log(b);
  b.forEach(function(behavior) {
    if (dictionary[behavior]) {
      dictionary[behavior].category = category;
    } 
  });
}

let categories = ["Interaction", "Object", "FX", "Custom", "Logic",
                    "Screen", "Scene", "Physics", "Transform", "UI"];
categories.forEach(function(category) {
  categorize(category);
  console.info(category);
});

// map ztag to behavior data
let counter = 0;
const behaviorDatabase = behaviors.all.listInternal();
Object.keys(behaviorDatabase).forEach(function(behavior) {
    
  if (dictionary[behavior] === undefined) {
     return;
  }
  
  // zactions data
  let data = behaviorDatabase[behavior];
  data.ZACTIONS.value = data.ZACTIONS.value || {};
  data.ZACTIONS.values = data.ZACTIONS.values || {};
  
  // multiple inputs
  if (data.ZACTIONS.values["NS.objects"]) {
    data.ZACTIONS.values["NS.objects"].forEach(function(key) {
        counter++;
        defineInput(behavior, key);
    })
  } 
  
  // single input
  if (data.ZACTIONS.value["NS.string"]) {
    counter++;
    defineInput(behavior, data.ZACTIONS.value["NS.string"]);
  }
  
})

// get behavior outputs
function defineInput(name, param) {
    
    try {
    
    // store output field to behavior database
    dictionary[name].outputs = dictionary[name].outputs || [];
    dictionary[name].outputs.push(param);
    
    } catch(e) {
        console.error(e);
    };
    
}

// determine input field types
Object.keys(dictionary).forEach(function(behavior) {
  Object.keys(dictionary[behavior].inputs).forEach(function(input) {
    let data = dictionary[behavior].inputs[input];
    let dict = {
      defaultValue: data.value
    }
    let val = data.value;
    
    // check if the behavior has a results output
    if (input === "final value") {
      defineInput(behavior, "result");
      delete dictionary[behavior].inputs[input];
      return;
    }
    if (input === "actionKey") {
      if (behavior !== "Set Input Field") {
        delete dictionary[behavior].inputs[input];
        return;
      }
      dict.inputType = "String";
      dict.defaultValue = "";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "value") {
      if (behavior !== "Set Input Field") {
        delete dictionary[behavior].inputs[input];
        return;
      }
      dict.inputType = "String";
      dict.defaultValue = "";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "control") {
      dict.useMain = true;
      dict.inputType = "Dictionary";
      dict.defaultValue = {};
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "storage") {
      dict.useMain = true;
      dict.inputType = "Array";
      dict.defaultValue = [];
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "outputs") {
      console.error(dict)
      dict.useMain = true;
      dict.inputType = "Array";
      dict.defaultValue = [];
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // layer ID
    if (input === "index") {
      if (behavior == "Show Layer") {
        dict.inputType = "LayerID";
        dict.defaultValue = "self";
        dictionary[behavior].inputs[input] = dict;
        return;
      }
      if (behavior == "Hide Layer") {
        dict.inputType = "LayerID";
        dict.defaultValue = "self";
        dictionary[behavior].inputs[input] = dict;
        return;
      }
    }
    
    // asset selection
    if (input === "soundPath") {
      dict.inputType = "Sound";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "predefinedGraphic") {
      dict.inputType = "Graphic";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "graphic") {
      dict.inputType = "Graphic";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "image") {
      dict.inputType = "Graphic";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "animationName") {
      dict.inputType = "String";
      dict.defaultValue = "";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "images") {
      dict.inputType = "GraphicArray";
      dict.defaultValue = [];
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "BehaviourCustomAttributeAnimationPriority") {
      dict.inputType = "Number";
      dict.defaultValue = 0;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "easeAction") {
      dict.inputType = "TransformTransition";
      dict.defaultValue = "Linear";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "transition") {
      dict.inputType = "SceneTransition";
      dict.defaultValue = "None";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // object ID
    if (input === "objectA") {
      dict.inputType = "ObjectID";
      dict.defaultValue = "self";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    if (input === "objectB") {
      dict.inputType = "ObjectID";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // behavior
    if (input.includes("behaviour")) {
      dict.inputType = "BehaviorID";
      dict.defaultValue = null;
      dictionary[behavior].inputs[input] = dict;
      return;
    }

    // non-existent
    if (val == undefined) {
      dictionary[behavior].inputs[input].inputType = "Custom";
      return;
    }
    
    // boolean
    if (val === true || val === false) {
      dict.inputType = "Boolean";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // string
    if (val === "blank" || val === " " || val === "") {
      dict.inputType = "String";
      dict.defaultValue = "";
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // JSON
    let isJSON = false;
    try {
      let json = val;
      try {
        dict.defaultValue = JSON.parse(val);
      } catch(e) {
        json = JSON.stringify(val);
      }
      let a = false;
      let d = false;
      
      // testing with array
      if (json.startsWith("[")) {
        a = true;
      }
      
      // testing with dictionary
      if (json.startsWith("{")) {
        d = true;
      }
      
      
      if (a) {
          
        // array
        isJSON = true;
        dict.inputType = "Array";
        dictionary[behavior].inputs[input] = dict;
        return;
          
      }
      if (d) {
      
        // dictionary
        isJSON = true;
        dict.inputType = "Dictionary";
        dictionary[behavior].inputs[input] = dict;
        return;
        
      }
      
    } catch(e) {};
    if (isJSON) {
      return;
    }
    
    // number
    if (val == Number(val)) {
      dict.inputType = "Number";
      dict.defaultValue = Number(val);
      dictionary[behavior].inputs[input] = dict;
      return;
    }
    
    // otherwise string
    dict.inputType = "String";
    if (dict.defaultValue == "$null") {
      dict.defaultValue = null;
    }
    dictionary[behavior].inputs[input] = dict;
    
  })
})

// add output for math function
dictionary["Math Function"].outputs.push("result");

console.log(behaviors.search.withName("Math Function").listInternal().format())
console.log(dictionary["Math Function"].format());
downloadFile("behaviorBase", dictionary.format())



























