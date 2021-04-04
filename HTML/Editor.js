// Imports
// -----------------------------------------------------------------------------

// import { THREE } from './lib/threejs/build/three.js';
import { ColladaLoader } from "./lib/threejs/examples/jsm/loaders/ColladaLoader.js";
import { FirstPersonControls } from "./lib/threejs/examples/jsm/controls/EditorControls.js";
import { TransformControls } from "./lib/threejs/examples/jsm/controls/TransformControls.js";
import {SkeletonUtils} from "./lib/threejs/examples/jsm/utils/SkeletonUtils.js";
import {BufferGeometryUtils} from "./lib/threejs/examples/jsm/utils/BufferGeometryUtils.js";

const fs = require("fs");
const path = require("path");

// Get friends

const ActorTools = require("./HTML/utils/ActorTools.js")
const RailTools = require("./HTML/utils/RailTools.js")
const RailHelperTools = require("./HTML/utils/RailHelperTools.js")

// Define ThreeJs variables:
// -----------------------------------------------------------------------------
const viewport = document.getElementById("viewport");
// var viewport = document.body;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, 2, 1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: viewport });
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const cubeTexLoader = new THREE.TextureLoader();
const cubeTexture = cubeTexLoader.load(
	"./Assets/Textures/CubeTexture.png");
const material = new THREE.MeshStandardMaterial({
	emissiveMap: cubeTexture,
	emissive: new THREE.Color("#FFFFFF"),
	transparent: true,
	opacity: 0.75
});
const areaTexture = cubeTexLoader.load(
	"./Assets/Textures/AreaTexture.png");
const areaMaterial = new THREE.MeshStandardMaterial({
	emissiveMap: areaTexture,
	map: areaTexture,
	emissive: new THREE.Color("#FFFFFF"),
	transparent: true,
	alphaTest: 0.35,
	opacity: 0.5,
	side: THREE.DoubleSide
});

const clock = new THREE.Clock();

// Define raycasting/selection variables
// -----------------------------------------------------------------------------

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 1;
const mouse = new THREE.Vector2();

let selectedObject;

camera.position.z = 5;

// Define pointerDown and pointerUp
viewport.onpointerdown = pointerDown;

const objects = [];

let doObjectSelect = true;

const selectedObjectGroup = new THREE.Group();

// User-Defined Variables
// -----------------------------------------------------------------------------

const customColor = new THREE.Color("skyblue");
const customDarkColor = new THREE.Color("#2b2b31");
let cameraSpeed = 150;
const cameraLookSpeed = 1;

// Amount of instances for each model before it creates a new instanced mesh object.
const instNum = 50;

// Determines whether models should be loaded. Currently this is equivelent to badFramerate.
//const loadModels = true;

var loadModels;
loadPython(function (s) { loadModels = s;}, "shareSettings", "LoadModels");

// Define Map Based variables
// -----------------------------------------------------------------------------

const testDict = new Object();
let sectionData;






var calledNum = 0;


// Define Global models
// -----------------------------------------------------------------------------

var cubeGeo = new THREE.BoxBufferGeometry();
var sphereGeo = new THREE.SphereBufferGeometry();
var cylinderGeo = new THREE.CylinderBufferGeometry();
var capsuleGeo = new THREE.CapsuleBufferGeometry();

var modelsToCacheTotal;
var modelsToCacheDone;

//var capsuleGeo = new THREE.BufferGeometry();

//const capsuleGeoVerticies = new Float32Array([
	 0.981239, -0.600000, -0.600000, 0.600000, -0.600000, -0.981239, 0.600000, -1.000000, -0.981239, 0.981239, -1.000000, -0.600000, 0.566616, -0.600000, -1.000000, 0.566616, -1.000000, -1.000000, 0.200000, -0.600000, -1.133311, 0.200000, -1.000000, -1.133311, -0.200000, -0.600000, -1.133311, -0.200000, -1.000000, -1.133311, -0.566616, -0.600000, -1.000000, -0.566616, -1.000000, -1.000000, -0.402604, -1.400000, -1.000000, -0.200000, -1.400000, -1.060113, -0.600000, -1.000000, -0.981239, -0.600000, -1.400000, -0.895717, -0.981238, -1.000000, -0.600000, -0.895717, -1.400000, -0.600000, -1.000000, -1.000000, -0.566616, -1.000000, -1.400000, -0.402605, -1.133311, -1.000000, -0.200000, -1.060113, -1.400000, -0.200000, -1.133311, -1.000000, 0.200000, -1.060113, -1.400000, 0.200000, -1.000000, -1.000000, 0.566616, -1.000000, -1.400000, 0.402605, -0.981238, -1.000000, 0.600000, -0.895717, -1.400000, 0.600000, -0.600000, -1.775880, 0.600000, -0.600000, -1.800000, 0.566616, -0.801421, -1.800000, 0.200000, -1.000000, -1.530196, 0.200000, -0.566616, -1.800000, 0.600000, -0.402604, -1.400000, 1.000000, -0.200000, -1.530196, 1.000000, -0.200000, -1.800000, 0.801421, -0.600000, -1.400000, 0.895717, 0.200000, -1.530196, 1.000000, 0.200000, -1.800000, 0.801421, 0.402605, -1.400000, 1.000000, 0.600000, -1.400000, 0.895717, 0.600000, -1.775880, 0.600000, 0.566616, -1.800000, 0.600000, 0.895717, -1.400000, 0.600000, 1.000000, -1.400000, 0.402605, 1.000000, -1.530196, 0.200000, 0.801421, -1.800000, 0.200000, 0.600000, -1.800000, 0.566616, 1.060113, -1.400000, 0.200000, 1.060113, -1.400000, -0.200000, 1.000000, -1.530196, -0.200000, 1.000000, -1.400000, -0.402605, 0.895717, -1.400000, -0.600000, 0.600000, -1.775880, -0.600000, 0.600000, -1.800000, -0.566616, 0.801421, -1.800000, -0.200000, 0.566616, -1.800000, -0.600000, 0.402605, -1.400000, -1.000000, 0.200000, -1.530196, -1.000000, 0.200000, -1.800000, -0.801421, 0.600000, -1.400000, -0.895717, -0.200000, -1.800000, -0.801421, -0.200000, -1.530196, -1.000000, 0.200000, -1.400000, -1.060113, -0.200000, -1.960788, -0.600000, 0.200000, -1.960788, -0.600000, -0.566616, -1.800000, -0.600000, -0.600000, -1.800000, -0.566616, -0.600000, -1.960788, -0.200000, -0.200000, -2.115109, -0.200000, -0.801421, -1.800000, -0.200000, -0.600000, -1.960788, 0.200000, -0.200000, -2.115109, 0.200000, 0.200000, -2.115109, 0.200000, 0.200000, -2.115109, -0.200000, 0.600000, -1.960788, 0.200000, 0.600000, -1.960788, -0.200000, 0.200000, -1.960788, 0.600000, -0.200000, -1.960788, 0.600000, -0.600000, -1.775880, -0.600000, 1.000000, -1.000000, -0.566616, 1.133311, -1.000000, 0.200000, 1.133311, -1.000000, -0.200000, 1.133311, -0.600000, 0.200000, 1.133311, -0.600000, -0.200000, 1.000000, -0.600000, -0.566616, 1.000000, -1.000000, 0.566616, 1.000000, -0.600000, 0.566616, 1.133311, -0.200000, 0.200000, 1.000000, -0.200000, 0.566616, 1.133311, 0.200000, 0.200000, 1.000000, 0.200000, 0.566616, 0.981239, 0.200000, 0.600000, 0.981239, -0.200000, 0.600000, 0.600000, -0.200000, 0.981239, 0.600000, 0.200000, 0.981239, 0.566616, 0.200000, 1.000000, 0.566616, -0.200000, 1.000000, 0.200000, -0.200000, 1.133311, 0.200000, 0.200000, 1.133311, -0.200000, 0.200000, 1.133311, -0.200000, -0.200000, 1.133311, -0.566616, 0.200000, 1.000000, -0.566616, -0.200000, 1.000000, -0.600000, -0.200000, 0.981239, -0.600000, 0.200000, 0.981239, -0.981239, 0.200000, 0.600000, -0.981239, -0.200000, 0.600000, -1.000000, -0.200000, 0.566616, -1.000000, 0.200000, 0.566616, -1.133311, 0.200000, 0.200000, -1.133311, -0.200000, 0.200000, -1.133311, -0.200000, -0.200000, -1.133311, 0.200000, -0.200000, -1.000000, -0.200000, -0.566616, -1.000000, 0.200000, -0.566616, -0.981239, 0.200000, -0.600000, -0.981239, -0.200000, -0.600000, -0.600000, -0.200000, -0.981239, -0.600000, 0.200000, -0.981239, -0.566616, 0.200000, -1.000000, -0.566616, -0.200000, -1.000000, -0.200000, -0.200000, -1.133311, -0.200000, 0.200000, -1.133311, 0.200000, -0.200000, -1.133311, 0.200000, 0.200000, -1.133311, 0.566616, 0.200000, -1.000000, 0.566616, -0.200000, -1.000000, 0.600000, -0.200000, -0.981239, 0.600000, 0.200000, -0.981239, 0.981239, 0.200000, -0.600000, 0.981239, -0.200000, -0.600000, 1.000000, -0.200000, -0.566616, 1.000000, 0.200000, -0.566616, 1.133311, 0.200000, -0.200000, 1.133311, -0.200000, -0.200000, 1.133311, 0.600000, -0.200000, 1.000000, 0.600000, -0.566616, 1.133311, 0.600000, 0.200000, 1.133311, 1.000000, 0.200000, 1.133311, 1.000000, -0.200000, 1.000000, 0.600000, 0.566616, 1.000000, 1.000000, 0.566616, 0.981238, 1.000000, 0.600000, 0.981238, 0.600000, 0.600000, 0.600000, 0.600000, 0.981239, 0.600000, 1.000000, 0.981239, 0.566616, 1.000000, 1.000000, 0.566616, 0.600000, 1.000000, 0.200000, 0.600000, 1.133311, 0.200000, 1.000000, 1.133311, -0.200000, 1.000000, 1.133311, -0.200000, 0.600000, 1.133311, -0.566616, 1.000000, 1.000000, -0.566616, 0.600000, 1.000000, -0.600000, 0.600000, 0.981239, -0.600000, 1.000000, 0.981239, -0.402605, 1.400000, 1.000000, -0.600000, 1.400000, 0.895717, -0.895717, 1.400000, 0.600000, -0.981239, 1.000000, 0.600000, -1.000000, 1.000000, 0.566616, -1.000000, 1.400000, 0.402605, -1.060113, 1.400000, 0.200000, -1.133311, 1.000000, 0.200000, -1.133311, 1.000000, -0.200000, -1.060113, 1.400000, -0.200000, -1.133311, 0.600000, 0.200000, -1.133311, 0.600000, -0.200000, -1.000000, 0.600000, -0.566616, -1.000000, 1.000000, -0.566616, -0.981239, 1.000000, -0.600000, -0.981239, 0.600000, -0.600000, -0.600000, 0.600000, -0.981239, -0.600000, 1.000000, -0.981239, -0.566616, 1.000000, -1.000000, -0.566616, 0.600000, -1.000000, -0.200000, 0.600000, -1.133311, -0.200000, 1.000000, -1.133311, 0.200000, 0.600000, -1.133311, 0.200000, 1.000000, -1.133311, -0.200000, 1.400000, -1.060113, 0.200000, 1.400000, -1.060113, 0.402604, 1.400000, -1.000000, 0.566616, 1.000000, -1.000000, 0.600000, 1.000000, -0.981239, 0.600000, 1.400000, -0.895717, 0.895717, 1.400000, -0.600000, 0.981238, 1.000000, -0.600000, 1.000000, 1.000000, -0.566616, 1.000000, 1.400000, -0.402605, 1.060113, 1.400000, -0.200000, 1.000000, 1.530196, -0.200000, 1.060113, 1.400000, 0.200000, 1.000000, 1.530196, 0.200000, 0.801421, 1.800000, 0.200000, 0.801421, 1.800000, -0.200000, 1.000000, 1.400000, 0.402605, 0.895717, 1.400000, 0.600000, 0.600000, 1.775880, 0.600000, 0.600000, 1.800000, 0.566616, 0.566616, 1.800000, 0.600000, 0.600000, 1.400000, 0.895717, 0.402604, 1.400000, 1.000000, 0.200000, 1.530196, 1.000000, 0.200000, 1.800000, 0.801421, -0.200000, 1.800000, 0.801421, -0.200000, 1.530196, 1.000000, -0.200000, 1.400000, 1.060113, 0.200000, 1.400000, 1.060113, -0.200000, 1.960788, 0.600000, 0.200000, 1.960788, 0.600000, -0.566616, 1.800000, 0.600000, -0.600000, 1.800000, 0.566616, -0.600000, 1.960788, 0.200000, -0.200000, 2.115109, 0.200000, -0.801421, 1.800000, 0.200000, -0.801421, 1.800000, -0.200000, -0.600000, 1.960788, -0.200000, -0.600000, 1.800000, -0.566616, -0.566616, 1.800000, -0.600000, -0.200000, 1.960788, -0.600000, -0.200000, 2.115109, -0.200000, 0.200000, 1.960788, -0.600000, 0.200000, 2.115109, -0.200000, -0.200000, 1.800000, -0.801421, 0.200000, 1.800000, -0.801421, 0.566616, 1.800000, -0.600000, -0.200000, 1.530196, -1.000000, 0.200000, 1.530196, -1.000000, -0.600000, 1.775880, -0.600000, -0.600000, 1.400000, -0.895717, -0.402605, 1.400000, -1.000000, -0.895717, 1.400000, -0.600000, 0.200000, 2.115109, 0.200000, 0.600000, 1.960788, -0.200000, 0.600000, 1.960788, 0.200000, -1.000000, 1.530196, -0.200000, -1.000000, 1.400000, -0.402605, -1.000000, 1.530196, 0.200000, -0.600000, 1.775880, 0.600000, 0.600000, 1.800000, -0.566616, 0.981238, 0.600000, -0.600000, 0.600000, 1.775880, -0.600000, 0.600000, 0.600000, -0.981239, 0.566616, 0.600000, -1.000000, -1.000000, 0.600000, 0.566616, -0.981239, 0.600000, 0.600000, -0.981238, -0.600000, -0.600000, -0.600000, -0.600000, -0.981239, -1.000000, -0.600000, -0.566616, -1.133311, -0.600000, 0.200000, -1.133311, -0.600000, -0.200000, -1.000000, -0.600000, 0.566616, -0.981238, -0.600000, 0.600000, -0.566616, -0.600000, 1.000000, -0.600000, -0.600000, 0.981239, -0.566616, -1.000000, 1.000000, -0.600000, -1.000000, 0.981239, -0.200000, -0.600000, 1.133311, -0.200000, -1.000000, 1.133311, 0.200000, -0.600000, 1.133311, 0.200000, -1.000000, 1.133311, 0.566616, -0.600000, 1.000000, 0.566616, -1.000000, 1.000000, 0.600000, -0.600000, 0.981239, 0.600000, -1.000000, 0.981239, 0.981239, -0.600000, 0.600000, 0.981239, -1.000000, 0.600000, 0.200000, -1.400000, 1.060113, -0.200000, -1.400000, 1.060113, -1.000000, -1.530196, -0.200000
