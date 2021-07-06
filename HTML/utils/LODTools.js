const LinkTools = require("./LinkTools.js")
const ActorTools = require("./ActorTools.js")
const SelectionTools = require("./SelectionTools.js")


// User controlled var
let LOD_THRESHOLD = 500

// LOD actors by linking actors
let forwardLODMap = new Map()

// Linking actors by LOD actors
let backwardLODMap = new Map()

// LOD status by linking actor
// False represents the actual actor showing, true is if the LOD is showing.
let forwardLODTracking = new Map()

// Linking actor by LOD status... why would anyone ever use this?
// Idk.... but I feel like storing it anyway just in case.
let backwardLODTracking = new Map()

// Function to init LOD data. LinkTools must be initialized.
const initLODs = function() {
  // Iterate through all link data entries
  for (const [actor, linkDataList] of LinkTools.forwardLinks.entries()) {
    for (const linkData of linkDataList) {
      // Check if it's an LOD link
      if (linkData.DefinitionName === "PlacementLOD") {
        // If so, add it to the LOD maps
        forwardLODMap.set(actor, linkData.LinkedActor)
        backwardLODMap.set(linkData.LinkedActor, actor)
      }
    }
  }
}

const enableLODs = function() {
  for (const [actor, linkedActor] of forwardLODMap.entries()) {
    //try {
      ActorTools.removeObjectActor(actor)
    //}
    //catch {}
    //try {
      ActorTools.removeObjectActor(linkedActor)
    //}
    //catch {}
  }
  applyLODs()
}

const disableLODs = function() {
  for (const [actor, linkedActor] of forwardLODMap.entries()) {
    //try {
      ActorTools.removeObjectActor(actor)
    //}
    //catch {}
    //try {
      ActorTools.removeObjectActor(linkedActor)
    //}
    //catch {}
    ActorTools.setupObjectActor(actor)
    ActorTools.setupObjectActor(linkedActor)
  }
}


const applyLODs = async function() {
  for (const [actor, actorLOD] of forwardLODMap.entries()) {
    // Whelp... distance formula I guess.
    if (Math.abs(Math.sqrt(Math.pow((global.camera.position.x - actor.Translate[0].value), 2) + Math.pow((global.camera.position.y - actor.Translate[1].value), 2) + Math.pow((global.camera.position.z - actor.Translate[2].value), 2))) > LOD_THRESHOLD) {
      // Check if LOD has already been applied..
      if (!forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {
        forwardLODTracking.set(actor, true)

        // Swap out the actor and its LOD
        // We pass in false so the actual actor dummy isn't removed.
        // False again in order to not deselect the object... yet
        await ActorTools.removeObjectActor(actor, false, false)

        await ActorTools.setupObjectActor(actorLOD)

      }
    }
    else {
      // Check if LOD has already been applied..
      if (forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {
        forwardLODTracking.set(actor, false)

        // Swap the actor and its LOD
        // We pass in false so the actual actorLOD dummy isn't removed.
        // False again in order to not deselect the object... yet
        await ActorTools.removeObjectActor(actorLOD, false, false)

        await ActorTools.setupObjectActor(actor)

      }
    }
  }
  for (const relDummy of SelectionTools.selectedDummys) {
    const selectedActor = relDummy.userData.actor
    if (forwardLODMap.get(selectedActor) !== undefined) {
      // This means that this is not an LOD actor, but has an LOD.
      if (forwardLODTracking.get(selectedActor)) {
        // This means that the LOD is the one rendered
        // We need to swap out the selection in favor of the LOD.

        let actorLODDummy = (function () {
      		for (const dummy of SelectionTools.objectDummys) {
      			if (dummy.userData.actor === forwardLODMap.get(selectedActor)) {
      				return dummy
      			}
      		}
      	})();

        SelectionTools.deselectObjectByDummy(relDummy, global.transformControl, global.THREE)
        SelectionTools.removeDummy(relDummy)
        SelectionTools.selectObjectByDummy(actorLODDummy, global.transformControl, global.THREE)
      }
    }
    if (backwardLODMap.get(selectedActor) !== undefined) {
      // This means that this is an LOD actor.
      if (!forwardLODTracking.get(backwardLODMap.get(selectedActor))) {
        // This means that the non-LOD is the one rendered
        // We need to swap out the selection in favor of the non-LOD.

        let actorDummy = (function () {
      		for (const dummy of SelectionTools.objectDummys) {
      			if (dummy.userData.actor === backwardLODMap.get(selectedActor)) {
      				return dummy
      			}
      		}
      	})();

        SelectionTools.deselectObjectByDummy(relDummy, global.transformControl, global.THREE)
        SelectionTools.removeDummy(relDummy)
        SelectionTools.selectObjectByDummy(actorDummy, global.transformControl, global.THREE)
      }
    }
  }
}

// Function for returning any actor that is either an LOD or the actor relating to the LOD
const getLODRelatedActor = function(actor) {
  if (forwardLODMap.has(actor)) {
    return(forwardLODMap.get(actor))
  }
  else if (backwardLODMap.has(actor)) {
    return(backwardLODMap.get(actor))
  }
}

module.exports = {
  initLODs: initLODs,
  enableLODs: enableLODs,
  disableLODs: disableLODs,
  applyLODs: applyLODs,
  getLODRelatedActor: getLODRelatedActor,

  // Primitive Vars
  getLOD_THRESHOLD: () => {
		return LOD_THRESHOLD
	},
  setLOD_THRESHOLD: (value) => {
		LOD_THRESHOLD = value
	},

  forwardLODMap: forwardLODMap,
  forwardLODTracking: forwardLODTracking
}
