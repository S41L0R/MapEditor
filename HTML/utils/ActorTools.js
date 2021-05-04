const SelectionTools = require("./SelectionTools.js")

// Deletion Tools:
// -----------------------------------------------------------------------------


// General manager for all actor deletion. Unless an actor and its model need to be managed seperately, use this. Pass in sectionData as maplike, scene as scenelike, and transformControl as transformControlLike unless you have a similar dict to edit instead.
const removeActors = async function(hashIDList, scenelike, maplike, transformControlLike) {
	removeObjectActors(hashIDList, scenelike, transformControlLike)
	removeDataActors(hashIDList, maplike)
}


// Function used to remove actors from the section data or a maplike dict via HashID.
const removeDataActors = async function(hashIDList, maplike) {
	let indexCounter = 0
	for (const i of maplike.Static.Objs) {
		if (hashIDList.includes(i.HashId.value)) {
			i.splice(indexCounter, 1)
		}
	}
	for (const i of maplike.Dynamic.Objs) {
		if (hashIDList.includes(i.HashId.value)) {
			i.splice(indexCounter, 1)
		}
	}
}

// Function used to remove objects from the scene or a scenelike dict via HashID.
// Probably does not work with instancedMesh support
const removeObjectActors = async function(hashIDList, scenelike, transformControlLike) {
	let indexCounter = 0
	for (const i of scenelike.children) {
		console.warn(indexCounter)
		if (hashIDList.includes(i.HashID)) {
			if (transformControlLike.object == i && transformControlLike.enabled == true) {
				transformControlLike.detach()
			}
			let meshArray = findMeshesFromObject(i)
			for (const x of meshArray) {
				x.geometry.dispose()
				x.material.dispose()
			}
			scenelike.children.splice(indexCounter, 1)


		}
		indexCounter++
	}
}

const removeDataActorByDummy = async function(dummy) {
	removeDataActors([dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index]], global.sectionData)
}
const removeObjectActorByDummy = async function(dummy) {
	// Okay, so this is how this function will work:
	// We get the data in the InstanceMatrix for this instance,
	// Then we find the last used "slot" in the instanceMatrix.
	// (This is done by accessing the count property)
	// We swap our data with that data,
	// AND HERE'S THE IMPORTANT PART:
	// We make sure to update any references to index.
	// This way stuff doesn't break.


	// It doesn't matter that we're just getting the first element,
	// these instanceMeshes should have the same count anyway.
	const firstInstancedMesh = dummy.userData.instancedMeshes[0]
	const firstInstanceMatrixObj = dummy.userData.instancedMeshes[0].instanceMatrix
	const itemSize = firstInstanceMatrixObj.itemSize
	const count = firstInstancedMesh.count
	const lastIndex = count - 1 // -1 to account for indices starting from 0

	const index = dummy.userData.index




	for (const instancedMesh of dummy.userData.instancedMeshes) {
		swapInstancedMeshIndicesInInstanceMatrix(instancedMesh, index, lastIndex)
	}

	/*
	findDummyFromInstancedMeshesAndIndex(dummy.userData.instancedMeshes, lastIndex).then((lastIndexDummy) => {
		console.warn("HELLO")
		console.error("HELLO")
		console.log("HELLO")
		console.error(lastIndexDummy)
		swapInstancedMeshIndicesInReferences(dummy, lastIndexDummy)
	})
	*/

	const lastIndexDummy = findDummyFromInstancedMeshesAndIndex(dummy.userData.instancedMeshes, lastIndex)
	swapInstancedMeshIndicesInReferences(dummy, lastIndexDummy)

	// Now the important part:
	for (const instancedMesh of dummy.userData.instancedMeshes) {
		if (instancedMesh.count > 0) {
			instancedMesh.count = instancedMesh.count - 1
		}
	}
	delete dummy
}




