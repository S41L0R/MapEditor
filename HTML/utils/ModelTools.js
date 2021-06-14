

// Requires
// -----------------------------------------------------------------------------
CacheTools = require("./CacheTools.js")
PythonTools = require("./PythonTools.js")
// -----------------------------------------------------------------------------

// Usables
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------

// Global Variables
// -----------------------------------------------------------------------------
let modelDict = {}
let basicMeshDict = {}
// -----------------------------------------------------------------------------

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

// This is just copy-pasted, it seems to work fine.
const bakeSkeleton = function ( target ) {
	var v1 = new THREE.Vector3()

	target.traverse( function ( object ) {
		if ( !object.isSkinnedMesh ) return
		if ( object.geometry.isBufferGeometry !== true ) throw new Error( "Only BufferGeometry supported." )

		var positionAttribute = object.geometry.getAttribute( "position" )
		var normalAttribute = object.geometry.getAttribute( "normal" )

		for ( var j = 0; j < positionAttribute.count; j ++ ) {
			object.boneTransform( j, v1 )
			positionAttribute.setXYZ( j, v1.x, v1.y, v1.z)

			getBoneNormalTransform.call( object, j, v1 )
			normalAttribute.setXYZ( j, v1.x, v1.y, v1.z )
		}

		positionAttribute.needsUpdate = true
		normalAttribute.needsUpdate = true

		object.skeleton.bones.forEach(bone => bone.rotation.set(0,0,0))
	} )
}


const getBoneNormalTransform = (function () {

	var baseNormal = new THREE.Vector3()

	var skinIndex = new THREE.Vector4()
	var skinWeight = new THREE.Vector4()

	var vector = new THREE.Vector3()
	var matrix = new THREE.Matrix4()
	var Matrix3 = new THREE.Matrix3()

	return function ( index, target ) {

		var skeleton = this.skeleton
		var geometry = this.geometry

		skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index )
		skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index )

		baseNormal.fromBufferAttribute( geometry.attributes.normal, index ).applyNormalMatrix( THREE.Matrix3.getNormalMatrix(this.bindMatrix) )

		target.set( 0, 0, 0 )

		for ( var i = 0; i < 4; i ++ ) {

			var weight = skinWeight.getComponent( i )

			if ( weight !== 0 ) {

				var boneIndex = skinIndex.getComponent( i )

				matrix.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] )

				target.addScaledVector( vector.copy( baseNormal ).applyNormalMatrix( THREE.Matrix3.getNormalMatrix(matrix) ), weight )

			}

		}
		THREE.Matrix3.getNormalMatrix(this.bindMatrixInverse)
		return target.applyNormalMatrix( THREE.Matrix3 )

	}

}())



const loadModels = async function(sectionData, BufferGeometryUtils, colladaLoader, sectionName, THREE) {
	// We get all of the model paths, with the actor name as the key and the path as the value.
	return PythonTools.loadPython("newGetActorModelPaths", sectionName).then(async (modelPathList) => {
		let promises = []

		for (const [name, path] of Object.entries(modelPathList)) {
			let modelNum = 0
			for (const actor of sectionData.Static.Objs) {
				if (actor.UnitConfigName.value === name) {
					modelNum = modelNum + 1
				}
			}
			for (const actor of sectionData.Dynamic.Objs) {
				if (actor.UnitConfigName.value === name) {
					modelNum = modelNum + 1
				}
			}
			promises.push(loadModelByActorName(name, BufferGeometryUtils, colladaLoader, sectionName, path, modelNum))
		}
		promises.push(setupCubeMesh(THREE))
		promises.push(setupBoxAreaMesh(THREE))
		promises.push(setupSphereAreaMesh(THREE))
		promises.push(setupCapsuleAreaMesh(THREE))

		//linktags
		promises.push(setupLinkTagAndMesh(THREE))
		promises.push(setupLinkTagOrMesh(THREE))
		promises.push(setupLinkTagCountMesh(THREE))
		promises.push(setupLinkTagPulseMesh(THREE))
		promises.push(setupLinkTagNoneMesh(THREE))
		promises.push(setupLinkTagNAndMesh(THREE))
		promises.push(setupLinkTagNOrMesh(THREE))
		promises.push(setupLinkTagXOrMesh(THREE))
		promises.push(setupLinkTagDefaultMesh(THREE))

		promises.push(setupWaterMesh(THREE))

		await Promise.all(promises)




	})
	console.warn(cubeMesh)
}


