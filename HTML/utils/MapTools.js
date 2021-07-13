let nextHashID

const generateHashID = function() {
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
		for (rail of global.sectionData.Static.Rails) {
			if (rail.HashId.value > currentNextHashID) {
				currentNextHashID = rail.HashId.value + 1
			}
		}
		nextHashID = currentNextHashID
	}
	let thisHashID = nextHashID
	nextHashID = nextHashID + 1
	return(thisHashID)
}

// A function to calculate one actor's offset from another
const calcActorOffset = function(actor, offsettingActor) {
	let offset = {
		"Translate": [
			{"type": 300},
			{"type": 300},
			{"type": 300}
		],
		"Rotate": [
			{"type": 300},
			{"type": 300},
			{"type": 300}
		],
		"Scale": [
			{"type": 300},
			{"type": 300},
			{"type": 300}
		],
	}

	const actorTransform = getConsistentTransform(actor)
	const offsettingActorTransform = getConsistentTransform(offsettingActor)

	offset.Translate[0].value = actorTransform.Translate[0].value - offsettingActorTransform.Translate[0].value
	offset.Translate[1].value = actorTransform.Translate[1].value - offsettingActorTransform.Translate[1].value
	offset.Translate[2].value = actorTransform.Translate[2].value - offsettingActorTransform.Translate[2].value

	offset.Rotate[0].value = actorTransform.Rotate[0].value - offsettingActorTransform.Rotate[0].value
	offset.Rotate[1].value = actorTransform.Rotate[1].value - offsettingActorTransform.Rotate[1].value
	offset.Rotate[2].value = actorTransform.Rotate[2].value - offsettingActorTransform.Rotate[2].value

	offset.Scale[0].value = actorTransform.Scale[0].value - offsettingActorTransform.Scale[0].value
	offset.Scale[1].value = actorTransform.Scale[1].value - offsettingActorTransform.Scale[1].value
	offset.Scale[2].value = actorTransform.Scale[2].value - offsettingActorTransform.Scale[2].value

	return(offset)
}

// A function to apply offset to an actor
const applyActorOffset = function(actor, offset, offsettingActor) {
	// We're gonna assume the offset was made with calcActorOffset, or another dimension-aware function

	// We'll also need to make sure that we get a consistent offsettingActor transform
	const offsettingActorTransform = getConsistentTransform(offsettingActor)

	if (actor.Translate !== undefined) {
		if (Array.isArray(actor.Translate)) {
			actor.Translate[0].value = offset.Translate[0].value + offsettingActorTransform.Translate[0].value
    		actor.Translate[1].value = offset.Translate[1].value + offsettingActorTransform.Translate[1].value
    		actor.Translate[2].value = offset.Translate[2].value + offsettingActorTransform.Translate[2].value
		}
		else {
			// This should not happen, the translation isn't 3D, and that isn't normal.

			console.error(actor)
			throw new Error(`
			Error with MapTools.applyActorOffset: Translation is not in 3D space or is formatted incorrectly.

			This can be accounted for in MapTools.js, however this is not normal and it is 
			likely that there is a greater problem with the input.
			`)
		}
	}
	else {
		// This should DEFINITELY not happen.

		console.error(actor)
		throw new Error(`
		Error with MapTools.applyActorOffset: Translation is undefined.

		This can be accounted for in MapTools.js, however this is highly unlikely to be normal.
		There is likely a greater problem with the input.
		`)
	}

	if (actor.Rotate !== undefined) {
		if (Array.isArray(actor.Rotate)) {
			actor.Rotate[0].value = offset.Rotate[0].value + offsettingActorTransform.Rotate[0].value
    		actor.Rotate[1].value = offset.Rotate[1].value + offsettingActorTransform.Rotate[1].value
    		actor.Rotate[2].value = offset.Rotate[2].value + offsettingActorTransform.Rotate[2].value
		}
		else {
			actor.Rotate = [
				{
					"type": 300,
					"value": offset.Rotate[0].value + offsettingActorTransform.Rotate[0].value
				},
				{
					"type": 300,
					"value": offset.Rotate[1].value + offsettingActorTransform.Rotate[1].value
				},
				{
					"type": 300,
					"value": offset.Rotate[2].value + offsettingActorTransform.Rotate[2].value
				}
			]
		}
	}
	else {
		actor.Rotate = [
			{
				"type": 300,
				"value": offset.Rotate[0].value + offsettingActorTransform.Rotate[0].value
			},
			{
				"type": 300,
				"value": offset.Rotate[1].value + offsettingActorTransform.Rotate[1].value
			},
			{
				"type": 300,
				"value": offset.Rotate[2].value + offsettingActorTransform.Rotate[2].value
			}
		]
	}

	if (actor.Scale !== undefined) {
		if (Array.isArray(actor.Scale)) {
			actor.Scale[0].value = offset.Scale[0].value + offsettingActorTransform.Scale[0].value
    		actor.Scale[1].value = offset.Scale[1].value + offsettingActorTransform.Scale[1].value
    		actor.Scale[2].value = offset.Scale[2].value + offsettingActorTransform.Scale[2].value
		}
		else {
			actor.Scale = [
				{
					"type": 300,
					"value": offset.Scale[0].value + offsettingActorTransform.Scale[0].value
				},
				{
					"type": 300,
					"value": offset.Scale[1].value + offsettingActorTransform.Scale[1].value
				},
				{
					"type": 300,
					"value": offset.Scale[2].value + offsettingActorTransform.Scale[2].value
				}
			]
		}
	}
	else {
		actor.Scale = [
			{
				"type": 300,
				"value": offset.Scale[0].value + offsettingActorTransform.Scale[0].value
			},
			{
				"type": 300,
				"value": offset.Scale[1].value + offsettingActorTransform.Scale[1].value
			},
			{
				"type": 300,
				"value": offset.Scale[2].value + offsettingActorTransform.Scale[2].value
			}
		]
	}
}

