let getWorldSpaceControlPointsCache = {}
// Pass in is just to get around the issues caused by using a .then in a loop. This just makes it so we can get whatever sort of index etc. back so we know what we were working on.
const getWorldSpaceControlPoints = function(point1, point2, controlPoint1, controlPoint2, passIn) {
	// For organization purposes we'll be calling this function multiple times with the same data.
	// We can fix any performance drops because of this by caching the result.
	if ([point1, point2, controlPoint1, controlPoint2] in getWorldSpaceControlPointsCache) {
		return(getWorldSpaceControlPointsCache[point1][point2][controlPoint1][controlPoint2])
	}
	const line = new THREE.LineCurve3(point1, point2)
	const worldSpaceOffsetOrigins = line.getPoints(2)
	//const point1InWorldSpace = new THREE.Vector3(controlPoint1.x + worldSpaceOffsetOrigins[1].x, controlPoint1.y + worldSpaceOffsetOrigins[1].y, controlPoint1.z + worldSpaceOffsetOrigins[1].z)
	//const point2InWorldSpace = new THREE.Vector3(controlPoint2.x + worldSpaceOffsetOrigins[1].x, controlPoint2.y + worldSpaceOffsetOrigins[1].y, controlPoint2.z + worldSpaceOffsetOrigins[1].z)

	const point1InWorldSpace = new THREE.Vector3(controlPoint1.x + point1.x, controlPoint1.y + point1.y, controlPoint1.z + point1.z) 
	const point2InWorldSpace = new THREE.Vector3(controlPoint2.x + point2.x, controlPoint2.y + point1.y, controlPoint2.z + point2.z) 

	// Notice we're also returning point1 and point2. This is because if this is being called using a .then() in a loop, counters in that loop can get confused because this might return later.
	// To combat that, we're just returning the endpoints of the line as well so that the calling function can remember what it was looking for.

	// (And of course cache the value first)
	getWorldSpaceControlPointsCache[point1, point2, controlPoint1, controlPoint2] = [point1, point1InWorldSpace, point2InWorldSpace, point2]
	return([point1, point1InWorldSpace, point2InWorldSpace, point2, passIn])
}

const getWorldSpaceControlPoint = function(railPoint, controlPoint) {
	return(new global.THREE.Vector3(controlPoint.x + railPoint.x, controlPoint.y + railPoint.y, controlPoint.z + railPoint.z))
}

let getLocalSpaceControlPointsCache = {}
// Pass in is just to get around the issues caused by using a .then in a loop. This just makes it so we can get whatever sort of index etc. back so we know what we were working on.
const getLocalSpaceControlPoints = async function(point1, point2, controlPoint1, controlPoint2, passIn) {
	// For organization purposes we'll be calling this function multiple times with the same data.
	// We can fix any performance drops because of this by caching the result.
	if ([point1, point2, controlPoint1, controlPoint2] in getWorldSpaceControlPointsCache) {
		return(getWorldSpaceControlPointsCache[point1][point2][controlPoint1][controlPoint2])
	}
	const line = new THREE.LineCurve3(point1, point2)
	const worldSpaceOffsetOrigins = line.getPoints(2)
	//const point1InLocalSpace = new THREE.Vector3(controlPoint1.x - worldSpaceOffsetOrigins[1].x, controlPoint1.y - worldSpaceOffsetOrigins[1].y, controlPoint1.z - worldSpaceOffsetOrigins[1].z)
	//const point2InLocalSpace = new THREE.Vector3(controlPoint2.x - worldSpaceOffsetOrigins[1].x, controlPoint2.y - worldSpaceOffsetOrigins[1].y, controlPoint2.z - worldSpaceOffsetOrigins[1].z)

	const point1InWorldSpace = new THREE.Vector3(controlPoint1.x - point1.x, controlPoint1.y - point1.y, controlPoint1.z - point1.z) 
	const point2InWorldSpace = new THREE.Vector3(controlPoint2.x - point2.x, controlPoint2.y - point1.y, controlPoint2.z - point2.z) 

	// Notice we're also returning point1 and point2. This is because if this is being called using a .then() in a loop, counters in that loop can get confused because this might return later.
	// To combat that, we're just returning the endpoints of the line as well so that the calling function can remember what it was looking for.

	// (And of course cache the value first)
	getWorldSpaceControlPointsCache[point1, point2, controlPoint1, controlPoint2] = [point1, point1InLocalSpace, point2InLocalSpace, point2]
	return([point1, point1InLocalSpace, point2InLocalSpace, point2, passIn])
}

module.exports = {
	getWorldSpaceControlPoints: getWorldSpaceControlPoints,
	getWorldSpaceControlPoint: getWorldSpaceControlPoint,
	getLocalSpaceControlPoints: getLocalSpaceControlPoints
}
