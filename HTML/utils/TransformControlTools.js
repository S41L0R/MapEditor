const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")
const RailTools = require("./RailTools.js")
const RailHelperTools = require("./RailHelperTools.js")
const RayCastTools = require("./RayCastTools.js")


const initTransformControlListeners = async function (transformControl) {
	initDraggingChanged(transformControl)
}


async function initDraggingChanged(transformControl) {
	transformControl.addEventListener("dragging-changed", async function(event) {
		console.warn("HI")

		for (const selectedObject of SelectionTools.selectedDummys) {

			if (selectedObject.type === "Points") {
				if (selectedObject.relevantType === "RailPoint") {
					for (const rail of global.sectionData.Static.Rails) {
						const pos = new global.THREE.Vector3().setFromMatrixPosition(selectedObject.matrixWorld)
						if (rail.HashId.value === selectedObject.CorrespondingRailHashID) {
							rail.RailPoints[selectedObject.railPointIndex].Translate[0].value = pos.x
							rail.RailPoints[selectedObject.railPointIndex].Translate[1].value = pos.y
							rail.RailPoints[selectedObject.railPointIndex].Translate[2].value = pos.z
							RailTools.reloadRail(selectedObject.CorrespondingRailHashID, global.sectionData, global.scene, RayCastTools.intersectables)
							RailHelperTools.reloadControlPointHelpersByRailHashID(selectedObject.CorrespondingRailHashID, global.scene, global.sectionData, RayCastTools.intersectables)
						}
					}
				}
				else if (selectedObject.relevantType === "ControlPoint") {
					for (const rail of global.sectionData.Static.Rails) {
						if (rail.HashId.value === selectedObject.CorrespondingRailHashID) {
							const pos = new global.THREE.Vector3().setFromMatrixPosition(selectedObject.matrixWorld)
							RailTools.setControlPointPos(rail, selectedObject.railPointIndex, selectedObject.controlPointIndex, pos)
							RailTools.reloadRail(selectedObject.CorrespondingRailHashID, global.sectionData, global.scene, RayCastTools.intersectables)
							// We also gotta calc NextDistance and PrevDistance for proper game function:
							RailTools.reloadNextAndPrevDistance(rail)
						}
					}
				}
			}
		}
	})
}

const onTransformControlDrag = async function (transformControl) {
	SelectionTools.updateSelectedObjs()

	let groupSelector = transformControl.object
	for (dummy of groupSelector.children) {
		if (!(dummy.relevantType === "RailPoint" || dummy.relevantType === "ControlPoint")) {
			ActorTools.updateDataActor(dummy)
		}

		else {


			if (dummy.relevantType == "RailPoint") {
				for (const rail of sectionData.Static.Rails) {
					if (rail.HashId.value == dummy.CorrespondingRailHashID) {
						let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
						rail.RailPoints[dummy.railPointIndex].Translate[0].value = pos.x
						rail.RailPoints[dummy.railPointIndex].Translate[1].value = pos.y
						rail.RailPoints[dummy.railPointIndex].Translate[2].value = pos.z





						RailTools.reloadRail(dummy.CorrespondingRailHashID, sectionData, scene, RayCastTools.intersectables)
						if (rail.RailType === "Bezier") {
							RailHelperTools.reloadControlPointHelpersByRailHashID(dummy.CorrespondingRailHashID, scene, sectionData, RayCastTools.intersectables)
						}
					}
				}
			}
			else if (dummy.relevantType == "ControlPoint") {
				for (const rail of sectionData.Static.Rails) {
					if (rail.HashId.value == dummy.CorrespondingRailHashID) {
						let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
						RailTools.setControlPointPos(rail, dummy.railPointIndex, dummy.controlPointIndex, pos)
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][0].value = selectedObject.position.x;
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][1].value = selectedObject.position.y;
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][2].value = selectedObject.position.z;
						RailTools.reloadRail(dummy.CorrespondingRailHashID, sectionData, scene, RayCastTools.intersectables)

					}
				}
			}
		}
	}

}

module.exports = {
	initTransformControlListeners: initTransformControlListeners,

	onTransformControlDrag: onTransformControlDrag
}
