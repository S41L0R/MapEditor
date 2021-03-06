const MapTools = require("./MapTools.js")

let objectDummys = []
let groupSelector
let selectedDummys = []





const createObjectDummy = async function (instancedMeshes, index, THREE, scenelike) {
	// We're using groups because they are simple and don't need geometry or anything.
	// Not that this will hold anything - though it could hold debug objects.
	const dummyObject = new THREE.Group()
	dummyObject.userData.instancedMeshes = instancedMeshes
	dummyObject.userData.index = index
	dummyObject.userData.actor = instancedMeshes[0].userData.actorList[index]
	console.error(instancedMeshes)
	console.error(dummyObject.userData.actor)

	const actorTransform = MapTools.getConsistentTransform(instancedMeshes[0].userData.actorList[index])

	const position = new global.THREE.Vector3(actorTransform.Translate[0].value, actorTransform.Translate[1].value, actorTransform.Translate[2].value)

	const rotation = new global.THREE.Quaternion().setFromEuler(new global.THREE.Euler(actorTransform.Rotate[0].value, actorTransform.Rotate[1].value, actorTransform.Rotate[2].value, "ZYX"))

	const scale = new global.THREE.Vector3(actorTransform.Scale[0].value, actorTransform.Scale[1].value, actorTransform.Scale[2].value)

	const matrix = new global.THREE.Matrix4()

	console.error(position)
	console.error(rotation)
	console.error(scale)

	console.error(actorTransform)
	matrix.compose(position, rotation, scale)
	dummyObject.matrix = matrix
	dummyObject.matrixWorld = matrix
	console.error(matrix)

	dummyObject.matrixAutoUpdate = false
	objectDummys.push(dummyObject)
	scenelike.add(dummyObject)


	// Dummy visualizer -- Uncomment for debug
	const dummyVisualizerGeo = new THREE.BufferGeometry();
	dummyVisualizerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3));
	const dummyVisualizerMat = new THREE.PointsMaterial(
		{
			size:10,
			sizeAttenuation: false,
			color: 0xff0000
		}
	);
	const dummyVisualizer = new THREE.Points(dummyVisualizerGeo, dummyVisualizerMat);
	dummyObject.add(dummyVisualizer)
	

	
	console.error(dummyObject)
	return(dummyObject)
}
const initSelectionTools = async function (THREE, scenelike) {
	groupSelector = new THREE.Group()
	groupSelector.userData.type = "GroupSelector"

	// groupSelector visualizer -- Uncomment for debug
	const groupSelectorVisualizerGeo = new THREE.BufferGeometry();
	groupSelectorVisualizerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3));
	const groupSelectorVisualizerMat = new THREE.PointsMaterial(
		{
			size:10,
			sizeAttenuation: false,
			color: 0x00ff00
		}
	);
	const groupSelectorVisualizer = new THREE.Points(groupSelectorVisualizerGeo, groupSelectorVisualizerMat);
	groupSelector.add(groupSelectorVisualizer)
	


	scenelike.add(groupSelector)
}


const removeDummy = function (dummy) {
	deselectObjectByDummy(dummy, global.transformControl, global.THREE)
	const selectedDummysDummyIndex = selectedDummys.indexOf(dummy)
	if (selectedDummysDummyIndex !== -1) {
		selectedDummys.splice(selectedDummysDummyIndex, 1)
	}
	const objectDummysDummyIndex = objectDummys.indexOf(dummy)
	if (objectDummysDummyIndex !== -1) {
		objectDummys.splice(objectDummysDummyIndex, 1)
	}
	groupSelector.remove(dummy)
	updateGroupSelectorPos(THREE, transformControl)
}

const selectObject = async function (instancedMesh, index, transformControl, THREE) {
	for (const dummy of objectDummys) {
		if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
			if (dummy.userData.index === index) {
				selectObjectByDummy(dummy, transformControl, THREE)
			}
		}
	}
}

const selectObjectByDummy = async function (dummy, transformControl, THREE) {
	if (!selectedDummys.includes(dummy)) {
		selectedDummys.push(dummy)
		console.error(dummy)
		groupSelector.attach(dummy)
		updateGroupSelectorPos(THREE, transformControl)
		updateSelectedDummys(THREE)
		displaySelection(dummy, THREE)
		transformControl.attach(groupSelector)

	}
}


