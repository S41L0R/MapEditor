// NOTE:
//
// Get rid of ignoreRailPointIndex and ignoreControlPointIndex.
//
//
// Why?
//
// Because we don't need to reload helpers at all if we're moving a controlPoint.
//
// We only need to do it if we're moving a railPoint.



const RAIL_RES = 50;

// Get Friends:
const RailHelperTools = require("./RailHelperTools.js");
const GeneralRailTools = require("./GeneralRailTools.js");
// This function creates all the rails in a scene based on a maplike.
const createRails = async function(maplike, scenelike, intersectables) {
	for (const rail of maplike.Static.Rails) {
		drawRail(rail, scenelike);
		RailHelperTools.drawHelpers(rail, scenelike, intersectables);
	}

}

// This function reloads all rails in the scene:
const reloadRails = async function(scenelike) {

}

// This function reloads a specific rail by destroying and creating it via hashID:
const reloadRail = async function(hashID, maplike, scenelike) {
	//console.error(hashID);
	//console.error(maplike);
	//console.error(scenelike);
	removeRail(hashID, scenelike);
	//RailHelperTools.removeControlPointHelpersByRailHashID(hashID, scenelike);
	addRail(hashID, maplike, scenelike);
}



// This function removes a rail from the scene.
const removeRail = async function(hashID, scenelike) {
	// We first loop through the scene:
	for (item of scenelike.children) {
		// Then if it has the matching hashID we get rid of it:
		if (item.HashID == hashID) {
			//console.error(hashID);
			//console.error("bye");
			for (object of item.children) {
				object.geometry.dispose();
				object.material.dispose();
				delete object;

			}
			scenelike.remove(item);
			// And then we break because we know we have already found the rail:
			break;
		}
	}
}

const addRail = async function(hashID, maplike, scenelike) {
	for (const rail of maplike.Static.Rails) {
		// Check if it matches the hashID
		if (rail.HashId.value == hashID) {
			drawRail(rail, scenelike);
		}
	}
}

async function drawRail(rail, scenelike) {
	// Check if it's a linear or bezier curve
	switch(rail.RailType.value) {
		case "Bezier":
			drawBezierRail(rail, scenelike);
			break;
		case "Linear":
			drawLinearRail(rail, scenelike);
			break;
	}
}


// Yes, this function is just a modified version of one from a a threejs example project.
function updateSplineOutline(scenelike, hashID) {
	for ( const item of scenelike.children ) {
		if (item.HashID == hashID) {


			const curveMesh = item.mesh;
			const position = curveMesh.geometry.attributes.position;

			for ( let i = 0; i < RAIL_RES; i ++ ) {

				const t = i / ( RAIL_RES - 1 );
				item.getPoint( t, point );
				position.setXYZ( i, point.x, point.y, point.z );

			}

			position.needsUpdate = true;
		}
	}

}

// This function just creates a Bezier rail in the scene based on a rail JSON.
async function drawBezierRail(rail, scenelike) {
	createBezierRailPointArray(rail).then((pointArray) => {
		createBezierRailPath(pointArray, scenelike, rail.HashId.value);
	});
}

// This function makes a linear rail in the scene based on rail JSON data.
async function drawLinearRail(rail, scenelike) {
	createLinearRailPointArray(rail).then((pointArray) => {
		createLinearRailPath(pointArray, scenelike, rail.HashId.value);
	});

}

