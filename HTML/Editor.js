global.THREE = THREE
// Imports
// -----------------------------------------------------------------------------
import { FirstPersonControls } from "./lib/threejs/examples/jsm/controls/EditorControls.js"
global.FirstPersonControls = FirstPersonControls

import { ColladaLoader } from "./lib/threejs/examples/jsm/loaders/ColladaLoader.js"
global.ColladaLoader = ColladaLoader

import { BufferGeometryUtils } from "./lib/threejs/examples/jsm/utils/BufferGeometryUtils.js"
global.BufferGeometryUtils = BufferGeometryUtils

import { TransformControls } from "./lib/threejs/examples/jsm/controls/TransformControls.js"
global.TransformControls = TransformControls

import {Line2} from "./lib/threejs/examples/jsm/lines/Line2.js"
global.Line2 = Line2

import {LineGeometry} from "./lib/threejs/examples/jsm/lines/LineGeometry.js"
global.LineGeometry = LineGeometry

import {LineMaterial} from "./lib/threejs/examples/jsm/lines/LineMaterial.js"
global.LineMaterial = LineMaterial
// -----------------------------------------------------------------------------

// Requires
// -----------------------------------------------------------------------------
const PythonTools = require("./HTML/utils/PythonTools.js")
const SceneTools = require("./HTML/utils/SceneTools.js")
const RayCastTools = require("./HTML/utils/RayCastTools.js")
const RailTools = require("./HTML/utils/RailTools.js")
const SelectionTools = require("./HTML/utils/SelectionTools.js")
const ActorEditorTools = require("./HTML/utils/ActorEditorTools.js")
const SaveTools = require('./HTML/utils/SaveTools.js')
const TransformControlTools = require("./HTML/utils/TransformControlTools.js")
const LinkTools = require("./HTML/utils/LinkTools.js")

const DomListners = require("./HTML/utils/DomListeners.js")

const ipc = require("electron").ipcRenderer


// Constants
// -----------------------------------------------------------------------------
const customSkyColor = new THREE.Color("skyblue")
const customDarkSkyColor = new THREE.Color("#2b2b31")

const clock = new THREE.Clock()

const defaultCameraSpeed = 150
const defaultCameraLookSpeed = 0.1

const colladaLoader = new ColladaLoader()
global.colladaLoader = colladaLoader
// -----------------------------------------------------------------------------

// Renderer initialization
// -----------------------------------------------------------------------------
const viewport = document.getElementById("viewport")
const renderer = new THREE.WebGLRenderer({ canvas: viewport, powerPreference: "high-performance" })
renderer.setSize( renderer.domElement.clientWidth, renderer.domElement, false )
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2.3
//renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement)

global.renderer = renderer

const camera = new THREE.PerspectiveCamera(70, 2, 1, 1000)
global.camera = camera

const scene = new THREE.Scene()
global.scene = scene

scene.add(camera)
// -----------------------------------------------------------------------------

// Lighting
// -----------------------------------------------------------------------------
const hemiLight = new THREE.HemisphereLight(customSkyColor, 0x080820, 1)
scene.add(hemiLight)


const cameraLight = new THREE.PointLight( 0xffffff, 1, 100 )
cameraLight.position.set(5, 0, 5)
camera.add( cameraLight )

/*
let circleGeo = new THREE.CircleGeometry(220, 50);
let circleMat = new THREE.MeshBasicMaterial({color:0xffffff});
let circle = new THREE.Mesh(circleGeo, circleMat);
circle.position.set(0, 5, 5);
camera.add(circle)
*/
scene.background = customSkyColor
// -----------------------------------------------------------------------------

// Post Processing
// This is simply garbage. Might revisit it later.
// -----------------------------------------------------------------------------

/*
let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, circle, {
	resolutionScale: 1,
	density: 0.6,
	decay: 0.95,
	weight: 0.9,
	samples: 100
});

let renderPass = new POSTPROCESSING.RenderPass(scene, camera);

let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);
effectPass.renderToScreen = true;

let effectComposer = new POSTPROCESSING.EffectComposer(renderer);
effectComposer.addPass(renderPass);
effectComposer.addPass(effectPass);
effectComposer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight)
*/

// -----------------------------------------------------------------------------

// Some stuff for stats to show
// -----------------------------------------------------------------------------

var stats = new Stats()
stats.showPanel(0)
stats.domElement.style.top = 50
document.body.appendChild( stats.dom )
stats.begin()

// -----------------------------------------------------------------------------

// Boring code that doesn't matter, except it does a bit
// -----------------------------------------------------------------------------

// Automatically scale canvas to fit:
function resizeCanvasToDisplaySize () {
	const canvas = renderer.domElement
	// look up the size the canvas is being displayed
	const width = canvas.clientWidth
	const height = canvas.clientHeight

	// adjust displayBuffer size to match
	if (canvas.width !== width || canvas.height !== height) {
		// you must pass false here or three.js sadly fights the browser
		renderer.setSize(width, height, false)
		camera.aspect = width / height
		camera.far = 100000
		camera.updateProjectionMatrix()

		// update any render target sizes here
	}
}


