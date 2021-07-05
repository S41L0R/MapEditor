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

        ActorTools.removeObjectActor(actor)
        ActorTools.removeObjectActor(linkData.LinkedActor)
      }
    }
  }
}


const applyLODs = async function() {
  for (const [actor, actorLOD] of forwardLODMap.entries()) {
    // Check if there even *is* a status for the actor...
    if (!forwardLODTracking.has(actor)) {
      forwardLODTracking.set(actor, true)
      backwardLODTracking.set(true, actor)
    }
    // Whelp... distance formula I guess.
    if (Math.abs(Math.sqrt(Math.pow((global.camera.position.x - actor.Translate[0].value), 2) + Math.pow((global.camera.position.y - actor.Translate[1].value), 2) + Math.pow((global.camera.position.z - actor.Translate[2].value), 2))) > LOD_THRESHOLD) {
      // Check if LOD has already been applied..
      if (!forwardLODTracking.get(actor)) {
        forwardLODTracking.set(actor, true)

        // We need to account for if the user had already selected the actor...
        // Some of this code will be after the dummy has been generated.

        let actorDummy = (function () {
      		for (const dummy of SelectionTools.selectedDummys) {
      			if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actor) {
      				return dummy
      			}
      		}
      	})();

        // Swap out the actor and its LOD
        await ActorTools.removeObjectActor(actor)

        await ActorTools.setupObjectActor(actorLOD)

        let actorLODDummy = (function () {
      		for (const dummy of SelectionTools.objectDummys) {
      			if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actorLOD) {
      				return dummy
      			}
      		}
      	})();

        if (actorDummy !== undefined) {
          SelectionTools.selectObjectByDummy(actorLODDummy)
        }
      }
    }
    else {
      // Check if LOD has already been applied..
      if (forwardLODTracking.get(actor)) {
        forwardLODTracking.set(actor, false)

        // We need to account for if the user had already selected the LOD..
        // Some of this code will be after the dummy has been generated.
        let dummyLOD = (function () {
      		for (const dummy of SelectionTools.selectedDummys) {
      			if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actorLOD) {
      				return dummy
      			}
      		}
      	})();


        // Swap the actor and its LOD
        await ActorTools.removeObjectActor(actorLOD)

        await ActorTools.setupObjectActor(actor)

        let actorDummy = (function () {
      		for (const dummy of SelectionTools.objectDummys) {
      			if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actor) {
      				return dummy
      			}
      		}
      	})();

        if (dummyLOD !== undefined) {
          SelectionTools.selectObjectByDummy(actorDummy)
        }


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
