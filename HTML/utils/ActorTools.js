// DOCS
// =============================================================================

// removeActors
// // Takes:
// // // hashIDList, scenelike, maplike, transformControlLike
// // Removes an actor from the scene and from a map file.
// // Flags:
// // // NeedsConvertToGlobal

// removeDataActors
// // Takes:
// // // hashIDList, maplike
// // Removes actors from a map file in bulk via hashIDList.
// // Flags:
// // // NeedsConvertToGlobal

// removeDataActorByDummy
// // Takes:
// // // dummy
// // Removes an actor from the global sectionData via a dummy.

// removeObjectActorByDummy
// // Takes:
// // // dummy
// // Removes an actor from the scene via a dummy.

// updateDataActor
// // Takes:
// // // dummy
// // Updates the actor in the map file via the object properties.



// =============================================================================

const SelectionTools = require("./SelectionTools.js")
const ModelTools = require("./ModelTools.js")



let nextHashID

// Deletion Tools:
// -----------------------------------------------------------------------------


// General manager for all actor deletion. Unless an actor and its model need to be managed seperately, use this. Pass in sectionData as maplike, scene as scenelike, and transformControl as transformControlLike unless you have a similar dict to edit instead.
const removeActors = async function(hashIDList, scenelike, maplike, transformControlLike) {
	removeObjectActors(hashIDList, scenelike, transformControlLike)
	removeDataActors(hashIDList, maplike)
}





// General manager for all dynamic actor creation (not including just generally adding actors to the scene during scene initialization.)
const addDynamicActor = async function(unitConfigName, position, scenelike, maplike, intersectables) {

	let actor = addDynamicDataActor(unitConfigName, position)
	setupObjectActor(actor)
}

// General manager for all static actor creation (not including just generally adding actors to the scene during scene initialization.)
const addStaticActor = async function(unitConfigName, position, scenelike, maplike, intersectables) {

	let actor = addStaticDataActor(unitConfigName, position)
	setupObjectActor(actor)
}



/*
function addObjectActor(actor, scenelike, intersectables, unitConfigName) {
	let currentIndex
	if (ModelTools.modelDict[unitConfigName] !== undefined) {
		currentIndex = ModelTools.modelDict[unitConfigName].count + 1
		ModelTools.modelDict[unitConfigName].count = ModelTools.modelDict[unitConfigName].count + 1
	}
	else {
		currentIndex = ModelTools.basicMeshDict["basicCube"].count + 1
		ModelTools.basicMeshDict["basicCube"].count = ModelTools.basicMeshDict["basicCube"].count + 1
	}

	SceneTools.addActorToScene(actor, scenelike, intersectables, currentIndex)
}
*/


const setupObjectActor = async function(actor) {
	switch (ModelTools.modelDict[actor.UnitConfigName.value]) {
		case undefined:
			switch (actor.UnitConfigName.value) {
				case "Area":
					if ("!Parameters" in actor) {
						if ("Shape" in actor["!Parameters"]) {
							switch (actor["!Parameters"].Shape.value) {
								case "Sphere":
									setupBasicMeshActor(actor, "areaSphere").then((actorModelData) => {
										return(actorModelData)
									})
								case "Capsule":
									setupBasicMeshActor(actor, "areaCapsule").then((actorModelData) => {
										return(actorModelData)
									})
								default:
									setupBasicMeshActor(actor, "areaBox").then((actorModelData) => {
										return(actorModelData)
									})
							}
						}
						else {
							setupBasicMeshActor(actor, "areaBox").then((actorModelData) => {
								return(actorModelData)
							})
						}
					}
					else {
						setupBasicMeshActor(actor, "areaBox").then((actorModelData) => {
							return(actorModelData)
						})
					}
					break
				case "LinkTagAnd":
					// Do something
					break
				case "LinkTagOr":
					// Do something
					break
				case "LinkTagNAnd":
					// Do something
					break
				case "LinkTagNOr":
					// Do something
					break
				case "LinkTagXOr":
					// Do something
					break
				case "LinkTagCount":
					// Do something
					break
				case "LinkTagPulse":
					// Do something
					break
				case "LinkTagNone":
					// Do something
					break
				default:
					// Just give it a basic cube model.
					setupBasicMeshActor(actor, "basicCube").then((actorModelData) => {
						return(actorModelData)
					})
			}
			break
		default:
			setupModelDictActor(actor).then((actorModelData) => {
				return(actorModelData)
			})
	}
}

