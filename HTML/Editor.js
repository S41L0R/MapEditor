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

import {LineSegmentsGeometry} from "./lib/threejs/examples/jsm/lines/LineSegmentsGeometry.js"
global.LineSegmentsGeometry = LineSegmentsGeometry

import {LineSegments2} from "./lib/threejs/examples/jsm/lines/LineSegments2.js"
global.LineSegments2 = LineSegments2
// -----------------------------------------------------------------------------

// Requires
// -----------------------------------------------------------------------------
const PythonTools = require("./HTML/utils/PythonTools.js")
global.PythonTools = PythonTools
const SceneTools = require("./HTML/utils/SceneTools.js")
global.SceneTools = SceneTools
const RayCastTools = require("./HTML/utils/RayCastTools.js")
global.RayCastTools = RayCastTools
const RailTools = require("./HTML/utils/RailTools.js")
global.RailTools = RailTools
const SelectionTools = require("./HTML/utils/SelectionTools.js")
global.SelectionTools = SelectionTools
const ActorEditorTools = require("./HTML/utils/ActorEditorTools.js")
global.ActorEditorTools = ActorEditorTools
const SaveTools = require('./HTML/utils/SaveTools.js')
global.SaveTools = SaveTools
const TransformControlTools = require("./HTML/utils/TransformControlTools.js")
global.TransformControlTools = TransformControlTools
const LinkTools = require("./HTML/utils/LinkTools.js")
global.LinkTools = LinkTools
const ModelTools = require("./HTML/utils/ModelTools.js")
global.ModelTools = ModelTools
const ActorTools = require("./HTML/utils/ActorTools.js")
global.ActorTools = ActorTools
const LODTools = require("./HTML/utils/LODTools.js")
global.LODTools = LODTools
const BasicMeshModelSetup = require("./HTML/utils/BasicMeshModelSetup.js")
global.BasicMeshModelSetup = BasicMeshModelSetup
const CacheTools = require("./HTML/utils/CacheTools.js")
global.CacheTools = CacheTools
const ClipboardTools = require("./HTML/utils/ClipboardTools.js")
global.ClipboardTools = ClipboardTools
const DataEditorTools = require("./HTML/utils/DataEditorTools.js")
global.DataEditorTools = DataEditorTools
const GeneralModelTools = require("./HTML/utils/GeneralModelTools.js")
global.GeneralModelTools = GeneralModelTools
const GeneralRailTools = require("./HTML/utils/GeneralRailTools.js")
global.GeneralRailTools = GeneralRailTools
const MapTools = require("./HTML/utils/MapTools.js")
global.MapTools = MapTools
const RailHelperTools = require("./HTML/utils/RailHelperTools.js")
global.RailHelperTools = RailHelperTools
const VariableDomListeners = require("./HTML/utils/VariableDomListeners.js")
global.VariableDomListeners = VariableDomListeners
const VisibilityTools = require("./HTML/utils/VisibilityTools.js")
global.VisibilityTools = VisibilityTools
const DomListeners = require("./HTML/utils/DomListeners.js")
global.DomListeners = DomListeners
const HeightMapTools = require("./HTML/utils/HeightMapTools.js")
global.HeightMapTools = HeightMapTools

const ipc = require("electron").ipcRenderer


// Constants
// -----------------------------------------------------------------------------
const customSkyColor = new THREE.Color("skyblue")
//const customDarkSkyColor = new THREE.Color("#2b2b31")
const customDarkSkyColor = new THREE.Color("#000000")

const clock = new THREE.Clock()

const defaultCameraSpeed = 150
const defaultCameraLookSpeed = 0.1


const colladaLoader = new ColladaLoader()
global.colladaLoader = colladaLoader

// Amout of frames between lod creation
const LOD_FRAMES = 60
// -----------------------------------------------------------------------------

// Renderer initialization
// -----------------------------------------------------------------------------
const viewport = document.getElementById("viewport")
const renderer = new THREE.WebGLRenderer({ canvas: viewport, powerPreference: "high-performance" })
renderer.setSize( renderer.domElement.clientWidth, renderer.domElement, false )
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 6
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

		LinkTools.reloadLinkObjectResolution()
		RailTools.reloadRailObjectResolution()
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

global.computeLODs = false

// Renderer
// -----------------------------------------------------------------------------
let currentFrame = 0

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

	// Don't always apply LODs, only do it every few frames
	// Though it doesn't have that much of a performance impact anyway...
	if (currentFrame % LOD_FRAMES === 0) {
		if (global.computeLODs) {
			LODTools.applyLODs()
		}
	}

	currentFrame = currentFrame + 1
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


// Don't use this, it is buggy and broken..
// ----------------------------------------
const sections = [
	"A-1",
	"B-1",
	"C-1",
	"D-1",
	"E-1",
	"F-1",
	"G-1",
	"H-1",
	"I-1",
	"J-1",

	"A-2",
	"B-2",
	"C-2",
	"D-2",
	"E-2",
	"F-2",
	"G-2",
	"H-2",
	"I-2",
	"J-2",

	"A-3",
	"B-3",
	"C-3",
	"D-3",
	"E-3",
	"F-3",
	"G-3",
	"H-3",
	"I-3",
	"J-3",

	"A-4",
	"B-4",
	"C-4",
	"D-4",
	"E-4",
	"F-4",
	"G-4",
	"H-4",
	"I-4",
	"J-4",

	"A-5",
	"B-5",
	"C-5",
	"D-5",
	"E-5",
	"F-5",
	"G-5",
	"H-5",
	"I-5",
	"J-5",

	"A-6",
	"B-6",
	"C-6",
	"D-6",
	"E-6",
	"F-6",
	"G-6",
	"H-6",
	"I-6",
	"J-6",

	"A-7",
	"B-7",
	"C-7",
	"D-7",
	"E-7",
	"F-7",
	"G-7",
	"H-7",
	"I-7",
	"J-7",

	"A-8",
	"B-8",
	"C-8",
	"D-8",
	"E-8",
	"F-8",
	"G-8",
	"H-8",
	"I-8",
	"J-8",
]
async function loadAll() {
	let sectionData = {}
	let promises = []
	for (const section of sections) {
		promises.push(PythonTools.loadPython("main", section, onPythonData).then((thisSectionData) => {
			sectionData = {
				...thisSectionData,
				...sectionData
			}
		}))
	}

	await Promise.all(promises)
	return sectionData
}
// ---------------------------------------