//	])

//const capsuleGeoIndices = new Float32Array ([
	  4, 1, 3, 2, 2, 3, 1, 4, 2, 3, 3, 2, 6, 5, 5, 6, 6, 5, 8, 7, 7, 8, 5, 6, 7, 8, 8, 7, 10, 9, 9, 10, 9, 10, 10, 9, 12, 11, 11, 12, 10, 9, 14, 13, 13, 14, 12, 11, 13, 14, 16, 15, 15, 16, 12, 11, 15, 16, 16, 15, 18, 17, 17, 18, 18, 17, 20, 19, 19, 20, 17, 18, 19, 20, 20, 19, 22, 21, 21, 22, 21, 22, 22, 21, 24, 23, 23, 24, 24, 23, 26, 25, 25, 26, 23, 24, 25, 26, 26, 25, 28, 27, 27, 28, 31, 29, 30, 30, 29, 31, 28, 27, 26, 25, 32, 32, 31, 29, 28, 27, 29, 31, 30, 30, 33, 33, 33, 33, 36, 34, 35, 35, 34, 36, 37, 37, 29, 31, 33, 33, 34, 36, 39, 38, 38, 39, 35, 35, 36, 34, 43, 40, 42, 41, 41, 42, 40, 43, 38, 39, 39, 38, 43, 40, 40, 43, 41, 42, 42, 41, 44, 44, 47, 45, 46, 46, 45, 47, 44, 44, 42, 41, 48, 48, 47, 45, 44, 44, 45, 47, 46, 46, 49, 49, 46, 46, 51, 50, 50, 51, 49, 49, 51, 50, 52, 52, 50, 51, 56, 53, 55, 54, 54, 55, 53, 56, 52, 52, 51, 50, 56, 53, 53, 56, 54, 55, 55, 54, 57, 57, 57, 57, 60, 58, 59, 59, 58, 60, 61, 61, 54, 55, 57, 57, 58, 60, 63, 62, 59, 59, 60, 58, 62, 63, 64, 64, 59, 59, 63, 62, 14, 13, 60, 58, 66, 65, 65, 66, 62, 63, 62, 63, 65, 66, 67, 67, 70, 68, 69, 69, 68, 70, 67, 67, 65, 66, 70, 68, 67, 67, 68, 70, 69, 69, 71, 71, 71, 71, 69, 69, 72, 72, 31, 29, 69, 69, 70, 68, 73, 73, 72, 72, 70, 68, 75, 74, 74, 75, 73, 73, 75, 74, 77, 76, 76, 77, 74, 75, 76, 77, 77, 76, 56, 53, 47, 45, 74, 75, 76, 77, 48, 48, 43, 40, 78, 78, 74, 75, 43, 40, 73, 73, 74, 75, 78, 78, 79, 79, 68, 70, 80, 80, 67, 67, 65, 66, 66, 65, 75, 74, 70, 68, 59, 59, 64, 64, 58, 60, 66, 65, 60, 58, 57, 57, 54, 55, 61, 61, 53, 56, 77, 76, 55, 54, 56, 53, 81, 81, 52, 52, 53, 56, 4, 1, 49, 49, 50, 51, 83, 82, 82, 83, 82, 83, 83, 82, 85, 84, 84, 85, 83, 82, 81, 81, 86, 86, 85, 84, 88, 87, 87, 88, 82, 83, 84, 85, 90, 87, 88, 87, 84, 85, 89, 85, 92, 87, 90, 87, 89, 85, 91, 85, 94, 89, 90, 87, 92, 87, 93, 89, 96, 90, 95, 90, 94, 89, 93, 89, 98, 91, 95, 90, 96, 90, 97, 91, 100, 92, 99, 92, 98, 91, 97, 91, 102, 93, 99, 92, 100, 92, 101, 93, 104, 94, 102, 93, 101, 93, 103, 94, 106, 95, 105, 95, 104, 94, 103, 94, 108, 96, 105, 95, 106, 95, 107, 96, 110, 97, 109, 97, 108, 96, 107, 96, 112, 98, 109, 97, 110, 97, 111, 98, 114, 99, 113, 99, 112, 98, 111, 98, 116, 100, 115, 100, 113, 99, 114, 99, 118, 101, 115, 100, 116, 100, 117, 101, 120, 102, 119, 102, 118, 101, 117, 101, 122, 12, 119, 102, 120, 102, 121, 12, 124, 10, 123, 10, 122, 12, 121, 12, 126, 8, 125, 8, 123, 10, 124, 10, 128, 6, 125, 8, 126, 8, 127, 6, 130, 3, 129, 3, 128, 6, 127, 6, 132, 4, 129, 3, 130, 3, 131, 4, 134, 86, 133, 86, 132, 4, 131, 4, 136, 84, 133, 86, 134, 86, 135, 84, 135, 84, 134, 86, 138, 86, 137, 84, 91, 85, 135, 84, 137, 84, 139, 85, 139, 85, 137, 84, 141, 103, 140, 104, 143, 105, 142, 87, 139, 85, 140, 104, 145, 89, 142, 87, 143, 105, 144, 106, 147, 107, 146, 90, 145, 89, 144, 106, 149, 91, 146, 90, 147, 107, 148, 108, 151, 109, 150, 92, 149, 91, 148, 108, 153, 93, 150, 92, 151, 109, 152, 110, 155, 94, 153, 93, 152, 110, 154, 111, 157, 112, 156, 95, 155, 94, 154, 111, 159, 113, 157, 112, 154, 111, 158, 114, 161, 115, 157, 112, 159, 113, 160, 116, 163, 117, 162, 118, 161, 115, 160, 116, 165, 119, 162, 118, 163, 117, 164, 120, 167, 121, 166, 122, 165, 119, 164, 120, 166, 122, 169, 99, 168, 98, 165, 119, 171, 123, 170, 100, 169, 99, 166, 122, 173, 101, 170, 100, 171, 123, 172, 124, 175, 125, 174, 102, 173, 101, 172, 124, 177, 12, 174, 102, 175, 125, 176, 126, 179, 127, 178, 10, 177, 12, 176, 126, 181, 128, 180, 8, 178, 10, 179, 127, 183, 129, 181, 128, 179, 127, 182, 130, 185, 131, 181, 128, 183, 129, 184, 132, 187, 133, 186, 134, 185, 131, 184, 132, 189, 135, 186, 134, 187, 133, 188, 136, 191, 137, 190, 138, 189, 135, 188, 136, 141, 103, 190, 138, 191, 137, 192, 139, 191, 137, 193, 140, 192, 139, 192, 139, 193, 140, 195, 141, 194, 142, 195, 141, 193, 140, 197, 143, 196, 144, 199, 145, 198, 146, 195, 141, 196, 144, 201, 147, 200, 148, 199, 145, 196, 144, 200, 148, 201, 147, 202, 149, 204, 150, 203, 151, 200, 148, 202, 149, 206, 152, 205, 153, 204, 150, 202, 149, 208, 154, 205, 153, 206, 152, 207, 155, 210, 156, 205, 153, 208, 154, 209, 157, 209, 157, 208, 154, 158, 114, 206, 152, 212, 158, 211, 159, 207, 155, 207, 155, 211, 159, 213, 160, 216, 161, 215, 162, 214, 163, 213, 160, 211, 159, 216, 161, 213, 160, 214, 163, 215, 162, 217, 164, 215, 162, 219, 165, 218, 166, 217, 164, 219, 165, 220, 167, 218, 166, 219, 165, 223, 168, 222, 169, 221, 170, 220, 167, 219, 165, 221, 170, 225, 171, 224, 172, 222, 169, 223, 168, 222, 169, 224, 172, 227, 173, 226, 174, 227, 173, 224, 172, 228, 175, 227, 173, 230, 176, 229, 177, 226, 174, 233, 178, 232, 179, 231, 180, 221, 170, 226, 174, 229, 177, 233, 178, 221, 170, 231, 180, 232, 179, 234, 181, 229, 177, 182, 130, 233, 178, 235, 182, 225, 171, 223, 168, 216, 161, 237, 183, 236, 184, 225, 171, 235, 182, 222, 169, 226, 174, 221, 170, 231, 180, 220, 167, 221, 170, 234, 181, 239, 185, 238, 186, 218, 166, 220, 167, 231, 180, 234, 181, 218, 166, 238, 186, 239, 185, 167, 121, 218, 166, 238, 186, 240, 187, 217, 164, 216, 161, 223, 168, 219, 165, 215, 162, 214, 163, 241, 188, 213, 160, 212, 158, 235, 182, 216, 161, 211, 159, 205, 153, 210, 156, 204, 150, 212, 158, 206, 152, 202, 149, 237, 183, 235, 182, 212, 158, 202, 149, 201, 147, 237, 183, 202, 149, 200, 148, 203, 151, 199, 145, 237, 183, 201, 147, 196, 144, 197, 143, 236, 184, 237, 183, 196, 144, 242, 189, 236, 184, 197, 143, 195, 141, 198, 146, 194, 142, 190, 138, 138, 86, 243, 4, 189, 135, 188, 136, 244, 190, 242, 189, 197, 143, 193, 140, 191, 137, 188, 136, 197, 143, 242, 189, 244, 190, 228, 175, 243, 4, 245, 3, 186, 134, 189, 135, 187, 133, 244, 190, 188, 136, 186, 134, 245, 3, 246, 6, 185, 131, 184, 132, 230, 176, 227, 173, 228, 175, 244, 190, 187, 133, 184, 132, 228, 175, 183, 129, 230, 176, 184, 132, 229, 177, 230, 176, 183, 129, 182, 130, 182, 130, 179, 127, 176, 126, 233, 178, 176, 126, 175, 125, 232, 179, 233, 178, 232, 179, 175, 125, 172, 124, 234, 181, 172, 124, 171, 123, 239, 185, 234, 181, 240, 187, 238, 186, 167, 121, 164, 120, 168, 98, 247, 97, 162, 118, 165, 119, 163, 117, 240, 187, 164, 120, 162, 118, 247, 97, 248, 96, 161, 115, 160, 116, 241, 188, 214, 163, 217, 164, 240, 187, 163, 117, 160, 116, 217, 164, 159, 113, 241, 188, 160, 116, 158, 114, 208, 154, 207, 155, 213, 160, 241, 188, 159, 113, 158, 114, 213, 160, 154, 111, 152, 110, 209, 157, 158, 114, 152, 110, 151, 109, 210, 156, 209, 157, 148, 108, 147, 107, 203, 151, 204, 150, 203, 151, 147, 107, 144, 106, 199, 145, 144, 106, 143, 105, 198, 146, 199, 145, 198, 146, 143, 105, 140, 104, 194, 142, 140, 104, 141, 103, 192, 139, 194, 142, 133, 86, 86, 86, 1, 4, 132, 4, 138, 86, 134, 86, 131, 4, 243, 4, 245, 3, 130, 3, 127, 6, 246, 6, 127, 6, 126, 8, 180, 8, 246, 6, 180, 8, 126, 8, 124, 10, 178, 10, 178, 10, 124, 10, 121, 12, 177, 12, 119, 102, 250, 102, 249, 101, 118, 101, 174, 102, 120, 102, 117, 101, 173, 101, 249, 101, 251, 100, 115, 100, 118, 101, 117, 101, 116, 100, 170, 100, 173, 101, 170, 100, 116, 100, 114, 99, 169, 99, 113, 99, 253, 99, 252, 98, 112, 98, 169, 99, 114, 99, 111, 98, 168, 98, 252, 98, 254, 97, 109, 97, 112, 98, 111, 98, 110, 97, 247, 97, 168, 98, 109, 97, 254, 97, 255, 96, 108, 96, 247, 97, 110, 97, 107, 96, 248, 96, 107, 96, 106, 95, 156, 95, 248, 96, 105, 95, 257, 95, 256, 94, 104, 94, 257, 95, 259, 191, 258, 192, 256, 94, 27, 28, 259, 191, 257, 95, 255, 96, 258, 192, 261, 193, 260, 93, 256, 94, 261, 193, 263, 194, 262, 92, 260, 93, 262, 92, 263, 194, 265, 195, 264, 91, 265, 195, 267, 196, 266, 90, 264, 91, 266, 90, 267, 196, 269, 197, 268, 89, 263, 194, 270, 198, 40, 43, 265, 195, 271, 199, 270, 198, 263, 194, 261, 193, 34, 36, 271, 199, 261, 193, 258, 192, 156, 95, 106, 95, 103, 94, 155, 94, 256, 94, 260, 93, 102, 93, 104, 94, 103, 94, 101, 93, 153, 93, 155, 94, 260, 93, 262, 92, 99, 92, 102, 93, 101, 93, 100, 92, 150, 92, 153, 93, 150, 92, 100, 92, 97, 91, 149, 91, 264, 91, 266, 90, 95, 90, 98, 91, 97, 91, 96, 90, 146, 90, 149, 91, 95, 90, 266, 90, 268, 89, 94, 89, 146, 90, 96, 90, 93, 89, 145, 89, 89, 85, 136, 84, 135, 84, 91, 85, 142, 87, 92, 87, 91, 85, 139, 85, 84, 85, 85, 84, 136, 84, 89, 85, 87, 88, 45, 47, 49, 49, 82, 83, 56, 53, 51, 50, 46, 46, 47, 45, 48, 48, 76, 77, 47, 45, 44, 44, 45, 47, 87, 88, 269, 197, 267, 196, 41, 42, 44, 44, 269, 197, 48, 48, 42, 41, 43, 40, 39, 38, 78, 78, 43, 40, 40, 43, 41, 42, 267, 196, 265, 195, 35, 35, 38, 39, 270, 198, 271, 199, 79, 79, 78, 78, 39, 38, 36, 34, 35, 35, 271, 199, 34, 36, 79, 79, 36, 34, 33, 33, 259, 191, 37, 37, 34, 36, 258, 192, 72, 72, 73, 73, 79, 79, 33, 33, 30, 30, 72, 72, 33, 33, 32, 32, 272, 200, 71, 71, 31, 29, 29, 31, 37, 37, 28, 27, 72, 72, 30, 30, 31, 29, 254, 97, 25, 26, 27, 28, 255, 96, 32, 32, 26, 25, 24, 23, 23, 24, 25, 26, 254, 97, 252, 98, 22, 21, 272, 200, 32, 32, 24, 23, 253, 99, 21, 22, 23, 24, 252, 98, 251, 100, 19, 20, 21, 22, 253, 99, 71, 71, 272, 200, 20, 19, 18, 17, 80, 80, 68, 70, 71, 71, 18, 17, 17, 18, 19, 20, 251, 100, 249, 101, 16, 15, 80, 80, 18, 17, 250, 102, 15, 16, 17, 18, 249, 101, 67, 67, 80, 80, 16, 15, 13, 14, 63, 62, 62, 63, 67, 67, 13, 14, 14, 13, 63, 62, 13, 14, 123, 10, 9, 10, 11, 12, 122, 12, 8, 7, 64, 64, 14, 13, 10, 9, 125, 8, 7, 8, 9, 10, 123, 10, 3, 2, 61, 61, 58, 60, 6, 5, 129, 3, 2, 3, 5, 6, 128, 6, 86, 86, 81, 81, 4, 1, 1, 4, 53, 56, 61, 61, 3, 2, 4, 1, 58, 60, 64, 64, 8, 7, 6, 5, 12, 11, 15, 16, 250, 102, 11, 12, 50, 51, 52, 52, 81, 81, 83, 82, 77, 76, 75, 74, 66, 65, 57, 57, 55, 54, 77, 76, 57, 57, 20, 19, 272, 200, 22, 21, 269, 197, 87, 88, 88, 87, 268, 89, 270, 198, 38, 39, 40, 43, 28, 27, 37, 37, 259, 191, 27, 28, 1, 4, 2, 3, 129, 3, 132, 4, 5, 6, 7, 8, 125, 8, 128, 6, 11, 12, 250, 102, 119, 102, 122, 12, 85, 84, 86, 86, 133, 86, 136, 84, 115, 100, 251, 100, 253, 99, 113, 99, 268, 89, 88, 87, 90, 87, 94, 89, 99, 92, 262, 92, 264, 91, 98, 91, 255, 96, 257, 95, 105, 95, 108, 96, 131, 4, 130, 3, 245, 3, 243, 4, 246, 6, 180, 8, 181, 128, 185, 131, 121, 12, 120, 102, 174, 102, 177, 12, 137, 84, 138, 86, 190, 138, 141, 103, 225, 171, 236, 184, 242, 189, 228, 175, 224, 172, 225, 171, 228, 175, 239, 185, 171, 123, 166, 122, 167, 121, 93, 89, 92, 87, 142, 87, 145, 89, 210, 156, 151, 109, 148, 108, 204, 150, 248, 96, 156, 95, 157, 112, 161, 115
