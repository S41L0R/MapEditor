const ActorTools = require("./ActorTools.js")
const RailTools = require("./RailTools.js")

// These are simply object-like vars indexed by actor objects.
// forwardLinks stores links by actors
// backwardLinks stores links by linked actors
let forwardLinks = new Map()
let backwardLinks = new Map()

let forwardRailLinks = new Map()

// This stores link object geometry indices by the linking actor
let linkObjectForwardMapping = new Map()

// This stores link object geometry indices by the linked actor
let linkObjectBackwardMapping = new Map()

// Link object - all the links in one object
let linkObject = new global.LineSegments2()

// Link Geometry - stores all links
let linkGeometry = new global.LineSegmentsGeometry()

// Max number of links in the scene before link refresh:
maxLinks = 1000

// The list of points
const linkPoints = []



// Functions to init the link object
const initLinkObject = function() {
  linkGeometry.setPositions(linkPoints)


  let colorsArray = []
  for (let i = 0; i < linkPoints.length/2; i++) {
    colorsArray.push(
      0.0, 0.0, 1.0,
      1.0, 1.0, 0.0
    )
  }
  const colors = new Float32Array(colorsArray)

  linkGeometry.setColors(colors)

  // Link Material for all links

  const material = new global.LineMaterial({
          linewidth: 3,
          vertexColors: true,
          dashed: false,
          alphaToCoverage: true,
  })

  material.resolution.set(window.innerWidth, window.innerHeight)

  linkObject = new global.LineSegments2(linkGeometry, material)
  linkObject.computeLineDistances()
  global.scene.add(linkObject)
}

const reloadLinkObjectResolution = function() {
  linkObject.material.resolution.set(window.innerWidth, window.innerHeight)
}

const removeLinkObject = function() {
  global.scene.remove(linkObject)
  linkObject.material.dispose()
  linkObject.geometry.dispose()
}

const reloadLinkObject = function() {
  removeLinkObject()
  initLinkObject()
}





const createLinks = async function() {
  initLinkObject()
  storeLinks()
  addLinksToScene()
}

const addLinksToScene = async function() {
  // We don't need to iterate through backwardLinks because it stores the same data
  for (const [actor, links] of forwardLinks.entries()) {
    for (const linkData of links) {
      addLinkToScene(actor, linkData.LinkedActor)
    }
  }

  for (const [actor, links] of forwardRailLinks.entries()) {
    for (const linkData of links) {
      addLinkToScene(actor, linkData.LinkedRail)
    }
  }
}

const removeLinksFromScene = async function() {
  let linkObjectsToRemove = []
  for (const linkObject of linkObjects) {
    global.scene.remove(linkObject)

    // schedule for removal from linkObjects
    linkObjectsToRemove.push(linkObject)
  }
  for (const linkObject of linkObjectsToRemove) {
    linkObjects.splice(linkObjects.indexOf(linkObject), 1)
  }
}


const reloadRelevantLinkObjects = async function(actor) {
  if (linkObjectForwardMapping.has(actor)) {
    for (const forwardMappingData of linkObjectForwardMapping.get(actor)) {
      linkPoints[forwardMappingData.LinkIndex    ] = actor.Translate[0].value
      linkPoints[forwardMappingData.LinkIndex + 1] = actor.Translate[1].value
      linkPoints[forwardMappingData.LinkIndex + 2] = actor.Translate[2].value

      linkPoints[forwardMappingData.LinkIndex + 3] = forwardMappingData.LinkedActor.Translate[0].value
      linkPoints[forwardMappingData.LinkIndex + 4] = forwardMappingData.LinkedActor.Translate[1].value
      linkPoints[forwardMappingData.LinkIndex + 5] = forwardMappingData.LinkedActor.Translate[2].value
    }
  }
  if (linkObjectBackwardMapping.has(actor)) {
    for (const backwardMappingData of linkObjectBackwardMapping.get(actor)) {
      linkPoints[backwardMappingData.LinkIndex    ] = backwardMappingData.LinkedActor.Translate[0].value
      linkPoints[backwardMappingData.LinkIndex + 1] = backwardMappingData.LinkedActor.Translate[1].value
      linkPoints[backwardMappingData.LinkIndex + 2] = backwardMappingData.LinkedActor.Translate[2].value

      linkPoints[backwardMappingData.LinkIndex + 3] = actor.Translate[0].value
      linkPoints[backwardMappingData.LinkIndex + 4] = actor.Translate[1].value
      linkPoints[backwardMappingData.LinkIndex + 5] = actor.Translate[2].value
    }
  }

  // Quick geometry edit
  linkGeometry.setPositions(linkPoints)
}

