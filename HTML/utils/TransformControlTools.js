

const initTransformControlListeners = async function (transformControl) {
	initDraggingChanged(transformControl)
}


async function initDraggingChanged(transformControl) {
	transformControl.addEventListener("dragging-changed", async function(event) {
		console.warn("HI")

		for (const selectedObject of global.SelectionTools.selectedDummys) {

			if (selectedObject.type === "Points") {
				if (selectedObject.relevantType === "RailPoint") {
					for (const rail of global.sectionData.Static.Rails) {
						const pos = new global.THREE.Vector3()
						const rot = new global.THREE.Euler(0, 0, 0, "ZYX")
						// We just have scale for fun
						const scale = new global.THREE.Vector3()
						selectedObject.matrixWorld.decompose(pos, rot, scale)
						if (rail.HashId.value === selectedObject.CorrespondingRailHashID) {
							rail.RailPoints[selectedObject.railPointIndex].Translate[0].value = pos.x
							rail.RailPoints[selectedObject.railPointIndex].Translate[1].value = pos.y
							rail.RailPoints[selectedObject.railPointIndex].Translate[2].value = pos.z

							if ("Rotate" in rail.RailPoints[selectedObject.railPointIndex]) {
								// We ensure it's 3D rotation:
								if (Array.isArray(rail.RailPoints[selectedObject.railPointIndex])) {
									rail.RailPoints[selectedObject.railPointIndex].Rotate[0].value = rot.x
									rail.RailPoints[selectedObject.railPointIndex].Rotate[1].value = rot.y
									rail.RailPoints[selectedObject.railPointIndex].Rotate[2].value = rot.z
								}
								else {
									rail.RailPoints[selectedObject.railPointIndex].Rotate = [
										{
											"type": 300,
											"value": rot.x
										},
										{
											"type": 300,
											"value": rot.y
										},
										{
											"type": 300,
											"value": rot.z
										}
									]
								}
							}
							global.RailTools.reloadRail(selectedObject.CorrespondingRailHashID, global.sectionData, global.scene, global.RayCastTools.intersectables)
							if (rail.RailType.value === "Bezier") {
								global.RailHelperTools.reloadControlPointHelpersByRailHashID(selectedObject.CorrespondingRailHashID, global.scene, global.sectionData, global.RayCastTools.intersectables)
							}
							// We also gotta calc NextDistance and PrevDistance for proper game function:
							global.RailTools.reloadNextAndPrevDistance(rail)
						}
					}
				}
				else if (selectedObject.relevantType === "ControlPoint") {
					for (const rail of global.sectionData.Static.Rails) {
						if (rail.HashId.value === selectedObject.CorrespondingRailHashID) {
							const pos = new global.THREE.Vector3().setFromMatrixPosition(selectedObject.matrixWorld)
							global.RailTools.setControlPointPos(rail, selectedObject.railPointIndex, selectedObject.controlPointIndex, pos)
							global.RailTools.reloadRail(selectedObject.CorrespondingRailHashID, global.sectionData, global.scene, global.RayCastTools.intersectables)
						}
					}
				}
			}
		}
	})
}

const onTransformControlDrag = async function (transformControl) {
	global.SelectionTools.updateSelectedObjs()

	let groupSelector = transformControl.object
	for (const dummy of groupSelector.children) {
		if (!(dummy.relevantType === "RailPoint" || dummy.relevantType === "ControlPoint" || dummy.type === "Line")) {
			console.warn(dummy)
			global.ActorTools.updateDataActor(dummy)
			global.LinkTools.reloadRelevantLinkObjects(dummy.userData.actor)
			// Make sure that the LOD data and linked LOD object are updated properly
			global.LODTools.updateActorLODData(dummy.userData.actor)
			
			if (global.computeLODs) {
				global.LODTools.applyTransformToLODPair(dummy.userData.actor)
			}
		}

		else {


			if (dummy.relevantType == "RailPoint") {
				for (const rail of sectionData.Static.Rails) {
					if (rail.HashId.value == dummy.CorrespondingRailHashID) {
						let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
						rail.RailPoints[dummy.railPointIndex].Translate[0].value = pos.x
						rail.RailPoints[dummy.railPointIndex].Translate[1].value = pos.y
						rail.RailPoints[dummy.railPointIndex].Translate[2].value = pos.z





						global.RailTools.reloadRail(dummy.CorrespondingRailHashID, sectionData, scene, global.RayCastTools.intersectables)
						if (rail.RailType === "Bezier") {
							global.RailHelperTools.reloadControlPointHelpersByRailHashID(dummy.CorrespondingRailHashID, scene, sectionData, global.RayCastTools.intersectables)
						}
					}
				}
			}
			else if (dummy.relevantType == "ControlPoint") {
				for (const rail of sectionData.Static.Rails) {
					if (rail.HashId.value == dummy.CorrespondingRailHashID) {
						let pos = new global.THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
						global.RailTools.setControlPointPos(rail, dummy.railPointIndex, dummy.controlPointIndex, pos)
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][0].value = selectedObject.position.x;
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][1].value = selectedObject.position.y;
						//rail.RailPoints[selectedObject.railPointIndex].ControlPoints[selectedObject.controlPointIndex][2].value = selectedObject.position.z;
						global.RailTools.reloadRail(dummy.CorrespondingRailHashID, sectionData, scene, global.RayCastTools.intersectables)

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