//])

//capsuleGeo.setIndex( capsuleGeoIndices );
//capsuleGeo.setAttribute( 'position', new THREE.BufferAttribute( capsuleGeoVerticies ) );





// Define basic eventListeners
// -----------------------------------------------------------------------------

document.getElementById("openVisibilityPanelButton").addEventListener("click", () => { createVisibilityWindow(); });

document.getElementById("addActorButton").addEventListener("click", () => { addActor(); });



// Boring code that doesn't matter
// -----------------------------------------------------------------------------

// Automatically scale canvas to fit:
function resizeCanvasToDisplaySize () {
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

//const geo = new THREE.Geometry();

//geo.vertices.push(
	//new THREE.Vector3(-1, 1, 0),
	//new THREE.Vector3(-1, -1, 0),
	//new THREE.Vector3(1, -1, 0)
//);

//geo.faces.push(new THREE.Face3(0, 1, 2));

//geo.computeBoundingSphere();

//const tri = new THREE.Mesh(geo, material);
//scene.add(tri);
//tri.position.set(50, 50, 50);



// Some stuff for stats to show
// -----------------------------------------------------------------------------


var stats = new Stats();
stats.showPanel(0);
stats.domElement.style.top = 50;
document.body.appendChild( stats.dom );
stats.begin();



// Actual code goes here:
// -----------------------------------------------------------------------------

// Loading loadManager
const loadManager = new THREE.LoadingManager();
loadManager.onStart = function (url, itemsLoaded, itemsTotal) {
	console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};
let daeModel;

const onLoad = function (dae) {
	console.log("Loading complete!");
	daeModel = dae.scene;
	daeModel.traverse(function (child) {
		if (child instanceof THREE.Mesh) {
			objects.push(child);
			console.log("Child instanceof THREE.Mesh = true");
		}
	});
	objects.push(dae.scene);
	console.log("objects:");
	console.log(objects);

	for (let i = 1; i < daeModel.children.length; i++) {
		daeModel.children[i].geometry.computeBoundingSphere();
		console.log(daeModel.children[i].geometry);
	}

	scene.add(daeModel);
	daeModel.parent.remove(daeModel.children[0]);
	console.log(daeModel);
};







var currentModelDataForLoad;
var instancedMeshIndex = [];



const daeOnLoad = function (dae, currentUrl) {
	//console.error("callednum: " + calledNum)
	console.log("Loading complete!");
	daeModel = dae.scene;
	daeModel.traverse(function (child) {
		if (child instanceof THREE.Mesh) {
			objects.push(child);
			console.log("Child instanceof THREE.Mesh = true");
		}
	});
	//console.error(dae)
	//let daeGeometry = dae.geometry.clone();
	//let daeMaterial = dae.material;

	//daeModel = new THREE.Mesh(daeGeometry, daeMaterial)
	objects.push(dae.scene);
	console.log("objects:");
	console.log(objects);

	for (let i = 1; i < daeModel.children.length; i++) {
		daeModel.children[i].geometry.computeBoundingSphere();
		console.log(daeModel.children[i].geometry);
	}

	//scene.add(daeModel);
	//daeModel.parent.remove(daeModel.children[0]);
	console.log(daeModel);





	instancedMeshIndex[currentUrl] = daeModel;

	console.warn(instancedMeshIndex);

	console.warn("Loaded Model");

	console.warn(instancedMeshIndex);
	console.warn(calledNum)
	console.warn(instancedMeshIndex["doneNum"])

	if (instancedMeshIndex["doneNum"] != undefined) {

		console.warn("doneNum was not null.");
		instancedMeshIndex["doneNum"] = instancedMeshIndex["doneNum"] + 1;
	}
	else {
		instancedMeshIndex["doneNum"] = 1;
		console.warn("doneNum was null.");
	}
	if (instancedMeshIndex["doneNum"] == calledNum) {

		console.warn("loadActors time");
		loadActors(sectionData, true);
	}

};



function daeCapsuleOnLoad(dae) {
	capsuleGeo = dae.scene.geometry;
}
















const onProgress = function (url, itemsLoaded, itemsTotal) {
	console.warn("Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};
async function loadPython (callback, func, arg) {
	console.log("Got to LoadPython!");

	if (arg == null) {
		const { spawn } = require("child_process");
		const childPython = spawn("python", [path.join(__dirname, "./MapEditor/Process.py"), `${func}`], {cwd:__dirname});

		console.log(`Process is spawned - With func ${func}.`);
		var loadingPython = true;
		childPython.stdio[1].on("data", (dataBuffer) => {
			console.log(`stdout as string from buffer: ${dataBuffer}`);

			if (dataBuffer.toString().includes("!startData")) {
				console.log("true");
				const data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")));
				console.log(data);
				// callback(data);
				callback(data);
				// return(data);
				if (func == "main") {
					sectionData = data;
				}
			} else if (dataBuffer.toString().includes("!startProgressDataTotal")) {
				modelsToCacheTotal = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressDataTotal") + 23, dataBuffer.toString().lastIndexOf("!endProgressDataTotal"))
			} else if (dataBuffer.toString().includes("!startProgressData")) {
				if (modelsToCacheDone/modelsToCacheTotal < 1) {
					document.getElementById("progressBar").style.visibility="visible";
					document.getElementById("ProgressContainerDiv").style.visibility="visible";
					document.getElementById("loadStatus").style.visibility="visible";
					document.getElementById("progressBar").style.width=`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`
					console.error(`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`)
					console.error(modelsToCacheDone);
					console.error(modelsToCacheTotal);
				}
				else {
					document.getElementById("progressBar").style.visibility="hidden";
					document.getElementById("ProgressContainerDiv").style.visibility="hidden";
					document.getElementById("loadStatus").style.visibility="hidden";
				}
			} else {
				console.log("false");
			}

		});
	} else {
		const { spawn } = require("child_process");
		const childPython = spawn("python", [path.join(__dirname, "./MapEditor/Process.py"), `${func}`, `${arg}`], {cwd:__dirname});

		console.log(`Process is spawned - With func ${func} and arg ${arg}.`);
		var loadingPython = true;
		childPython.stdio[1].on("data", (dataBuffer) => {
			console.log(`stdout as string from buffer: ${dataBuffer}`);

			if (dataBuffer.toString().includes("!startData")) {
				console.log("true");
				const data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")));
				console.log(data);
				// callback(data);
				callback(data);
				// return(data);

				if (func == "main") {
					sectionData = data;
				}
			} else if (dataBuffer.toString().includes("!startProgressDataTotal")) {
				modelsToCacheTotal = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressDataTotal") + 23, dataBuffer.toString().lastIndexOf("!endProgressDataTotal"))
			} else if (dataBuffer.toString().includes("!startProgressData")) {
				console.error("testestestest")
				modelsToCacheDone = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressData") + 18, dataBuffer.toString().lastIndexOf("!endProgressData"))
				if (modelsToCacheDone/modelsToCacheTotal < 1) {
					document.getElementById("progressBar").style.visibility="visible";
					document.getElementById("ProgressContainerDiv").style.visibility="visible";
					document.getElementById("loadStatus").style.visibility="visible";
					document.getElementById("progressBar").style.width=`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`
					console.error(`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`)
					console.error(modelsToCacheDone);
					console.error(modelsToCacheTotal);
				}
				else {
					document.getElementById("progressBar").style.visibility="hidden";
					document.getElementById("ProgressContainerDiv").style.visibility="hidden";
					document.getElementById("loadStatus").style.visibility="hidden";
				}

			} else {
				console.log("false");
			}
		});

		childPython.stdio[2].on("data", (dataBuffer) => {
			console.error(dataBuffer.toString());
		});
	}
}
// loadPython();
// var data = loadPython();
let fullData;
function loadPythonCallback (data) {
	fullData = data;
}
// loadPython(loadPythonCallback);
console.log("test");



// Load from map file.





let globUrlDict;
function daeOnError() {
	console.warn("Issue loading. Probably can't find path.")
	if (instancedMeshIndex["doneNum"] == undefined) {
			instancedMeshIndex["doneNum"] = 1;
			console.warn("doneNum was null.");
	}
	//calledNum = calledNum - 1
	console.warn(calledNum)
	instancedMeshIndex["doneNum"] = instancedMeshIndex["doneNum"] + 1;
}
async function loadInstanceModels(urlDict) {
	console.warn(urlDict)
	globUrlDict = urlDict;

	if (urlDict == null) {
		loadPython(function (s) { loadInstanceModels(s) }, "getActorModelPaths");
		return;
	}

	let urlArray = [path.join(__dirname, "./Cache/Model/Enemy_Moriblin_Bone/Moriblin_Bone.dae")];


	for (const i in urlDict) {
			console.warn(i)
			console.warn(urlDict[i])
			//loader.load(urlArray[i], daeOnLoad, onProgress);
			loader.load(urlDict[i], function (collada) {
  daeOnLoad(collada, urlDict[i]);
}, onProgress, daeOnError);
			calledNum = calledNum + 1;
			console.warn("Loaded DaeModel")
		console.warn(path.join(__dirname, urlDict[i]))
/*		fs.access(urlDict[i], fs.F_OK, (err) => {
			if (err) {
				calledNum = calledNum - 1
				console.warn(path.join(__dirname, urlDict[i]))
				console.warn("calledNum decreased due to inability to access file.")
			}
		});
*/
		console.warn(calledNum)
	}

/*
	Object.keys(urlDict).forEach(function(k){
		console.warn(k)
		console.warn(urlArray[k])
		loader.load(urlArray[k], daeOnLoad, onProgress);
	});
*/





}




async function loadActors (actorsData, isMainLoad) {
	console.log("Got to loadActors!");

	// pywebview.api.getStuff();
	//const loader = new THREE.FontLoader();

	// data.Static.Objs
	// for (var i = 0; i < data.Static.Objs.length-1001; i++) {
	// for (const i of data.Static.Objs.slice(0, 5)) {
	// data.Static.Objs.Length.foreach()








	/*
	for (const i of actorsData.Static.Rails) {
		//Create a closed wavey loop
		const curve = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( -10, 0, 10 ),
			new THREE.Vector3( -5, 5, 5 ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 5, -5, 5 ),
			new THREE.Vector3( 10, 0, 10 )
		] );

		const points = curve.getPoints( 50 );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

		// Create the final object to add to the scene
		const curveObject = new THREE.Line( geometry, material );

		scene.add(curveObject)
		console.warn(curveObject)
	}
	*/


	for (const i of actorsData.Static.Objs) {



		currentModelDataForLoad = i;
		// var i = 0;
		/*
    loader.load( 'HTML/lib/threejs/examples/fonts/helvetiker_regular.typeface.json', async function ( font ) {

    //var textGeo = await new THREE.TextGeometry( data.Static.Objs[i].UnitConfigName.value, {
    var textGeo = await new THREE.TextBufferGeometry( i.UnitConfigName.value, {
    //var textGeo = new Promise(THREE.TextGeometry( data.Static.Objs[i].UnitConfigName.value, {
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
     textMesh.position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value)
     await scene.add(textMesh);
     console.log(i);
     //console.log(data.Static.Objs[i].UnitConfigName.value);
     console.log(i.UnitConfigName.value);
     console.log(textMesh);

   } ); */

	 		//loader.load(url, daeOnLoadStatic, onProgress);

		console.warn("instancedMeshIndex:")
		console.warn(instancedMeshIndex[globUrlDict[i.UnitConfigName.value]])
		console.warn(i.UnitConfigName.value)
		console.warn(globUrlDict[i.UnitConfigName.value])
		console.warn(globUrlDict)
		console.warn(instancedMeshIndex)
		if (instancedMeshIndex[globUrlDict[i.UnitConfigName.value]] != undefined && loadModels == true && globUrlDict[i.UnitConfigName.value] != undefined) {


			let duplicateMesh = SkeletonUtils.clone(instancedMeshIndex[globUrlDict[i.UnitConfigName.value]]);






			await scene.add(duplicateMesh);

			objects.push(duplicateMesh);


			duplicateMesh.position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value);

			// Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
			try {
				duplicateMesh.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
			}
			catch {

				// Just in case it's 1D rotation
				try {
					duplicateMesh.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
				}

				// In case there is no rotation.
				catch {
					duplicateMesh.rotation.set(0, 0, 0)
				}
			}

			// Try to apply scale, if it doesn't exist add some.
			try {
				duplicateMesh.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
			}
			catch {
				// This could also mean that there's only 1 scale value, try that first.
				try {
					duplicateMesh.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
				}
				catch {
					duplicateMesh.scale.set(1, 1, 1)
				}
			}
			duplicateMesh.HashID = i.HashId.value;
			duplicateMesh.Type = "Static";


			console.warn(i);

			console.warn(duplicateMesh);

			console.warn(i.Translate[0].value);

			console.warn("instancedMeshBase:");

			console.log(instancedMeshIndex[globUrlDict[i.UnitConfigName.value]]);

		}


		else {

			console.log(i);

			/*
			await loader.load("./Assets/Models/Capsule.dae", function (collada) {
				daeCapsuleOnLoad(collada);
			});
			*/
			//console.error(capsuleGeo)
			//var capsuleGeo = await new THREE.CapsuleBufferGeometry()
			if (i.UnitConfigName.value == "Area") {
				if (i["!Parameters"].Shape.value == "Sphere") {
					var cubeMesh = await new THREE.Mesh(sphereGeo, areaMaterial);
				}
				else if (i["!Parameters"].Shape.value == "Cylinder") {
					var cubeMesh = await new THREE.Mesh(cylinderGeo, areaMaterial);
				}
				else if (i["!Parameters"].Shape.value == "Capsule") {
					var cubeMesh = await new THREE.Mesh(capsuleGeo, areaMaterial);
				}
				else {
					var cubeMesh = await new THREE.Mesh(cubeGeo, areaMaterial);
				}
			}
			else {
				var cubeMesh = await new THREE.Mesh(cubeGeo, material);
			}
			cubeMesh.position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value);

			// Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
			try {
				cubeMesh.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
			}
			catch {

				// Just in case it's 1D rotation
				try {
					cubeMesh.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
				}

				// In case there is no rotation.
				catch {
					cubeMesh.rotation.set(0, 0, 0)
				}
			}

			// Try to apply scale, if it doesn't exist add some.
			try {
				cubeMesh.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
			}
			catch {
				// This could also mean that there's only 1 scale value, try that first.
				try {
					cubeMesh.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
				}
				catch {
					cubeMesh.scale.set(1, 1, 1)
				}
			}
			cubeMesh.HashID = i.HashId.value;
			cubeMesh.Type = "Static";
			await scene.add(cubeMesh);
			await objects.push(cubeMesh);
			await console.log("cubeMesh");
			console.log(cubeMesh);
			await console.log("No cubeMesh");

		}

	}
	for (const i of actorsData.Dynamic.Objs) {


		currentModelDataForLoad = i;
		// var i = 0;
		/*
    loader.load( 'HTML/lib/threejs/examples/fonts/helvetiker_regular.typeface.json', async function ( font ) {

    //var textGeo = await new THREE.TextGeometry( data.Static.Objs[i].UnitConfigName.value, {
    var textGeo = await new THREE.TextBufferGeometry( i.UnitConfigName.value, {
    //var textGeo = new Promise(THREE.TextGeometry( data.Static.Objs[i].UnitConfigName.value, {
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
     textMesh.position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value)
     await scene.add(textMesh);
     console.log(i);
     //console.log(data.Static.Objs[i].UnitConfigName.value);
     console.log(i.UnitConfigName.value);
     console.log(textMesh);

   } ); */


	 	if (instancedMeshIndex[globUrlDict[i.UnitConfigName.value]] != undefined && loadModels == true && globUrlDict[i.UnitConfigName.value] != undefined) {

			//loader.load(url, daeOnLoadDynamic, onProgress);

			let duplicateMesh = SkeletonUtils.clone(instancedMeshIndex[globUrlDict[i.UnitConfigName.value]]);

			//console.warn(instancedMeshIndex[globUrlDict[i.UnitConfigName.value]])




			scene.add(duplicateMesh);

			objects.push(duplicateMesh);

			duplicateMesh.children[0].position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value);

			// Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
			try {
				duplicateMesh.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
			}
			catch {

				// Just in case it's 1D rotation
				try {
					duplicateMesh.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
				}

				// In case there is no rotation.
				catch {
					duplicateMesh.rotation.set(0, 0, 0)
				}
			}

			// Try to apply scale, if it doesn't exist add some.
			try {
				duplicateMesh.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
			}
			catch {
				// This could also mean that there's only 1 scale value, try that first.
				try {
					duplicateMesh.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
				}
				catch {
					duplicateMesh.scale.set(1, 1, 1)
				}
			}
			duplicateMesh.HashID = i.HashId.value;
			duplicateMesh.Type = "Dynamic";


			/*
			for (let i = 1; i < duplicateMesh.children.length; i++) {
				duplicateMesh.children[i].geometry.computeBoundingSphere();
				console.log(duplicateMesh.children[i].geometry);
			}
			*/

		}

		else {


			console.log(i);
			if (i.UnitConfigName.value == "Area") {
				if (i["!Parameters"].Shape.value == "Sphere") {
					var cubeMesh = await new THREE.Mesh(sphereGeo, areaMaterial);
				}
				else if (i["!Parameters"].Shape.value == "Cylinder") {
					var cubeMesh = await new THREE.Mesh(cylinderGeo, areaMaterial);
				}
				else if (i["!Parameters"].Shape.value == "Capsule") {
					var cubeMesh = await new THREE.Mesh(capsuleGeo, areaMaterial);
				}
				else {
					var cubeMesh = await new THREE.Mesh(cubeGeo, areaMaterial);
				}
			}
			else {
				var cubeMesh = await new THREE.Mesh(cubeGeo, material);
			}
			cubeMesh.position.set(i.Translate[0].value, i.Translate[1].value, i.Translate[2].value);
			// Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
			try {
				cubeMesh.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
			}
			catch {

				// Just in case it's 1D rotation
				try {
					cubeMesh.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
				}

				// In case there is no rotation.
				catch {
					cubeMesh.rotation.set(0, 0, 0)
				}
			}

			// Try to apply scale, if it doesn't exist add some.
			try {
				cubeMesh.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
			}
			catch {
				// This could also mean that there's only 1 scale value, try that first.
				try {
					cubeMesh.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
				}
				catch {
					cubeMesh.scale.set(1, 1, 1)
				}
			}
			cubeMesh.HashID = i.HashId.value;
			cubeMesh.Type = "Dynamic";
			await scene.add(cubeMesh);
			await objects.push(cubeMesh);
			await console.log("cubeMesh");
			console.log(cubeMesh);
			await console.log("No cubeMesh");

		}

	}
	console.log(scene);

	/*
	for (const rail of sectionData.Static.Rails) {
		let pointsArray = [new THREE.Vector3(2,100,5), new THREE.Vector3(3, 100, 8), new THREE.Vector3(5, 115, 6)];
		console.error(rail)
		for (const railPoint of rail.RailPoints) {
			//pointsArray.push(new THREE.Vector3(railPoint.Translate[0], railPoint.Translate[1], railPoint.Translate[2]))
			camera.position.x = railPoint.Translate[0]
			camera.position.y = railPoint.Translate[1]
			camera.position.z = railPoint.Translate[2]
			camera.position.x = 0;
			camera.position.y = 100;
			camera.position.z = 0;
			console.error(railPoint)
			//pointsArray.push(new THREE.Vector3(2,100,5), new THREE.Vector3(3, 100, 8), new THREE.Vector3(5, 115, 6));

		}

		// Create a sine-like wave
		const curve = new THREE.CubicBezierCurve3( [
				new THREE.Vector3( -10, 0, 0 ),
				new THREE.Vector3( -5, 15, 0 ),
				new THREE.Vector3( 20, 15, 0 ),
				new THREE.Vector3( 10, 0, 0 )
		]);
		const points = curve.getPoints( 50 );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );
		const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
		// Create the final object to add to the scene
		const curveObject = new THREE.Line( geometry, material );
		scene.add(curveObject);
	}*/

	/*
	//for (const rail of sectionData.Static.Rails) {
		let pointsArray = [];
		for (const railPoint of rail.RailPoints) {
			pointsArray.push(new THREE.Vector3(railPoint.Translate[0], railPoint.Translate[1], railPoint.Translate[2]));

			camera.position.x = railPoint.Translate[0];
			camera.position.y = railPoint.Translate[1];
			camera.position.z = railPoint.Translate[2];
		}
		const curve = new THREE.CatmullRomCurve3( [
				new THREE.Vector3( -10, 0, 10 ),
				new THREE.Vector3( -5, 5, 5 ),
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 5, -5, 5 ),
				new THREE.Vector3( 10, 0, 10 )
		] );
		//const curve = new THREE.CatmullRomCurve3(pointsArray);
		const points = curve.getPoints(50);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const curveMaterial = new THREE.BufferGeometry().setFromPoints(points);
		const curveObject = new THREE.Line(geometry, curveMaterial);
		scene.add(curveObject);
	//}*/


	/*
	const curve = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( -10, 0, 10 ),
			new THREE.Vector3( -5, 5, 5 ),
			new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( 5, -5, 5 ),
					new THREE.Vector3( 10, 0, 10 )
					] );
	*/
	/*
	for (const rail of sectionData.Static.Rails) {
		let pointsArray = [];
		for (const railPoint of rail.RailPoints) {
			console.error(railPoint);
			pointsArray.push(new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value));
		}
		console.error(pointsArray);
		const curve = new THREE.CatmullRomCurve3(pointsArray);
		const points = curve.getPoints( 50 );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		const curveMat = new THREE.LineBasicMaterial( { color : 0xff0000 } );

		// Create the final object to add to the scene
		const curveObject = new THREE.Line( geometry, curveMat );

		scene.add(curveObject);
		console.error(sectionData);
	}*/


	RailTools.createRails(sectionData, scene, objects);

	if (isMainLoad) {
		/* Kinda bad code tbh, so I'll use a bad method for commenting out a comment.
		camera.position.x = actorsData.Dynamic.Objs[actorsData.Dynamic.Objs.length - 1].Translate[0].value;
		camera.position.y = actorsData.Dynamic.Objs[actorsData.Dynamic.Objs.length - 1].Translate[1].value;
		camera.position.z = actorsData.Dynamic.Objs[actorsData.Dynamic.Objs.length - 1].Translate[2].value;
		*/

		camera.position.x = actorsData.Static.LocationPosX.value;
		camera.position.y = 50;
		camera.position.z = actorsData.Static.LocationPosX.value;


		//camera.position.x = scene.children[66].position.x;
		//camera.position.y = scene.children[66].position.y;
		//camera.position.z = scene.children[66].position.z;
	}
}

