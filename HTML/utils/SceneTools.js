

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
	addActorsToScene: addActorsToScene
}
