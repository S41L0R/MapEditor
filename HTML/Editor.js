// Imports


//import { THREE } from './lib/threejs/build/three.js';
import { ColladaLoader } from './lib/threejs/examples/jsm/loaders/ColladaLoader.js';
import { FirstPersonControls } from './lib/threejs/examples/jsm/controls/EditorControls.js'
import {TransformControls} from './lib/threejs/examples/jsm/controls/TransformControls.js'

const fs = require('fs')

// Define ThreeJs variables:
// -----------------------------------------------------------------------------
var viewport = document.getElementById("viewport");
//var viewport = document.body;


var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);

var renderer = new THREE.WebGLRenderer({canvas: viewport});
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

var clock = new THREE.Clock();



// Define raycasting/selection variables
// -----------------------------------------------------------------------------

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var selectedObject;



camera.position.z = 5;


// Define pointerDown and pointerUp
viewport.onpointerdown = pointerDown;

var objects = [];

var doObjectSelect = true;

// User-Defined Variables
// -----------------------------------------------------------------------------

var customColor = new THREE.Color( 'skyblue' );
var customDarkColor = new THREE.Color('#2b2b31');
var cameraSpeed = 150;
var cameraLookSpeed = 1;






// Define Map Based variables
// -----------------------------------------------------------------------------

var testDict = new Object();
var sectionData;



// Boring code that doesn't matter
// -----------------------------------------------------------------------------

// Automatically scale canvas to fit:
function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.far = 100000;
    camera.updateProjectionMatrix();

    // update any render target sizes here
  }
}



var geo = new THREE.Geometry();

geo.vertices.push(
	new THREE.Vector3( -1,  1, 0 ),
	new THREE.Vector3( -1, -1, 0 ),
	new THREE.Vector3(  1, -1, 0 )
);

geo.faces.push( new THREE.Face3( 0, 1, 2 ) );

geo.computeBoundingSphere();

var tri = new THREE.Mesh(geo, material);
scene.add(tri);
tri.position.set(50, 50, 50);

// Actual code goes here:
// -----------------------------------------------------------------------------

// Loading loadManager
var loadManager = new THREE.LoadingManager();
loadManager.onStart = function ( url, itemsLoaded, itemsTotal ) {

	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};
var daeModel;

const onLoad = function (dae)  {

	console.log( 'Loading complete!');
  daeModel = dae.scene;
  daeModel.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
        objects.push(child);
        console.log("Child instanceof THREE.Mesh = true")

    }
  });
  objects.push(dae.scene);
  console.log("objects:");
  console.log(objects);

  for (var i = 1; i < daeModel.children.length; i++) {
    daeModel.children[i].geometry.computeBoundingSphere();
    console.log(daeModel.children[i].geometry);


  }


  scene.add(daeModel);
  daeModel.parent.remove(daeModel.children[0]);
  console.log(daeModel);

};


const onProgress = function ( url, itemsLoaded, itemsTotal ) {

	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};
function loadPython(callback, func, arg) {
  console.log("Got to LoadPython!");



  if (arg == null) {
    const { spawn } = require('child_process');
    const childPython = spawn('python', ['../MapEditor/Process.py', `${func}()`]);

    console.log("Process is spawned.");
    var loadingPython = true;
    childPython.stdio[1].on('data', (dataBuffer) => {
      console.log(`stdout as string from buffer: ${dataBuffer}`);

      if (dataBuffer.toString().includes("!startData")) {
        console.log("true");
        var data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")));
        console.log(data);
        //callback(data);
        loadActors(data);



        sectionData = data;
      }
      else {
        console.log("false");
      }

    });
  }
  else {
    const { spawn } = require('child_process');
    const childPython = spawn('python', ['../MapEditor/Process.py', `${func}(${arg})`]);

    console.log("Process is spawned.");
    var loadingPython = true;
    childPython.stdio[1].on('data', (dataBuffer) => {
      console.log(`stdout as string from buffer: ${dataBuffer}`);

      if (dataBuffer.toString().includes("!startData")) {
        console.log("true");
        var data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")));
        console.log(data);
        //callback(data);
        loadActors(data);



        sectionData = data;
      }
      else {
        console.log("false");
      }

    });
  }
}
//loadPython();
//var data = loadPython();
var fullData;
function loadPythonCallback(data) {
  fullData = data;
}
//loadPython(loadPythonCallback);
console.log("test");
loadPython(function(s){console.log(s);}, "main")