async function setupBasicMeshActor(actor, basicMeshKey) {
	// First up, we need to check on whether there are already too many instanced
	// mesh indices.
	if (ModelTools.basicMeshDict[basicMeshKey].count === ModelTools.basicMeshDict[basicMeshKey].instanceMatrix.count) {
		// We have too many actors! We'll need to figure out what to do in this case. (Probably re-create the instancedMesh)
	}
	else {
		// Okay, we're good.
		console.warn(ModelTools.basicMeshDict[basicMeshKey])
		let actorModel = ModelTools.basicMeshDict[basicMeshKey]
		let index = actorModel.count
		actorModel.count = actorModel.count + 1
		createActorMatrix(actor).then((actorMatrix) => {
			actorModel.setMatrixAt(index, actorMatrix)
			actorModel.instanceMatrix.needsUpdate = true
			SelectionTools.createObjectDummy([actorModel], index, global.THREE, global.scene)

			actorModel.userData.actorList[index] = actor
		})
	}
	return([[actorModel], index])
}


async function setupModelDictActor(actor) {
	createActorMatrix(actor).then((actorMatrix) => {
		// Get the actor name and store it as the key we'll be using to access the model:
		let modelDictKey = actor.UnitConfigName.value
		// Eh.. all instancedMeshes of the same type should have the same index.. I think?
		let index = ModelTools.modelDict[modelDictKey][0].count

		for (const actorModel of ModelTools.modelDict[modelDictKey]) {
			// First up, we need to check on whether there are already too many instanced
			// mesh indices.
			if (actorModel.count === actorModel.instanceMatrix.count) {
				// We have too many actors! We'll need to figure out what to do in this case. (Probably re-create the instancedMesh)

				// Right now we'll just return
				return
			}
			else {
				// Okay, we're good.
				actorModel.count = actorModel.count + 1

				actorModel.setMatrixAt(index, actorMatrix)
				actorModel.instanceMatrix.needsUpdate = true

				actorModel.userData.actorList[index] = actor

			}
		}
		SelectionTools.createObjectDummy(ModelTools.modelDict[modelDictKey], index, global.THREE, global.scene)
		return([ModelTools.modelDict[modelDictKey], index])
	})
}


async function createActorMatrix(actor) {
	// Set actorModel transform:
	let actorMatrix = new global.THREE.Matrix4()

	let position = new global.THREE.Vector3(0, 0, 0)
	let rotation = new global.THREE.Quaternion(0, 0, 0, 0)
	let scale = new global.THREE.Vector3(1, 1, 1)

	position.set(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value)

	// Try to apply rotation from global.THREE-dimensional param, if only one dimension exists apply that instead.
	try {
		rotation.setFromEuler(new global.THREE.Euler(actor.Rotate[0].value, actor.Rotate[1].value, actor.Rotate[2].value, "ZYX"))
	}
	catch {

		// Just in case it's 1D rotation
		try {
			rotation.setFromEuler(new global.THREE.Euler(0, actor.Rotate.value, 0, "ZYX"))
		}

		// In case there is no rotation.
		catch {
			rotation.setFromEuler(new THREE.Euler(0, 0, 0, "ZYX"))
		}
	}

	// Try to apply scale, if it doesn't exist add some.
	try {
		scale.set(actor.Scale[0].value, actor.Scale[1].value, actor.Scale[2].value)
	}
	catch {
		// This could also mean that there's only 1 scale value, try that first.
		try {
			scale.set(actor.Scale.value, actor.Scale.value, actor.Scale.value)
		}
		catch {
			scale.set(1, 1, 1)
		}
	}
	actorMatrix.compose(position, rotation, scale)
	//actorMatrix.compose(new global.THREE.Vector3(0, 0, 0), new global.THREE.Quaternion(0, 0, 0, 0).setFromEuler(new global.THREE.Euler(0, 0, 0, "ZYX")), new global.THREE.Vector3(1, 1, 1))

	return(actorMatrix)
}