// Light mode / Dark mode
// -----------------------------------------------------------------------------
const darkModeToggle = document.getElementById("darkModeToggle");
const styleSheet = document.getElementById("styleSheet");

darkModeToggle.addEventListener("click", function () {
	if (styleSheet.getAttribute("href") == "HTML/Light-Mode.css") {
		styleSheet.href = "HTML/Dark-Mode.css";
		scene.background = customDarkColor;
		loadPython(function (s) { console.log(s); }, "setDarkMode", "dark");
	} else {
		styleSheet.href = "HTML/Light-Mode.css";
		scene.background = customColor;
		loadPython(function (s) { console.log(s); }, "setDarkMode", "light");
	}
});

// Used to return the actor data for showActorData. Later on I'll just assign the index in the Objs array from sectionData as a value directly to the object on creation so I don't need this.
// -----------------------------------------------------------------------------
function findActorData (hashId, type) {
	if (type == "Static") {
		for (const i of sectionData.Static.Objs) {
			// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
      	if (i.HashId.value == hashId) {
        	return i;
      	}
			// }
		}
	}
	if (type == "Dynamic") {
		for (const i of sectionData.Dynamic.Objs) {
			// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
      	if (i.HashId.value == hashId) {
        	return (i);
      	}
			// }
		}
	}
}

