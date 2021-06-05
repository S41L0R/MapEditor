// Get Friends
const GeneralRailTools = require("./GeneralRailTools.js");


let controlPointObjects = []
let railPointObjects = []
let railHelperObjects = []

const drawHelpers = async function(rail, scenelike, intersectables) {
	drawRailPointHelpers(rail, scenelike, intersectables);
	if (rail.RailType.value == "Bezier") {
		generateControlPointHelpers(rail, scenelike, intersectables);
	}
}

const removeControlPointHelpersByRailHashID = async function(hashID, scenelike, intersectables) {
	// We first loop through the scene:
	for (const item of scenelike.children) {
		// Then if it has the matching hashID we get rid of it:
		if (item.CorrespondingRailHashID == hashID) {
			if (item.relevantType == "ControlPoint") {
				item.geometry.dispose()
				item.material.dispose()
				scenelike.remove(item)
				intersectables.splice(intersectables.indexOf(item), 1)
				delete item;
				//renderer.renderLists.dispose();
			}
		}
	}
}


const reloadRailPointHelpersByRailHashID = async function(hashID, scenelike, maplike, intersectables) {
	let removeList = []
	for (item of scenelike.children) {
		if (item.CorrespondingRailHashID === hashID) {
			if (item.relevantType == "RailPoint") {
				item.geometry.dispose()
				item.material.dispose()
				removeList.push(item)
				intersectables.splice(intersectables.indexOf(item), 1)
			}
		}
	}
	for (const item of removeList) {
		scenelike.remove(item)
	}
	for (const rail of maplike.Static.Rails) {
		if (rail.HashId.value == hashID) {
			drawRailPointHelpers(rail, scenelike, intersectables)
		}
	}
}


const reloadControlPointHelpersByRailHashID = async function(hashID, scenelike, maplike, intersectables) {
	//removeControlPointHelpersByRailHashID(hashID, scenelike, intersectables);
	for (const rail of maplike.Static.Rails) {
		if (rail.HashId.value == hashID) {
			generateControlPointHelpers(rail, scenelike, intersectables);
		}
	}
}
async function drawRailPointHelpers(rail, scenelike, intersectables) {

	for ([index, railPoint] of rail.RailPoints.entries()) {

		// Set up the basic geometry:
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3));
		const material = new THREE.PointsMaterial(
			{
				size:10,
				sizeAttenuation: false,
				color: 0xffff00
			}
		);
		const helperObject = new THREE.Points(geometry, material);
		geometry.computeBoundingSphere();
		// Set up positions
		helperObject.position.x = railPoint.Translate[0].value;
		helperObject.position.y = railPoint.Translate[1].value;
		helperObject.position.z = railPoint.Translate[2].value;

		// Hack on a hashID in order to find the corresponding rail later:
		helperObject.CorrespondingRailHashID = rail.HashId.value;

		// And hack on a rail index in order to find the railPoint later:
		helperObject.railPointIndex = index;

		// Just hack on an identifying label:
		helperObject.relevantType = "RailPoint";

		// And add it to the scene
		scenelike.add(helperObject);

		// Add it to all the relevant helper lists
		railPointObjects.push(helperObject)
		railHelperObjects.push(helperObject)

		// And add it to our list of intersectable objects
		intersectables.push(helperObject);
	}
}

