// Requires
// -----------------------------------------------------------------------------
const RayCastTools = require("./RayCastTools.js")
const ModelTools = require("./ModelTools.js")



let currentBasicCubeIndex = 0;

const addActorsToScene = async function(scenelike, maplike, intersectables, BufferGeometryUtils, colladaLoader, sectionName, THREE) {
  return ModelTools.loadModels(maplike, BufferGeometryUtils, colladaLoader, sectionName, THREE).then(() => {
    console.warn("models should have loaded")
    let currentIndexDict = {}
    maplike.Static.Objs.forEach((actor) => {
      if (currentIndexDict[actor.UnitConfigName.value] === undefined) {
        currentIndexDict[actor.UnitConfigName.value] = 0;
      }
      else {
        currentIndexDict[actor.UnitConfigName.value] = currentIndexDict[actor.UnitConfigName.value] + 1;
      }
      addActorToScene(actor, scenelike, intersectables, currentIndexDict[actor.UnitConfigName.value])
    })
    maplike.Dynamic.Objs.forEach((actor) => {
      if (currentIndexDict[actor.UnitConfigName.value] === undefined) {
        currentIndexDict[actor.UnitConfigName.value] = 0;
      }
      else {
        currentIndexDict[actor.UnitConfigName.value] = currentIndexDict[actor.UnitConfigName.value] + 1;
      }
      addActorToScene(actor, scenelike, intersectables, currentIndexDict[actor.UnitConfigName.value])
    })
  })
}

/*
const addActorToScene = async function(actor, scenelike, intersectables) {
  if (ModelTools.modelDict[actor.UnitConfigName.value] !== undefined) {

    console.warn("actorMesh")
    actorModel = ModelTools.modelDict[actor.UnitConfigName.value].clone()

    // Set actorModel transform:

    actorModel.position.set(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value)

    // Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
    try {
      actorModel.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
    }
    catch {

      // Just in case it's 1D rotation
      try {
        actorModel.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
      }

      // In case there is no rotation.
      catch {
        actorModel.rotation.set(0, 0, 0)
      }
    }

    // Try to apply scale, if it doesn't exist add some.
    try {
      actorModel.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
    }
    catch {
      // This could also mean that there's only 1 scale value, try that first.
      try {
        actorModel.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
      }
      catch {
        actorModel.scale.set(1, 1, 1)
      }
    }

    // Add actorModel to scenelike:

    scenelike.add(actorModel)
  }
  else {
    // We can put the standard cube mesh
    console.warn("cubeMesh")

    const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

    const actorCubeModel = new THREE.Mesh( geometry, material );

    actorCubeModel.position.set(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value)

    // Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
    try {
      actorCubeModel.rotation.set(i.Rotate[0].value * Math.PI / 180, i.Rotate[1].value * Math.PI / 180, i.Rotate[2].value * Math.PI / 180);
    }
    catch {

      // Just in case it's 1D rotation
      try {
        actorCubeModel.rotation.set(0, i.Rotate.value * Math.PI / 180, 0)
      }

      // In case there is no rotation.
      catch {
        actorCubeModel.rotation.set(0, 0, 0)
      }
    }

    // Try to apply scale, if it doesn't exist add some.
    try {
      actorCubeModel.scale.set(i.Scale[0].value, i.Scale[1].value, i.Scale[2].value);
    }
    catch {
      // This could also mean that there's only 1 scale value, try that first.
      try {
        actorCubeModel.scale.set(i.Scale.value, i.Scale.value, i.Scale.value)
      }
      catch {
        actorCubeModel.scale.set(1, 1, 1)
      }
    }

		scenelike.add(actorCubeModel);

  }
}
*/



const addActorToScene = async function(actor, scenelike, intersectables, currentIndex) {
  if (ModelTools.modelDict[actor.UnitConfigName.value] !== undefined) {

    console.warn("actorMesh")
    actorModels = ModelTools.modelDict[actor.UnitConfigName.value];

    // Set actorModel transform:
    let actorMatrix = new THREE.Matrix4();

    let position = new THREE.Vector3(0, 0, 0);
    let rotation = new THREE.Quaternion(0, 0, 0, 0);
    let scale = new THREE.Vector3(1, 1, 1);

    position.set(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value);

    // Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
    try {
      rotation.setFromEuler(new THREE.Euler(actor.Rotate[0].value, actor.Rotate[1].value, actor.Rotate[2].value));
    }
    catch {

      // Just in case it's 1D rotation
      try {
        rotation.setFromEuler(new THREE.Euler(0, actor.Rotate.value, 0));
      }

      // In case there is no rotation.
      catch {
        rotation.setFromEuler(new THREE.Euler(0, 0, 0));
      }
    }

    // Try to apply scale, if it doesn't exist add some.
    try {
      scale.set(actor.Scale[0].value, actor.Scale[1].value, actor.Scale[2].value);
    }
    catch {
      // This could also mean that there's only 1 scale value, try that first.
      try {
        scale.set(actor.Scale.value, actor.Scale.value, actor.Scale.value);
      }
      catch {
        scale.set(1, 1, 1);
      }
    }
    actorMatrix.compose(position, rotation, scale)
    console.warn(actorMatrix)
    console.warn(currentIndex)
    for (actorModel of actorModels) {
      actorModel.setMatrixAt(currentIndex, actorMatrix);
      actorModel.instanceMatrix.needsUpdate = true;
      scenelike.add(actorModel)
      console.log(actorModel)
    }
  }
  else {
    // We can put the standard cube mesh
    console.warn("cubeMesh")

    console.warn(ModelTools)
    let actorModel = ModelTools.basicMeshDict["basicCube"];

    // Set actorModel transform:
    let actorMatrix = new THREE.Matrix4();

    let position = new THREE.Vector3(0, 0, 0);
    let rotation = new THREE.Quaternion(0, 0, 0, 0);
    let scale = new THREE.Vector3(1, 1, 1);

    position.set(actor.Translate[0].value, actor.Translate[1].value, actor.Translate[2].value);

    // Try to apply rotation from three-dimensional param, if only one dimension exists apply that instead.
    try {
      rotation.setFromEuler(new THREE.Euler(actor.Rotate[0].value, actor.Rotate[1].value, actor.Rotate[2].value));
    }
    catch {

      // Just in case it's 1D rotation
      try {
        rotation.setFromEuler(new THREE.Euler(0, actor.Rotate.value, 0));
      }

      // In case there is no rotation.
      catch {
        rotation.set(0, 0, 0);
      }
    }

    // Try to apply scale, if it doesn't exist add some.
    try {
      scale.set(actor.Scale[0].value, actor.Scale[1].value, actor.Scale[2].value);
    }
    catch {
      // This could also mean that there's only 1 scale value, try that first.
      try {
        scale.set(actor.Scale.value, actor.Scale.value, actor.Scale.value);
      }
      catch {
        scale.set(1, 1, 1);
      }
    }
    actorMatrix.compose(position, rotation, scale)

    actorModel.setMatrixAt(currentBasicCubeIndex, actorMatrix);
    currentBasicCubeIndex = currentBasicCubeIndex + 1;
    actorModel.instanceMatrix.needsUpdate = true;
    scenelike.add(actorModel)
    console.log(actorModel)
  }
}


module.exports = {
  addActorsToScene: addActorsToScene
}
