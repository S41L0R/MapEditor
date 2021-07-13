let objectDummys = []
let selectedDummys = []
let groupSelector


const initSelectionTools = function() {
	groupSelector = new global.THREE.Group()
	groupSelector.userData.type = "GroupSelector"
	groupSelector.rotation.order = "ZYX"
	/*
	// groupSelector visualizer -- Uncomment for debug
	const groupSelectorVisualizerGeo = new global.THREE.BufferGeometry();
	groupSelectorVisualizerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3));
	const groupSelectorVisualizerMat = new global.THREE.PointsMaterial(
		{
			size:10,
			sizeAttenuation: false,
			color: 0x00ff00
		}
	);
	const groupSelectorVisualizer = new global.THREE.Points(groupSelectorVisualizerGeo, groupSelectorVisualizerMat);
	*/


	const material = new global.THREE.LineBasicMaterial({
		color: 0x0000ff
	})
	const points = []
	points.push(new global.THREE.Vector3(0, 0, 0))
	points.push(new global.THREE.Vector3(0, -5, 0))
	const geometry = new global.THREE.BufferGeometry().setFromPoints(points)
	const groupSelectorVisualizer = new global.THREE.Line(geometry, material)




	groupSelector.add(groupSelectorVisualizer)
	

	global.scene.add(groupSelector)
}

const createObjectDummy = function(instancedMeshes, index) {
	let dummy = new global.THREE.Group()
	dummy.userData.type = "Dummy"

	let actor = instancedMeshes[0].userData.actorList[index]

	dummy.userData.actor = actor
	dummy.userData.instancedMeshes = instancedMeshes
	dummy.userData.index = index

	actorPos = global.MapTools.getConsistentTransform(actor)
	dummy.rotation.order = "ZYX"
	dummy.position.x = actorPos.Translate[0].value
	dummy.position.y = actorPos.Translate[1].value
	dummy.position.z = actorPos.Translate[2].value
	dummy.rotation.x = actorPos.Rotate[0].value
	dummy.rotation.y = actorPos.Rotate[1].value
	dummy.rotation.z = actorPos.Rotate[2].value
	dummy.scale.x = actorPos.Scale[0].value
	dummy.scale.y = actorPos.Scale[1].value
	dummy.scale.z = actorPos.Scale[2].value

	/*
	const material = new global.THREE.LineBasicMaterial({
		color: 0x00ff00
	})
	const points = []
	points.push(new global.THREE.Vector3(0, 0, 0))
	points.push(new global.THREE.Vector3(0, -5, 0))
	const geometry = new global.THREE.BufferGeometry().setFromPoints(points)
	const groupSelectorVisualizer = new global.THREE.Line(geometry, material)

	dummy.add(groupSelectorVisualizer)
	*/
	objectDummys.push(dummy)
	global.scene.add(dummy)

	return(dummy)
}

const removeDummy = function(dummy) {
	if (selectedDummys.includes(dummy)) {
		deselectObjectByDummy(dummy)
	}
	objectDummys.splice(objectDummys.indexOf(dummy), 1)
	scene.remove(dummy)
}

const selectObject = function(instancedMesh, index) {
	for (const dummy of objectDummys) {
		if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
			if (dummy.userData.index === index) {
				selectObjectByDummy(dummy)
			}
		}
	}
}

const selectObjectByDummy = function(dummy) {	
	for (const selectedDummy of selectedDummys) {
		selectedDummy.updateMatrixWorld()
		groupSelector.remove(selectedDummy)
		selectedDummy.matrixWorld.decompose(selectedDummy.position, selectedDummy.quaternion, selectedDummy.scale)
	}
	selectedDummys.push(dummy)
	updateGroupSelectorPos()
	for (const dummy of selectedDummys) {
		groupSelector.attach(dummy)
	}
	//groupSelector.add(dummy)
	//updateSelectedDummys()
	displaySelection(dummy)
	global.transformControl.attach(groupSelector)

	console.error(dummy)
}

const selectRail = function(helper) {
	if (!groupSelector.children.includes(helper)) {
		groupSelector.add(helper)
		global.transformControl.attach(groupSelector)
		selectedDummys.push(helper)
		updateGroupSelectorPos()
		updateSelectedDummys()
	}
}

