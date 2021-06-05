let objectDummys = []
let groupSelector
let selectedDummys = []





const createObjectDummy = async function (instancedMeshes, index, THREE, scenelike) {
	// We're using groups because they are simple and don't need geometry or anything.
	// Not that this will hold anything - though it could hold debug objects.
	const dummyObject = new THREE.Group()
	dummyObject.userData.instancedMeshes = instancedMeshes
	dummyObject.userData.index = index
	instancedMeshes[0].getMatrixAt(index, dummyObject.matrix)
	instancedMeshes[0].getMatrixAt(index, dummyObject.matrixWorld)

	/*
	for (let i = 0; i <= 16; i++) {
		console.error(instancedMeshes[0].instanceMatrix.array)
		let num = instancedMeshes[0].instanceMatrix.array[index + i]
		dummyObject.matrix.elements[i] = num
	}
	*/
	dummyObject.matrixAutoUpdate = false
	objectDummys.push(dummyObject)
	scenelike.add(dummyObject)


	/* Dummy visualizer
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
	*/



	return(dummyObject)
}
const initSelectionTools = async function (THREE, scenelike) {
	groupSelector = new THREE.Group()
	groupSelector.userData.type = "GroupSelector"

	/* groupSelector visualizer
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
	*/


	scenelike.add(groupSelector)
}


const removeDummy = function (dummy) {
	const selectedDummysDummyIndex = selectedDummys.indexOf(dummy)
	selectedDummys.splice(selectedDummysDummyIndex, 1)
	const objectDummysDummyIndex = objectDummys.indexOf(dummy)
	objectDummys.splice(objectDummysDummyIndex, 1)
	groupSelector.remove(dummy)
	global.scene.remove(dummy)
	updateGroupSelectorPos(THREE, transformControl)

	// Don't know if this does anything but we'll do it anyway:
	delete dummy
}

const selectObject = async function (instancedMesh, index, transformControl, THREE) {
	for (const dummy of objectDummys) {
		if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
			if (dummy.userData.index === index) {
				if (!selectedDummys.includes(dummy)) {
					selectedDummys.push(dummy)
					groupSelector.add(dummy)
					/*
          for (selectedDummy of selectedDummys) {
            groupSelector.remove(selectedDummy)
          }
          */
					updateGroupSelectorPos(THREE, transformControl)
					/*
          for (selectedDummy of selectedDummys) {
            if (selectedDummy !== dummy) {
              groupSelector.add(selectedDummy)
            }
          }
          groupSelector.attach(dummy)
          */
					//groupSelector.attach(dummy);
					updateSelectedDummys(THREE)
					displaySelection(dummy, THREE)
					transformControl.attach(groupSelector)

				}
			}
		}
	}
}

const selectObjectByDummy = async function (dummy, transformControl, THREE) {
	if (!selectedDummys.includes(dummy)) {
		selectedDummys.push(dummy)
		groupSelector.add(dummy)
		/*
	  for (selectedDummy of selectedDummys) {
	    groupSelector.remove(selectedDummy)
	  }
	  */
		updateGroupSelectorPos(THREE, transformControl)
		/*
	  for (selectedDummy of selectedDummys) {
	    if (selectedDummy !== dummy) {
	      groupSelector.add(selectedDummy)
	    }
	  }
	  groupSelector.attach(dummy)
	  */
		//groupSelector.attach(dummy);
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
					undisplaySelection(dummy, THREE)
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
			undisplaySelection(dummy, THREE)
		}
		transformControl.attach(groupSelector)
	}
}


const deselectAll = async function (transformControl, THREE) {
	for (const dummy of selectedDummys) {
		groupSelector.remove(dummy)
		if (!(dummy.relevantType === "RailPoint" || dummy.relevantType === "ControlPoint")) {
			undisplaySelection(dummy, global.THREE)
		}
		else {
			// We need to make sure that the matrixWorld also carries over to the pos and the normal matrix
			dummy.matrix = dummy.matrixWorld
			dummy.position.setFromMatrixPosition(dummy.matrixWorld)
			global.scene.add(dummy)
		}
		resetGroupSelectorPos()
	}
	global.transformControl.detach(groupSelector)
	selectedDummys.splice(0, selectedDummys.length)
}

const selectRail = async function (helper) {
	groupSelector.add(helper)
	global.transformControl.attach(groupSelector)
	selectedDummys.push(helper)
	updateGroupSelectorPos(global.THREE, global.transformControl)
	updateSelectedDummys(global.THREE)






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
	midX = 0
	midY = 0
	midZ = 0
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

	// Just some meh code to make sure the transformControl doesn't glitch out
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
	let newRotEuler = new THREE.Euler(rotX, rotY, rotZ)
	//let newRotQuaternion = new THREE.Quaternion().setFromEuler(newRotEuler);

	let oldScaleVector = new THREE.Vector3().setFromMatrixScale(object.matrixWorld)
	let scaleX = oldScaleVector.x - groupSelector.scale.x
	let scaleY = oldScaleVector.y - groupSelector.scale.y
	let scaleZ = oldScaleVector.z - groupSelector.scale.z
	let newScaleVector = new THREE.Vector3(scaleX, scaleY, scaleZ)


	//object.position.set(newPosVector.x, newPosVector.y, newPosVector.z);
	//object.rotation.set(rotX, rotY, rotZ);
	//object.scale.set(newScaleVector.x, -newScaleVector.y, newScaleVector.z);
	//object.updateMatrix();
	//object.matrix.makeRotationFromEuler(newRotEuler)
	//object.matrix.compose(newPosVector, new THREE.Quaternion().setFromRotationMatrix(object.matrix), newScaleVector)
	object.matrix.setPosition(posX, posY, posZ)
	object.position.set(posX, posY, posZ)
	//object.matrix.setScale(scaleX, scaleY, scaleZ)
}

const displaySelection = async function(dummy, THREE) {
	/*
  // Should make things look red but doesn't work.
  console.error(dummy)
  let instancedMesh = dummy.userData.instancedMeshes;
  let index = dummy.userData.index;

  instancedMesh.setColorAt(index, new THREE.Color("#FF0000"));
  instancedMesh.instanceColor.needsUpdate = true;

  */

	for (instancedMesh of dummy.userData.instancedMeshes) {
		const wireframeGeo = new THREE.WireframeGeometry( instancedMesh.geometry )

		const wireframe = new THREE.LineSegments( wireframeGeo )
		wireframe.material.depthTest = true
		wireframe.material.opacity = 0.25
		wireframe.material.transparent = true
		wireframe.material.color = new THREE.Color("#0000FF")

		wireframe.userData.index = dummy.userData.index

		instancedMesh.getMatrixAt(dummy.userData.index, wireframe.matrix)
		wireframe.matrixAutoUpdate = false

		instancedMesh.add(wireframe)

	}
}

const undisplaySelection = async function(dummy, THREE) {
	for (instancedMesh of dummy.userData.instancedMeshes) {
		for (wireframe of instancedMesh.children) {
			if (wireframe.userData.index === dummy.userData.index) {
				instancedMesh.remove(wireframe)
				wireframe.material.dispose()
				wireframe.geometry.dispose()
			}
		}
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
