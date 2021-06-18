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


module.exports = {
  generateHashID: generateHashID
}