function setActorData (hashId, type, data) {
	if (type == "Static") {
		var index = 0;
		for (var i of sectionData.Static.Objs) {
			// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
      	if (i.HashId.value == hashId) {
        	sectionData.Static.Objs[index] = data;
				console.warn(i);
      	}
			// }
			index = index + 1;
		}
	}
	if (type == "Dynamic") {
		var index = 0;
		for (var i of sectionData.Dynamic.Objs) {
			// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
      	if (i.HashId.value == hashId) {
        	sectionData.Dynamic.Objs[index] = data;
				console.warn(i);
      	}
			// }
			index = index + 1;
		}
	} else {
		console.warn(type);
	}
	console.warn(findActorData(hashId, type));
	console.warn(data);
	console.warn(type);
	console.warn(sectionData);

	var index = 0;
	for (var i of scene.children) {
		// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
		if (i.HashID == hashId) {
			console.warn(data)
			console.warn(scene)
			scene.children[index].position.x = data.Translate[0].value;
			scene.children[index].position.y = data.Translate[1].value;
			scene.children[index].position.z = data.Translate[2].value;

			scene.children[index].rotation.x = data.Rotate[0].value * Math.PI / 180;
			scene.children[index].rotation.y = data.Rotate[1].value * Math.PI / 180;
			scene.children[index].rotation.z = data.Rotate[2].value * Math.PI / 180;

			scene.children[index].scale.x = data.Scale[0].value;
			scene.children[index].scale.y = data.Scale[1].value;
			scene.children[index].scale.z = data.Scale[2].value;
		}
		// }
		index = index + 1;
	}
}


