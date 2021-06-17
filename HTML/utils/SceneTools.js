// Requires
// -----------------------------------------------------------------------------
const RayCastTools = require("./RayCastTools.js")
const ModelTools = require("./ModelTools.js")
const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")


const addActorsToScene = async function() {
let sectionData = global.sectionData
let intersectables = RayCastTools.intersectables
	//return ModelTools.loadModels(global.sectionData, global.BufferGeometryUtils, global.colladaLoader, global.sectionName, THREE).then(() => {
	return ModelTools.loadGameModelsBySection(global.sectionName).then(() => {
	//return ModelTools.setupBasicMeshModels().then(() => {
		addInstancedMeshes()
		sectionData.Static.Objs.forEach((actor) => {
			ActorTools.setupObjectActor(actor).then((actorModelData) => {
				if (actorModelData !== undefined) {
					[instancedMeshes, index] = actorModelData

				}
			})
		})
		sectionData.Dynamic.Objs.forEach((actor) => {
			ActorTools.setupObjectActor(actor).then((actorModelData) => {
				if (actorModelData !== undefined) {
					[instancedMeshes, index] = actorModelData

				}
			})
		})
	})
}




async function addInstancedMeshes () {
	for (let key in ModelTools.modelDict) {
		console.error(key)

		for (actorModel of ModelTools.modelDict[key]) {
			RayCastTools.intersectables.push(actorModel)
			global.scene.add(actorModel)
		}
	}
	for (let key in ModelTools.basicMeshDict) {
		RayCastTools.intersectables.push(ModelTools.basicMeshDict[key][0])
		global.scene.add(ModelTools.basicMeshDict[key][0])
	}
}



module.exports = {
	addActorsToScene: addActorsToScene
}
