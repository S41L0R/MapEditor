// Some maps to help us find stuff
let railPointMap = new Map()
let controlPointMap = new Map()

let controlPointRailPointMap = new Map()
let railPointControlPointsMap = new Map()

let helperIndexForwardMap = new Map()
let helperIndexBackwardMap = new Map()

let controlPointConnectorIndexForwardMap = new Map()
let controlPointConnectorIndexBackwardMap = new Map()

let helperDummyMap = new Map()

// Object Setup
const texLoader = new global.THREE.TextureLoader()
const pointsAlphaMap = texLoader.load("./Assets/Textures/RailHelper.png")
let pointsMaterial = new global.THREE.PointsMaterial({ size: 15, sizeAttenuation: false, transparent: true, alphaMap: pointsAlphaMap, alphaTest: 0.5, vertexColors: true})

let helperPoints = []
let pointsGeometry = new global.THREE.BufferGeometry()

let pointsVertexColors = []

let pointsObject = new global.THREE.Points(pointsGeometry, pointsMaterial)
pointsObject.userData.relevantType = "RailHelper"



let controlPointConnectorGeometry = new global.LineSegmentsGeometry()

let controlPointConnectorMaterial = new global.LineMaterial({
    color: 0x0f0f0f,
    opacity: 0.75,
    transparent: true,
    linewidth: 3
})

let controlPointConnectorObject = new global.LineSegments2(controlPointConnectorGeometry, controlPointConnectorMaterial)

let controlPointConnectorPositions = []

const initControlPointConnectorObject = function() {
    controlPointConnectorMaterial.resolution.set(window.innerWidth, window.innerHeight)
    global.scene.add(controlPointConnectorObject)
}

const removeControlPointConnectorObject = function() {
    global.scene.remove(controlPointConnectorObject)
}

const addControlPointConnector = function(controlPointPos, railPointPos) {
    const controlPointConnectorIndex = controlPointConnectorPositions.length
    controlPointConnectorPositions.push(controlPointPos.x, controlPointPos.y, controlPointPos.z, railPointPos.x, railPointPos.y, railPointPos.z)
    controlPointConnectorGeometry.setPositions(controlPointConnectorPositions)
    return(controlPointConnectorIndex)
}

const removeControlPointConnector = function(controlPointConnectorIndex) {
    controlPointConnectorPositions.splice(controlPointConnectorIndex, 6)
    controlPointConnectorGeometry.setPositions(controlPointConnectorPositions)
}



const initPointsObject = function() {
    pointsGeometry.setFromPoints(helperPoints)

    const vertexColors = new Float32Array(pointsVertexColors)
    pointsGeometry.setAttribute("color", new global.THREE.BufferAttribute(vertexColors, 3))

    global.RayCastTools.intersectables.push(pointsObject)

    global.scene.add(pointsObject)
}

const removePointsObject = function() {
    global.scene.remove(pointsObject)
    global.RayCastTools.intersectables.splice(global.RayCastTools.intersectables.indexOf(pointsObject), 1)
    pointsObject.material.dispose()
    pointsObject.geometry.dispose()
    
}

const reloadPointsObject = function() {
    removePointsObject()
    initPointsObject()
}

const generateRailHelpers = function(rail) {
    initControlPointConnectorObject()
    for (const railPoint of rail.RailPoints) {
        // Set the maps up properly
        helperIndexForwardMap.set(railPoint, helperPoints.length)
        helperIndexBackwardMap.set(helperPoints.length, railPoint)
        railPointMap.set(railPoint, rail)


        let railPointPos = new global.THREE.Vector3(railPoint.Translate[0].value, railPoint.Translate[1].value, railPoint.Translate[2].value)

        helperPoints.push(railPointPos)
        pointsVertexColors.push(1, 1, 0)

        if (!helperDummyMap.has(railPoint)) {
            const railPointDummy = global.SelectionTools.createRailPointDummy(railPoint)
            helperDummyMap.set(railPoint, railPointDummy)
        }

        if (rail.RailType.value === "Bezier") {
            let controlPoints = []
            if ("ControlPoints" in railPoint) {
                controlPoints = railPoint.ControlPoints
            }
            else {
                controlPoints = [
                    [
                        {type: 300, value: 0.0},
                        {type: 300, value: 0.0},
                        {type: 300, value: 0.0}
                    ],
                    [
                        {type: 300, value: 0.0},
                        {type: 300, value: 0.0},
                        {type: 300, value: 0.0}
                    ]
                ]
            }
            railPointControlPointsMap.set(railPoint, controlPoints)
            for (const controlPoint of controlPoints) {
                // Set the maps up properly
                controlPointRailPointMap.set(controlPoint, railPoint)
                helperIndexForwardMap.set(controlPoint, helperPoints.length)
                helperIndexBackwardMap.set(helperPoints.length, controlPoint)
                controlPointMap.set(controlPoint, rail)
                
                const localSpaceControlPointPos = new global.THREE.Vector3(controlPoint[0].value, controlPoint[1].value, controlPoint[2].value)
                const worldSpaceControlPointPos = global.GeneralRailTools.getWorldSpaceControlPoint(railPointPos, localSpaceControlPointPos)
                helperPoints.push(worldSpaceControlPointPos)
                pointsVertexColors.push(15/255, 15/255, 15/255)

                if (!helperDummyMap.has(controlPoint)) {
                    const controlPointDummy = global.SelectionTools.createControlPointDummy(controlPoint)
                    helperDummyMap.set(controlPoint, controlPointDummy)
                }

                const controlPointConnectorIndex = addControlPointConnector(worldSpaceControlPointPos, railPointPos)

                controlPointConnectorIndexForwardMap.set(controlPoint, controlPointConnectorIndex)
                controlPointConnectorIndexBackwardMap.set(controlPointConnectorIndex, controlPoint)
            }
        }
    }
    reloadPointsObject()
}