function findDummyFromInstancedMeshesAndIndex(instancedMeshArray, index) {
		console.warn(instancedMeshArray)
		console.warn(index)
		/*
		for (const dummy of SelectionTools.objectDummys) {
			if (dummy.userData.index === index) {
				console.warn(dummy.userData.index)
				console.warn(dummy.userData.instancedMeshes)
				if (dummy.userData.instancedMeshes == instancedMeshArray) {
					console.warn("Hi")
					resolve(dummy)
				}
			}
		}
		*/
		console.error(SelectionTools.objectDummys.length)
		for (let dummy of SelectionTools.objectDummys) {
			if (dummy.userData.instancedMeshes == instancedMeshArray) {
				console.warn(instancedMeshArray)
				console.warn(dummy.userData.instancedMeshes)
				if (dummy.userData.index === index) {
					console.warn("Hi")
					return(dummy)
				}
			}
		}
}
async function swapInstancedMeshIndicesInReferences(dummy1, dummy2) {
	const temporarySwapStorage = dummy1.userData.index
	dummy1.userData.index = dummy2.userData.index
	dummy2.userData.index = temporarySwapStorage
}




function swapInstancedMeshIndicesInInstanceMatrix(InstancedMesh, index1, index2) {
	let instanceMatrixObj = InstancedMesh.instanceMatrix
	let itemSize = instanceMatrixObj.itemSize
	let instanceMatrix = instanceMatrixObj.array

	let item1Index = itemSize*index1
	let item2Index = itemSize*index2

	// Swap the portions of the array:
	for (let itemPortionIndex = 0; itemPortionIndex < itemSize; itemPortionIndex++) {
		let item1PortionIndex = item1Index + itemPortionIndex
		let item2PortionIndex = item2Index + itemPortionIndex

		const temporarySwapStorage = instanceMatrix[item1PortionIndex]

		instanceMatrix[item1PortionIndex] = instanceMatrix[item2PortionIndex]
		instanceMatrix[item2PortionIndex] = temporarySwapStorage
	}
	InstancedMesh.instanceMatrix.needsUpdate = true
}


const updateDataActor = async function(dummy) {
	let firstInstancedMesh = dummy.userData.instancedMeshes[0]
	let instancedMeshIndex = dummy.userData.index
	let actor = firstInstancedMesh.userData.actorList[instancedMeshIndex]
	let actorMatrix = dummy.matrixWorld
	let position = new global.THREE.Vector3()
	let rotationQ = new global.THREE.Quaternion()
	let rotationE = new global.THREE.Euler()
	let scale = new global.THREE.Vector3()

	actorMatrix.decompose(position, rotationQ, scale)

	rotationE.setFromQuaternion(rotationQ)

	actor.Translate[0].value = position.x
	actor.Translate[1].value = position.y
	actor.Translate[2].value = position.z


	if (rotationE.x !== 0 && rotationE.y !== 0 && rotationE.z !== 0) {
		console.error("test")
		console.error(rotationE)
		if (rotationE.x !== 0 && rotationE.z !== 0) {
			console.error("test2")
			actor.Rotate = [
				{
					"type": 300,
					"value": rotationE.x
				},
				{
					"type": 300,
					"value": rotationE.y
				},
				{
					"type": 300,
					"value": rotationE.z
				}
			]
		}
		else {
			console.error("test3")
			actor.Rotate = {
				"type": 300,
				"value": rotateE.y
			}
		}
	}

	if (scale.x !== 1 && scale.y !== 1 && scale.z !== 1) {
		if (scale.x !== 1 && scale.z !== 1) {
			actor.Scale = [
				{
					"type": 300,
					"value": scale.x
				},
				{
					"type": 300,
					"value": scale.y
				},
				{
					"type": 300,
					"value": scale.z
				}
			]
		}
		else {
			actor.Scale = {
				"type": 300,
				"value": scale.y
			}
		}
	}
	else {
		delete actor.scale
	}


}

// Does not work with InstancedMesh support:
function findMeshesFromObject(object) {
	let meshArray = []
	for (const i of object.children) {
		if (i.type == "Group") {
			meshArray.concat(findMeshesFromObject(i))
		}
		else {
			meshArray.push(i)
		}
	}
	console.warn(meshArray)
	return(meshArray)
}

module.exports = {
	removeActors: removeActors,
	removeDataActors: removeDataActors,
	removeObjectActors: removeObjectActors,
	updateDataActor: updateDataActor,
	removeObjectActorByDummy: removeObjectActorByDummy,
	removeDataActorByDummy: removeDataActorByDummy
}
