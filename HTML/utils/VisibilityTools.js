// TO DO:
// Think about whether it would make sense to add actor groups to arrays.
// Maybe replace the switch statements with that.


const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")


// A function that takes a type of actor (string) and sets its visibility based on the passed bool value
const changeActorGroupVisibility = async function(type, visibility) {
  actorsArray = getActorsOfType(type)
  for (const actor of actorsArray) {
    changeActorVisibility(actor, visibility)
  }
}

// A function to change whether the actor is visible or not.
// Takes in the actor to make the change to.
// Takes in a boolean to represent whether the actor is visible.
const changeActorVisibility = async function(actor, visibility) {
  if (visibility) {
    // We could check here if the actor is already in the scene, but for the sake of speed we're gonna trust the rest of the code.
    ActorTools.setupObjectActor(actor)
  }
  else {
    // Okay, based on the actor we'll first have to find the dummy.
    for (const dummy of SelectionTools.objectDummys) {
      if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actor) {
        SelectionTools.deselectObjectByDummy(dummy, global.transformControl, global.THREE).then(() => {
          ActorTools.removeObjectActorByDummy(dummy)
        })
      }
    }
  }
}



// A function to get actors in sectionData based on what type of actor they are.
// Takes in the type. (A string)

// This could also be moved into a more general file,
// But right now we're only using it for visibility.
const getActorsOfType = function(type) {
  let actorsArray = []
  switch(type) {
    case "invis":
      // We're gonna need to get a whole bunch of actors.
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        switch(actor.UnitConfigName.value) {
          case "Area":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagAnd":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNAnd":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagXOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagCount":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagPulse":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNone":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "EventTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "BottomTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "SpotBgmTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AreaCulling_OuterNPCMementary":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AreaCulling_InnerHide":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "DestinationAnchor":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AirWallCurseGanon":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "CastleBarrier":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "TerrainHideCenterTag":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "AreaCulling_InnerOn":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "NoUseDRCAppTag":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "AirWallHorse":
            // Pass the actor
            actorsArray.push(actor)
            break
          default:
            // Move on
        }
      }
      break
    case "areas":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        switch(actor.UnitConfigName.value) {
          case "Area":
            // Pass this actor
            actorsArray.push(actor)
            break
        }
      }
      break
    case "linktags":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        switch(actor.UnitConfigName.value) {
          case "LinkTagAnd":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNAnd":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagXOr":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagCount":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagPulse":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "LinkTagNone":
            // Pass this actor
            actorsArray.push(actor)
            break
          default:
            // Move on
        }
      }
      break
    case "otherInvis":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        switch(actor.UnitConfigName.value) {
          case "EventTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "BottomTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "SpotBgmTag":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AreaCulling_OuterNPCMementary":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AreaCulling_InnerHide":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "DestinationAnchor":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "AirWallCurseGanon":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "CastleBarrier":
            // Pass this actor
            actorsArray.push(actor)
            break
          case "TerrainHideCenterTag":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "AreaCulling_InnerOn":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "NoUseDRCAppTag":
            // Pass the actor
            actorsArray.push(actor)
            break
          case "AirWallHorse":
            // Pass the actor
            actorsArray.push(actor)
            break
          default:
            // Move on
        }
      }
      break
  }
  return(actorsArray)
}



module.exports = {
  changeActorGroupVisibility: changeActorGroupVisibility,
  changeActorVisibility: changeActorVisibility,
  getActorsOfType: getActorsOfType
}