const deselectAll = function() {
	let dummysToDeselect = []
	for (const dummy of selectedDummys) {
		dummysToDeselect.push(dummy)
		
	}
	for (const dummy of dummysToDeselect) {
		deselectObjectByDummy(dummy)
	}
}

const deselectObject = function(instancedMesh, index) {
	for (const dummy of objectDummys) {
		if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
			if (dummy.userData.index === index) {
				deselectObjectByDummy(dummy)
			}
		}
	}
}

const deselectObjectByDummy = function(dummy) {
	selectedDummys.splice(selectedDummys.indexOf(dummy), 1)
	for (const selectedDummy of selectedDummys) {
		selectedDummy.updateMatrixWorld()
		groupSelector.remove(selectedDummy)
		selectedDummy.matrixWorld.decompose(selectedDummy.position, selectedDummy.quaternion, selectedDummy.scale)
	}
	updateGroupSelectorPos()
	for (const selectedDummy of selectedDummys) {
		groupSelector.attach(selectedDummy)
	}
	undisplaySelection(dummy)
	
	if (selectedDummys.length === 0) {
		global.transformControl.remove(groupSelector)
	}
}

const displaySelection = function(dummy) {
	for (instancedMesh of dummy.userData.instancedMeshes) {
		const wireframeGeo = new global.THREE.WireframeGeometry(instancedMesh.geometry)
		
		const wireframe = new global.THREE.LineSegments(wireframeGeo)
		wireframe.material.depthTest = true
		wireframe.material.opacity = 0.25
		wireframe.material.transparent = true
		wireframe.material.color = new global.THREE.Color("#0000FF")

		wireframe.userData.index = dummy.userData.index
		wireframe.userData.type = "SelectionDisplay"

		dummy.add(wireframe)
	}
}

const undisplaySelection = function(dummy) {
	let childrenToRemove = []

	for (const child of dummy.children) {
		if (child.userData.type === "SelectionDisplay") {
			childrenToRemove.push(child)
		}
	}

	for (const child of childrenToRemove) {
		dummy.remove(child)

		child.geometry.dispose()
		child.material.dispose()
	}
}

const updateSelectedDummys = function() {
	resetGroupSelectorRotAndScale()
	for (const dummy of selectedDummys) {
		toLocalSpace(dummy)
	}
}

const toLocalSpace = function(dummy) {
	let actorPos = {}
	if (dummy.relevantType === "RailPoint") {
		actorPos = global.MapTools.getConsistentTransform(dummy.userData.railPoint)
	}
	// This is more of a hacky solution, but this makes no sense to have in getConsistentTransform
	// Well it actually kinda does.. but not really
	else if (dummy.relevantType === "ControlPoint") {
		actorPos = {
			"Translate": [
				{"value": dummy.userData.controlPoint[0].value},
				{"value": dummy.userData.controlPoint[1].value},
				{"value": dummy.userData.controlPoint[2].value}
			]
		}
	}
	else {
		actorPos = global.MapTools.getConsistentTransform(dummy.userData.actor)
	}

	let posX = actorPos.Translate[0].value - groupSelector.position.x
	let posY = actorPos.Translate[1].value - groupSelector.position.y
	let posZ = actorPos.Translate[2].value - groupSelector.position.z
	
	//let rotX = actorPos.Rotate[0].value - groupSelector.rotation.x // Problem - this is not the same way that threejs calculates rotation.
	//let rotY = actorPos.Rotate[1].value - groupSelector.rotation.y // This is individual origins instead of median point
	//let rotZ = actorPos.Rotate[2].value - groupSelector.rotation.z // - Which matters in 3D
	
	// Easy, probably temp solution: Take it from the global matrix - doesn't work with on-frame computations
	//let euler = new global.THREE.Euler("ZYX").setFromRotationMatrix(dummy.matrixWorld, "ZYX")
	//let rotX = euler.x
	//let rotY = euler.y
	//let rotZ = euler.z

	//let euler2 = new global.THREE.Euler("ZYX").setFromRotationMatrix(new global.THREE.Matrix4().makeRotationFromEuler(new global.THREE.Euler(actorPos.Rotate[0].value, actorPos.Rotate[1].value, actorPos.Rotate[2].value, "ZYX")))
	//console.error(euler)
	//console.error(euler2)

	//let rotX = euler2.x
	//let rotY = euler2.y
	//let rotZ = euler2.z
	
	//let rotX = actorPos.Rotate[0].value
	//let rotY = actorPos.Rotate[1].value
	//let rotZ = actorPos.Rotate[2].value
	

	let scaleX = actorPos.Scale[0].value * groupSelector.scale.x
	let scaleY = actorPos.Scale[1].value * groupSelector.scale.y
	let scaleZ = actorPos.Scale[2].value * groupSelector.scale.z

	dummy.position.x = posX
	dummy.position.y = posY
	dummy.position.z = posZ

	dummy.rotation.x = rotX
	dummy.rotation.y = rotY
	dummy.rotation.z = rotZ

	dummy.scale.x = scaleX
	dummy.scale.y = scaleY
	dummy.scale.z = scaleZ
	//dummy.updateMatrixWorld()


	
}

