const drawHelpers = async function(rail, scenelike, intersectables) {
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

		// And add it to the scene
		scenelike.add(helperObject);

		// And add it to our list of intersectable objects
		intersectables.push(helperObject);
	}
}


module.exports = {
	drawHelpers: drawHelpers
}
