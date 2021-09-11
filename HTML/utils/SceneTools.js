const fs = require('fs')

const addActorsToScene = async function() {
let sectionData = global.sectionData
let intersectables = global.RayCastTools.intersectables
	return global.ModelTools.loadGameModelsBySection(global.sectionName).then(() => {
		addInstancedMeshes()
		sectionData.Static.Objs.forEach((actor) => {
			global.ActorTools.setupObjectActor(actor).then((actorModelData) => {
				if (actorModelData !== undefined) {
					[instancedMeshes, index] = actorModelData

				}
			})
		})
		sectionData.Dynamic.Objs.forEach((actor) => {
			global.ActorTools.setupObjectActor(actor).then((actorModelData) => {
				if (actorModelData !== undefined) {
					[instancedMeshes, index] = actorModelData

				}
			})
		})
	})
}

const addActorsToSceneDungeon = async function() {
	let sectionData = global.sectionData
	let intersectables = global.RayCastTools.intersectables
		return global.ModelTools.loadGameModelsByDungeon(global.sectionName).then(() => {
			// Add the dungeon base model
			global.PythonTools.loadPython("dungeonGetBaseModelPath", sectionName).then((modelPath) => {
				global.colladaLoader.load(modelPath, (collada) => {
					
					let colladaModel = collada.scene

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
							item.material.transparent = true
							item.material.alphaTest = 0.5
						}
					})

					global.scene.add(colladaModel)

				})
			})
			addInstancedMeshes()
			sectionData.Static.Objs.forEach((actor) => {
				global.ActorTools.setupObjectActor(actor).then((actorModelData) => {
					if (actorModelData !== undefined) {
						[instancedMeshes, index] = actorModelData
	
					}
				})
			})
			sectionData.Dynamic.Objs.forEach((actor) => {
				global.ActorTools.setupObjectActor(actor).then((actorModelData) => {
					if (actorModelData !== undefined) {
						[instancedMeshes, index] = actorModelData
	
					}
				})
			})
		})
	}




async function addInstancedMeshes () {
	for (let key in global.ModelTools.modelDict) {
		for (actorModel of global.ModelTools.modelDict[key]) {
			global.RayCastTools.intersectables.push(actorModel)
			global.scene.add(actorModel)
		}
	}
	for (let key in global.ModelTools.basicMeshDict) {
		global.RayCastTools.intersectables.push(global.ModelTools.basicMeshDict[key][0])
		global.scene.add(global.ModelTools.basicMeshDict[key][0])
	}
}



module.exports = {
	addActorsToScene: addActorsToScene,
	addActorsToSceneDungeon: addActorsToSceneDungeon
}