// Load from map file.
async function loadActors(data) {


  console.log("Got to loadActors!");

  //pywebview.api.getStuff();
  var loader = new THREE.FontLoader();




  //data.Static.Objs
  //for (var i = 0; i < data.Static.Objs.length-1001; i++) {
  //for (const i of data.Static.Objs.slice(0, 5)) {
  //data.Static.Objs.Length.foreach()
  for (const i of data.Static.Objs) {
    //var i = 0;
    /*
    loader.load( 'HTML/lib/threejs/examples/fonts/helvetiker_regular.typeface.json', async function ( font ) {

    //var textGeo = await new THREE.TextGeometry( data.Static.Objs[i].UnitConfigName, {
    var textGeo = await new THREE.TextBufferGeometry( i.UnitConfigName, {
    //var textGeo = new Promise(THREE.TextGeometry( data.Static.Objs[i].UnitConfigName, {
  		  font: font,
  		  size: 800,
  		  height: 5,
  		  curveSegments: 12,
  		  bevelEnabled: true,
  		  bevelThickness: 10,
    		bevelSize: 8,
  		  bevelOffset: 0,
  		  bevelSegments: 5
  	 } );
     //textGeo.computeBoundingBox();
     //textGeo.computeVertexNormals();
     const textMesh = await new THREE.Mesh(textGeo, material);
     //textMesh.scale.set(0.001, 0.001, 0.001);
     textMesh.scale.set(0.1, 0.1, 0.1);
     textMesh.position.set(i.Translate[0], i.Translate[1], i.Translate[2])
     await scene.add(textMesh);
     console.log(i);
     //console.log(data.Static.Objs[i].UnitConfigName);
     console.log(i.UnitConfigName);
     console.log(textMesh);

   } );*/
    console.log(i);


    var cubeGeo = await new THREE.BoxBufferGeometry(10, 10, 10);
    var cubeMesh = await new THREE.Mesh(cubeGeo, material);
    cubeMesh.position.set(i.Translate[0], i.Translate[1], i.Translate[2])
    cubeMesh.HashID = i.HashId;
    cubeMesh.Type = "Static";
    await scene.add(cubeMesh);
    await objects.push(cubeMesh);
    await console.log("cubeMesh");
    console.log(cubeMesh);
    await console.log("No cubeMesh")

  }
  console.log(scene);
}

// Light mode / Dark mode
// -----------------------------------------------------------------------------
const darkModeToggle = document.getElementById("darkModeToggle");
const styleSheet = document.getElementById("styleSheet");

darkModeToggle.addEventListener("click", function() {
  if (styleSheet.getAttribute("href") == "HTML/Light-Mode.css") {
    styleSheet.href = "HTML/Dark-Mode.css";
    scene.background = customDarkColor;
    loadPython(function(s){console.log(s);}, 'setDarkMode');
  } else {
    styleSheet.href = "HTML/Light-Mode.css";
    scene.background = customColor;
    loadPython(function(s){console.log(s);}, 'setDarkMode');
  }
});

//Load settings from config.json
function loadSettings() {
  var settings = loadPython(function(s){console.log(s);}, "getDarkMode");
  if (settings.DarkMode == true) {
    styleSheet.href = "HTML/Dark-Mode.css";
    scene.background = customDarkColor;
  }
  else {
    styleSheet.href = "HTML/Light-Mode.css";
    scene.background = customColor;
  };
};
window.onload = function() {
  loadSettings();
};

// Used to return the actor data for showActorData. Later on I'll just assign the index in the Objs array from sectionData as a value directly to the object on creation so I don't need this.
// -----------------------------------------------------------------------------
function findActorData(hashId, type) {
  if (type == "Static") {
    for (const i of sectionData.Static.Objs) {
      if (i.HashId == hashId) {
        return i;
      }
    }
  }
  if (type.equals("Dynamic")) {
    for (const i of sectionData.Dynamic.Objs) {
      if (i.HashId == hashId) {
        return(i);
      }
    }
  }
}

// -----------------------------------------------------------------------------


// Controls the side bar panel thing, doesn't currently have a system for multi-actor selection, but I'll need to give TransformControls that first.
// -----------------------------------------------------------------------------
// Initializes the camera slider varaibles
var cameraSlider = document.getElementById('cameraSlider');
var sliderValue = document.getElementById('sliderValue');
sliderValue.innerHTML = cameraSlider.value;

// Changes the camera speed when the slider's value changes
cameraSlider.oninput = function() {
  sliderValue.innerHTML = this.value;
  cameraSpeed = this.value
  fpControls.movementSpeed = cameraSpeed
}

function showActorData(ActorHashID, ActorType) {
  var actorDataPanel = document.getElementById("DataEditorTextWindow");
  actorDataPanel.innerHTML = `
  <p><strong>${findActorData(ActorHashID, ActorType).UnitConfigName}</strong></p>
  <p>${ActorHashID}</p>
  <button class="button" id="ActorEditButton">Edit BYML</button>

  `;
  document.getElementById("ActorEditButton").addEventListener("click", () => {createEditorWindow(findActorData(ActorHashID, ActorType))});
  //document.getElementById("ActorEditButton").onclick = findActorData(ActorHashID, ActorType);
}
// -----------------------------------------------------------------------------
//loadActors();



/*function loadPython () {
    var python = require('child_process').spawn('python', ['./../MapEditor/Process.py']);
 }*/


//loadData();


// DAE loader
// -----------------------------------------------------------------------------

var loader = new ColladaLoader();
var url = './Test/Guardian_A_Perfect.dae'
loader.load( url, onLoad, onProgress );
//console.log(daeModel);

