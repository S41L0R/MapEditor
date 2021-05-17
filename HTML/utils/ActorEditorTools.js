const ActorTools = require("./ActorTools.js")

const ipc = require("electron").ipcRenderer
const initActorEditorTools = async function (sectionData) {
	ipc.on("fromActorEditor", (event, message, HashId, type, isEditingRail) => {
		for (const [index, actor] of sectionData.Static.Objs.entries()) {
			if (actor.HashId.value == HashId) {
				// Set the actor data to the returned data:
				Object.assign(sectionData.Static.Objs[index], message)
				ActorTools.reloadObjectActor(actor)
				return
			}
		}
		for (const [index, actor] of sectionData.Dynamic.Objs.entries()) {
			if (actor.HashId.value == HashId) {
				// Set the actor data to the returned data:
				Object.assign(sectionData.Dynamic.Objs[index], message)
				ActorTools.reloadObjectActor(actor)
				return
			}
		}


	})
}









module.exports = {
	initActorEditorTools: initActorEditorTools
}