const getConsistentTransform = function(inputTransformDict) {
	let outputTransformDict = {
		"Translate": [
			{},
			{},
			{}
		],
		"Rotate": [
			{},
			{},
			{}
		],
		"Scale": [
			{},
			{},
			{}
		]
	}
	if (inputTransformDict.Translate !== undefined) {
		if (Array.isArray(inputTransformDict.Translate)) {
			// Okay, this should be three-dimensional translation
			// If it wasn't, I'd be worried
			outputTransformDict.Translate[0].type = inputTransformDict.Translate[0].type
			outputTransformDict.Translate[0].value = inputTransformDict.Translate[0].value
			outputTransformDict.Translate[1].type = inputTransformDict.Translate[1].type
			outputTransformDict.Translate[1].value = inputTransformDict.Translate[1].value
			outputTransformDict.Translate[2].type = inputTransformDict.Translate[2].type
			outputTransformDict.Translate[2].value = inputTransformDict.Translate[2].value
		}
		else {
			// This should not happen, the translation isn't 3D, and that isn't normal.

			console.error(inputTransformDict)
			throw new Error(`
			Error with MapTools.getConsistentTransform: Translation is not in 3D space or is formatted incorrectly.

			This can be accounted for in MapTools.js, however this is not normal and it is 
			likely that there is a greater problem with the input.
			`)
		}
	}
	else {
		// This should DEFINITELY not happen.

		console.error(inputTransformDict)
		throw new Error(`
		Error with MapTools.getConsistentTransform: Translation is undefined.

		This can be accounted for in MapTools.js, however this is highly unlikely to be normal.
		There is likely a greater problem with the input.
		`)
	}

	if (inputTransformDict.Rotate !== undefined) {
		if (Array.isArray(inputTransformDict.Rotate)) {
			// Okay, this should be three-dimensional rotation

			outputTransformDict.Rotate[0].type = inputTransformDict.Rotate[0].type
			outputTransformDict.Rotate[0].value = inputTransformDict.Rotate[0].value
			outputTransformDict.Rotate[1].type = inputTransformDict.Rotate[1].type
			outputTransformDict.Rotate[1].value = inputTransformDict.Rotate[1].value
			outputTransformDict.Rotate[2].type = inputTransformDict.Rotate[2].type
			outputTransformDict.Rotate[2].value = inputTransformDict.Rotate[2].value
		}
		else {
			// This must be one-dimensional rotation

			outputTransformDict.Rotate[0].type = 300
			outputTransformDict.Rotate[0].value = 0
			outputTransformDict.Rotate[1].type = inputTransformDict.Rotate.type
			outputTransformDict.Rotate[1].value = inputTransformDict.Rotate.value
			outputTransformDict.Rotate[2].type = 300
			outputTransformDict.Rotate[2].value = 0
		}
	}
	else {
		outputTransformDict.Rotate = [
			{
				"type": 300,
				"value": 0
			},
			{
				"type": 300,
				"value": 0
			},
			{
				"type": 300,
				"value": 0
			}
		]
	}

	if (inputTransformDict.Scale !== undefined) {
		if (Array.isArray(inputTransformDict.Scale)) {
			// Okay, this should be three-dimensional scale

			outputTransformDict.Scale[0].type = inputTransformDict.Scale[0].type
			outputTransformDict.Scale[0].value = inputTransformDict.Scale[0].value
			outputTransformDict.Scale[1].type = inputTransformDict.Scale[1].type
			outputTransformDict.Scale[1].value = inputTransformDict.Scale[1].value
			outputTransformDict.Scale[2].type = inputTransformDict.Scale[2].type
			outputTransformDict.Scale[2].value = inputTransformDict.Scale[2].value
		}
		else {
			// This must be one-dimensional scale

			outputTransformDict.Scale = [
				{
					"type": inputTransformDict.Scale.type,
					"value": inputTransformDict.Scale.value
				},
				{
					"type": inputTransformDict.Scale.type,
					"value": inputTransformDict.Scale.value
				},
				{
					"type": inputTransformDict.Scale.type,
					"value": inputTransformDict.Scale.value
				}
			]
		}
	}
	else {
		outputTransformDict.Scale = [
			{
				"type": 300,
				"value": 1
			},
			{
				"type": 300,
				"value": 1
			},
			{
				"type": 300,
				"value": 1
			}
		]
	}
	return(outputTransformDict)
}


module.exports = {
  generateHashID: generateHashID,
  calcActorOffset: calcActorOffset,
  applyActorOffset: applyActorOffset,
  getConsistentTransform: getConsistentTransform
}