const deselectObject = async function (instancedMesh, index, transformControl, THREE) {
	for (const dummy of objectDummys) {
		if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
			if (dummy.userData.index === index) {
				if (selectedDummys.includes(dummy)) {
					selectedDummys.splice(selectedDummys.indexOf(dummy), 1)
					groupSelector.remove(dummy)
					updateGroupSelectorPos(THREE, transformControl)
					updateSelectedDummys(THREE)
					undisplaySelection(dummy)
					transformControl.attach(groupSelector)
				}
			}
		}
	}
}

const deselectObjectByDummy = async function (dummy, transformControl, THREE) {
	if (selectedDummys.includes(dummy)) {
		selectedDummys.splice(selectedDummys.indexOf(dummy), 1)
		groupSelector.remove(dummy)
		updateGroupSelectorPos(THREE, transformControl)
		updateSelectedDummys(THREE)
		if (!(dummy.relevantType === "RailPoint" || dummy.relevantType === "ControlPoint")) {
			undisplaySelection(dummy)
		}
		transformControl.attach(groupSelector)
	}
}


const deselectAll = async function (transformControl, THREE) {
	for (const dummy of selectedDummys) {
		groupSelector.remove(dummy)
		if (!(dummy.relevantType === "RailPoint" || dummy.relevantType === "ControlPoint")) {
			undisplaySelection(dummy)
		}
		else {
			// We need to make sure that the matrixWorld also carries over to the pos and the normal matrix
			dummy.matrix = dummy.matrixWorld
			dummy.position.setFromMatrixPosition(dummy.matrixWorld)
			dummy.rotation.setFromRotationMatrix(dummy.matrixWorld)
			global.scene.add(dummy)
		}
		resetGroupSelectorPos()
	}
	global.transformControl.detach(groupSelector)
	selectedDummys.splice(0, selectedDummys.length)
}

const selectRail = async function (helper) {
	// So I was thinking things through, and I think it makes sense to first check
	// whether the rail is already selected or not.
	if (!groupSelector.children.includes(helper)) {
		groupSelector.add(helper)
		global.transformControl.attach(groupSelector)
		selectedDummys.push(helper)
		updateGroupSelectorPos(global.THREE, global.transformControl)
		updateSelectedDummys(global.THREE)
	}
}

const deselectRail = async function (helper) {
	selectedDummys.splice(selectedDummys.indexOf(helper), 1)
	groupSelector.remove(helper)
	updateGroupSelectorPos(global.THREE, global.transformControl)
	updateSelectedDummys(global.THREE)
	transformControl.attach(groupSelector)
}


const updateSelectedObjs = function() {
	for (const dummy of selectedDummys) {
		if (dummy.userData.instancedMeshes !== undefined) {
			for (instancedMesh of dummy.userData.instancedMeshes) {
				instancedMesh.setMatrixAt(dummy.userData.index, dummy.matrixWorld)
				instancedMesh.instanceMatrix.needsUpdate = true

				updateObjectSelectionDisplay(instancedMesh, dummy.userData.index)
			}
		}
	}
}

const updateSelectedDummys = function(THREE) {
	for (dummy of selectedDummys) {
		toLocalSpace(dummy, THREE)
	}
}

function updateGroupSelectorPos(THREE, transformControl) {

	// Code to average positions to get position in middle:
	let midX = 0
	let midY = 0
	let midZ = 0
	for (const dummy of selectedDummys) {
		const pos = new THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld)
		midX += pos.x
		midY += pos.y
		midZ += pos.z
	}
	midX = midX / selectedDummys.length
	midY = midY / selectedDummys.length
	midZ = midZ / selectedDummys.length

	groupSelector.position.set(midX, midY, midZ)
	groupSelector.rotation.set(0, 0, 0)
	groupSelector.scale.set(1, 1, 1)

	// Just some meh code to make sure the transformControl doesn't glitch out
	// Umm... I have no idea why this is commented, but it works anyway.
	//transformControl.detach();
	//transformControl.attach(groupSelector);
}