// -----------------------------------------------------------------------------

// Control setup
// -----------------------------------------------------------------------------
const editorControls = new FirstPersonControls(camera, renderer.domElement)
editorControls.movementSpeed = defaultCameraSpeed
editorControls.lookSpeed = defaultCameraLookSpeed
// -----------------------------------------------------------------------------

// Setup Selection
// -----------------------------------------------------------------------------
SelectionTools.initSelectionTools(THREE, scene)
// -----------------------------------------------------------------------------

// Setup TransformControls
// -----------------------------------------------------------------------------
const transformControl = new TransformControls(camera, renderer.domElement)
// This is so we can detect if the user is clicking on transformControl and if
// so don't select an object.
RayCastTools.intersectables.push(transformControl)
scene.add(transformControl)

// Set up listeners and other transformControl utils:
TransformControlTools.initTransformControlListeners(transformControl)


// Make it a global
global.transformControl = transformControl
// -----------------------------------------------------------------------------

// Setup Raycaster
// -----------------------------------------------------------------------------
RayCastTools.initRaycaster(viewport, document, TransformControls, transformControl, camera)
// -----------------------------------------------------------------------------


// Renderer
// -----------------------------------------------------------------------------

function render() {
	resizeCanvasToDisplaySize()

	stats.update()


	requestAnimationFrame(render)

	editorControls.update(clock.getDelta())

	camera.aspec = renderer.domElement.clientWidth / renderer.domElement.clientHeight

	renderer.render(scene, camera)

	document.getElementById("renderStats").innerHTML = `
	Camera Pos: ${Math.trunc(camera.position.x)} ${Math.trunc(camera.position.y)} ${Math.trunc(camera.position.z)}<br>
	Scene Polycount: ${renderer.info.render.triangles}<br>
	Active Drawcalls: ${renderer.info.render.calls}<br>
	Textures in Memory: ${renderer.info.memory.textures}<br>
	Geometries in Memory: ${renderer.info.memory.geometries}
	`


	if (transformControl.dragging) {
		TransformControlTools.onTransformControlDrag(transformControl)
	}
}
render()

// -----------------------------------------------------------------------------

// Light mode / Dark mode
// -----------------------------------------------------------------------------
const darkModeToggle = document.getElementById("darkModeToggle")
const styleSheet = document.getElementById("styleSheet")

darkModeToggle.addEventListener("click", function () {
	if (styleSheet.getAttribute("href") == "HTML/Light-Mode.css") {
		styleSheet.href = "HTML/Dark-Mode.css"
		scene.background = customDarkSkyColor
		PythonTools.loadPython("setDarkMode", "dark")
	} else {
		styleSheet.href = "HTML/Light-Mode.css"
		scene.background = customSkyColor
		PythonTools.loadPython("setDarkMode", "light")
	}
})
// -----------------------------------------------------------------------------


async function loadSection(sectionName) {
	// Just in case we hit reload and want to see something
	if (sectionName === undefined) {
		sectionName = await PythonTools.loadPython('shareSettings', 'TestingMapSection')
	}
	global.sectionName = sectionName
	document.getElementById("loadingStatus").innerHTML = "Loading Python"
	PythonTools.loadPython("main", sectionName).then((sectionData) => {
		// Found it made things a lot easier to have a few global vars that I use a lot.
		global.sectionData = sectionData
		DomListners.initSaveButton(document, SaveTools.saveData, sectionData, sectionName)
		// Setup ActorEditor
		// -----------------------------------------------------------------------------
		ActorEditorTools.initActorEditorTools(sectionData)
		// -----------------------------------------------------------------------------
		document.getElementById("loadingStatus").innerHTML = "Creating Rails"
		console.log("rails")
		RailTools.createRails(sectionData, scene, RayCastTools.intersectables)
		// First place actors in scene (Will be dummy if there is no model):
			document.getElementById("loadingStatus").innerHTML = "Loading Models"
	    SceneTools.addActorsToScene(scene, sectionData, RayCastTools.intersectables, BufferGeometryUtils, colladaLoader, sectionName, THREE).then(()=>{
				document.getElementById("loadingDisplay").style.opacity = 0
			})
			LinkTools.createLinks()


	  camera.position.set(sectionData.Static.LocationPosX.value, 100, sectionData.Static.LocationPosZ.value)
	});
}

async function loadDarkMode() {
	// Sets dark mode/light mode based on settings
	let darkMode = await PythonTools.loadPython('getDarkMode', null)
	console.error(darkMode)
	if (darkMode == true){
		styleSheet.href = "HTML/Dark-Mode.css";
		scene.background = customDarkSkyColor;
	}
	else {
		styleSheet.href = "HTML/Light-Mode.css";
		scene.background = customSkyColor;
	}
}

DomListners.initListeners(document, editorControls, transformControl)

ipc.on("loadSection", async (event, sectionName) => {
	loadDarkMode()
	loadSection(sectionName)
});

var perfEntries = performance.getEntriesByType('navigation')

if (perfEntries[0].type == 'reload') {
	console.log('Page Reloaded')
	loadDarkMode()
	loadSection()
}
else {}