function moveControlPointHelper(object, controlPoint, rail, railPointIndex, controlPointIndex) {
	//console.warn(railPointIndex)
	if (controlPointIndex == 0) {
		if (rail.RailPoints[railPointIndex - 1] != undefined) {
			// Then this should be on a line between the previous railPoint and the current one
			// We'll get Vector3s representing the positions of points:
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex - 1].Translate[0].value, rail.RailPoints[railPointIndex - 1].Translate[1].value, rail.RailPoints[railPointIndex - 1].Translate[2].value);
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);
			let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);


			GeneralRailTools.getWorldSpaceControlPoints(point1, point2,  controlPoint1, 0).then((worldSpaceControlPointPositions) => {
				object.position.set(worldSpaceControlPointPositions[1].x, worldSpaceControlPointPositions[1].y, worldSpaceControlPointPositions[1].z);
			});
		}
		else if (rail.IsClosed.value == true) {
			// Then this should be on a line between the previous railPoint and the current one

			// We'll get Vector3s representing the positions of points:
			let point1 = new THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].Translate[0].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[1].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[2].value);
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);
			let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);




			GeneralRailTools.getWorldSpaceControlPoints(point1, point2,  controlPoint1, 0).then((worldSpaceControlPointPositions) => {

				//object.position = worldSpaceControlPointPositions[1];
				object.position.set(worldSpaceControlPointPositions[1].x, worldSpaceControlPointPositions[1].y, worldSpaceControlPointPositions[1].z);
			});
		}
	}
	else if (controlPointIndex == 1) {
		// Then this should be on a line between the current railPoint and the next one
		if (rail.RailPoints[railPointIndex + 1] != undefined) {
			// We'll get Vector3s representing the positions of points:
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex + 1].Translate[0].value, rail.RailPoints[railPointIndex + 1].Translate[1].value, rail.RailPoints[railPointIndex + 1].Translate[2].value);
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);
			let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);




			GeneralRailTools.getWorldSpaceControlPoints(point1, point2,  controlPoint1, 0).then((worldSpaceControlPointPositions) => {

				//object.position = worldSpaceControlPointPositions[1];
				object.position.set(worldSpaceControlPointPositions[1].x, worldSpaceControlPointPositions[1].y, worldSpaceControlPointPositions[1].z);
			});
		}
		else if (rail.IsClosed.value == true) {
			// We'll get Vector3s representing the positions of points:
			let point2 = new THREE.Vector3(rail.RailPoints[0].Translate[0].value, rail.RailPoints[0].Translate[1].value, rail.RailPoints[0].Translate[2].value);
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);
			let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);




			GeneralRailTools.getWorldSpaceControlPoints(point1, point2,  controlPoint1, 0).then((worldSpaceControlPointPositions) => {

				//object.position = worldSpaceControlPointPositions[1];
				object.position.set(worldSpaceControlPointPositions[1].x, worldSpaceControlPointPositions[1].y, worldSpaceControlPointPositions[1].z);
			});
		}
	}

}
function generateControlPointHelpers(rail, scenelike, intersectables) {

	// Okay, we'll just assume for a second that there's not an error elsewhere in the code, and that there aren't multiple instances of the same rail hashID
	//
	// We'll just loop through all the controlPoints, and look for relevant controlPoint helpers to see if they already exist.
	// If so, we can just move them.
	let controlPointsToIgnore = [];
	for (const [railPointIndex, railPoint] of rail.RailPoints.entries()) {
		for (const [controlPointIndex, controlPoint] of railPoint.ControlPoints.entries()) {
			for (const helper of controlPointObjects) {
				if (helper.CorrespondingRailHashID === rail.HashId.value) {
					if (helper.railPointIndex === railPointIndex) {
						if (helper.controlPointIndex === controlPointIndex) {
							// Of course, we want to make sure we don't move a controlPoint helper if it's already being moved by the user!
							// That would create a weird amplification effect.
							// Don't ask me why I know.
							if (!(helper.parent.userData.type === "GroupSelector")) {
								moveControlPointHelper(helper, controlPoint, rail, railPointIndex, controlPointIndex);
							}
							controlPointsToIgnore.push(controlPoint);
						}
					}
				}
			}
		}
	}

	// We'll loop through our railPoints
	for ([railPointIndex, railPoint] of rail.RailPoints.entries()) {
		if (railPoint.ControlPoints !== undefined) {
			// And our controlPoints (if they exist)
			for ([controlPointIndex, controlPoint] of railPoint.ControlPoints.entries()) {
				if (!(controlPointsToIgnore.includes(controlPoint))) {
					// Some logic stuff I can look over and comment about later:
					if (controlPointIndex == 0) {
						if (rail.RailPoints[railPointIndex - 1] != undefined) {
							// Then this should be on a line between the previous railPoint and the current one

							// We'll get Vector3s representing the positions of points:
							let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex - 1].Translate[0].value, rail.RailPoints[railPointIndex - 1].Translate[1].value, rail.RailPoints[railPointIndex - 1].Translate[2].value);
							let point2 = new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value);
							let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);

							drawControlPointHelpers(point1, point2, controlPoint1, railPointIndex, controlPointIndex, intersectables, scenelike, rail);
						}
						else if (rail.IsClosed.value == true) {
							// Then this should be on a line between the previous railPoint and the current one

							// We'll get Vector3s representing the positions of points:
							let point1 = new THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].Translate[0].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[1].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[2].value);
							let point2 = new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value);
							let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);

							drawControlPointHelpers(point1, point2, controlPoint1, railPointIndex, controlPointIndex, intersectables, scenelike, rail);
						}
					}
					else if (controlPointIndex == 1) {
						// Then this should be on a line between the current railPoint and the next one
						if (rail.RailPoints[railPointIndex + 1] != undefined) {
							// We'll get Vector3s representing the positions of points:
							let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex + 1].Translate[0].value, rail.RailPoints[railPointIndex + 1].Translate[1].value, rail.RailPoints[railPointIndex + 1].Translate[2].value);
							let point1 = new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value);
							let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);

							drawControlPointHelpers(point1, point2, controlPoint1, railPointIndex, controlPointIndex, intersectables, scenelike, rail);
						}
						else if (rail.IsClosed.value == true) {
							// We'll get Vector3s representing the positions of points:
							let point2 = new THREE.Vector3(rail.RailPoints[0].Translate[0].value, rail.RailPoints[0].Translate[1].value, rail.RailPoints[0].Translate[2].value);
							let point1 = new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value);
							let controlPoint1 = new THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value);

							drawControlPointHelpers(point1, point2, controlPoint1, railPointIndex, controlPointIndex, intersectables, scenelike, rail);
						}
					}
				}
			}
		}
	}
}

