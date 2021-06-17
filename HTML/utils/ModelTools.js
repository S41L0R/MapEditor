

// Requires
// -----------------------------------------------------------------------------
const CacheTools = require("./CacheTools.js")
const PythonTools = require("./PythonTools.js")
const GeneralModelTools = require("./GeneralModelTools.js")
const BasicMeshModelSetup = require("./BasicMeshModelSetup.js")
// -----------------------------------------------------------------------------

// Usables
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------

// Global Variables
// -----------------------------------------------------------------------------
let modelDict = {}
let basicMeshDict = {}
let modelNumDict = {}
// -----------------------------------------------------------------------------










const setupBasicMeshModels = function() {
  let promises = []

  promises.push(BasicMeshModelSetup.setupCubeMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupBoxAreaMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupSphereAreaMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupCapsuleAreaMesh(THREE, basicMeshDict))

  //linktags
  promises.push(BasicMeshModelSetup.setupLinkTagAndMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagOrMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagCountMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagPulseMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagNoneMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagNAndMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagNOrMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagXOrMesh(THREE, basicMeshDict))
  promises.push(BasicMeshModelSetup.setupLinkTagDefaultMesh(THREE, basicMeshDict))

  promises.push(BasicMeshModelSetup.setupWaterMesh(THREE, basicMeshDict))

  return Promise.all(promises)
}



const loadModelByActorName = function (actorName) {
  return new Promise((resolve) => {
    PythonTools.loadPython("getActorModelPath", actorName).then(() => {
      loadModel(actorName, modelPath).then(() => {
        resolve()
      })
    })
  })
}


const loadGameModelsBySection = function(sectionName) {
  return new Promise ((resolve) => {
    PythonTools.loadPython("newGetActorModelPaths", sectionName).then((modelPathList) => {
      let promises = []

      for (const [actorName, modelPath] of Object.entries(modelPathList)) {
  			promises.push(loadModel(actorName, modelPath))
  		}

      promises.push(setupBasicMeshModels())

      Promise.all(promises).then(() => {
        resolve()
      })
    })
  })
}

function loadModel(actorName, modelPath) {
  return new Promise((resolve) => {
    modelNumDict[actorName] = 0
    for (const actor of global.sectionData.Static.Objs) {
      if (actor.UnitConfigName.value === actorName) {
        modelNumDict[actorName] = modelNumDict[actorName] + 1
      }
    }
    for (const actor of global.sectionData.Dynamic.Objs) {
      if (actor.UnitConfigName.value === actorName) {
        modelNumDict[actorName] = modelNumDict[actorName] + 1
      }
    }
    global.colladaLoader.load(modelPath, (collada) => {colladaOnLoad(collada, actorName, resolve, modelNumDict[actorName])}, (collada) => {colladaOnProgress(collada, actorName)}, (error) => {colladaOnError(error, actorName, resolve)})
  })
}




const colladaOnLoad = function (collada, actorName, resolve, modelNum) {
	// General logic for when the collada file is loaded.
	// This includes model manipulation in order to serve our purposes.
	colladaModel = collada.scene
	GeneralModelTools.bakeSkeleton(colladaModel)
	let colladaMeshArray = []
	colladaModel.traverse((item) => {
		if (item.isMesh) {

			// We get the geometry and the material
			let colladaGeometry = item.geometry

			let colladaMaterial = item.material

			let colladaInstancedMesh = new THREE.InstancedMesh(colladaGeometry, colladaMaterial, modelNum + 999)
			colladaInstancedMesh.userData.actorList = []

			// Set the count to 0 for logic later:
			colladaInstancedMesh.count = 0

			colladaMeshArray.push(colladaInstancedMesh)
		}
	})



	// We send this out like so:
	modelDict[actorName] = colladaMeshArray

	console.warn(modelDict)

	console.warn("This loaded")

	resolve()
}

const colladaOnProgress = function (collada, actorName) {
	console.log(`progress for ${actorName}`)
}

const colladaOnError = function (error, actorName, resolve) {
	console.log(`error for ${actorName} when loading models.`)
	console.error(error)
	resolve()
}




























module.exports = {
  setupBasicMeshModels: setupBasicMeshModels,
  loadGameModelsBySection: loadGameModelsBySection,

  modelDict: modelDict,
  basicMeshDict: basicMeshDict
}
