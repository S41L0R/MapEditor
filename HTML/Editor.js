var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({canvas: "viewport"});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

camera.position.z = 5;


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




function animate() {
	requestAnimationFrame( animate );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();
