const MapTools = require("./MapTools.js")
const ActorTools = require("./ActorTools.js")
const SelectionTools = require("./SelectionTools.js")
const DataEditorTools = require("./DataEditorTools.js")
const LODTools = require("./LODTools.js")

let actorClipboard = {}


// Takes in a simple dict set up like this:
// {
//   "Static": [actor1, actor2, actor3...],
//   "Dynamic": [actor1, actor2, actor3...]
// }
const copyActors = function(actorDict) {
  // This is easy.
  actorClipboard = actorDict
}

const pasteActors = function() {
  // Ugh, now I have to do actual work.

  // Okay, so now we're actually gonna want to deselect all currently selected objects/actors. This is so that the user can easily start moving around what they just pasted.
  SelectionTools.deselectAll(global.transformControl, global.THREE).then(() => {
    DataEditorTools.removeAllActorsFromSelectedActorsList(global.document).then(() => {
      for (const refActor of actorClipboard.Static) {
        // UGGGH I JUYSYT RELIAIZED THATRY I NEED TO MAKRE COPYT OF OBJECTE AND NTOT REFERERENCE OR ENLSE MESS UP.
        let actor = JSON.parse(JSON.stringify(refActor))
        // We're gonna want to get a new HashID for the actor:
        actor.HashId.value = MapTools.generateHashID()
        // Then make sure it's in sectionData:
        global.sectionData.Static.Objs.push(actor)
        // Wait for that, then set up the object actor.
        ActorTools.setupObjectActor(actor).then((actorModelData) => {
          // Select the new actor.
          SelectionTools.selectObject(actorModelData[0][0], actorModelData[1], global.transformControl, global.THREE)
        })
        DataEditorTools.addActorToSelectedActorsList(actor, global.document)

        // Just in case we're selecting an LOD or an actor with an LOD:
        relatedLODActor = LODTools.getLODRelatedActor(actor)
        if (relatedLODActor !== undefined) {
          DataEditorTools.addActorToSelectedActorsList(relatedLODActor, global.document)
        }
      }
      for (const refActor of actorClipboard.Dynamic) {
        // UGGGH I JUYSYT RELIAIZED THATRY I NEED TO MAKRE COPYT OF OBJECTE AND NTOT REFERERENCE OR ENLSE MESS UP.
        let actor = JSON.parse(JSON.stringify(refActor))
        // We're gonna want to get a new HashID for the actor:
        actor.HashId.value = MapTools.generateHashID()
        // Then make sure it's in sectionData:
        global.sectionData.Dynamic.Objs.push(actor)
        // Wait for that, then set up the object actor.
        ActorTools.setupObjectActor(actor).then((actorModelData) => {
          // Select the new actor.
          SelectionTools.selectObject(actorModelData[0][0], actorModelData[1], global.transformControl, global.THREE)
        })
        DataEditorTools.addActorToSelectedActorsList(actor, global.document)

        // Just in case we're selecting an LOD or an actor with an LOD:
        relatedLODActor = LODTools.getLODRelatedActor(actor)
        if (relatedLODActor !== undefined) {
          DataEditorTools.addActorToSelectedActorsList(relatedLODActor, global.document)
        }
      }
    })
  })
}



module.exports = {
  copyActors: copyActors,
  pasteActors: pasteActors
}