const setupCubeMesh = async function (THREE) {
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

const setupBoxAreaMesh = async function (THREE) {
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

const setupSphereAreaMesh = async function (THREE) {
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


const setupCapsuleAreaMesh = async function (THREE) {
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


const setupLinkTagAndMesh = async function (THREE) {
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

const setupLinkTagOrMesh = async function (THREE) {
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


const setupLinkTagCountMesh = async function (THREE) {
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

const setupLinkTagPulseMesh = async function (THREE) {
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

const setupLinkTagNoneMesh = async function (THREE) {
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


const setupLinkTagNAndMesh = async function (THREE) {
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


const setupLinkTagNOrMesh = async function (THREE) {
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


const setupLinkTagXOrMesh = async function (THREE) {
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


const setupLinkTagDefaultMesh = async function (THREE) {
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




const setupWaterMesh = async function (THREE) {
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



const loadModelByActorName = async function (actorName, BufferGeometryUtils, colladaLoader, sectionName, modelPath, modelNum) {

	return new Promise((resolve) => {

		// We first need to check if this model is already loaded:
		if (modelDict[actorName] === undefined) {
			// Okay, good it's not


			// Without the if statement, this is REALLY slow. Because of this we get all actorModelPaths at once and feed it in, only relying on this if the paths aren't fed in.
			if (modelPath === undefined) {
				return PythonTools.loadPython("getActorModelPath", actorName + " " + sectionName).then((resultingModelPath) => {
					colladaLoader.load(resultingModelPath, (collada) => {colladaOnLoad(collada, actorName, resolve, BufferGeometryUtils, modelNum)}, colladaOnProgress, colladaOnError)
				})
			}
			else {
				colladaLoader.load(modelPath, (collada) => {colladaOnLoad(collada, actorName, resolve, BufferGeometryUtils, modelNum)}, (collada) => {colladaOnProgress(collada, actorName)}, (error) => {colladaOnError(error, actorName, resolve)})
			}


		}
	})

}

const colladaOnLoad = function (collada, actorName, resolve, BufferGeometryUtils, modelNum) {
	// General logic for when the collada file is loaded.
	// This includes model manipulation in order to serve our purposes.
	colladaModel = collada.scene
	bakeSkeleton(colladaModel)
	let colladaMeshArray = []
	colladaModel.traverse((item) => {
		if (item.isMesh) {
			//item.castShadow = true;
			//item.recieveShadow = true;

			// We get the geometry and the material
			let colladaGeometry = item.geometry

			let colladaMaterial = item.material

			let colladaInstancedMesh = new THREE.InstancedMesh(colladaGeometry, colladaMaterial, modelNum + 999)
			colladaInstancedMesh.userData.actorList = []

			// Set the count to 0 for logic later:
			colladaInstancedMesh.count = 0

			colladaMeshArray.push(colladaInstancedMesh)
		}
	})



	// We send this out like so:
	modelDict[actorName] = colladaMeshArray

	console.warn(modelDict)

	console.warn("This loaded")

	resolve()
}

const colladaOnProgress = function (collada, actorName) {
	console.log(`progress for ${actorName}`)
}

const colladaOnError = function (error, actorName, resolve) {
	console.log(`error for ${actorName} when loading models.`)
	console.error(error)
	resolve()
}


module.exports = {
	bakeSkeleton: bakeSkeleton,
	loadModelByActorName: loadModelByActorName,
	loadModels: loadModels,


	// Non-Function Variables:
	modelDict: modelDict,
	basicMeshDict: basicMeshDict
}
