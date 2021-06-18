// Imported stuff
// -----------------------------------------------------------------------------
const basicCubeTexturePath = "./Assets/Textures/CubeTexture.png"
const areaTexturePath_Box = "./Assets/Textures/AreaTexture - Box.png"
const areaTexturePath_Sphere = "./Assets/Textures/AreaTexture - Sphere.png"
const linkTagAndTexturePath = "./Assets/Textures/LinkTagAndTexture.png"
const linkTagOrTexturePath = "./Assets/Textures/LinkTagOrTexture.png"
const linkTagCountTexturePath = "./Assets/Textures/LinkTagCountTexture.png"
const linkTagPulseTexturePath = "./Assets/Textures/LinkTagPulseTexture.png"
const linkTagNoneTexturePath = "./Assets/Textures/LinkTagNoneTexture.png"
const linkTagNAndTexturePath = "./Assets/Textures/LinkTagNAndTexture.png"
const linkTagNOrTexturePath = "./Assets/Textures/LinkTagNOrTexture.png"
const linkTagXOrTexturePath = "./Assets/Textures/LinkTagXOrTexture.png"
const linkTagDefaultTexturePath = "./Assets/Textures/LinkTagDefaultTexture.png"
const waterTexturePath = "./Assets/Textures/WaterTexture.jpg"

// -----------------------------------------------------------------------------


const setupCubeMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(basicCubeTexturePath)
		const material = new THREE.MeshStandardMaterial({
    	emissiveMap: texture,
    	emissive: new THREE.Color("#FFFFFF"),
    	transparent: true,
    	opacity: 0.75,
			side: THREE.DoubleSide
		})
		basicCubeMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		basicCubeMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["basicCube"] = [basicCubeMesh]


		// Set the count to 0 for logic later:
		basicCubeMesh.count = 0


		resolve()
	})
}

const setupBoxAreaMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(areaTexturePath_Box)
		texture.magFilter = THREE.NearestFilter
		const material = new THREE.MeshStandardMaterial({
			emissiveMap: texture,
			map: texture,
			emissive: new THREE.Color("#FFFFFF"),
			transparent: true,
			alphaTest: 0.35,
			opacity: 0.5,
			side: THREE.DoubleSide,
		})
		boxAreaMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		boxAreaMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["areaBox"] = [boxAreaMesh]


		// Set the count to 0 for logic later:
		boxAreaMesh.count = 0


		resolve()
	})
}

const setupSphereAreaMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const sphereGeometry = new THREE.SphereBufferGeometry(1, 32, 32)
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(areaTexturePath_Sphere)
		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
		texture.repeat.set(15, 15)
		texture.magFilter = THREE.NearestFilter
		const material = new THREE.MeshStandardMaterial({
			emissiveMap: texture,
			map: texture,
			emissive: new THREE.Color("#FFFFFF"),
			transparent: true,
			alphaTest: 0.35,
			opacity: 1,
			side: THREE.DoubleSide
		})
		sphereAreaMesh = new THREE.InstancedMesh(sphereGeometry, material, 9999)
		sphereAreaMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["areaSphere"] = [sphereAreaMesh]


		// Set the count to 0 for logic later:
		sphereAreaMesh.count = 0


		resolve()
	})
}


const setupCapsuleAreaMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const capsuleGeometry = new THREE.CapsuleBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(areaTexturePath_Sphere)
		const material = new THREE.MeshStandardMaterial({
			emissiveMap: texture,
			map: texture,
			emissive: new THREE.Color("#FFFFFF"),
			transparent: true,
			alphaTest: 0.35,
			opacity: 0.5,
			side: THREE.DoubleSide
		})
		capsuleAreaMesh = new THREE.InstancedMesh(capsuleGeometry, material, 9999)
		capsuleAreaMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["areaCapsule"] = [capsuleAreaMesh]


		// Set the count to 0 for logic later:
		capsuleAreaMesh.count = 0


		resolve()
	})
}


const setupLinkTagAndMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagAndTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagAndMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagAndMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagAnd"] = [linkTagAndMesh]


		// Set the count to 0 for logic later:
		linkTagAndMesh.count = 0


		resolve()
	})
}

const setupLinkTagOrMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagOrTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagOrMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagOrMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagOr"] = [linkTagOrMesh]


		// Set the count to 0 for logic later:
		linkTagOrMesh.count = 0


		resolve()
	})
}


const setupLinkTagCountMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagCountTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagCountMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagCountMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagCount"] = [linkTagCountMesh]


		// Set the count to 0 for logic later:
		linkTagCountMesh.count = 0


		resolve()
	})
}

const setupLinkTagPulseMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagPulseTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagPulseMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagPulseMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagPulse"] = [linkTagPulseMesh]


		// Set the count to 0 for logic later:
		linkTagPulseMesh.count = 0


		resolve()
	})
}

const setupLinkTagNoneMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagNoneTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagNoneMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagNoneMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagNone"] = [linkTagNoneMesh]


		// Set the count to 0 for logic later:
		linkTagNoneMesh.count = 0


		resolve()
	})
}


const setupLinkTagNAndMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagNAndTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagNAndMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagNAndMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagNAnd"] = [linkTagNAndMesh]


		// Set the count to 0 for logic later:
		linkTagNAndMesh.count = 0


		resolve()
	})
}


const setupLinkTagNOrMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagNOrTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagNOrMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagNOrMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagNOr"] = [linkTagNOrMesh]


		// Set the count to 0 for logic later:
		linkTagNOrMesh.count = 0


		resolve()
	})
}


const setupLinkTagXOrMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagXOrTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagXOrMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagXOrMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagXOr"] = [linkTagXOrMesh]


		// Set the count to 0 for logic later:
		linkTagXOrMesh.count = 0


		resolve()
	})
}


const setupLinkTagDefaultMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(linkTagDefaultTexturePath)
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		})
		linkTagDefaultMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		linkTagDefaultMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["linkTagDefault"] = [linkTagDefaultMesh]


		// Set the count to 0 for logic later:
		linkTagDefaultMesh.count = 0


		resolve()
	})
}




const setupWaterMesh = async function (THREE, basicMeshDict) {
	return new Promise((resolve) => {
		const cubeGeometry = new THREE.BoxBufferGeometry()
		const cubeTexLoader = new THREE.TextureLoader()
		const texture = cubeTexLoader.load(waterTexturePath)
		const material = new THREE.MeshStandardMaterial({
			transparent: true,
			opacity: 0.2,
			map: texture,
		})
		waterMesh = new THREE.InstancedMesh(cubeGeometry, material, 9999)
		waterMesh.userData.actorList = []
		// This is stored as an array for consistency and ref comparison later.
		basicMeshDict["water"] = [waterMesh]


		// Set the count to 0 for logic later:
		waterMesh.count = 0


		resolve()
	})
}

module.exports = {
  setupCubeMesh: setupCubeMesh,
  setupBoxAreaMesh: setupBoxAreaMesh,
  setupSphereAreaMesh: setupSphereAreaMesh,
  setupCapsuleAreaMesh: setupCapsuleAreaMesh,
  // Linktags:
  setupLinkTagAndMesh: setupLinkTagAndMesh,
  setupLinkTagOrMesh: setupLinkTagOrMesh,
  setupLinkTagCountMesh: setupLinkTagCountMesh,
  setupLinkTagPulseMesh: setupLinkTagPulseMesh,
  setupLinkTagNoneMesh: setupLinkTagNoneMesh,
  setupLinkTagNAndMesh: setupLinkTagNAndMesh,
  setupLinkTagNOrMesh: setupLinkTagNOrMesh,
  setupLinkTagXOrMesh: setupLinkTagXOrMesh,
  setupLinkTagDefaultMesh: setupLinkTagDefaultMesh,
  // Etc:
  setupWaterMesh: setupWaterMesh,
}
