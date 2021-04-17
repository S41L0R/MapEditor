const objectDummys = [];
let groupSelector;
let selectedDummys = [];


// TO DO:
// As it turns out, there's a massive error in how I did some of this. Instead
// of using one dummy obj per object, we need one per actor, with an array
// of InstancedMeshes and their indexes. I'll need to modify SceneTools to do
// that, and then modify this document to accept those changes.




const createObjectDummy = async function (instancedMeshes, index, THREE, scenelike) {
  // We're using groups because they are simple and don't need geometry or anything.
  // Not that this will hold anything - though it could hold debug objects.
  const dummyObject = new THREE.Group();
  dummyObject.userData.instancedMeshes = instancedMeshes;
  dummyObject.userData.index = index;
  instancedMeshes[0].getMatrixAt(index, dummyObject.matrix);
  dummyObject.matrixAutoUpdate = false;
  objectDummys.push(dummyObject);
  scenelike.add(dummyObject);
}
const initSelectionTools = async function (THREE, scenelike) {
  groupSelector = new THREE.Group();
  scenelike.add(groupSelector)
}

const selectObject = async function (instancedMesh, index, transformControl, THREE) {
  for (const dummy of objectDummys) {
    if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
      if (dummy.userData.index === index) {
        console.error("FOUND")
        if (!selectedDummys.includes(dummy)) {
          selectedDummys.push(dummy);
          groupSelector.add(dummy);
          /*
          for (selectedDummy of selectedDummys) {
            groupSelector.remove(selectedDummy)
          }
          */
          updateGroupSelectorPos(THREE, transformControl)
          /*
          for (selectedDummy of selectedDummys) {
            if (selectedDummy !== dummy) {
              groupSelector.add(selectedDummy)
            }
          }
          groupSelector.attach(dummy)
          */
          //groupSelector.attach(dummy);
          updateSelectedDummys(THREE);
          displaySelection(dummy, THREE)
          transformControl.attach(groupSelector)

        }
      }
    }
  }
}


const deselectObject = async function (instancedMesh, index, transformControl, THREE) {
  for (const dummy of objectDummys) {
    if (dummy.userData.instancedMeshes.includes(instancedMesh)) {
      if (dummy.userData.index === index) {
        console.error("FOUND")
        if (selectedDummys.includes(dummy)) {
          selectedDummys.splice(selectedDummys.indexOf(dummy), 1);
          groupSelector.remove(dummy);
          updateGroupSelectorPos(THREE, transformControl)
          updateSelectedDummys(THREE);
          undisplaySelection(dummy, THREE)
          transformControl.attach(groupSelector)
        }
      }
    }
  }
}


const deselectAll = async function (transformControl, THREE) {
  for (const dummy of selectedDummys) {
    groupSelector.remove(dummy)
    undisplaySelection(dummy, THREE)
    resetGroupSelectorPos()
  }
  transformControl.detach(groupSelector)
  selectedDummys = []
}


const updateSelectedObjs = function() {
  for (const dummy of selectedDummys) {
    console.error(dummy.position)
    for (instancedMesh of dummy.userData.instancedMeshes) {
      instancedMesh.setMatrixAt(dummy.userData.index, dummy.matrixWorld);
      instancedMesh.instanceMatrix.needsUpdate = true;

      updateObjectSelectionDisplay(instancedMesh, dummy.userData.index);
    }
  }
}

const updateSelectedDummys = function(THREE) {
  for (dummy of selectedDummys) {
    toLocalSpace(dummy, THREE);
  }
}

function updateGroupSelectorPos(THREE, transformControl) {

  // Code to average positions to get position in middle:
  midX = 0;
  midY = 0;
  midZ = 0;
  console.error(selectedDummys)
  for (const dummy of selectedDummys) {
    console.error(dummy)
    const pos = new THREE.Vector3().setFromMatrixPosition(dummy.matrixWorld);
    midX += pos.x;
    midY += pos.y;
    midZ += pos.z;
  }
  console.error(midX)
  midX = midX / selectedDummys.length;
  midY = midY / selectedDummys.length;
  midZ = midZ / selectedDummys.length;

  groupSelector.position.set(midX, midY, midZ);

  // Just some meh code to make sure the transformControl doesn't glitch out
  //transformControl.detach();
  //transformControl.attach(groupSelector);
}