function findRailData (hashId) {
	for (const i of sectionData.Static.Rails) {
		// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
		if (i.HashId.value == hashId) {
			return i;
		}
	}
}



function setRailData (hashId, data) {
	var index = 0;
	for (var i of sectionData.Static.Rails) {
		// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
		if (i.HashId.value == hashId) {
			sectionData.Static.Rails[index] = data;
			console.warn(i);
		}
		index = index + 1;
	}
	console.warn(findRailData(hashId));
	console.warn(data);
	console.warn(sectionData);

	RailTools.reloadRail(hashId, sectionData, scene);
	RailHelperTools.reloadControlPointHelpersByRailHashID(hashId, scene, sectionData, objects);
	RailHelperTools.reloadRailPointHelpersByRailHashID(hashId, scene, sectionData, objects);
}

// -----------------------------------------------------------------------------

// Controls the side bar panel thing, doesn't currently have a system for multi-actor selection, but I'll need to give TransformControls that first.
// -----------------------------------------------------------------------------
// Initializes the camera slider varaibles
const cameraSlider = document.getElementById("cameraSlider");
const sliderValue = document.getElementById("sliderValue");
sliderValue.innerHTML = cameraSlider.value;

// Changes the camera speed when the slider's value changes
cameraSlider.oninput = function () {
	sliderValue.innerHTML = this.value;
	cameraSpeed = this.value;
	fpControls.movementSpeed = cameraSpeed;
};

function showActorData (ActorHashID, ActorType) {
	const actorDataPanel = document.getElementById("DataEditorTextWindow");
	actorDataPanel.innerHTML = `
  <p id="SelectedActorName"><strong>${findActorData(ActorHashID, ActorType).UnitConfigName.value}</strong></p>
  <p>${ActorHashID}</p>
  <button class="button" id="ActorEditButton">Edit BYML</button>

  `;
	document.getElementById("ActorEditButton").addEventListener("click", () => { createEditorWindow(findActorData(ActorHashID, ActorType), ActorType, false); });
	// document.getElementById("ActorEditButton").onclick = findActorData(ActorHashID, ActorType);
}


function showRailData (RailHashID) {
	const actorDataPanel = document.getElementById("DataEditorTextWindow");
	actorDataPanel.innerHTML = `
  <p id="SelectedActorName"><strong>${findRailData(RailHashID).RailType.value} Rail</strong></p>
  <p>${RailHashID}</p>
  <button class="button" id="ActorEditButton">Edit BYML</button>

  `;
	document.getElementById("ActorEditButton").addEventListener("click", () => { createEditorWindow(findRailData(RailHashID), null, true); });
	// document.getElementById("ActorEditButton").onclick = findActorData(ActorHashID, ActorType);
}
// -----------------------------------------------------------------------------
// loadActors();

/* function loadPython () {
    var python = require('child_process').spawn('python', ['./MapEditor/Process.py']);
 } */

// loadData();

// DAE loader
// -----------------------------------------------------------------------------

const loader = new ColladaLoader();
const url = "./Test/TestToolboxGuardian/Guardian_A_Perfect.dae";
loader.load(url, onLoad, onProgress, onDaeError);
// console.log(daeModel);

function onDaeError(collada) {
	console.error(collada)
}
// -----------------------------------------------------------------------------

// Controls
var fpControls = new FirstPersonControls(camera, renderer.domElement);
fpControls.movementSpeed = cameraSpeed;
fpControls.loocSpeed = cameraLookSpeed;
fpControls.lookSpeed = 0.1;

// Transform Controls
// -----------------------------------------------------------------------------

// Initialize transformControl
const transformControl = new TransformControls(camera, renderer.domElement);
objects.push(transformControl);
let transformControlAttached = false;

// Do some junk that matters but doesn't matter.
//transformControl.addEventListener("change", render);

transformControl.addEventListener("dragging-changed", function (event) {
	fpControls.enabled = !event.value;
	doObjectSelect = !event.value;


	if (selectedObject.type == "Points") {
		//selectedObject = selectedObject.object;
		if (selectedObject.relevantType == "RailPoint") {
			for (const rail of sectionData.Static.Rails) {
				if (rail.HashId.value == selectedObject.CorrespondingRailHashID) {
					console.error("hi there");
					/*
					for (railPoint of rail.RailPoints) {
						console.error(railPoint);
						railPoint.Translate[0].value = selectedObject.position.x;
						railPoint.Translate[1].value = selectedObject.position.y;
						railPoint.Translate[2].value = selectedObject.position.z;
					}
					*/
					rail.RailPoints[selectedObject.railPointIndex].Translate[0].value = selectedObject.position.x;
					rail.RailPoints[selectedObject.railPointIndex].Translate[1].value = selectedObject.position.y;
					rail.RailPoints[selectedObject.railPointIndex].Translate[2].value = selectedObject.position.z;
					RailTools.reloadRail(selectedObject.CorrespondingRailHashID, sectionData, scene, objects);
					RailHelperTools.reloadControlPointHelpersByRailHashID(selectedObject.CorrespondingRailHashID, scene, sectionData, objects);
				}
			}
		}
		else if (selectedObject.relevantType == "ControlPoint") {
			for (const rail of sectionData.Static.Rails) {
				if (rail.HashId.value == selectedObject.CorrespondingRailHashID) {
					RailTools.setControlPointPos(rail, selectedObject.railPointIndex, selectedObject.controlPointIndex, selectedObject.position);
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][0].value = selectedObject.position.x;
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][1].value = selectedObject.position.y;
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][2].value = selectedObject.position.z;
					RailTools.reloadRail(selectedObject.CorrespondingRailHashID, sectionData, scene, objects);
				}
			}
		}
	}
	else if (selectedObject.parent.type == "Group") {
		transformControl.attach(selectedObject.parent);
		transformControlAttached = true;
		var tempActorData = findActorData(selectedObject.parent.HashID, selectedObject.parent.Type);
		console.warn(tempActorData);
		console.warn("asdf")


		try {
			tempActorData.Scale = [{"type":300, "value": selectedObject.parent.scale.x}, {"type":300, "value": selectedObject.parent.scale.y}, {"type":300, "value": selectedObject.parent.scale.z}];
		}
		catch {
			console.log("Scale doesn't exist. Correcting.")

			tempActorData.Scale = [{"type":300, "value": 1}, {"type":300, "value": 1}, {"type":300, "value": 1}]
		}

		try {
			tempActorData.Rotate = [{"type":300, "value": selectedObject.parent.rotation.x * 180 / Math.PI}, {"type":300, "value": selectedObject.parent.rotation.y * 180 / Math.PI}, {"type":300, "value": selectedObject.parent.rotation.z * 180 / Math.PI}];
		}
		catch {
			console.log("Rotation doesn't exist. Correcting.")
			tempActorData.Rotate = [{"type":300, "value": 0}, {"type":300, "value": 0}, {"type":300, "value": 0}]
		}

		try {
			tempActorData.Translate = [{"type":300,"value":selectedObject.parent.position.x}, {"type":300,"value":selectedObject.parent.position.y}, {"type":300,"value":selectedObject.parent.position.z}];
		}
		catch {
			console.log("Translation... doesn't exist? Correcting I guess.")
			tempActorData.Translate = [{"type":300, "value": 0}, {"type":300, "value": 0}, {"type":300, "value": 0}]
		}


		setActorData(selectedObject.parent.HashID, selectedObject.parent.Type, tempActorData);

	}



	else {
		transformControl.attach(selectedObject);
		transformControlAttached = true;

		var tempActorData = findActorData(selectedObject.HashID, selectedObject.Type);
		console.warn(tempActorData);
		console.warn("asdf")

		//tempActorData.Scale = [selectedObject.scale.x, selectedObject.scale.y, selectedObject.scale.z];

		//tempActorData.Rotate = [selectedObject.rotation.x * 180 / Math.PI, selectedObject.rotation.y * 180 / Math.PI, selectedObject.rotation.z * 180 / Math.PI];

		//tempActorData.Translate = [selectedObject.position.x, selectedObject.position.y, selectedObject.position.z];




		try {
			tempActorData.Scale = [{"type":300, "value": selectedObject.scale.x}, {"type":300, "value": selectedObject.scale.y}, {"type":300, "value": selectedObject.scale.z}];
		}
		catch {
			console.log("Scale doesn't exist.")
		}

		try {
			tempActorData.Rotate = [{"type":300, "value": selectedObject.rotation.x * 180 / Math.PI}, {"type":300, "value": selectedObject.rotation.y * 180 / Math.PI}, {"type":300, "value": selectedObject.rotation.z * 180 / Math.PI}];
		}
		catch {
			console.log("Rotation doesn't exist.")
		}

		try {
			tempActorData.Translate = [{"type":300,"value":selectedObject.position.x}, {"type":300,"value":selectedObject.position.y}, {"type":300,"value":selectedObject.position.z}];
		}
		catch {
			console.log("Translation... doesn't exist?")
		}

		/*
		tempActorData.Translate[0].type = 300;
		tempActorData.Translate[1].type = 300;
		tempActorData.Translate[2].type = 300;

		tempActorData.Rotate[0].type = 300;
		tempActorData.Rotate[1].type = 300;
		tempActorData.Rotate[2].type = 300;

		tempActorData.Scale[0].type = 300;
		tempActorData.Scale[1].type = 300;
		tempActorData.Scale[2].type = 300;


		tempActorData.Translate[0].value = selectedObject.position.x;
		tempActorData.Translate[1].value = selectedObject.position.y;
		tempActorData.Translate[2].value = selectedObject.position.z;

		tempActorData.Rotate[0].value = selectedObject.rotation.x * 180 / Math.PI;
		tempActorData.Rotate[1].value = selectedObject.rotation.y * 180 / Math.PI;
		tempActorData.Rotate[2].value = selectedObject.rotation.z * 180 / Math.PI;

		tempActorData.Scale[0].value = selectedObject.scale.x;
		tempActorData.Scale[1].value = selectedObject.scale.y;
		tempActorData.Scale[2].value = selectedObject.scale.z;

		*/

		setActorData(selectedObject.HashID, selectedObject.Type, tempActorData);
	}
});
transformControl.setMode("translate");

