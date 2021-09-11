

// Requires
// -----------------------------------------------------------------------------
const path = require('path')
const fs = require('fs')
const { Console } = require('console')
// -----------------------------------------------------------------------------

// Usables
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------

// Global Variables
// -----------------------------------------------------------------------------
let modelDict = {}
let basicMeshDict = {}
let modelNumDict = {}

let modelDictByPath = {}

let mostRecentModelPathDict = {}
// -----------------------------------------------------------------------------

// Constants
// -----------------------------------------------------------------------------

// The maximum number of game model textures to be loaded. Is imprecise, getting texture dimensions/sizes would be more useful...
const TEXTURE_CAP = 3000
// -----------------------------------------------------------------------------








const setupBasicMeshModels = function() {
  let promises = []

  promises.push(global.BasicMeshModelSetup.setupCubeMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupBoxAreaMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupSphereAreaMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupCapsuleAreaMesh(THREE, basicMeshDict))

  //linktags
  promises.push(global.BasicMeshModelSetup.setupLinkTagAndMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagOrMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagCountMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagPulseMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagNoneMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagNAndMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagNOrMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagXOrMesh(THREE, basicMeshDict))
  promises.push(global.BasicMeshModelSetup.setupLinkTagDefaultMesh(THREE, basicMeshDict))

  promises.push(global.BasicMeshModelSetup.setupWaterMesh(THREE, basicMeshDict))

  return Promise.all(promises)
}



const loadModelByActorName = function (actorName) {
  return new Promise((resolve) => {
    global.PythonTools.loadPython("getActorModelPath", actorName).then(() => {
      loadModel(actorName, modelPath).then(() => {
        resolve()
      })
    })
  })
}


const loadGameModelsBySection = function(sectionName) {
  return new Promise ((resolve) => {
    global.PythonTools.loadPython("newGetActorModelPaths", sectionName).then((modelPathDict) => {

      mostRecentModelPathDict = modelPathDict

      let promises = []

      for (const [actorName, modelPath] of Object.entries(modelPathDict)) {
  			promises.push(loadModel(actorName, modelPath))
  		}

      promises.push(setupBasicMeshModels())

      Promise.all(promises).then(() => {
        resolve()
      })
    })
  })
}