function addDynamicDataActor(unitConfigName, position) {
	// The first thing we've got to do is create the actual actor.
	let actor = {
		"UnitConfigName": {},
		"Translate": [{},{},{}],
		"HashId": {}
	}
	actor.UnitConfigName.value = unitConfigName
	actor.UnitConfigName.type = 400
	actor.Translate[0].value = position.x
	actor.Translate[0].type = 300
	actor.Translate[1].value = position.y
	actor.Translate[1].type = 300
	actor.Translate[2].value = position.z
	actor.Translate[2].type = 300
	actor.HashId.value = generateHashID()
	actor.HashId.type = 102
	global.sectionData.Dynamic.Objs.push(actor)
	return actor
}



function addStaticDataActor(unitConfigName, position) {
	// The first thing we've got to do is create the actual actor.
	let actor = {
		"UnitConfigName": {},
		"Translate": [{},{},{}],
		"HashId": {}
	}
	actor.UnitConfigName.value = unitConfigName
	actor.UnitConfigName.type = 400
	actor.Translate[0].value = position.x
	actor.Translate[0].type = 300
	actor.Translate[1].value = position.y
	actor.Translate[1].type = 300
	actor.Translate[2].value = position.z
	actor.Translate[2].type = 300
	actor.HashId.value = generateHashID()
	actor.HashId.type = 102
	global.sectionData.Static.Objs.push(actor)
	return actor
}


function generateHashID() {
	// If we don't already have the next HashID, we generate it.
	if (nextHashID === undefined) {
		let currentNextHashID = 0
		for (actor of global.sectionData.Static.Objs) {
			if (actor.HashId.value > currentNextHashID) {
				currentNextHashID = actor.HashId.value + 1
			}
		}
		for (actor of global.sectionData.Dynamic.Objs) {
			if (actor.HashId.value > currentNextHashID) {
				currentNextHashID = actor.HashId.value + 1
			}
		}
		nextHashID = currentNextHashID
	}
	let thisHashID = nextHashID
	nextHashID = nextHashID + 1
	return(thisHashID)
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
		for (let dummy of SelectionTools.objectDummys) {
			if (dummy.userData.instancedMeshes == instancedMeshArray) {
				if (dummy.userData.index === index) {
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


// Updates the actor in the map file
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
		if (rotationE.x !== 0 && rotationE.z !== 0) {
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

// Deprecated


// Does not work well with instancedMesh support
// -----------------------------------------------------------------------------

// Function used to remove objects from the scene or a scenelike dict via HashID.
const removeObjectActors = async function(hashIDList, scenelike, transformControlLike) {
	let indexCounter = 0
	for (const i of scenelike.children) {
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

// Find meshes inside an object
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
	return(meshArray)
}


// -----------------------------------------------------------------------------

module.exports = {
	removeActors: removeActors,
	removeDataActors: removeDataActors,
	removeObjectActors: removeObjectActors,
	updateDataActor: updateDataActor,
	removeObjectActorByDummy: removeObjectActorByDummy,
	removeDataActorByDummy: removeDataActorByDummy,
	addDynamicActor: addDynamicActor,
	addStaticActor: addStaticActor,
	setupObjectActor: setupObjectActor,
	nextHashID: nextHashID
}
