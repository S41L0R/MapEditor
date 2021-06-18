const ActorTools = require("./ActorTools.js")
const RailTools = require("./RailTools.js")

// These are simply object-like vars indexed by actor objects.
// forwardLinks stores links by actors
// backwardLinks stores links by linked actors
let forwardLinks = new Map()
let backwardLinks = new Map()

let forwardRailLinks = new Map()

// Array to store the actual link objects
let linkObjects = []



const createLinks = async function() {
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
  removeLinkObjectsFromSceneByIncludedActor(actor)
  addRelevantLinkObjectsByIncludedActor(actor)
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
  // Convert the actor positions to THREE.Vector3
  actorPos = new global.THREE.Vector3(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value)
  linkedActorPos = new global.THREE.Vector3(linkedActor.Translate[0].value, linkedActor.Translate[1].value, linkedActor.Translate[2].value)



  // Build up the line geometry
  const curve = new global.THREE.LineCurve3(actorPos, linkedActorPos)
  const points = curve.getPoints( 2 );
  //const geometry = new global.THREE.BufferGeometry().setFromPoints( points )
  const positions = [
    points[0].x, points[0].y, points[0].z,
    points[1].x, points[1].y, points[1].z,
    points[2].x, points[2].y, points[2].z
  ]

  const geometry = new global.LineGeometry()

  geometry.setPositions(positions)


  const colors = new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 1.0, 0.0
  ]);
  geometry.setColors(colors)
  //geometry.addAttribute('color', new global.THREE.BufferAttribute(colors,3));

  // Set up the line material
  const material = new global.LineMaterial({
					linewidth: 1, // in pixels
					vertexColors: true,
					dashed: false,
					alphaToCoverage: true,
  })
  material.resolution.set(window.innerWidth, window.innerHeight)

  // Set up the link object
  const linkObject = new global.Line2( geometry, material )
  linkObject.computeLineDistances()
  linkObject.scale.set(1,1,1)

  linkObject.userData.actor = actor
  linkObject.userData.linkedActor = linkedActor


  // Add it to the linkObject array
  linkObjects.push(linkObject)

  // Add it to the scene
  global.scene.add(linkObject)
}





// Basic function to loop through all linkObjects and delete relevant ones.
const removeLinkObjectsFromSceneByIncludedActor = async function(actor) {
  let linkObjectsForRemoval = []
  for (const linkObject of linkObjects) {
    if (linkObject.userData.actor === actor || linkObject.userData.linkedActor === actor) {
      // Schedule the linkObject for removal
      linkObjectsForRemoval.push(linkObject)
      global.scene.remove(linkObject)
    }
  }
  // Remove relevant linkObjects from linkObjects
  for (const linkObject of linkObjectsForRemoval) {
    linkObjects.splice(linkObjects.indexOf(linkObject), 1)
  }
}

// The reason linkObjects is plural in this function title is to account for
// when two links come from and arrive at the same actors as each other.

// UNTESTED & CURRENTLY UNUSED - Probably works
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
  addRelevantLinkObjectsByIncludedActor: addRelevantLinkObjectsByIncludedActor
}