function drawControlPointHelpers(point1, point2, controlPoint1, railPointIndex, controlPointIndex, intersectables, scenelike, rail) {

	// Since we're doing controlPoints one at a time, we'll just feed 0 in for the second controlPoint:
	// (And make sure to pass in the indexes so we can remember where we were)
	GeneralRailTools.getWorldSpaceControlPoints(point1, point2,  controlPoint1, 0, [railPointIndex, controlPointIndex]).then((worldSpaceControlPointPositions) => {
		// Set up the basic geometry:
		const geometry = new THREE.BufferGeometry()
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3))
		const material = new THREE.PointsMaterial(
			{
				size:10,
				sizeAttenuation: false,
				color: 0x0000ff
			}
		);
		const helperObject = new THREE.Points(geometry, material)
		geometry.computeBoundingSphere()
		// Set up positions
		helperObject.position = worldSpaceControlPointPositions[1]

		// Hack on a hashID in order to find the corresponding rail later:
		helperObject.CorrespondingRailHashID = rail.HashId.value

		// And hack on a rail index in order to find the railPoint later:
		// (We passed in the railPointIndex, so we can just retreive it)
		helperObject.railPointIndex = worldSpaceControlPointPositions[4][0]

		// Plus a controlPoint index too:
		// (Again, retrieving the index)
		helperObject.controlPointIndex = worldSpaceControlPointPositions[4][1]

		// Just hack on an identifying label:
		helperObject.relevantType = "ControlPoint"

		// And add it to the scene
		scenelike.add(helperObject)

		// Add it to all relevant helper lists
		controlPointObjects.push(helperObject)
		railHelperObjects.push(helperObject)

		// And add it to our list of intersectable objects
		intersectables.push(helperObject)


		// And because there are two controlPoints per railPoint, we'll just do this again:
		helperObject.position.set(worldSpaceControlPointPositions[1].x, worldSpaceControlPointPositions[1].y, worldSpaceControlPointPositions[1].z)
		//helperObject.position = worldSpaceControlPointPositions[1];
		helperObject.CorrespondingRailHashID = rail.HashId.value
		helperObject.relevantType = "ControlPoint"
		scenelike.add(helperObject)
		intersectables.push(helperObject)
	});
}

const removeUnusedControlPointHelpers = async function(rail, scenelike, intersectables) {
	let controlPointHelpersToRemove = []
	let controlPointIndexArray = []
	for (const railPoint of rail.RailPoints) {
		for (const helper of controlPointObjects) {
			// Okay, we're only going to remove matching railPoints if they're part of the rail we sent in. Also, otherwise it would be harder to figure out if the controlPoint is needed.
			if (helper.CorrespondingRailHashID === rail.HashId.value) {
				// First off, we can check if the controlPoint it's referencing exists.
				if (typeof railPoint.ControlPoints[helper.controlPointIndex] === 'undefined') {
					controlPointHelpersToRemove.push(helper)
				}

				// We also need to check for duplicate references, and delete accordingly.
				if (controlPointIndexArray[helper.controlPointIndex] !== undefined) {
					controlPointHelpersToRemove.push(helper)
				}
				else {
					controlPointIndexArray[helper.controlPointIndex] = "I exist!"
				}
			}
		}
	}
	for (const helper of controlPointHelpersToRemove) {
		controlPointObjects.splice(controlPointObjects.indexOf(helper), 1)
		scenelike.remove(helper)
		intersectables.splice(intersectables.indexOf(helper), 1)
	}
}

module.exports = {
	drawHelpers: drawHelpers,
	removeControlPointHelpersByRailHashID: removeControlPointHelpersByRailHashID,
	reloadControlPointHelpersByRailHashID: reloadControlPointHelpersByRailHashID,
	reloadRailPointHelpersByRailHashID: reloadRailPointHelpersByRailHashID,
	removeUnusedControlPointHelpers: removeUnusedControlPointHelpers
}