async function createBezierRailPath(pointArray, scenelike, RailHashID) {
	// Cubic Bezier curves don't take an array in, instead they take only four arguments.
	// We can solve this problem by creating multiple curves.

	// The first thing we'll want to do is make sure we have a group for all curves in a rail.
	// This will optimize searching so that we don't have to search through every curve in order to find the curves we're looking for.
	// (Because otherwise we wouldn't be able to break from a searching loop without the risk of not finding all relevant curves.)

	const railGroup = new THREE.Group();
	// We'll hack on an identifying hashID:
	railGroup.HashID = RailHashID;
	for (i=0; i < pointArray.length-3; i+=3) {
		// I'm gonna go on the assumption that controlPoints are offsets from points on a linear path
		// So let's create a line and find the world space positions for those offsets:
		GeneralRailTools.getWorldSpaceControlPoints(pointArray[i], pointArray[i+3], pointArray[i+1], pointArray[i+2]).then((worldSpaceControlPointPositions) => {
			//console.error(worldSpaceControlPointPositions);
			//console.error(pointArray)
			//console.error(pointArray[i]);
			//const worldSpaceControlPointPositions = getWorldSpaceControlPoints(pointArray[i], pointArray[i+3], pointArray[1+1], pointArray[i+2]);
			const curve = new THREE.CubicBezierCurve3(worldSpaceControlPointPositions[0], worldSpaceControlPointPositions[1], worldSpaceControlPointPositions[2], worldSpaceControlPointPositions[3]);
			const points = curve.getPoints( RAIL_RES );
			const geometry = new THREE.BufferGeometry().setFromPoints( points );

			const curveMat = new THREE.LineBasicMaterial( { color : 0xff0000 } );

			// Create the final object to add to the scene
			const curveObject = new THREE.Line( geometry, curveMat );

			// And put it with other curves from the rail in the group
			railGroup.add(curveObject);
		});
	}
	scenelike.add(railGroup);
}