const updateGroupSelectorPos = function() {
	// Pretty simple, this part finds the midpoint
	let midX = 0
	let midY = 0
	let midZ = 0

	for (const dummy of selectedDummys) {
		let actorTransform = {}
		if (dummy.relevantType === "RailPoint") {
			actorTransform = global.MapTools.getConsistentTransform(dummy.userData.railPoint)
		}
		// This is more of a hacky solution, but this makes no sense to have in getConsistentTransform
		// Well it actually kinda does.. but not really
		else if (dummy.relevantType === "ControlPoint") {
			actorTransform = {
				"Translate": [
					{"value": dummy.userData.controlPoint[0].value},
					{"value": dummy.userData.controlPoint[1].value},
					{"value": dummy.userData.controlPoint[2].value}
				]
			}
		}
		else {
			actorTransform = global.MapTools.getConsistentTransform(dummy.userData.actor)
		}
		midX += actorTransform.Translate[0].value
		midY += actorTransform.Translate[1].value
		midZ += actorTransform.Translate[2].value
	}
	midX = midX / selectedDummys.length
	midY = midY / selectedDummys.length
	midZ = midZ / selectedDummys.length

	// And this part applies it
	groupSelector.position.set(midX, midY, midZ)

	// The reason we don't look at rot or scale is the following:
	// 
	// The only purpose of this function is to put transformControl
	// in a position where the user can see and use it. The user
	// cannot see or use rot or scale in relation to groupSelector,
	// so we can ignore that. toLocalSpace (used in
	// updateSelectedDummys) is already built to account for scale
	// or rot that has changed in the groupSelector.
}

const resetGroupSelectorRotAndScale = function() {
	groupSelector.rotation.set(0,0,0)
	groupSelector.scale.set(1, 1, 1)
}
const resetGroupSelectorTransform = function() {
	groupSelector.position.set(0, 0, 0)
	groupSelector.rotation.set(0, 0, 0)
	groupSelector.scale.set(1, 1, 1)
}

const updateSelectedObjs = function() {
	for (const dummy of selectedDummys) {
		updateSelectedObjectByDummy(dummy)
	}
}

const updateSelectedObjectByDummy = function(dummy) {
	if (dummy.userData.instancedMeshes !== undefined) {
		for (const instancedMesh of dummy.userData.instancedMeshes) {
			instancedMesh.setMatrixAt(dummy.userData.index, dummy.matrixWorld)
			instancedMesh.instanceMatrix.needsUpdate = true
		}
	}
}

module.exports = {
	selectObject: selectObject,
	selectObjectByDummy: selectObjectByDummy,
	selectRail: selectRail,
	deselectObject: deselectObject,
	deselectObjectByDummy: deselectObjectByDummy,
	deselectAll: deselectAll,
	createObjectDummy: createObjectDummy,
	updateSelectedObjs: updateSelectedObjs,
	displaySelection: displaySelection,
	undisplaySelection: undisplaySelection,
	removeDummy: removeDummy,


	initSelectionTools: initSelectionTools,


	objectDummys: objectDummys,
	selectedDummys: selectedDummys,

	getGroupSelector: () => {
		return groupSelector
	},
	getSelectedDummys: () => {
		return selectedDummys
	}
}