function updatebounds () {
	console.log("parent:");
	console.log(transformControl.object.parent);
	let child;
	for (child = 1; child < transformControl.object.parent.children.length; child++) {
		transformControl.object.parent.children[child].geometry.computeBoundingSphere();
	}
	render();
}

function render () {
	renderer.render(scene, camera);
}
// Adds transformControl to the scene.
scene.add(transformControl);

// Custom background color
// -----------------------------------------------------------------------------

scene.background = customColor;

// Lighting
// -----------------------------------------------------------------------------
const cameraPointLight = new THREE.PointLight(0xffffff, 1, 100, 2);
cameraPointLight.position.set(0, 0, 0);
camera.add(cameraPointLight);

const hemiLight = new THREE.HemisphereLight(customColor, 0x080820, 1);
scene.add(hemiLight);

scene.add(camera);

// -----------------------------------------------------------------------------

// window.open('./HTML/UI/SelectedActor/SelectedActor.html', 'hi', 'nodeIntegration=no')
// const electron = require('electron')
// const BrowserWindow = electron.BrowserWindow;

function createEditorWindow (obj, actorType, editingRail) {
	const { BrowserWindow } = require("electron").remote;

	const editorWin = new BrowserWindow({ width: 600, height: 400, webPreferences: {
		nodeIntegration: true,
		contextIsolation: false,
		enableRemoteModule: true
	} });
	// win.LoadURL("file://HTML/UI/SelectedActor/SelectedActor.html")
	editorWin.loadURL(`file://${__dirname}/HTML/UI/SelectedActor/SelectedActor.html`);

	editorWin.once("ready-to-show", () => {
		editorWin.show();
	});

	editorWin.webContents.on("did-finish-load", () => {
		// editorWin.webContents.send('toActorEditor', 'Hello second window!');
		editorWin.webContents.send("toActorEditor", { data: obj, type: actorType, HashID: obj.HashId.value, editingRail: editingRail, windowID: 1 });
	});
}


function createVisibilityWindow () {
	const { BrowserWindow } = require("electron").remote;

	const visiblityWin = new BrowserWindow({ width: 600, height: 400, webPreferences: {
		nodeIntegration: true,
	 	contextIsolation: false,
	 	enableRemoteModule: true
	 } });
	visiblityWin.loadURL(`file://${__dirname}/HTML/UI/VisibilityEditor/VisibilityEditor.html`);

	visiblityWin.once("ready-to-show", () => {
		visiblityWin.show();
	});
	//console.error(sectionData)
	let fullActorDict = {HashIDs: [], ActorNames: []}
	for (const i of sectionData.Static.Objs) {
		fullActorDict.HashIDs.push({HashID: i.HashId.value, Name: i.UnitConfigName.value})
		//fullActorDict.HashIDs.HashID.push(i.HashId.value);
		//fullActorDict.HashIDs.Name.push(i.UnitConfigName.value);
		fullActorDict.ActorNames.push(i.UnitConfigName.value);
	}
	for (const i of sectionData.Dynamic.Objs) {
		fullActorDict.HashIDs.push({HashID: i.HashId.value, Name: i.UnitConfigName.value})
		//fullActorDict.HashIDs.HashID.push(i.HashId.value);
		//fullActorDict.HashIDs.Name.push(i.UnitConfigName.value);
		fullActorDict.ActorNames.push(i.UnitConfigName.value);
	}
	fullActorDict.ActorNames = [...new Set(fullActorDict.ActorNames)]
	console.warn(fullActorDict)
	visiblityWin.webContents.on("did-finish-load", () => {
		visiblityWin.webContents.send("toVisibilityWindow", fullActorDict);
	});
}

const ipc = require("electron").ipcRenderer;

ipc.on("fromActorEditor", (event, message, hashID, type, isEditingRail) => {
	if (!isEditingRail) {
		setActorData(hashID, type, message);
		console.warn(message);
		console.warn(hashID);
		console.warn(type);
		ActorTools.removeObjectActors([hashID], scene, transformControl);
		console.warn(sectionData)
		let actorsData = {
			"Dynamic": {
				"Objs": []
			},
			"Static": {
				"Objs": [],
				"LocationPosX": sectionData.Static.LocationPosX,
				"LocationPosZ": sectionData.Static.LocationPosZ
			}
		};
		actorsData[type].Objs.push(message);
		console.warn(actorsData);
		loadActors(actorsData, false)
		console.warn(scene);
	}
	// Otherwise we're editing a rail:
	else {
		setRailData(hashID, message)
	}
});


ipc.on("loadSection", (event, message) => {
	displaySectionName(message);
	//console.error("hi")
	loadPython(function (s) { loadInstanceModels(null)}, "main", message);
});

ipc.on("appDataPath", (event, message) => {
	//console.error(message)
});

ipc.on("fromVisibilityEditor", (event, message) => {
	console.warn(message);
	console.warn(scene)
	let num = 0
	for (const x of scene.children) {
		if (message.HashIDs.includes(x.HashID)) {
			x.visible = false;
		}
		else {
			x.visible = true;
		}
		num = num + 1;
	}
	/*
	for (const i of message.HashIDs) {
		let num = 0;
		for (const x of scene.children) {
			// if (sectionData.Dynamic.Objs.hasOwnProperty(i)) {
      	if (x.HashID == i) {

					x.visible = false;
					objects[num].visible = false;

        	//console.warn(x)
					//if (x.visible == true) {
						//x.visible = false;
						//objects[num].visible = false;
					//}
					//else {
						//x.visible = true;
						//objects[num].visible = true;
					//}
      	}
			// }
			num = num + 1;
		}
	}
	*/
	for (const i of message.ActorNames) {
		let num = 0;
		for (const x of scene.children) {
			try {
				//console.warn (i)
				//console.warn (x)
				//console.warn(findActorData(x.HashID, x.Type).UnitConfigName)
				if (findActorData(x.HashID, x.Type).UnitConfigName.value == i) {
					console.warn(objects)
					console.warn("i")
					if (x.visible == true) {
						x.visible = false;
						objects[num].visible = false;
					}
					else {
						x.visible = true;
						objects[num].visible = true;
					}
				}
			}
			catch {
				console.warn("Couldn't find actor data.")
			}
			num = num + 1;
		}


		console.warn(i)
	}
});

document.getElementById("DataEditorTextWindow").innerHTML = `

`;

// Handle Adding Actors
// -----------------------------------------------------------------------------

function addActor() {
	let position = new THREE.Vector3();
	position.setFromMatrixPosition(camera.matrixWorld);

	//Generate new HashID
	let highestIntHashID
	sectionData.Static.Objs.forEach((data) => {
		let intHashID = data.HashId.value;
		if (intHashID > highestIntHashID || highestIntHashID == undefined) {
			highestIntHashID = intHashID;
		}
	})
	sectionData.Dynamic.Objs.forEach((data) => {
		let intHashID = data.HashId.value;
		if (intHashID > highestIntHashID || highestIntHashID == undefined) {
			highestIntHashID = intHashID;
		}
	})

	let highestInGameHashID = 4294961892;

	highestIntHashID = highestInGameHashID;
	let addedActorData =
	{
		"HashId": {
			"type": 102,
			"value": highestIntHashID + 1
		},
		"Rotate": [
			{"type": 300, "value": camera.rotation.x},
			{"type": 300, "value": camera.rotation.x},
			{"type": 300, "value": camera.rotation.x}
		],
		"Translate": [
				{"type": 300, "value": camera.position.x},
				{"type": 300, "value": camera.position.y},
				{"type": 300, "value": camera.position.z}
		],
		"UnitConfigName": {"type": 400, "value": "Test"}
	}

	sectionData.Dynamic.Objs.push(addedActorData)

	let actorsData = {
		"Dynamic": {
			"Objs": []
		},
		"Static": {
			"Objs": [],
			"LocationPosX": sectionData.Static.LocationPosX,
			"LocationPosZ": sectionData.Static.LocationPosZ
		}
	};
	actorsData.Dynamic.Objs.push(addedActorData);
	loadActors(actorsData, false);

	console.error(sectionData.Dynamic.Objs[0])
	console.error(highestIntHashID);
	console.error(sectionData)
}

// Handle Mouse Movement
// -----------------------------------------------------------------------------
document.addEventListener("mousemove", onMouseMove, true);

function onMouseMove (event) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// console.log(mouse.x);
}

console.log(scene.children);

// Handle Actor Selection
// -----------------------------------------------------------------------------



function clearActorSelectionGroup() {
	for (const i of selectedObjectGroup) {
		i.position.x = i.position.x + selectedObjectGroup.position.x;
		i.position.y = i.position.y + selectedObjectGroup.position.y;
		i.position.z = i.position.z + selectedObjectGroup.position.z;
		scene.add(i)
		selectedObjectGroup.remove(i)
	}
}







