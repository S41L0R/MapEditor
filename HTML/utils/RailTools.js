// Constants
const RAIL_RES = 50 // Update to setting sometime
const COLOR_ONE = [0.0, 0.0, 1.0]
const COLOR_TWO = [1.0, 1.0, 0.0]

// Maps
let railIndexMap = new Map() // This maps rails to the starting index and length of vertex data


let railPositions = []


// Object Init
let railGeometry = new global.LineSegmentsGeometry()

let railMaterial = new global.LineMaterial({
	linewidth: 5,
	vertexColors: true,
	dashed: true,
	dashSize: 3,
	alphaToCoverage: true,
})

let railObject = new global.LineSegments2()
//

const initRailObject = function() {
    let railGeometryPositions = []
	/*
    for (const [index, railPos] of railPositions.entries()) {
        railGeometryPositions.push(railPos.x, railPos.y, railPos.z)
        if (index !== 0 && index !== railPositions.length - 1) {
			railGeometryPositions.push(railPos.x, railPos.y, railPos.z)
		}
    }
	*/
	let colorsArray = []
	for (const [rail, railIndexData] of railIndexMap.entries()) {
		const relRailPositions = railPositions.slice(railIndexData.Index, railIndexData.Length + railIndexData.Index)
		for (const [index, railPos] of relRailPositions.entries()) {
			railGeometryPositions.push(railPos.x, railPos.y, railPos.z)

			// Vertex Colors
			colorsArray.push((((COLOR_TWO[0] - COLOR_ONE[0]) / railIndexData.Length) * index) + COLOR_ONE[0], (((COLOR_TWO[1] - COLOR_ONE[1]) / railIndexData.Length) * index) + COLOR_ONE[1], (((COLOR_TWO[2] - COLOR_ONE[2]) / railIndexData.Length) * index) + COLOR_ONE[2])

			if (index !== 0 && index !== railIndexData.Length - 1) {
				railGeometryPositions.push(railPos.x, railPos.y, railPos.z)

				// Vertex Colors
				colorsArray.push((((COLOR_TWO[0] - COLOR_ONE[0]) / railIndexData.Length) * (index + 1)) + COLOR_ONE[0], (((COLOR_TWO[1] - COLOR_ONE[1]) / railIndexData.Length) * (index + 1)) + COLOR_ONE[1], (((COLOR_TWO[2] - COLOR_ONE[2]) / railIndexData.Length) * (index + 1)) + COLOR_ONE[2])
			}
		}
	}
    railGeometry.setPositions(railGeometryPositions)

    
	/*
    for (let i = 0; i < railGeometryPositions.length; i++) {
	    colorsArray.push(
		0.0, 0.0, 1.0,
		1.0, 1.0, 0.0
	    )
	}
	*/

    let colors = new Float32Array(colorsArray)

    railGeometry.setColors(colors)

    railMaterial.resolution.set(window.innerWidth, window.innerHeight)

    railObject = new global.LineSegments2(railGeometry, railMaterial)
    railObject.computeLineDistances()
    global.scene.add(railObject)
}

const reloadRailObjectResolution = function() {
    railObject.material.resolution.set(window.innerWidth, window.innerHeight)
}

const removeRailObject = function() {
	global.scene.remove(railObject)
	railObject.material.dispose()
	railObject.geometry.dispose()
}

const reloadRailObject = function() {
	removeRailObject()
	initRailObject()
}

const createRails = function() {
	for (const rail of global.sectionData.Static.Rails) {
		addRail(rail)
		global.RailHelperTools.generateRailHelpers(rail)
	}
	reloadRailObject()
}

const removeRails = function() {
	for (const rail of global.sectionData.Static.Rails) {
		removeRail(rail)
		global.RailHelperTools.removeRailHelpers(rail)
	}
}


// Rail Creation Process

const addRail = function(rail) {
	// Okay, so we're gonna need to know if this rail is linear or bezier
	switch (rail.RailType.value) {
		case "Bezier":
			addBezierRail(rail)
			break
		case "Linear":
			addLinearRail(rail)
			break
		default:
			console.error("Problem with following rail data: Could not find RailType.")
			console.error(rail)
	}
}

const removeRail = function(rail) {
	// Okay, so we're gonna remove this rail from everything
	const railIndexData = railIndexMap.get(rail)
	railPositions.splice(railIndexData.Index, railIndexData.Length)
	// We're also gonna want to make sure to update all the other index references
	for (const [rail, indexData] of railIndexMap.entries()) {
		if (indexData.Index > railIndexData.Index) {
			indexData.Index -= railIndexData.Length
		}
	}
}