async function createLinearRailPath(pointArray, scenelike, RailHashID) {
	// Just like cubic Bezier, line curves don't take in an array, just two points.
	// This means we'll be making multiple line curves.

	// Again, we'll be adding this stuff to a group for faster searching later:
	const railGroup = new THREE.Group();
	// And again, with a hashID connected:
	railGroup.HashID = RailHashID;
	for (i=0; i < pointArray.length-1; i++) {
	        const curve = new THREE.LineCurve3(pointArray[i], pointArray[i+1]);
	        const points = curve.getPoints( 2 );
	        const geometry = new THREE.BufferGeometry().setFromPoints( points );

	        const curveMat = new THREE.LineBasicMaterial( { color : 0xff0000 } );

	        // Create the final object to add to the scene
		const curveObject = new THREE.Line( geometry, curveMat );

		// And add it to the group
		railGroup.add(curveObject);
	}
	scenelike.add(railGroup);
}
let createBezierRailPointArrayCache = {};
const createBezierRailPointArray = async function(rail) {
	// Before we run the bulk of the function, we'll just run some quick caching code to check if we've already calculated this:

	// We'll only be referencing the positions of railPoints and controlPoints as that's all that matters for this function, and to save memory:
	if ([JSON.stringify([rail.RailPoints, rail.ControlPoints])] in createBezierRailPointArrayCache) {
		return(createBezierRailPointArrayCache[JSON.stringify([rail.RailPoints, rail.ControlPoints])]);
	}
	// We'll be using a cubic Bezier curve, which means we have two controlpoints.
	// Bezier rails already have two controlpoints, so we can just hook into those.
	// Cubic Bezier curves in ThreeJs follow the following format for their position data:
	//
	// Point1, (Vector3)
	// ControlPoint1, (Vector3)
	// ControlPoint2, (Vector3)
	// Point2 (Vector3)
	//
	// So, in summary, there are two controlpoints between points.

	// We can start by creating an array to store the points:
	let pointArray = [];
	// Then we'll loop through and for each railPoint add the needed stuff:
	for (const [index, railPoint] of rail.RailPoints.entries()) {
		// Something we have to take into account is that the first controlPoint is for the previous segment, and the next controlPoint is for the next one.
		// Take this diagram for example, where "O"s are railPoints, and "x"s are controlPoints:
		//
		// O----x----x----O----x----x----O
		// ^    ^    ^    ^    ^    ^    ^
		// P1   P1C2 P2C1 P2   P2C2 P3C1 P3
		//
		// The controlPoints associated with the first and last railPoints will have all 0s if the rail is open.
		// Otherwise, the controlPoints will be referring to a curve drawn between the first and last railPoints.

		// So we'll want to first check if this is the first railPoint, as the stuff in here doesn't apply if it's not:
		if (index == 0) {
			// If it is, we'll want to then check if the rail is closed or not, so we can complete the circle if it is:
			if (rail.IsClosed.value) {
				// If this is the first railPoint, we'll add the last point as well in order to correctly complete the circle
				pointArray.push(new THREE.Vector3(rail.RailPoints[rail.RailPoints.length-1].Translate[0].value, rail.RailPoints[rail.RailPoints.length-1].Translate[1].value, rail.RailPoints[rail.RailPoints.length-1].Translate[2].value));
				// And then we'll add the last controlPoint from the last railPoint:
				// (I've found that sometimes the controlPoint is not defined, so if it's not we'll just have 0, 0, 0)
				if (rail.RailPoints[rail.RailPoints.length-1].ControlPoints != undefined) {
					pointArray.push(new THREE.Vector3(rail.RailPoints[rail.RailPoints.length-1].ControlPoints[1][0].value, rail.RailPoints[rail.RailPoints.length-1].ControlPoints[1][1].value, rail.RailPoints[rail.RailPoints.length-1].ControlPoints[1][2].value));
				}
				else {
					pointArray.push(new THREE.Vector3(0, 0, 0));
				}
				// And the first controlPoint from the first railPoint (which we know the var railPoint currently is):
				// (Again, we'll account for if it's not defined)
				if (railPoint.ControlPoints != undefined) {
					pointArray.push(new THREE.Vector3(railPoint.ControlPoints[0][0].value, railPoint.ControlPoints[0][1].value, railPoint.ControlPoints[0][2].value));
				}
				else {
					pointArray.push(new THREE.Vector3(0, 0, 0));
				}
			}
		}

		// Then we just push the current railPoint:
		pointArray.push(new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value));

		// We make sure it's not the last railPoint:
		if (index != (rail.RailPoints.length - 1)) {
			// If it's not, we add the next two controlPoints:

			// The first of which will be the second controlPoint from this railPoint:
			// (As always, we only do this if the controlPoints exist)
			if (railPoint.ControlPoints != undefined) {
				pointArray.push(new THREE.Vector3(railPoint.ControlPoints[1][0].value, railPoint.ControlPoints[1][1].value, railPoint.ControlPoints[1][2].value));
			}
			else {
				pointArray.push(new THREE.Vector3(0, 0, 0));
			}
			// And the second of which will be the first controlPoint from the next railPoint:
			// (If it exists)
			if (rail.RailPoints[index+1].ControlPoints != undefined) {
				pointArray.push(new THREE.Vector3(rail.RailPoints[index+1].ControlPoints[0][0].value, rail.RailPoints[index+1].ControlPoints[0][1].value, rail.RailPoints[index+1].ControlPoints[0][2].value));

			}
			else {
				pointArray.push(new THREE.Vector3(0, 0, 0));
			}
		}

	}

	// Okay, we're done with this so we'll package pointArray up nicely to be shipped off to whatever called this function.
	// (But not before caching the value!)
	createBezierRailPointArrayCache[JSON.stringify([rail.RailPoints, rail.ControlPoints])] = pointArray;
	return(pointArray);
}


const createLinearRailPointArray = async function(rail) {
	// This will be a lot simpler than the cubic Bezier curve, so all we need to do is (A). Loop through all of the rail's railPoints, and (B). Remember to take IsClosed into account.

	// Let's start by initializing an array to add the railPoints to:
	let pointArray = [];

	// Then we'll loop through all of the railPoints in order to add the positions to pointArray:
	for (const [index, railPoint] of rail.RailPoints.entries()) {
		// We'll first want to check if this is the first railPoint, as we only need to do this for the first railPoint:
		if (index == 0) {
			// We'll then want to check if the rail is closed, so that we can add the last railPoint to the beginning of pointArray to complete the circle:
			if (rail.IsClosed.value) {
				// Okay, we'll add that last railPoint:
				pointArray.push(new THREE.Vector3(rail.RailPoints[rail.RailPoints.length-1].Translate[0].value, rail.RailPoints[rail.RailPoints.length-1].Translate[1].value, rail.RailPoints[rail.RailPoints.length-1].Translate[2].value));
			}
		}

		// We'll then want to actually add the current point to pointArray:
		pointArray.push(new THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value));
	}

	// Now we'll just want to package pointArray to be shipped off to the function caller.
	return(pointArray);
}

