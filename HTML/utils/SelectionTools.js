const objectDummys = [];
let groupSelector;
let selectedDummys = [];

const createObjectDummy = async function (instancedMesh, index, THREE, scenelike) {
  // We're using groups because they are simple and don't need geometry or anything.
  // Not that this will hold anything - though it could hold debug objects.
  const dummyObject = new THREE.Group();
  dummyObject.userData.instancedMesh = instancedMesh;
  dummyObject.userData.index = index;
  instancedMesh.getMatrixAt(index, dummyObject.matrix);
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
    if (dummy.userData.instancedMesh === instancedMesh) {
      if (dummy.userData.index === index) {
        if (!selectedDummys.includes(dummy)) {
          selectedDummys.push(dummy);
          groupSelector.add(dummy);
          updateGroupSelectorPos(THREE, transformControl)
          updateSelectedDummys(THREE);
          //displaySelection(dummy, THREE)
          transformControl.attach(groupSelector)
        }
      }
    }
  }
}


const updateSelectedObjs = function() {
  for (const dummy of selectedDummys) {
    console.error(dummy.position)
    dummy.userData.instancedMesh.setMatrixAt(dummy.userData.index, dummy.matrixWorld);
    dummy.userData.instancedMesh.instanceMatrix.needsUpdate = true;
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

function toLocalSpace(object, THREE) {
  console.error(object)
  let oldPosVector = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
  let posX = oldPosVector.x - groupSelector.position.x;
  let posY = oldPosVector.y - groupSelector.position.y;
  let posZ = oldPosVector.z - groupSelector.position.z;
  console.error(posX)
  console.error(posY)
  console.error(posZ)
  object.matrix.setPosition(posX, posY, posZ)
}

function displaySelection(dummy, THREE) {
  // Should make things look red but doesn't work.
  console.error(dummy)
  let instancedMesh = dummy.userData.instancedMesh;
  let index = dummy.userData.index;

  instancedMesh.setColorAt(index, new THREE.Color("#FF0000"));
  instancedMesh.instanceColor.needsUpdate = true;
}

module.exports = {
  selectObject: selectObject,
  createObjectDummy: createObjectDummy,
  updateSelectedObjs: updateSelectedObjs,

  initSelectionTools: initSelectionTools
}