const reloadRail = function(rail) {
	removeRail(rail)
	addRail(rail)
	reloadRailObject()
}

function addBezierRail(rail) {
	const pointArray = createBezierRailPointArray(rail)
	addBezierRailPath(rail, pointArray)
}

function addLinearRail(rail) {
	const pointArray = createLinearRailPointArray(rail)
	addLinearRailPath(rail, pointArray)
}

function addBezierRailPath(rail, pointArray) {
	const index = railPositions.length

	for (let i=0; i < pointArray.length-3; i+=3) {
		const worldSpaceControlPointPositions = global.GeneralRailTools.getWorldSpaceControlPoints(pointArray[i], pointArray[i+3], pointArray[i+1], pointArray[i+2])
		const curve = new global.THREE.CubicBezierCurve3(worldSpaceControlPointPositions[0], worldSpaceControlPointPositions[1], worldSpaceControlPointPositions[2], worldSpaceControlPointPositions[3])
		const points = curve.getPoints( RAIL_RES )
		
		railPositions.push(...points)
		
	}
	railIndexMap.set(rail, {"Index": index, "Length": railPositions.length - index, "SegSize": RAIL_RES + 1})
}

function addLinearRailPath(rail, pointArray) {
	let index = railPositions.length

	railPositions.push(...pointArray)
	railIndexMap.set(rail, {"Index": index, "Length": pointArray.length, "SegSize": 2})
}


// We cache the result of this function to make it faster sometimes
let createBezierRailPointArrayCache = {}
const createBezierRailPointArray = function(rail) {
	// Quick caching check
	if ([JSON.stringify([rail.RailPoints, rail.ControlPoints])] in createBezierRailPointArrayCache) {
		return(createBezierRailPointArrayCache[JSON.stringify([rail.RailPoints, rail.ControlPoints])])
	}


	// This is a Bezier rail, which consists of two control points.
	// Cubic Bezier curves in ThreeJs follow the following format for their position data:
	//
	// Point1, (Vector3)
	// ControlPoint1 (Vector3)
	// ControlPoint2 (Vector3)
	// Point2 (Vector3)
	//
	//
	// However, rails have the following format:
	//
	// Point1
	// - LastLineSegControlPoint2
	// - ControlPoint1
	// Point2
	// - ControlPoint2
	// - NextLineSegControlPoint1
	
	// We'll start by creating an array to store the positions:
	let positionArray = []
	// Then we'll loop through for each RailPoint and add the needed stuff
	for (const [index, railPoint] of rail.RailPoints.entries()) {
		// We'll first want to do some logic for the first RailPoint, as it doesn't have a previous RailPoint to look to.
		if (index === 0) {
			// If the rail is closed, then we can look to the last RailPoint
			if (rail.IsClosed.value) {
				// Add the last point pos
				positionArray.push(new global.THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].Translate[0].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[1].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[2].value))
				// Add the last ControlPoint from the last RailPoint pos
				// (But make sure it exists, it might not)
				if (rail.RailPoints[rail.RailPoints.length - 1].ControlPoints !== undefined) {
					positionArray.push(new global.THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].ControlPoints[1][0].value, rail.RailPoints[rail.RailPoints.length - 1].ControlPoints[1][1].value, rail.RailPoints[rail.RailPoints.length - 1].ControlPoints[1][2].value))
				}
				else {
					positionArray.push(new global.THREE.Vector3(0, 0, 0))
				}

				// We also need to add the first ControlPoint from the first RailPoint (which we know that the var railPoint currently is)
				// Again, we'll make sure the ControlPoints are defined
				if (railPoint.ControlPoints !== undefined) {
					positionArray.push(new global.THREE.Vector3(railPoint.ControlPoints[0][0].value, railPoint.ControlPoints[0][1].value, railPoint.ControlPoints[0][2].value))
				}
				else {
					positionArray.push(new global.THREE.Vector3(0, 0, 0))
				}
			}
		}

		// We next push the current RailPoint
		positionArray.push(new global.THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value))

		// We make sure it's not the last RailPoint
		if (index !== (rail.RailPoints.length - 1)) {
			// And if not, we add the next two ControlPoints

			// The first of which will be the second ControlPoint from this RailPoint
			// (As always, we use a default if the ControlPoints don't exist)
			if (railPoint.ControlPoints !== undefined) {
				positionArray.push(new global.THREE.Vector3(railPoint.ControlPoints[1][0].value, railPoint.ControlPoints[1][1].value, railPoint.ControlPoints[1][2].value))
			}
			else {
				positionArray.push(new global.THREE.Vector3(0, 0, 0))
			}

			// And the second of which will be the first ControlPoint from the next RailPoint:
			if (rail.RailPoints[index + 1].ControlPoints !== undefined) {
				positionArray.push(new global.THREE.Vector3(rail.RailPoints[index + 1].ControlPoints[0][0].value, rail.RailPoints[index + 1].ControlPoints[0][1].value, rail.RailPoints[index + 1].ControlPoints[0][2].value))
			}
			else {
				positionArray.push(new global.THREE.Vector3(0, 0, 0))
			}
		}
	}

	// Okay, we're done so we'll package positionArray up nicely to be shipped off to whatever called this function.
	// (But not before caching the result!)
	createBezierRailPointArrayCache[JSON.stringify([rail.RailPoints, rail.ControlPoints])] = positionArray
	return (positionArray)
}


