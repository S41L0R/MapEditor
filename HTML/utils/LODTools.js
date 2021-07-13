

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

// LOD Actor Offset by Linking Actor
let forwardLODOffsetMap = new Map()

// Linking Actor Offset by LOD Actor
let backwardLODOffsetMap = new Map()

// Function to init LOD data. global.LinkTools must be initialized.
const initLODs = function() {
  // Clear out any previous stuff
  forwardLODMap = new Map()
  backwardLODMap = new Map()
  forwardLODOffsetMap = new Map()
  backwardLODOffsetMap = new Map()

  // Iterate through all link data entries
  for (const [actor, linkDataList] of global.LinkTools.forwardLinks.entries()) {
    for (const linkData of linkDataList) {
      // Check if it's an LOD link
      if (linkData.DefinitionName === "PlacementLOD") {
        // If so, add it to the LOD maps
        forwardLODMap.set(actor, linkData.LinkedActor)
        backwardLODMap.set(linkData.LinkedActor, actor)

        // Make sure to also grab the offset...
        forwardLODOffsetMap.set(actor, global.MapTools.calcActorOffset(linkData.LinkedActor, actor))
        backwardLODOffsetMap.set(linkData.LinkedActor, global.MapTools.calcActorOffset(actor, linkData.LinkedActor))
      }
    }
  }
}

const updateActorLODData = function(actor) {

  // Check if this actor is a linking actor or not...
  if (global.LinkTools.forwardLinks.has(actor)) {
    const linkDataList = global.LinkTools.forwardLinks.get(actor)
    for (const linkData of linkDataList) {
      // Check if it's an LOD link
      if (linkData.DefinitionName === "PlacementLOD") {
        // If so, add it to the LOD maps
        forwardLODMap.set(actor, linkData.LinkedActor)
        backwardLODMap.set(linkData.LinkedActor, actor)

        // Make sure to also grab the offset...
        forwardLODOffsetMap.set(actor, global.MapTools.calcActorOffset(linkData.LinkedActor, actor))
        backwardLODOffsetMap.set(linkData.LinkedActor, global.MapTools.calcActorOffset(actor, linkData.LinkedActor))
      }
    }
  }

  // If not, check if it's linked to.
  else if (global.LinkTools.backwardLinks.has(actor)) {
    // And if it's liked to, run this function with the linking actor
    updateActorLODData(global.LinkTools.backwardLinks.get(actor))
  }
}

const enableLODs = function() {
  for (const [actor, linkedActor] of forwardLODMap.entries()) {
    global.ActorTools.removeObjectActor(actor)
    global.ActorTools.removeObjectActor(linkedActor)
  }
  applyLODs()
}

const disableLODs = function() {
  for (const [actor, linkedActor] of forwardLODMap.entries()) {
    
    global.ActorTools.removeObjectActor(actor)
    global.ActorTools.removeObjectActor(linkedActor)

    global.ActorTools.setupObjectActor(actor)
    global.ActorTools.setupObjectActor(linkedActor)
  }
}


const applyLODs = async function() {
  let incorrectSelectedActorsList = []
  for (const [actor, actorLOD] of forwardLODMap.entries()) {
    if (Math.abs(Math.sqrt(Math.pow((global.camera.position.x - actor.Translate[0].value), 2) + Math.pow((global.camera.position.y - actor.Translate[1].value), 2) + Math.pow((global.camera.position.z - actor.Translate[2].value), 2))) > LOD_THRESHOLD) {
      if (!forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {

        for (const dummy of global.SelectionTools.selectedDummys) {
          if (dummy.userData.actor === actor) {
            incorrectSelectedActorsList.push(actor)
          }
        }

      }
    }
    else {
      if (forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {

        for (const dummy of global.SelectionTools.selectedDummys) {
          if (dummy.userData.actor === actorLOD) {
            incorrectSelectedActorsList.push(actorLOD)
          }
        }

      }
    }
  }
  for (const [actor, actorLOD] of forwardLODMap.entries()) {
    // Whelp... distance formula I guess.
    if (Math.abs(Math.sqrt(Math.pow((global.camera.position.x - actor.Translate[0].value), 2) + Math.pow((global.camera.position.y - actor.Translate[1].value), 2) + Math.pow((global.camera.position.z - actor.Translate[2].value), 2))) > LOD_THRESHOLD) {
      // Check if LOD has already been applied..
      if (!forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {
        forwardLODTracking.set(actor, true)


        // Swap out the actor and its LOD - And the selection

        await global.ActorTools.setupObjectActor(actorLOD).then(async (modelData) => {

          let dummyLOD = modelData[2]
          await global.ActorTools.removeObjectActor(actor, dummyLOD, incorrectSelectedActorsList.includes(actor))
        
        })
      }
    }
    else {
      // Check if LOD has already been applied..
      if (forwardLODTracking.get(actor) || !forwardLODTracking.has(actor)) {
        forwardLODTracking.set(actor, false)

        // Swap the actor and its LOD - And the selection



        await global.ActorTools.setupObjectActor(actor).then(async (modelData) => {

          let dummyActor = modelData[2]
          await global.ActorTools.removeObjectActor(actorLOD, dummyActor, incorrectSelectedActorsList.includes(actorLOD))
        
        })
      }
    }
  }
}

function applyTransformToLODPair(actor) {
  let LODPairActor = findLODPairActor(actor)
  if (forwardLODOffsetMap.has(actor)) {
    // Okay, LODPairActor is an LOD actor
    global.MapTools.applyActorOffset(LODPairActor, forwardLODOffsetMap.get(actor), actor)
  }
  else if (backwardLODOffsetMap.has(actor)) {
    // Okay, LODPairActor is a linking actor
    global.MapTools.applyActorOffset(LODPairActor, backwardLODOffsetMap.get(actor), actor)
  }
}

// Function to find the LOD pair actor from relevant actor
function findLODPairActor(actor) {
  if (forwardLODMap.has(actor)) {
    return(forwardLODMap.get(actor))
  }
  else if (backwardLODMap.has(actor)) {
    return(backwardLODMap.get(actor))
  }
  else {
    return(undefined)
  }
}

// Function to find the LOD pair dummy from relevant dummy
function findLODPairDummy(dummy) {
  if (forwardLODMap.has(dummy.userData.actor)) {
    // Return the LOD dummy
    let relDummy = (function () {
      for (const dummy of global.SelectionTools.objectDummys) {
        if (dummy.userData.actor === forwardLODMap.get(dummy.userData.actor)) {
          return dummy
        }
      }
    })();

    return(relDummy)

  }
  else if (backwardLODMap.has(dummy.userData.actor)) {
    // Return the linking actor dummy
    let relDummy = (function () {
      for (const dummy of global.SelectionTools.objectDummys) {
        if (dummy.userData.actor === backwardLODMap.get(dummy.userData.actor)) {
          return dummy
        }
      }
    })();

    return(relDummy)
  }
  else {
    return(undefined)
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
  updateActorLODData: updateActorLODData,
  enableLODs: enableLODs,
  disableLODs: disableLODs,
  applyLODs: applyLODs,
  getLODRelatedActor: getLODRelatedActor,
  applyTransformToLODPair: applyTransformToLODPair,

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
