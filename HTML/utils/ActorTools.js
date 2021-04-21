// Deletion Tools:
// -----------------------------------------------------------------------------


// General manager for all actor deletion. Unless an actor and its model need to be managed seperately, use this. Pass in sectionData as maplike, scene as scenelike, and transformControl as transformControlLike unless you have a similar dict to edit instead.
const removeActors = async function(hashIDList, scenelike, maplike, transformControlLike) {
	removeObjectActors(hashIDList, scenelike, transformControlLike);
	removeDataActors(hashIDList, maplike);
}


// Function used to remove actors from the section data or a maplike dict via HashID.
const removeDataActors = async function(hashIDList, maplike) {
	let indexCounter = 0;
	for (const i of maplike.Static.Objs) {
		if (hashIDList.includes(i.HashId.value)) {
			i.splice(indexCounter, 1);
		}
	}
	for (const i of maplike.Dynamic.Objs) {
		if (hashIDList.includes(i.HashId.value)) {
			i.splice(indexCounter, 1);
		}
	}
}

// Function used to remove objects from the scene or a scenelike dict via HashID.
// Probably does not work with instancedMesh support
const removeObjectActors = async function(hashIDList, scenelike, transformControlLike) {
	let indexCounter = 0;
	for (const i of scenelike.children) {
		console.warn(indexCounter)
		if (hashIDList.includes(i.HashID)) {
			if (transformControlLike.object == i && transformControlLike.enabled == true) {
				transformControlLike.detach();
			}
			let meshArray = findMeshesFromObject(i);
			for (const x of meshArray) {
				x.geometry.dispose();
				x.material.dispose();
			}
			scenelike.children.splice(indexCounter, 1)


		}
		indexCounter++;
	}
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

function findMeshesFromObject(object) {
	let meshArray = [];
	for (const i of object.children) {
		if (i.type == "Group") {
			meshArray.concat(findMeshesFromObject(i))
		}
		else {
			meshArray.push(i)
		}
	}
	console.warn(meshArray)
	return(meshArray);
}

module.exports = {
	removeActors: removeActors,
	removeDataActors: removeDataActors,
	removeObjectActors: removeObjectActors,
	updateDataActor: updateDataActor
}
