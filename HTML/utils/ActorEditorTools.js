const ActorTools = require("./ActorTools.js")
const RailTools = require("./RailTools.js")
const RailHelperTools = require("./RailHelperTools.js")
const RayCastTools = require("./RayCastTools.js")
const SelectionTools = require("./SelectionTools.js")
const LinkTools = require("./LinkTools.js")

const ipc = require("electron").ipcRenderer
const initActorEditorTools = async function (sectionData) {
	ipc.on("fromActorEditor", async (event, message, HashId, type, isEditingRail) => {
		for (const [index, actor] of sectionData.Static.Objs.entries()) {
			if (actor.HashId.value == HashId) {
				// Set the actor data to the returned data:
				Object.assign(sectionData.Static.Objs[index], message)
				ActorTools.reloadObjectActor(actor)
				// A reminder that only static actors can be linked.
				LinkTools.storeLink(actor)
				LinkTools.reloadRelevantLinkObjects(actor)
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
		for (const [index, rail] of sectionData.Static.Rails.entries()) {
			if (rail.HashId.value === HashId) {
				// Set the rail data to the returned data:
				Object.assign(sectionData.Static.Rails[index], message)



				for (const helper of global.scene.children) {
					if (helper.CorrespondingRailHashID === HashId) {
						await SelectionTools.deselectObjectByDummy(helper, global.transformControl, global.THREE)
					}
				}


				await SelectionTools.deselectAll(global.transformControl, global.THREE)
				await RailTools.reloadRail(HashId, global.sectionData, global.scene)
				if (rail.RailType.value === "Bezier") {
					await RailHelperTools.reloadControlPointHelpersByRailHashID(HashId, global.scene, global.sectionData, RayCastTools.intersectables)
				}
				await RailHelperTools.reloadRailPointHelpersByRailHashID(HashId, global.scene, global.sectionData, RayCastTools.intersectables)

				return
			}
		}


	})
}









module.exports = {
	initActorEditorTools: initActorEditorTools
}
