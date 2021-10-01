

const initTransformControlListeners = async function (transformControl) {
	initDraggingChanged(transformControl)
}


async function initDraggingChanged(transformControl) {
	transformControl.addEventListener("dragging-changed", function(event) {
		global.SelectionTools.updateSelectedObjs()

		for (const dummy of global.SelectionTools.selectedDummys) {
			if (!(dummy.userData.relevantType === "RailPoint" || dummy.userData.relevantType === "ControlPoint" || dummy.type === "Line")) {
				global.ActorTools.updateDataActor(dummy)
				global.LinkTools.reloadRelevantLinkObjects(dummy.userData.actor)
				
				
				if (global.computeLODs) {
					global.LODTools.applyTransformToLODPair(dummy.userData.actor)
				}
				else {
					// Make sure that the LOD data and linked LOD object are updated properly
					// We only do this when LODs aren't being calculated because that's when the user should be able to move actors separately
					global.LODTools.updateActorLODData(dummy.userData.actor) 
				}
			}
			else {
				if (dummy.userData.relevantType == "RailPoint") {
					let rail = global.RailHelperTools.getRailFromRailBit(dummy.userData.railPoint)
					let railPoint = dummy.userData.railPoint
					let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
					railPoint.Translate[0].value = pos.x
					railPoint.Translate[1].value = pos.y
					railPoint.Translate[2].value = pos.z
	
	
					global.RailTools.reloadRail(rail)
					global.RailHelperTools.reloadRailHelpers(rail, true)
				}
				else if (dummy.userData.relevantType == "ControlPoint") {
					let rail = global.RailHelperTools.getRailFromRailBit(dummy.userData.controlPoint)
					let controlPoint = dummy.userData.controlPoint
					let railPoint = global.RailHelperTools.controlPointRailPointMap.get(controlPoint)
					let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
	
					controlPoint[0].value = pos.x - railPoint.Translate[0].value
					controlPoint[1].value = pos.y - railPoint.Translate[1].value
					controlPoint[2].value = pos.z - railPoint.Translate[2].value
	
					global.RailTools.reloadRail(rail)
					global.RailHelperTools.reloadRailHelpers(rail)
				}
			}
		}
	})
}

const onTransformControlDrag = async function (transformControl) {
	global.SelectionTools.updateSelectedObjs()

	for (const dummy of global.SelectionTools.selectedDummys) {
		if (!(dummy.userData.relevantType === "RailPoint" || dummy.userData.relevantType === "ControlPoint" || dummy.type === "Line")) {
			global.ActorTools.updateDataActor(dummy)
			global.LinkTools.reloadRelevantLinkObjects(dummy.userData.actor)
			
			if (global.computeLODs) {
				global.LODTools.applyTransformToLODPair(dummy.userData.actor)
			}
			else {
				// Make sure that the LOD data and linked LOD object are updated properly
				// We only do this when LODs aren't being calculated because that's when the user should be able to move actors separately
				global.LODTools.updateActorLODData(dummy.userData.actor) 
			}
		}
		else {
			if (dummy.userData.relevantType == "RailPoint") {
				let rail = global.RailHelperTools.getRailFromRailBit(dummy.userData.railPoint)
				let railPoint = dummy.userData.railPoint
				let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
				railPoint.Translate[0].value = pos.x
				railPoint.Translate[1].value = pos.y
				railPoint.Translate[2].value = pos.z


				global.RailTools.reloadRail(rail)
				global.RailHelperTools.reloadRailHelpers(rail, true)
			}
			else if (dummy.userData.relevantType == "ControlPoint") {
				let rail = global.RailHelperTools.getRailFromRailBit(dummy.userData.controlPoint)
				let controlPoint = dummy.userData.controlPoint
				let railPoint = global.RailHelperTools.controlPointRailPointMap.get(controlPoint)
				let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)

				controlPoint[0].value = pos.x - railPoint.Translate[0].value
				controlPoint[1].value = pos.y - railPoint.Translate[1].value
				controlPoint[2].value = pos.z - railPoint.Translate[2].value

				global.RailTools.reloadRail(rail)
				global.RailHelperTools.reloadRailHelpers(rail)
			}
		}
	}

}

module.exports = {
	initTransformControlListeners: initTransformControlListeners,

	onTransformControlDrag: onTransformControlDrag
}