const removeRailHelpers = function(rail, removeDummys=true) {
    for (const railPoint of rail.RailPoints) {
        if (helperIndexForwardMap.has(railPoint)) {
            const railPointIndex = helperIndexForwardMap.get(railPoint)
            helperIndexForwardMap.delete(railPoint)
            helperIndexBackwardMap.delete(railPointIndex)

            helperPoints.splice(railPointIndex, 1)
            pointsVertexColors.splice(railPointIndex * 3, 3)

            // Remove the dummy
            if (removeDummys) {
                const railPointDummy = helperDummyMap.get(railPoint)
                global.SelectionTools.removeDummy(railPointDummy)
            }


            // Update the other indices
            let storedPoints = []
            for (let [storedPoint, storedIndex] of helperIndexForwardMap.entries()) {
                if (storedIndex >= railPointIndex) {
                    storedPoints.push(storedPoint)
                }
            }
            for (const storedPoint of storedPoints) {
                const storedIndex = helperIndexForwardMap.get(storedPoint)
                helperIndexForwardMap.set(storedPoint, storedIndex - 1)
                helperIndexBackwardMap.set(storedIndex - 1, storedPoint)
            }

            // Okay, go through the ControlPoints
            for (const controlPoint of railPointControlPointsMap.get(railPoint)) {
                const controlPointIndex = helperIndexForwardMap.get(controlPoint)
                helperIndexForwardMap.delete(controlPoint)
                helperIndexBackwardMap.delete(controlPointIndex)

                helperPoints.splice(controlPointIndex, 1)
                pointsVertexColors.splice(controlPointIndex * 3, 3)

                // Remove the dummy
                if (removeDummys) {
                    const controlPointDummy = helperDummyMap.get(controlPoint)
                    global.SelectionTools.removeDummy(controlPointDummy)
                }

                // Update the other indices
                let storedPoints = []
                for (let [storedPoint, storedIndex] of helperIndexForwardMap.entries()) {
                    if (storedIndex >= controlPointIndex) {
                        storedPoints.push(storedPoint)
                    }
                }
                for (const storedPoint of storedPoints) {
                    const storedIndex = helperIndexForwardMap.get(storedPoint)
                    helperIndexForwardMap.set(storedPoint, storedIndex - 1)
                    helperIndexBackwardMap.set(storedIndex - 1, storedPoint)
                }



                // Deal with the ControlPoint connector
                const controlPointConnectorIndex = controlPointConnectorIndexForwardMap.get(controlPoint)
                removeControlPointConnector(controlPointConnectorIndex)
                
                // Remove from maps
                controlPointConnectorIndexForwardMap.delete(controlPoint)
                controlPointConnectorIndexBackwardMap.delete(controlPointConnectorIndex)

                // Update the other indices
                storedPoints = [] // We're re-using the same variable name as before because it makes sense.
                for (let [storedPoint, storedIndex] of controlPointConnectorIndexForwardMap.entries()) {
                    if (storedIndex >= controlPointConnectorIndex) {
                        storedPoints.push(storedPoint)
                    }
                }
                for (const storedPoint of storedPoints) {
                    const storedIndex = controlPointConnectorIndexForwardMap.get(storedPoint)
                    controlPointConnectorIndexForwardMap.set(storedPoint, storedIndex - 6)
                    controlPointConnectorIndexBackwardMap.set(storedIndex - 6, storedPoint)
                }
            }
        }
    }
    reloadPointsObject()
}

const reloadRailHelpers = function(rail) {
    removeRailHelpers(rail, false)
    generateRailHelpers(rail)
}

const getRailFromRailBit = function(railBit) {
    if (railPointMap.has(railBit)) {
        return(railPointMap.get(railBit))
    }
    if (controlPointMap.has(railBit)) {
        return(controlPointMap.get(railBit))
    }
}


module.exports = {
    initPointsObject: initPointsObject,
    removePointsObject: removePointsObject,
    generateRailHelpers: generateRailHelpers,
    removeRailHelpers: removeRailHelpers,
    reloadRailHelpers: reloadRailHelpers,
    getRailFromRailBit: getRailFromRailBit,

    // Maps
    helperIndexForwardMap: helperIndexForwardMap,
    helperIndexBackwardMap: helperIndexBackwardMap,

    helperDummyMap: helperDummyMap,

    controlPointRailPointMap: controlPointRailPointMap
}