function resetGroupSelectorPos() {
  groupSelector.position.set(0, 0, 0);
  groupSelector.rotation.set(0, 0, 0);
  groupSelector.scale.set(1, 1, 1);
}

function toLocalSpace(object, THREE) {
  console.error(object)
  let oldPosVector = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
  console.error(oldPosVector)
  let posX = oldPosVector.x - groupSelector.position.x;
  let posY = oldPosVector.y - groupSelector.position.y;
  let posZ = oldPosVector.z - groupSelector.position.z;
  let newPosVector = new THREE.Vector3(posX, posY, posZ);

  let oldRotEuler = new THREE.Euler().setFromRotationMatrix(object.matrixWorld);
  let rotX = oldRotEuler._x - groupSelector.rotation.x;
  let rotY = oldRotEuler._y - groupSelector.rotation.y;
  let rotZ = oldRotEuler._z - groupSelector.rotation.z;
  let newRotEuler = new THREE.Euler(rotX, rotY, rotZ);
  //let newRotQuaternion = new THREE.Quaternion().setFromEuler(newRotEuler);

  let oldScaleVector = new THREE.Vector3().setFromMatrixScale(object.matrixWorld);
  let scaleX = oldScaleVector.x - groupSelector.scale.x;
  let scaleY = oldScaleVector.y - groupSelector.scale.y;
  let scaleZ = oldScaleVector.z - groupSelector.scale.z;
  let newScaleVector = new THREE.Vector3(scaleX, scaleY, scaleZ);

  console.error(posX)
  console.error(posY)
  console.error(posZ)

  console.error(newPosVector)
  console.error(newRotEuler)
  console.error(newScaleVector)

  //object.position.set(newPosVector.x, newPosVector.y, newPosVector.z);
  //object.rotation.set(rotX, rotY, rotZ);
  //object.scale.set(newScaleVector.x, -newScaleVector.y, newScaleVector.z);
  //object.updateMatrix();
  //object.matrix.makeRotationFromEuler(newRotEuler)
  //object.matrix.compose(newPosVector, new THREE.Quaternion().setFromRotationMatrix(object.matrix), newScaleVector)
  object.matrix.setPosition(posX, posY, posZ)
  //object.matrix.setScale(scaleX, scaleY, scaleZ)
}

function displaySelection(dummy, THREE) {
  /*
  // Should make things look red but doesn't work.
  console.error(dummy)
  let instancedMesh = dummy.userData.instancedMeshes;
  let index = dummy.userData.index;

  instancedMesh.setColorAt(index, new THREE.Color("#FF0000"));
  instancedMesh.instanceColor.needsUpdate = true;

  */

  for (instancedMesh of dummy.userData.instancedMeshes) {
    const wireframeGeo = new THREE.WireframeGeometry( instancedMesh.geometry );

    const wireframe = new THREE.LineSegments( wireframeGeo );
    wireframe.material.depthTest = true;
    wireframe.material.opacity = 0.25;
    wireframe.material.transparent = true;
    wireframe.material.color = new THREE.Color("#0000FF")

    wireframe.userData.index = dummy.userData.index;

    instancedMesh.getMatrixAt(dummy.userData.index, wireframe.matrix);
    wireframe.matrixAutoUpdate = false;

    instancedMesh.add(wireframe)

  }
}

function undisplaySelection(dummy, THREE) {
  for (instancedMesh of dummy.userData.instancedMeshes) {
    for (wireframe of instancedMesh.children) {
      if (wireframe.userData.index === dummy.userData.index) {
        instancedMesh.remove(wireframe)
        wireframe.material.dispose();
        wireframe.geometry.dispose();
      }
    }
  }
}

function updateObjectSelectionDisplay(instancedMesh, index) {
  for (const wireframe of instancedMesh.children) {
    if (wireframe.userData.index === index) {
      instancedMesh.getMatrixAt(index, wireframe.matrix)
    }
  }
}

module.exports = {
  selectObject: selectObject,
  deselectObject: deselectObject,
  deselectAll: deselectAll,
  createObjectDummy: createObjectDummy,
  updateSelectedObjs: updateSelectedObjs,

  initSelectionTools: initSelectionTools
}