/*
function pointerDown (evt) {
	let action;

	switch (evt.pointerType) {
	case "mouse":
		console.log(scene)
		console.log(sectionData)
		if (evt.buttons === 1) {
			if (doObjectSelect == true) {
				raycaster.setFromCamera(mouse, camera);
				const intersects = raycaster.intersectObjects(objects, true);
				console.warn(objects)

				if (intersects.length > 0) {
					console.log("start");
					try {
          	console.log(intersects[0].object);
					} catch {
						console.log("could not find selected object.");
					}
					try {
          	console.log(intersects[0].object.parent);
					} catch {
						console.log("could not find next parent.");
					}
					try {
						console.log(intersects[0].object.parent.parent);
					} catch {
						console.log("could not find next parent.");
					}
					try {
						console.log(intersects[0].object.parent.parent.parent);
					} catch {
						console.log("could not find next parent.");
					}
					try {
						console.log(intersects[0].object.parent.parent.parent.parent);
					} catch {
						console.log("could not find next parent.");
					}
					console.log("end");
					console.warn(intersects.length)
					//for (const ri in intersects.length) {
					for (let ri = 0; ri < intersects.length; ri++) {
					console.warn(ri)
					if (intersects[ri].object !== null && intersects[ri].object !== scene && intersects[ri].object !== camera && intersects[ri].object.visible == true) {
						let foundTransformControls = false;
						intersects.forEach((intersect, i) => {
							console.warn(intersect);
							console.warn(intersect.parent);
							try {
								console.log("trying");
								if (((intersect.object.parent.parent.parent !== scene.children[1] && transformControlAttached == true) && (intersect.object.parent.parent !== scene.children[1] && transformControlAttached == true) && (intersect.object.parent !== scene.children[1] && transformControlAttached == true)) || intersect.object.type == "TransformControlsPlane" || (transformControlAttached == false)) {
			            	console.log(intersect.object);
								} else {
									console.log("found transformcontrols.");
									foundTransformControls = true;
								}
							} catch {
								console.log("had to catch");
								console.warn("could not find next parent.");
								console.log(intersect.object.parent);
								console.log(intersect.object);
								console.log("trying with two less parents.");

								if ((intersect.object.parent !== scene.children[1] && transformControlAttached == true) || intersect.object.type == "TransformControlsPlane" || (transformControlAttached == false)) {
			            	console.log(intersect.object.parent);
			            	console.log(intersect.object);
								} else {
									console.log("found transformcontrols.");
									foundTransformControls = true;
								}
							}
						});
						if (intersects[ri].object.type == "TransformControlsPlane") {
							intersects.shift();
						}
						console.log("foundTransformControls: " + foundTransformControls);
						if (foundTransformControls == false) {
							try {
								selectedObject = intersects[ri].object;
								console.log(selectedObject);


							if (selectedObject.parent.type == "Group") {
								transformControl.attach(selectedObject.parent);
								transformControlAttached = true;
								showActorData(selectedObject.parent.HashID, selectedObject.parent.Type);
							} else {
								transformControl.attach(selectedObject);
								transformControlAttached = true;
								showActorData(selectedObject.HashID, selectedObject.Type);
							}
						}
						catch {
							console.log("Nothing To Select")
						}
						} else {
							console.log(selectedObject);
						}
						break;
					}
				}
				}
			} else {
				transformControl.detach();
				transformControlAttached = false;
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
*/


function pointerDown (evt) {
	let action;
	let breakException = {};

	switch (evt.pointerType) {
	case "mouse":
		if (evt.buttons === 1) {
			if (doObjectSelect == true) {
				raycaster.setFromCamera(mouse, camera);
				const intersects = raycaster.intersectObjects(objects, true);
				console.warn(objects)
				console.warn(intersects)
				let transformControlsPass = false;
				let unconfirmedSelectedObject = null;
				if (intersects.length > 0) {
					intersects.forEach((intersect, i) => {

						//Check if the object is even visible. This is really important as we don't want the user to select stuff they can't even see.
						if (intersect.object.visible) {
						//console.error("i")

						let foundTransformBreak = false;
						let foundTransformReturn = false;

						try {
							if (intersect.object instanceof TransformControls) {
									if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
										if (unconfirmedSelectedObject != null) {
											//Workaround to break from the forEach.
											foundTransformBreak = true;
											throw breakException;
										}
										//Workaround to get past the catch statement
										foundTransformReturn = true;
										return;
									}

									unconfirmedSelectedObject = null;

									//Workaround to break from the forEach.
									foundTransformBreak = true;
									throw breakException;

							    }
						}
						catch {
							//console.error("hi")
							if (transformControlsPass) {
								return;
							}
							if (foundTransformBreak) {
								throw breakException;
							}
							if (foundTransformReturn) {
								return;
							}
							console.error("This shouldn't be here...")
							// I guess I'll add the object as the intersect anyway...


							//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
							unconfirmedSelectedObject = intersect.object;
							transformControlsPass = true;
							return;
						}
						try {
							if (intersect.object.parent instanceof TransformControls) {
									if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
										if (unconfirmedSelectedObject != null) {
											//Workaround to break from the forEach.
											foundTransformBreak = true;
											throw breakException;
										}
										//Workaround to get past the catch statement
										foundTransformReturn = true;
										return;
									}

									unconfirmedSelectedObject = null;

									//Workaround to break from the forEach.
									foundTransformBreak = true;
									throw breakException;

								}
						}
						catch {
							//console.error("hi")
							if (transformControlsPass) {
								return;
							}
							if (foundTransformBreak) {
								throw breakException;
							}
							if (foundTransformReturn) {
								return;
							}
							console.error("Couldn't find object parent... this shouldn't be here, unless you're selecting the scene.")

							//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
							unconfirmedSelectedObject = intersect.object;
							transformControlsPass = true;
							return;

						}
						try {
							if (intersect.object.parent.parent instanceof TransformControls) {

									if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
										if (unconfirmedSelectedObject != null) {
											//Workaround to break from the forEach.
											foundTransformBreak = true;
											throw breakException;
										}
										//Workaround to get past the catch statement
										foundTransformReturn = true;
										return;
									}

									unconfirmedSelectedObject = null;

									//Workaround to break from the forEach.
									foundTransformBreak = true;
									throw breakException;
								}
						}
						catch {
							//console.error("hi")
							if (transformControlsPass) {
								return;
							}
							if (foundTransformBreak) {
								throw breakException;
							}
							if (foundTransformReturn) {
								return;
							}
							//console.error("Couldn't find next parent.")

							//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
							unconfirmedSelectedObject = intersect.object;
							transformControlsPass = true;
							return;

						}
						try {
							if (intersect.object.parent.parent.parent instanceof TransformControls) {
									if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
										if (unconfirmedSelectedObject != null) {
											//Workaround to break from the forEach.
											foundTransformBreak = true;
											throw breakException;
										}
										//Workaround to get past the catch statement
										foundTransformReturn = true;
										return;
									}

									unconfirmedSelectedObject = null;

									//Workaround to break from the forEach.
									foundTransformBreak = true;
									throw breakException;

								}
						}
						catch {
							//console.error("hi")
							if (transformControlsPass) {
								return;
							}
							if (foundTransformBreak) {
								throw breakException;
							}
							if (foundTransformReturn) {
								return;
							}

							//console.error("Couldn't find next parent.")

							//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
							unconfirmedSelectedObject = intersect.object;
							transformControlsPass = true;
							return;

						}
						if (transformControlsPass) {
							return;
						}

						console.warn("Object has too many parents, but that's fine.")

						//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
						unconfirmedSelectedObject = intersect.object;
						transformControlsPass = true;
						return;
					}
					})
				}
				if (unconfirmedSelectedObject != null) {
					selectedObject = unconfirmedSelectedObject;
					if (selectedObject.parent.type == "Group") {
						transformControl.attach(selectedObject.parent);
						transformControlAttached = true;
						showActorData(selectedObject.parent.HashID, selectedObject.parent.Type);
					} else {
						if (selectedObject.relevantType == "ControlPoint" || selectedObject.relevantType == "RailPoint") {
							transformControl.attach(selectedObject);
							transformControlAttached = true;
							showRailData(selectedObject.CorrespondingRailHashID)
						}
						else {
							transformControl.attach(selectedObject);
							transformControlAttached = true;
							showActorData(selectedObject.HashID, selectedObject.Type);
						}
					}
				}
				console.warn(unconfirmedSelectedObject)
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

function controlSetTranslate () {
	transformControl.setMode("translate");
}
function controlSetScale () {
	transformControl.setMode("scale");
}

function controlSetRotate () {
	transformControl.setMode("rotate");
}

// More boring stuff
// -----------------------------------------------------------------------------

function animate () {
		console.warn(sectionData)
	/*
	let geoArray = [];
	if (scene.children != undefined) {
		//console.error("HIII")
		scene.children.forEach((object) => {
			if (object.visible && object.geometry != undefined) {
				geoArray.push(object.geometry)
				object.visible = false;
			}
		})
		console.warn(geoArray)
		if (geoArray.length > 1) {
			//console.error("YAY")
			BufferGeometryUtils.mergeBufferGeometries(geoArray, false);
		}
	}
	*/
	var position = new THREE.Vector3();
  position.setFromMatrixPosition( camera.matrixWorld );
	//console.error(position)
	stats.update();
	resizeCanvasToDisplaySize();
	setTimeout(function () {
		requestAnimationFrame(animate);
	}, 1000 / 60);

	fpControls.update(clock.getDelta());

	camera.aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
	renderer.render(scene, camera);
	//console.error(scene)

	if (transformControl.dragging) {
		if (selectedObject.relevantType == "RailPoint") {
			for (const rail of sectionData.Static.Rails) {
				if (rail.HashId.value == selectedObject.CorrespondingRailHashID) {
					console.error("hi there");
					/*
					for (railPoint of rail.RailPoints) {
						console.error(railPoint);
						railPoint.Translate[0].value = selectedObject.position.x;
						railPoint.Translate[1].value = selectedObject.position.y;
						railPoint.Translate[2].value = selectedObject.position.z;
					}
					*/
					rail.RailPoints[selectedObject.railPointIndex].Translate[0].value = selectedObject.position.x;
					rail.RailPoints[selectedObject.railPointIndex].Translate[1].value = selectedObject.position.y;
					rail.RailPoints[selectedObject.railPointIndex].Translate[2].value = selectedObject.position.z;
					RailTools.reloadRail(selectedObject.CorrespondingRailHashID, sectionData, scene, objects);
					RailHelperTools.reloadControlPointHelpersByRailHashID(selectedObject.CorrespondingRailHashID, scene, sectionData, objects);
				}
			}
		}
		else if (selectedObject.relevantType == "ControlPoint") {
			for (const rail of sectionData.Static.Rails) {
				if (rail.HashId.value == selectedObject.CorrespondingRailHashID) {
					RailTools.setControlPointPos(rail, selectedObject.railPointIndex, selectedObject.controlPointIndex, selectedObject.position);
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][0].value = selectedObject.position.x;
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][1].value = selectedObject.position.y;
					//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][2].value = selectedObject.position.z;
					RailTools.reloadRail(selectedObject.CorrespondingRailHashID, sectionData, scene, objects);
				}
			}
		}
	}
}
animate();

// Load settings from config.json
function loadDarkMode (darkMode) {
	console.warn("darkmode:" + darkMode);
	if (darkMode == true) {
		styleSheet.href = "HTML/Dark-Mode.css";
		scene.background = customDarkColor;
	} else {
		styleSheet.href = "HTML/Light-Mode.css";
		scene.background = customColor;
	}
}

// Calls the function to save current data in process.py
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function () {
	console.error(sectionData)
	//loadPython(function (s) { console.warn("Saving..."); }, "save", JSON.stringify(sectionData));

	// Special saving code - uses stdin because sectionData is big.
		const { spawn } = require("child_process");
		const childPython = spawn("python", [path.join(__dirname, "./MapEditor/Process.py"), 'save'], {cwd:__dirname});

		childPython.stdio[2].on("data", function (dataBuffer){
			console.error(dataBuffer.toString());
		});

		childPython.stdin.write(JSON.stringify(sectionData));
		childPython.stdin.end();

	console.warn("e");
});

// function to get the current section name ahd display it.
function displaySectionName (section) {
	const sectionName = document.getElementById("sectionName");
	console.warn(sectionName);
	console.warn(section);
	sectionName.innerHTML = section;
}

// loadPython(function(s){console.warn("ugh what is it this time");loadDarkMode(s);}, "shareSettings", 'DarkMode');
window.onload = function () {
	loadPython(function (s) { console.warn("ugh what is it this time"); loadDarkMode(s); }, "shareSettings", "DarkMode");

};
