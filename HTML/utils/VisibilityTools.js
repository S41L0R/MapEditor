// TO DO:
// Think about whether it would make sense to add actor groups to arrays.
// Maybe replace the switch statements with that.

const actorGroups = {
  "invisActors": {
    "areas": [
      "Area"
    ],
    "linktags": [
      "LinkTagAnd",
      "LinkTagOr",
      "LinkTagNAnd",
      "LinkTagNOr",
      "LinkTagXOr",
      "LinkTagCount",
      "LinkTagPulse",
      "LinkTagNone"
    ],
    "other": [
      "EventTag",
      "BottomTag",
      "SpotBgmTag",
      "AreaCulling_OuterNPCMementary",
      "AreaCulling_InnerHide",
      "DestinationAnchor",
      "AirWallCurseGanon",
      "CastleBarrier",
      "TerrainHideCenterTag",
      "AreaCulling_InnerOn",
      "NoUseDRCAppTag",
      "AirWallHorse",
      "FarModelCullingArea",
      "Obj_SweepCollision",
      "AirWallForE3"
    ]
  }
}




// A function that takes a type of actor (string) and sets its visibility based on the passed bool value
const changeActorGroupVisibility = async function(type, visibility) {
  // Links aren't actors so we have special logic for that
  if (type === "links") {
    if (visibility) {
      global.LinkTools.addLinksToScene()
    }
    else {
      global.LinkTools.removeLinksFromScene()
    }
  }
  // Same with rails
  else if (type === "rails") {
    if (visibility) {
      global.RailTools.initRailObject()
      global.RailHelperTools.initPointsObject()
      global.RailHelperTools.initControlPointConnectorObject()
    }
    else {
      global.RailTools.removeRailObject()
      global.RailHelperTools.removePointsObject()
      global.RailHelperTools.removeControlPointConnectorObject()
    }
  }
  else {
    actorsArray = getActorsOfType(type)
    for (const actor of actorsArray) {
      changeActorVisibility(actor, visibility)
    }
  }
}

// A function to change whether the actor is visible or not.
// Takes in the actor to make the change to.
// Takes in a boolean to represent whether the actor is visible.
const changeActorVisibility = async function(actor, visibility) {
  if (visibility) {
    // We could check here if the actor is already in the scene, but for the sake of speed we're gonna trust the rest of the code.
    global.ActorTools.setupObjectActor(actor)
  }
  else {
    // Okay, based on the actor we'll first have to find the dummy.
    for (const dummy of global.SelectionTools.objectDummys) {
      if (dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index] === actor) {
        global.SelectionTools.deselectObjectByDummy(dummy, global.transformControl, global.THREE)
        global.ActorTools.removeObjectActorByDummy(dummy)
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
        for (const [key, type] of Object.entries(actorGroups.invisActors)) {
          if (type.includes(actor.UnitConfigName.value)) {
            // Pass this actor
            actorsArray.push(actor)
          }
        }
      }
      break
    case "areas":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        if (actorGroups.invisActors.areas.includes(actor.UnitConfigName.value)) {
          // Pass this actor
          actorsArray.push(actor)
        }
      }
      break
    case "linktags":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        if (actorGroups.invisActors.linktags.includes(actor.UnitConfigName.value)) {
          // Pass this actor
          actorsArray.push(actor)
        }
      }
      break
    case "otherInvis":
      for (const actor of global.sectionData.Static.Objs.concat(global.sectionData.Dynamic.Objs)) {
        if (actorGroups.invisActors.other.includes(actor.UnitConfigName.value)) {
          // Pass this actor
          actorsArray.push(actor)
        }
      }
      break
    case "static":
      // Okay, so we'll just return the static obj array.
      return(global.sectionData.Static.Objs)
      break
    case "dynamic":
      // Okay, so we'll just return the dynamic obj array.
      return(global.sectionData.Dynamic.Objs)
      break
  }
  return(actorsArray)
}



module.exports = {
  changeActorGroupVisibility: changeActorGroupVisibility,
  changeActorVisibility: changeActorVisibility,
  getActorsOfType: getActorsOfType
}