// -----------------------------------------------------------------------------


// Controls
var fpControls = new FirstPersonControls( camera, renderer.domElement );
fpControls.movementSpeed = cameraSpeed;
fpControls.loocSpeed = cameraLookSpeed;
fpControls.lookSpeed = 0.1;

// Transform Controls
// -----------------------------------------------------------------------------

// Initialize transformControl
var transformControl = new TransformControls( camera, renderer.domElement );

// Do some junk that matters but doesn't matter.
transformControl.addEventListener( 'change', render);

transformControl.addEventListener( 'dragging-changed', function ( event ) {
  fpControls.enabled = ! event.value;
  doObjectSelect = ! event.value;

} );
transformControl.setMode('translate');


function updatebounds () {
  console.log("parent:");
  console.log(transformControl.object.parent);
  var child;
  for (child = 1; child < transformControl.object.parent.children.length; child++) {
    transformControl.object.parent.children[child].geometry.computeBoundingSphere();
  }
  render();
}



function render() {

  renderer.render( scene, camera );




}
// Adds transformControl to the scene.
scene.add(transformControl);


// Custom background color
// -----------------------------------------------------------------------------


scene.background = customColor


// Lighting
// -----------------------------------------------------------------------------
var cameraPointLight = new THREE.PointLight( 0xffffff, 100, 100, 2 );
cameraPointLight.position.set( 0, 0, 0 );
camera.add( cameraPointLight );

var hemiLight = new THREE.HemisphereLight( customColor, 0x080820, 1 );
scene.add( hemiLight );

scene.add(camera);


// -----------------------------------------------------------------------------

//window.open('./HTML/UI/SelectedActor/SelectedActor.html', 'hi', 'nodeIntegration=no')
//const electron = require('electron')
//const BrowserWindow = electron.BrowserWindow;


function createEditorWindow(obj) {
const {BrowserWindow} = require('electron').remote

let editorWin = new BrowserWindow({width: 600, height: 400, webPreferences: {nodeIntegration: true}});
//win.LoadURL("file://HTML/UI/SelectedActor/SelectedActor.html")

editorWin.loadURL(`file://${__dirname}/HTML/UI/SelectedActor/SelectedActor.html`)





  editorWin.once('ready-to-show', () => {
      editorWin.show();
    });

  editorWin.webContents.on('did-finish-load', () => {
      //editorWin.webContents.send('toActorEditor', 'Hello second window!');
      editorWin.webContents.send('toActorEditor', {data: obj, windowID: 1});
  });
}



const ipc = require('electron').ipcRenderer;


ipc.on('fromActorEditor', (event, message) => {
  console.warn(message);
})

document.getElementById("DataEditorTextWindow").innerHTML = `

`;



// Handle Mouse Movement
// -----------------------------------------------------------------------------
document.addEventListener( 'mousemove', onMouseMove, true );

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  //console.log(mouse.x);
}

console.log(scene.children);

// Handle Actor Selection
// -----------------------------------------------------------------------------
function pointerDown(evt) {
  var action;

  switch(evt.pointerType) {
    case "mouse":
      if (evt.buttons === 1) {
      if (doObjectSelect == true) {
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects, true);


        // Checks to make sure that something was actually intersected.
        if (intersects.length > 0) {

          // Grabs the very first intersected object
          selectedObject  = intersects[0].object;
          console.log("start");
          console.log(selectedObject);
          console.log(selectedObject.parent);
          console.log("end");
          if ( selectedObject !== null && selectedObject !== scene && selectedObject !== camera && selectedObject.parent.children[0] !== scene.children[1].object) {
            if (selectedObject.parent.type == "Group") {
              transformControl.attach( selectedObject.parent);
              showActorData(selectedObject.parent.HashID, selectedObject.parent.Type);
            }
            else {
              transformControl.attach( selectedObject );
              showActorData(selectedObject.HashID, selectedObject.Type);
            }
            console.log(selectedObject.parent);
            console.log(selectedObject);
          //selectedObject.parent.remove(selectedObject);
          }
        }
      }

      else {
        transformControl.detach();
      }
      break;
      }
    case "pen":
      action = "tapping";
      break;
    case "touch":
      action = "touching";
      break;
    default:
      action = "interacting with";
      break;
    }
  }


// Handle TransformControl Mode changes
document.getElementById("Translate").addEventListener("click", controlSetTranslate);
document.getElementById("Rotate").addEventListener("click", controlSetRotate);
document.getElementById("Scale").addEventListener("click", controlSetScale);


function controlSetTranslate() {
  transformControl.setMode("translate");
}
function controlSetScale() {
  transformControl.setMode("scale");
}

function controlSetRotate() {
  transformControl.setMode("rotate");
}




// More boring stuff
// -----------------------------------------------------------------------------

function animate() {
	resizeCanvasToDisplaySize();
  setTimeout( function() {

        requestAnimationFrame( animate );

    }, 1000 / 60 );

  fpControls.update(clock.getDelta());

	camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
	renderer.render( scene, camera );
}
animate();