const createLinearRailPointArray = function(rail) {
	// This is a lot simpler than creating Bezier curve position arrays
	
	// We'll start by initializing an array to add the RailPoints to
	let positionArray = []

	// Then we'll loop through all of the RailPoints in order to add the positions to the position array
	for (const [index, railPoint] of rail.RailPoints.entries()) {
		// We'll first want to check if this is the first RailPoint
		if (index === 0) {
			// We'll want to check if the rail is closed, because we can wrap around if so
			if (rail.IsClosed.value) {
				// We'll add the last RailPoint
				positionArray.push(new global.THREE.Vector3(rail.RailPoints[rail.RailPoints.length - 1].Translate[0].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[1].value, rail.RailPoints[rail.RailPoints.length - 1].Translate[2].value))
			}
		}

		// We'll also want to add the current point to the position array
		positionArray.push(new global.THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value))
	}

	// We'll ship the position array off to whatever called this
	return (positionArray)
}


// Rail-related tools

const getRailFromHashID = function(HashID) {
	for (const rail of global.sectionData.Static.Rails) {
		if (rail.HashId.value === HashID) {
			return (rail)
		}
	}
}

const updateNextAndPrevDistance = function(rail) {
	if (rail.IsClosed.value === true) {
		for (const [index, railPoint] of rail.RailPoints.entries()) {
			const nextDistIndex = (index + 1) % rail.RailPoints.length
			const prevDistIndex = (rail.RailPoints.length + index - 1) % rail.RailPoints.length
			railPoint.NextDistance.value = Math.sqrt(Math.pow((rail.RailPoints[nextDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))
			railPoint.PrevDistance.value = Math.sqrt(Math.pow((rail.RailPoints[prevDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[prevDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[prevDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))
		}
	}
	else {
		for (const [index, railPoint] of rail.RailPoints.entries()) {
			if (index === rail.RailPoints.length - 1) {
				const prevDistIndex = index - 1
				railPoint.NextDistance.value = 0
				railPoint.PrevDistance.value = Math.sqrt(Math.pow((rail.RailPoints[prevDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[prevDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[prevDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))


			}
			else if (index === 0) {
				const nextDistIndex = index + 1
				railPoint.NextDistance.value = Math.sqrt(Math.pow((rail.RailPoints[nextDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))

				railPoint.PrevDistance.value = 0
			}
			else {
				const nextDistIndex = index + 1
				const prevDistIndex = index - 1
				railPoint.NextDistance.value = Math.sqrt(Math.pow((rail.RailPoints[nextDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))
				railPoint.PrevDistance.value = Math.sqrt(Math.pow((rail.RailPoints[nextDistIndex].Translate[0].value - railPoint.Translate[0].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[1].value - railPoint.Translate[1].value), 2) + Math.pow((rail.RailPoints[nextDistIndex].Translate[2].value - railPoint.Translate[2].value), 2))
			}
		}
	}
}


module.exports = {
	initRailObject: initRailObject,
	reloadRailObjectResolution: reloadRailObjectResolution,
	createRails: createRails,
	addRail: addRail,
	removeRail: removeRail,
	reloadRail: reloadRail,

	// Rail-related tools
	getRailFromHashID: getRailFromHashID,
	updateNextAndPrevDistance: updateNextAndPrevDistance
}