const addRelevantLinkObjectsByIncludedActor = async function(actor) {
  const forwardLinkDataList = forwardLinks.get(actor)
  if (forwardLinkDataList !== undefined) {
    for (const forwardLinkData of forwardLinkDataList) {
      const linkedActor = forwardLinkData.LinkedActor
      addLinkToScene(actor, linkedActor)
    }
  }

  // We need to also find actors that link to the relevant actor
  const backwardLinkDataList = backwardLinks.get(actor)
  if (backwardLinkDataList !== undefined) {
    for (const backwardLinkData of backwardLinkDataList) {
      addLinkToScene(backwardLinkData.LinkedActor, actor)
    }
  }

  // Rails are important too!
  const forwardRailLinkDataList = forwardRailLinks.get(actor)
  if (forwardRailLinkDataList !== undefined) {
    for (const forwardRailLinkData of forwardRailLinkDataList) {
      addLinkToScene(actor, forwardRailLinkData.LinkedRail)
    }
  }
}
const addLinkToScene = async function(actor, linkedActor) {

  linkPoints.push(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value)
  linkPoints.push(linkedActor.Translate[0].value, linkedActor.Translate[1].value, linkedActor.Translate[2].value)

  const index = linkPoints.length - 6



  if (linkObjectForwardMapping.has(actor)) {
    linkObjectForwardMapping.set(actor, linkObjectForwardMapping.get(actor).concat({"LinkIndex": index, "LinkedActor": linkedActor}))
  }
  else {
    linkObjectForwardMapping.set(actor, [{"LinkIndex": index, "LinkedActor": linkedActor}])
  }

  if (linkObjectBackwardMapping.has(linkedActor)) {
    linkObjectBackwardMapping.set(linkedActor, linkObjectBackwardMapping.get(linkedActor).concat({"LinkIndex": index, "LinkedActor": actor}))
  }
  else {
    linkObjectBackwardMapping.set(linkedActor, [{"LinkIndex": index, "LinkedActor": actor}])
  }

  reloadLinkObject()
}





// Basic function to loop through all linkObjects and delete relevant ones.
const removeLinkObjectsFromSceneByIncludedActor = async function(actor) {
  let forwardIndicesToRemove = []
  let backwardIndicesToRemove = []
  if (forwardLinks.has(actor)) {
    console.error(linkObjectBackwardMapping.get(actor))
    for (const linkObjectForwardMappingData of linkObjectForwardMapping.get(actor)) {
      const index = linkObjectForwardMappingData.LinkIndex
      linkPoints.splice(index, 6)

      // Umm... now we need to splice this index from linkObjectForwardMappingData
      // We'll just store the index for now...
      forwardIndicesToRemove.push(index)
    }
  }
  if (backwardLinks.has(actor)) {
    for (const linkObjectBackwardMappingData of linkObjectBackwardMapping.get(actor)) {
      const index = linkObjectBackwardMappingData.LinkIndex
      linkPoints.splice(index, 6)

      // Umm... now we need to splice this index from linkObjectBackwardMappingData
      // We'll just store the index for now...
      backwardIndicesToRemove.push(index)

    }
  }

  for (const index of forwardIndicesToRemove) {
    linkPoints.splice(index, 6)
    for (const [actor, forwardMappingDataList] of linkObjectForwardMapping.entries()) {
      for (const forwardMappingData of forwardMappingDataList) {
        if (forwardMappingData.LinkIndex > index) {
          forwardMappingData.LinkIndex = forwardMappingData.LinkIndex - 6
        }
      }
    }
  }

  for (const index of backwardIndicesToRemove) {
    linkPoints.splice(index, 6)
    for (const [actor, backwardMappingDataList] of linkObjectBackwardMapping.entries()) {
      for (const backwardMappingData of backwardMappingDataList) {
        if (backwardMappingData.LinkIndex > index) {
          backwardMappingData.LinkIndex = backwardMappingData.LinkIndex - 6
        }
      }
    }
  }
  linkObjectForwardMapping.delete(actor)
  linkObjectBackwardMapping.delete(actor)
  reloadLinkObject()
}