const loadGameModelsByDungeon = function(dungeonPath) {
  return new Promise ((resolve) => {
    global.PythonTools.loadPython("dungeonGetActorModelPaths", dungeonPath).then((modelPathDict) => {

      mostRecentModelPathDict = modelPathDict

      let promises = []

      for (const [actorName, modelPath] of Object.entries(modelPathDict)) {
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
    // Check if this model has already been loaded for another actor
    // If so, just copy the data over.
    if (modelDictByPath[modelPath] !== undefined) {
      modelDict[actorName] = modelDictByPath[modelPath]
      resolve()
    }
    global.colladaLoader.load(modelPath, (collada) => {colladaOnLoad(collada, actorName, modelPath, resolve, modelNumDict[actorName])}, (collada) => {colladaOnProgress(collada, actorName)}, (error) => {colladaOnError(error, actorName, modelPath, resolve)})
  })
}



let loadedTextures = 0
const colladaOnLoad = function (collada, actorName, modelPath, resolve, modelNum) {
	// General logic for when the collada file is loaded.
	// This includes model manipulation in order to serve our purposes.
	colladaModel = collada.scene
  // This is only needed on the old version of ModelExporter:
	//global.GeneralModelTools.bakeSkeleton(colladaModel)

	let colladaMeshArray = []
	colladaModel.traverse((item) => {
		if (item.isMesh) {

      item.material.transparent = true
      item.material.alphaTest = 0.5

      // Lets get the extra model data loaded
      let extraModelRawData = fs.readFileSync(modelPath.replace(".dae", ".json"))
      let extraModelData = JSON.parse(extraModelRawData)
      let materialName = item.name.split("_").slice(item.name.split("_").lastIndexOf("Mt"), item.name.split("_").length).join("_")
      if (materialName in extraModelData["Materials"]) {
        let mskTexPath = modelPath.split("/").slice(0, modelPath.split("/").length - 1).join("/") + "/" + extraModelData["Materials"][materialName]["MskTex"] + ".png"
        if (fs.existsSync(mskTexPath)) {
          console.error(materialName)
          console.error(mskTexPath)
          item.material.alphaMap = new global.THREE.TextureLoader().load(mskTexPath)
          item.material.alphaMap.wrapS = global.THREE.RepeatWrapping
          item.material.alphaMap.wrapT = global.THREE.RepeatWrapping

          item.material.alphaTest = 0.5
          
          item.material.side = global.THREE.DoubleSide
        }
      }

			// We get the geometry and the material
			let colladaGeometry = item.geometry

			let colladaMaterial = item.material

      let diffuseMap = colladaMaterial.map
      let normalMap = colladaMaterial.normalMap
      let envMap = colladaMaterial.envMap
      let alphaMap = colladaMaterial.alphaMap
      let aoMap = colladaMaterial.aoMap
      let bumpMap = colladaMaterial.bumpMap
      let displacementMap = colladaMaterial.displacementMap
      let emissiveMap = colladaMaterial.emissiveMap
      let lightMap = colladaMaterial.lightMap
      let metalnessMap = colladaMaterial.metalnessMap
      let roughnessMap = colladaMaterial.roughnessMap
      if (loadedTextures > TEXTURE_CAP) {
        if (diffuseMap !== null) {
          diffuseMap.dispose()
          colladaMaterial.map = null
        }
        if (normalMap !== null) {
          normalMap.dispose()
          colladaMaterial.normalMap = null
        }
        if (envMap !== null) {
          envMap.dispose()
          colladaMaterial.envMap = null
        }
        if (alphaMap !== null) {
          alphaMap.dispose()
          colladaMaterial.alphaMap = null
        }
        if (aoMap !== null) {
          aoMap.dispose()
          colladaMaterial.aoMap = null
        }
        if (bumpMap !== null) {
          bumpMap.dispose()
          colladaMaterial.bumpMap = null
        }
        if (displacementMap !== null) {
          displacementMap.dispose()
          colladaMaterial.displacementMap = null
        }
        if (emissiveMap !== null) {
          emissiveMap.dispose()
          colladaMaterial.emissiveMap = null
        }
        if (lightMap !== null) {
          lightMap.dispose()
          colladaMaterial.lightMap = null
        }
        if (metalnessMap !== undefined) {
          metalnessMap.dispose()
          colladaMaterial.metalnessMap = null
        }
        if (roughnessMap !== undefined) {
          roughnessMap.dispose()
          colladaMaterial.roughnessMap = null
        }
      }
      else {
        if (diffuseMap !== null) {
          loadedTextures = loadedTextures + 1

          diffuseMap.minFilter = global.THREE.LinearFilter
        }
        if (normalMap !== null) {
          loadedTextures = loadedTextures + 1

          normalMap.minFilter = global.THREE.LinearFilter
        }
        if (envMap !== null) {
          loadedTextures = loadedTextures + 1

          envMap.minFilter = global.THREE.LinearFilter
        }
        if (alphaMap !== null) {
          loadedTextures = loadedTextures + 1

          alphaMap.minFilter = global.THREE.LinearFilter
        }
        if (aoMap !== null) {
          loadedTextures = loadedTextures + 1

          aoMap.minFilter = global.THREE.LinearFilter
        }
        if (bumpMap !== null) {
          loadedTextures = loadedTextures + 1

          bumpMap.minFilter = global.THREE.LinearFilter
        }
        if (displacementMap !== null) {
          loadedTextures = loadedTextures + 1

          displacementMap.minFilter = global.THREE.LinearFilter
        }
        if (emissiveMap !== null) {
          loadedTextures = loadedTextures + 1

          emissiveMap.minFilter = global.THREE.LinearFilter
        }
        if (lightMap !== null) {
          loadedTextures = loadedTextures + 1

          lightMap.minFilter = global.THREE.LinearFilter
        }
        if (metalnessMap !== undefined) {
          loadedTextures = loadedTextures + 1

          metalnessMap.minFilter = global.THREE.LinearFilter
        }
        if (roughnessMap !== undefined) {
          loadedTextures = loadedTextures + 1

          roughnessMap.minFilter = global.THREE.LinearFilter
        }
      }


			let colladaInstancedMesh = new THREE.InstancedMesh(colladaGeometry, colladaMaterial, modelNum + 999)
			colladaInstancedMesh.userData.actorList = []

			// Set the count to 0 for logic later:
			colladaInstancedMesh.count = 0

			colladaMeshArray.push(colladaInstancedMesh)
		}
	})



	// We send this out like so:
	modelDict[actorName] = colladaMeshArray

  // For optimiation purposes:
  modelDictByPath[modelPath] = colladaMeshArray

	resolve()
}

const colladaOnProgress = function (collada, actorName) {
	console.log(`progress for ${actorName}`)
}

const colladaOnError = function (error, actorName, modelPath, resolve) {
	console.log(`error for ${actorName} when loading models.`)
	console.error(error)
  console.error(modelPath)
  console.error(actorName)
	resolve()
}





// Function to apply cached models by extracted sbfres path:
const loadNewCachedModels = function(modelsPath, callback) {
  let modelPaths = []
  fs.readdir(modelsPath, (err, files) => {
    for (const file of files) {
      // Check if the file extension is dae.
      const fileNameArray = file.split(".")
      if (fileNameArray[1] === "dae") {
        // If so, add it to modelPaths
        modelPaths.push(path.join(modelsPath, file))
      }
    }
    for (const [actorName, modelPath] of Object.entries(mostRecentModelPathDict)) {
      for (const listedModelPath of modelPaths) {
        if (path.resolve(modelPath) === path.resolve(listedModelPath)) {
          loadModel(actorName, modelPath).then(() => {
            for (const model of modelDict[actorName]) {
              global.scene.add(model)
              global.RayCastTools.intersectables.push(model)
            }
            callback(actorName)
          })
        }
      }
    }
  })
}





















module.exports = {
  setupBasicMeshModels: setupBasicMeshModels,
  loadGameModelsBySection: loadGameModelsBySection,
  loadGameModelsByDungeon: loadGameModelsByDungeon,
  loadNewCachedModels: loadNewCachedModels,

  modelDict: modelDict,
  modelDictByPath: modelDictByPath,
  basicMeshDict: basicMeshDict
}
