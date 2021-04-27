const SelectionTools = require("./SelectionTools.js")
const DataEditorTools = require("./DataEditorTools.js")

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
						console.error(selectedObject)
						if (selectedObject !== undefined) {
							SelectionTools.selectObject(selectedObject.object, selectedObject.instanceId, transformControl, THREE)

							DataEditorTools.addActorToSelectedActorsList(selectedObject.object.userData.actorList[selectedObject.instanceId], document)
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
							SelectionTools.deselectObject(selectedObject.object, selectedObject.instanceId, transformControl, THREE)

							DataEditorTools.removeActorFromSelectedActorsList(selectedObject.object.userData.actorList[selectedObject.instanceId], document)
						}
						// Otherwise, deselect everything:
						else {
							SelectionTools.deselectAll(transformControl, THREE)

							DataEditorTools.removeAllActorsFromSelectedActorsList(document)
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
			//console.error("i")

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
				//console.error("hi")
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
				//console.error("hi")
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
				//console.error("hi")
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}
					//console.error("Couldn't find next parent.")

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
				//console.error("hi")
					if (transformControlsPass) {
						return
					}
					if (foundTransformBreak) {
						throw breakException
					}
					if (foundTransformReturn) {
						return
					}

					//console.error("Couldn't find next parent.")

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
		selectedObject = unconfirmedSelectedObject
		if (selectedObject.object.parent.type == "Group") {
			return(selectedObject)
			transformControlAttached = true
			showActorData(selectedObject.object.parent.HashID, selectedObject.parent.Type)
		} else {
			if (selectedObject.object.relevantType == "ControlPoint" || selectedObject.relevantType == "RailPoint") {
				return(selectedObject)
				transformControlAttached = true
				showRailData(selectedObject.object.CorrespondingRailHashID)
			}
			else {
				return(selectedObject)
				transformControlAttached = true
				showActorData(selectedObject.object.HashID, selectedObject.object.Type)
			}
		}
	}
	console.warn(unconfirmedSelectedObject)
}






module.exports = {
	intersectables: intersectables,
	initRaycaster: initRaycaster
}