// The reason linkObjects is plural in this function title is to account for
// when two links come from and arrive at the same actors as each other.

// UNTESTED & CURRENTLY UNUSED - Probably works... Just kidding, I optimized things.
// This does NOT WORK.
const removeLinkObjectsFromSceneByConnectionActors = async function(actor, linkedActor) {
  let linkObjectsForRemoval = []
  for (const linkObject of linkObjects) {
    if (linkObject.userData.actor === actor) {
      if (linkObject.userData.linkedActor === linkedActor) {
        // Schedule the linkObject for removal
        linkObjectsForRemoval.push(linkObject)
        global.scene.remove(linkObject)
      }
    }
  }
  // Remove relevant linkObjects from linkObjects
  for (const linkObject of linkObjectsForRemoval) {
    linkObjects.splice(linkObjects.indexOf(linkObject), 1)
  }
}


// Just a function to find all links and store them in a more efficient format.
const storeLinks = function() {
  // Only static actors can be linked.
  for (const actor of global.sectionData.Static.Objs) {
    storeLink(actor)
  }
}

const storeLink = function(actor) {
  if ("LinksToObj" in actor) {
    for (const link of actor.LinksToObj) {
      const linkedActor = ActorTools.getActorFromHashID(link.DestUnitHashId.value)

      // Store the link for this actor.
      const actorLinkData = {
        "DefinitionName": link.DefinitionName.value,
        "LinkedActor": linkedActor
      }
      if (forwardLinks.get(actor) !== undefined) {
        forwardLinks.get(actor).push(actorLinkData)
      }
      else {
        forwardLinks.set(actor, [actorLinkData])
      }

      // Store the link for the referenced actor
      const linkedActorLinkData = {
        "DefinitionName": link.DefinitionName.value,
        "LinkedActor": actor
      }
      if (backwardLinks.get(linkedActor) !== undefined) {
        backwardLinks.get(linkedActor).push(linkedActorLinkData)
      }
      else {
        backwardLinks.set(linkedActor, [linkedActorLinkData])
      }
    }
  }
  // We also want to check if it links to a rail
  if ("LinksToRail" in actor) {
    for (const link of actor.LinksToRail) {
      const actorRailLinkData = {
        "DefinitionName": link.DefinitionName.value,
        "LinkedRail": RailTools.getRailFromHashID(link.DestUnitHashId.value)
      }
      if (forwardRailLinks.get(actor) !== undefined) {
        forwardRailLinks.get(actor).push(actorRailLinkData)
      }
      else {
        forwardRailLinks.set(actor, [actorRailLinkData])
      }
    }
  }
}

// Function to remove links relevant to the actor provided from the links map.
const removeRelevantLinksFromMap = async function(actor) {
  const forwardLinkDataList = forwardLinks.get(actor)
  for (const forwardLinkData of forwardLinkDataList) {
    const linkedActor = forwardLinkData.LinkedActor
    forwardLinks.delete(actor)
    backwardLinks.delete(linkedActor)
  }
}



module.exports = {
  storeLinks: storeLinks,
  storeLink: storeLink,
  addLinksToScene: addLinksToScene,
  removeLinksFromScene: removeLinksFromScene,
  addLinkToScene: addLinkToScene,
  createLinks: createLinks,
  removeLinkObjectsFromSceneByConnectionActors: removeLinkObjectsFromSceneByConnectionActors,
  removeRelevantLinksFromMap: removeRelevantLinksFromMap,
  reloadRelevantLinkObjects: reloadRelevantLinkObjects,
  removeLinkObjectsFromSceneByIncludedActor: removeLinkObjectsFromSceneByIncludedActor,
  addRelevantLinkObjectsByIncludedActor: addRelevantLinkObjectsByIncludedActor,
  reloadLinkObjectResolution: reloadLinkObjectResolution
}
