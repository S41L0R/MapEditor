// Imports


//import { THREE } from './lib/threejs/build/three.js';
import { ColladaLoader } from './lib/threejs/examples/jsm/loaders/ColladaLoader.js';
import { FirstPersonControls } from './lib/threejs/examples/jsm/controls/EditorControls.js'
import {TransformControls} from './lib/threejs/examples/jsm/controls/TransformControls.js'



// Define ThreeJs variables:
// -----------------------------------------------------------------------------
var viewport = document.getElementById("viewport");


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
var cameraSpeed = 15;
var cameraLookSpeed = 1;

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

    }
  });
  objects.push(dae.scene);
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








// DAE loader
// -----------------------------------------------------------------------------

var loader = new ColladaLoader();
var url = '../Test/Guardian_A_Perfect.dae'
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



// Handle Mouse Movement
// -----------------------------------------------------------------------------
document.addEventListener( 'mousemove', onMouseMove, false );

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
      if (doObjectSelect == true) {
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects, true);
        // Checks to make sure that something was actually intersected.
        if (intersects.length > 0) {

          // Grabs the very first intersected object
          selectedObject  = intersects[0].object;
          if ( selectedObject !== null && selectedObject !== scene && selectedObject !== camera && selectedObject.parent.children[0] !== scene.children[1].object) {
            transformControl.attach( selectedObject.parent.children[0]);
            console.log(selectedObject.parent.children[0]);
            console.log(selectedObject);
          //selectedObject.parent.remove(selectedObject);
          }
        }
      }
      else {
        transformControl.detach();
      }
      break;
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
