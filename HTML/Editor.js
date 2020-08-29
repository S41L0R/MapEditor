// Imports


var THREE = require('three');
var collada = require('three-loaders-collada')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE)



// Define ThreeJs variables:

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);
var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("viewport")});

document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

camera.position.z = 5;




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


// Actual code goes here:


// DAE loader
var loader = new THREE.ColladaLoader();

loader.load( '../Test/TwnObj_Village_Korok_DekuTree_A_01.dae', function ( dae ) {

	scene.add( dae.scene );

}, undefined, function ( error ) {

	console.error( error );

} );



// Controls
var controls = new OrbitControls( camera, renderer.domElement );
controls.update();






// Lighting
var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 0, 0, 0 );
camera.add( light );
scene.add(camera);














function animate() {
	resizeCanvasToDisplaySize();
	requestAnimationFrame( animate );

  controls.update();

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
	camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
	renderer.render( scene, camera );
}
animate();
