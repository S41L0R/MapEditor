
// TO DO:

// Set up this so that it's simpler. Instead of checking for transformControl
// we can just rely on the check if we're dragging transformControl.


let intersectables = []


let doObjectSelect = true

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = 1
const mouse = new THREE.Vector2()

const initRaycaster = async function (viewport, document, TransformControls, transformControl, camera) {
	console.warn("HI")
	document.addEventListener("mousemove", () => {
  	mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
	}, true)
	viewport.onpointerdown = (event) => {
		switch (event.pointerType) {
		case "mouse":
			// Primary (usually left) click:
			if (event.buttons === 1) {
				// Then we want to select something
				if (!transformControl.dragging) {
					if (doObjectSelect) {
						let selectedObject = raycast(TransformControls, camera)
						if (selectedObject !== undefined) {
							if (selectedObject.object.relevantType !== "RailPoint" && selectedObject.object.relevantType !== "ControlPoint") {
								global.SelectionTools.selectObject(selectedObject.object, selectedObject.instanceId, transformControl, THREE)

								global.DataEditorTools.addActorToSelectedActorsList(selectedObject.object.userData.actorList[selectedObject.instanceId], document)

								// Just in case we're selecting an LOD or an actor with an LOD:
								relatedLODActor = global.LODTools.getLODRelatedActor(selectedObject.object.userData.actorList[selectedObject.instanceId])
								if (relatedLODActor !== undefined) {
									global.DataEditorTools.addActorToSelectedActorsList(relatedLODActor, document)
								}
							}
							else {
								global.SelectionTools.selectRail(selectedObject.object)

								// Okay, so now what we want to do is set things up so that the rail appears in the selected items list.

								// First thing that we'll need to do right now is find the actual rail.
								for (const rail of global.sectionData.Static.Rails) {
									if (rail.HashId.value === selectedObject.object.CorrespondingRailHashID) {
										global.DataEditorTools.addActorToSelectedActorsList(rail, global.document) // Yes, I know that this is currently called "AddActorToSelectedActorsList". Maybe later we can split actor and rail lists?
									}
								}
							}
						}
					}
				}
			}
			// Auxiliary (usually middle) click:
			if (event.buttons === 4) {
				// Then we want to deselect something/everything dependong on whether we have intersects:

				if (!transformControl.dragging) {
					if (doObjectSelect) {
						let selectedObject = raycast(TransformControls, camera)

						// If we clicked something, deselect just it:
						if (selectedObject !== undefined) {
							global.SelectionTools.deselectObject(selectedObject.object, selectedObject.instanceId, transformControl, THREE)

							global.DataEditorTools.removeActorFromSelectedActorsList(selectedObject.object.userData.actorList[selectedObject.instanceId], document)

							relatedLODActor = global.LODTools.getLODRelatedActor(selectedObject.object.userData.actorList[selectedObject.instanceId])
							if (relatedLODActor !== undefined) {
								global.DataEditorTools.removeActorFromSelectedActorsList(relatedLODActor, document)
							}
						}
						// Otherwise, deselect everything:
						else {
							global.SelectionTools.deselectAll(transformControl, THREE)

							global.DataEditorTools.removeAllActorsFromSelectedActorsList(document)
						}
					}
				}
			}
		}
	}
}
function raycast (TransformControls, camera) {
	console.warn("HELLO")
	let action
	let breakException = {}
	raycaster.setFromCamera(mouse, camera)
	const intersects = raycaster.intersectObjects(intersectables)
	console.warn(intersectables)
	console.warn(intersects)
	let transformControlsPass = false
	let unconfirmedSelectedObject = null
	if (intersects.length > 0) {
		intersects.forEach((intersect, i) => {

			//Check if the object is even visible. This is really important as we don't want the user to select stuff they can't even see.
			if (intersect.object.visible) {

				let foundTransformBreak = false
				let foundTransformReturn = false

				try {
					if (intersect.object instanceof TransformControls) {
						if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
							if (unconfirmedSelectedObject != null) {
								//Workaround to break from the forEach.
								foundTransformBreak = true
								throw breakException
							}
							//Workaround to get past the catch statement
							foundTransformReturn = true
							return
						}

						unconfirmedSelectedObject = null

						//Workaround to break from the forEach.
						foundTransformBreak = true
						throw breakException

				    }
				}
				catch {
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}
					console.error("This shouldn't be here...")
					// I guess I'll add the object as the intersect anyway...


					//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
					unconfirmedSelectedObject = intersect
					transformControlsPass = true
					return
				}
				try {
					if (intersect.object.parent instanceof TransformControls) {
						if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
							if (unconfirmedSelectedObject != null) {
								//Workaround to break from the forEach.
								foundTransformBreak = true
								throw breakException
							}
							//Workaround to get past the catch statement
							foundTransformReturn = true
							return
						}

						unconfirmedSelectedObject = null

						//Workaround to break from the forEach.
						foundTransformBreak = true
						throw breakException

					}
				}
				catch {
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}
					console.error("Couldn't find object parent... this shouldn't be here, unless you're selecting the scene.")

					//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
					unconfirmedSelectedObject = intersect
					transformControlsPass = true
					return

				}
				try {
					if (intersect.object.parent.parent instanceof TransformControls) {

						if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
							if (unconfirmedSelectedObject != null) {
								//Workaround to break from the forEach.
								foundTransformBreak = true
								throw breakException
							}
							//Workaround to get past the catch statement
							foundTransformReturn = true
							return
						}

						unconfirmedSelectedObject = null

						//Workaround to break from the forEach.
						foundTransformBreak = true
						throw breakException
					}
				}
				catch {
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}

					//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
					unconfirmedSelectedObject = intersect
					transformControlsPass = true
					return

				}
				try {
					if (intersect.object.parent.parent.parent instanceof TransformControls) {
						if (intersect.object.name == "XZ" || intersect.object.name == "XY" || intersect.object.name == "YZ" || intersect.object.type == "TransformControlsPlane" || transformControlAttached == false) {
							if (unconfirmedSelectedObject != null) {
								//Workaround to break from the forEach.
								foundTransformBreak = true
								throw breakException
							}
							//Workaround to get past the catch statement
							foundTransformReturn = true
							return
						}

						unconfirmedSelectedObject = null

						//Workaround to break from the forEach.
						foundTransformBreak = true
						throw breakException

					}
				}
				catch {
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}


					//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
					unconfirmedSelectedObject = intersect
					transformControlsPass = true
					return

				}
				if (transformControlsPass) {
					return
				}

				console.warn("Object has too many parents, but that's fine.")

				//Start a search for transformControls pass - this is for if transformControls isn't the first element in the raycast result.
				unconfirmedSelectedObject = intersect
				transformControlsPass = true
				return
			}
		})
	}
	if (unconfirmedSelectedObject != null) {
		let selectedObject = unconfirmedSelectedObject
		if (selectedObject.object.parent.type == "Group") {
			return(selectedObject)
			//transformControlAttached = true
			//showActorData(selectedObject.object.parent.HashID, selectedObject.parent.Type)
		} else {
			if (selectedObject.object.relevantType === "ControlPoint" || selectedObject.relevantType === "RailPoint") {
				return(selectedObject)
				//transformControlAttached = true
				//showRailData(selectedObject.object.CorrespondingRailHashID)
			}
			else {
				return(selectedObject)
				//transformControlAttached = true
				//showActorData(selectedObject.object.HashID, selectedObject.object.Type)
			}
		}
	}
	console.warn(unconfirmedSelectedObject)
}






module.exports = {
	intersectables: intersectables,
	initRaycaster: initRaycaster
}