const setControlPointPos = async function(rail, railPointIndex, controlPointIndex, position) {
	if (controlPointIndex == 0) {
		if (rail.RailPoints[railPointIndex - 1] != undefined) {
			// Then this should be on a line between the previous railPoint and the current one

			// We'll get Vector3s representing the positions of points:
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex - 1].Translate[0].value, rail.RailPoints[railPointIndex - 1].Translate[1].value, rail.RailPoints[railPointIndex - 1].Translate[2].value);
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);

			GeneralRailTools.getLocalSpaceControlPoints(point1, point2,  position, 0).then((localSpaceControlPointPositions) => {
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][0].value = localSpaceControlPointPositions[1].x;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][1].value = localSpaceControlPointPositions[1].y;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][2].value = localSpaceControlPointPositions[1].z;
			});
		}
		else if (rail.IsClosed.value == true) {
			// Then this should be on a line between the previous railPoint and the current one

			// We'll get Vector3s representing the positions of points:
			let point1 = new THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].Translate[0].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[1].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[2].value);
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);

			GeneralRailTools.getLocalSpaceControlPoints(point1, point2,  position, 0).then((localSpaceControlPointPositions) => {
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][0].value = localSpaceControlPointPositions[1].x;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][1].value = localSpaceControlPointPositions[1].y;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][2].value = localSpaceControlPointPositions[1].z;
			});
		}
	}
	else if (controlPointIndex == 1) {
		// Then this should be on a line between the current railPoint and the next one
		if (rail.RailPoints[railPointIndex + 1] != undefined) {
			// We'll get Vector3s representing the positions of points:
			let point2 = new THREE.Vector3(rail.RailPoints[railPointIndex + 1].Translate[0].value, rail.RailPoints[railPointIndex + 1].Translate[1].value, rail.RailPoints[railPointIndex + 1].Translate[2].value);
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);

			GeneralRailTools.getLocalSpaceControlPoints(point1, point2,  position, 0).then((localSpaceControlPointPositions) => {
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][0].value = localSpaceControlPointPositions[1].x;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][1].value = localSpaceControlPointPositions[1].y;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][2].value = localSpaceControlPointPositions[1].z;
			});

		}
		else if (rail.IsClosed.value == true) {
			// We'll get Vector3s representing the positions of points:
			let point2 = new THREE.Vector3(rail.RailPoints[0].Translate[0].value, rail.RailPoints[0].Translate[1].value, rail.RailPoints[0].Translate[2].value);
			let point1 = new THREE.Vector3(rail.RailPoints[railPointIndex].Translate[0].value, rail.RailPoints[railPointIndex].Translate[1].value, rail.RailPoints[railPointIndex].Translate[2].value);

			GeneralRailTools.getLocalSpaceControlPoints(point1, point2,  position, 0).then((localSpaceControlPointPositions) => {
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][0].value = localSpaceControlPointPositions[1].x;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][1].value = localSpaceControlPointPositions[1].y;
				rail.RailPoints[railPointIndex].ControlPoints[controlPointIndex][2].value = localSpaceControlPointPositions[1].z;
			});
		}
	}
}

module.exports = {
	createRails: createRails,
	reloadRails: reloadRails,
	reloadRail: reloadRail,
	createBezierRailPointArray: createBezierRailPointArray,
	createLinearRailPointArray: createLinearRailPointArray,
	setControlPointPos: setControlPointPos
}
