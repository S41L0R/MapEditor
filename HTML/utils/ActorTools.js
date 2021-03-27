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
	removeObjectActors: removeObjectActors
}