function resetGroupSelectorPos() {
	groupSelector.position.set(0, 0, 0)
	groupSelector.rotation.set(0, 0, 0)
	groupSelector.scale.set(1, 1, 1)
}

function toLocalSpace(object, THREE) {
	let oldPosVector = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld)
	let posX = oldPosVector.x - groupSelector.position.x
	let posY = oldPosVector.y - groupSelector.position.y
	let posZ = oldPosVector.z - groupSelector.position.z
	let newPosVector = new THREE.Vector3(posX, posY, posZ)

	let oldRotEuler = new THREE.Euler().setFromRotationMatrix(object.matrixWorld)
	let rotX = oldRotEuler.x - groupSelector.rotation.x
	let rotY = oldRotEuler.y - groupSelector.rotation.y
	let rotZ = oldRotEuler.z - groupSelector.rotation.z
	let newRotEuler = new THREE.Euler(rotX, rotY, rotZ, "ZYX")
	let newRotQuaternion = new THREE.Quaternion().setFromEuler(newRotEuler);

	let oldScaleVector = new THREE.Vector3().setFromMatrixScale(object.matrixWorld)
	let scaleX = oldScaleVector.x / groupSelector.scale.x
	let scaleY = oldScaleVector.y / groupSelector.scale.y
	let scaleZ = oldScaleVector.z / groupSelector.scale.z
	let newScaleVector = new THREE.Vector3(scaleX, scaleY, scaleZ)

	let matrix = new THREE.Matrix4()
	matrix.setPosition(posX, posY, posZ)


	//object.position.set(newPosVector.x, newPosVector.y, newPosVector.z);
	//object.rotation.set(rotX, rotY, rotZ);
	//object.scale.set(newScaleVector.x, -newScaleVector.y, newScaleVector.z);
	//object.updateMatrix();
	//object.matrix.makeRotationFromEuler(newRotEuler)
	//object.matrix.compose(newPosVector, new THREE.Quaternion().setFromRotationMatrix(object.matrix), newScaleVector)
	//object.matrix.setPosition(posX, posY, posZ)
	object.position.set(posX, posY, posZ)

	object.matrix = matrix
	//object.matrix.setScale(scaleX, scaleY, scaleZ)
}

const displaySelection = async function(dummy, THREE) {

	for (const instancedMesh of dummy.userData.instancedMeshes) {
		const wireframeGeo = new THREE.WireframeGeometry( instancedMesh.geometry )

		const wireframe = new THREE.LineSegments( wireframeGeo )
		wireframe.material.depthTest = true
		wireframe.material.opacity = 0.25
		wireframe.material.transparent = true
		wireframe.material.color = new THREE.Color("#0000FF")

		wireframe.userData.index = dummy.userData.index

		instancedMesh.getMatrixAt(dummy.userData.index, wireframe.matrix)
		wireframe.matrixAutoUpdate = false

		dummy.attach(wireframe)

	}
}

const undisplaySelection = async function(dummy) {
	for (wireframe of dummy.children) {
		dummy.remove(wireframe)
		wireframe.material.dispose()
		wireframe.geometry.dispose()
	}
}

function updateObjectSelectionDisplay(instancedMesh, index) {
	for (const wireframe of instancedMesh.children) {
		if (wireframe.userData.index === index) {
			instancedMesh.getMatrixAt(index, wireframe.matrix)
		}
	}
}

module.exports = {
	selectObject: selectObject,
	selectObjectByDummy: selectObjectByDummy,
	deselectObject: deselectObject,
	deselectObjectByDummy: deselectObjectByDummy,
	deselectAll: deselectAll,
	createObjectDummy: createObjectDummy,
	updateSelectedObjs: updateSelectedObjs,
	displaySelection: displaySelection,
	undisplaySelection: undisplaySelection,
	removeDummy: removeDummy,
	selectRail: selectRail,


	initSelectionTools: initSelectionTools,


	objectDummys: objectDummys,
	selectedDummys: selectedDummys,

	getSelectedDummys: () => {
		return selectedDummys
	}
}
