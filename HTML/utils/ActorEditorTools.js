
const ipc = require("electron").ipcRenderer
const initActorEditorTools = async function (sectionData) {
	ipc.on("fromActorEditor", async (event, message, HashId, type, isEditingRail) => {
		for (const [index, actor] of sectionData.Static.Objs.entries()) {
			if (actor.HashId.value == HashId) {
				// Set the actor data to the returned data:
				Object.assign(sectionData.Static.Objs[index], message)
				global.ActorTools.reloadObjectActor(actor)
				// A reminder that only static actors can be linked.
				global.LinkTools.storeLink(actor)
				global.LinkTools.reloadRelevantLinkObjects(actor)
				return
			}
		}
		for (const [index, actor] of sectionData.Dynamic.Objs.entries()) {
			if (actor.HashId.value == HashId) {
				// Set the actor data to the returned data:
				Object.assign(sectionData.Dynamic.Objs[index], message)
				global.ActorTools.reloadObjectActor(actor)
				return
			}
		}
		for (const [index, rail] of sectionData.Static.Rails.entries()) {
			if (rail.HashId.value === HashId) {

				for (const helper of global.scene.children) {
					if (helper.CorrespondingRailHashID === HashId) {
						await global.SelectionTools.deselectObjectByDummy(helper)
					}
				}
				await global.SelectionTools.deselectAll(global.transformControl)

				await global.RailHelperTools.removeRailHelpers(rail)

				// Set the rail data to the returned data:
				await Object.assign(sectionData.Static.Rails[index], message)

				await global.RailHelperTools.generateRailHelpers(rail)

				


				
				await global.RailTools.reloadRail(rail)
				

				return
			}
		}


	})
}









module.exports = {
	initActorEditorTools: initActorEditorTools
}