async function loadSection(sectionName) {
	// Just in case we hit reload and want to see something
	if (sectionName === undefined) {
		sectionName = await PythonTools.loadPython('shareSettings', 'TestingMapSection')
	}
	else {
		PythonTools.loadPython("setSetting", `TestingMapSection, ${sectionName}`)
	}
	global.sectionName = sectionName
	document.getElementById("loadingStatus").innerHTML = "Loading Python"
	HeightMapTools.loadSectionHeightMap(sectionName)
	//PythonTools.loadPython("main", sectionName, onPythonData).then((sectionData) => {
	PythonTools.loadPython("main", sectionName, onPythonData).then((sectionData) => {
		// Found it made things a lot easier to have a few global vars that I use a lot.
		global.sectionData = sectionData
		DomListeners.initSaveButton(document, SaveTools.saveData, sectionData, sectionName)
		// Setup ActorEditor
		// -----------------------------------------------------------------------------
		ActorEditorTools.initActorEditorTools(sectionData)
		// -----------------------------------------------------------------------------
		document.getElementById("loadingStatus").innerHTML = "Creating Rails"
		RailTools.initRailObject()
		RailTools.createRails(sectionData, scene, RayCastTools.intersectables)
		// First place actors in scene (Will be dummy if there is no model):
			document.getElementById("loadingStatus").innerHTML = "Loading Models"
	    	SceneTools.addActorsToScene(scene, sectionData, RayCastTools.intersectables, BufferGeometryUtils, colladaLoader, sectionName, THREE).then(()=>{
				document.getElementById("loadingDisplay").style.opacity = 0
				LinkTools.createLinks().then(() => {
					LODTools.initLODs()
				})
			})



	  camera.position.set(sectionData.Static.LocationPosX.value, 100, sectionData.Static.LocationPosZ.value)
	});
}

async function loadDungeon(sectionName) {
	global.isDungeon = true
	// Just in case we hit reload and want to see something
	if (sectionName === undefined) {
		sectionName = await PythonTools.loadPython('shareSettings', 'TestingMapSection')
	}
	else {
		PythonTools.loadPython("setSetting", `TestingMapSection, ${sectionName.replace("\\", "\\\\")}`)
	}
	global.sectionName = sectionName
	document.getElementById("loadingStatus").innerHTML = "Loading Python"
	HeightMapTools.loadSectionHeightMap(sectionName)
	//PythonTools.loadPython("main", sectionName, onPythonData).then((sectionData) => {
	PythonTools.loadPython("mainDungeon", sectionName, onPythonData).then((sectionData) => {
		// Found it made things a lot easier to have a few global vars that I use a lot.
		global.sectionData = sectionData
		DomListeners.initSaveButton(document, SaveTools.saveData, sectionData, sectionName)
		// Setup ActorEditor
		// -----------------------------------------------------------------------------
		ActorEditorTools.initActorEditorTools(sectionData)
		// -----------------------------------------------------------------------------
		document.getElementById("loadingStatus").innerHTML = "Creating Rails"
		RailTools.initRailObject()
		RailTools.createRails(sectionData, scene, RayCastTools.intersectables)
		// First place actors in scene (Will be dummy if there is no model):
			document.getElementById("loadingStatus").innerHTML = "Loading Models"
	    	SceneTools.addActorsToSceneDungeon(scene, sectionData, RayCastTools.intersectables, BufferGeometryUtils, colladaLoader, sectionName, THREE).then(()=>{
				document.getElementById("loadingDisplay").style.opacity = 0
				LinkTools.createLinks().then(() => {
					LODTools.initLODs()
				})
			})



	  camera.position.set(sectionData.Static.LocationPosX.value, 100, sectionData.Static.LocationPosZ.value)
	});
}

async function loadDarkMode() {
	// Sets dark mode/light mode based on settings
	let darkMode = await PythonTools.loadPython('getDarkMode', null)
	if (darkMode == true){
		styleSheet.href = "HTML/Dark-Mode.css";
		scene.background = customDarkSkyColor;
	}
	else {
		styleSheet.href = "HTML/Light-Mode.css";
		scene.background = customSkyColor;
	}
}

DomListeners.initListeners(document, editorControls, transformControl)

ipc.on('projectName', async(event, project) => {
	global.projectName = project
	console.log(`Project successfully set to "${projectName}"`)
})

ipc.on("loadSection", async (event, sectionName) => {
	loadDarkMode()
	loadSection(sectionName)
});

ipc.on("loadDungeon", async (event, sectionName) => {
	loadDarkMode()
	loadDungeon(sectionName)
});

var perfEntries = performance.getEntriesByType('navigation')

if (perfEntries[0].type == 'reload') {
	console.log('Page Reloaded')
	loadDarkMode()
	loadSection()
}
else {}







function onPythonData(dataType, data) {
	switch(dataType) {
		case "modelCachedData":
			ModelTools.loadNewCachedModels(data, ActorTools.reloadObjectActorByName)
			break
		default:
			console.error(`loadPython callback dataType not supported: ${dataType}`)
	}
}
