// This is just copy-pasted, it seems to work fine.
// It bakes the skeleton default transform into the mesh.
function bakeSkeleton ( target ) {
  var v1 = new global.THREE.Vector3()

  target.traverse( function ( object ) {
    if ( !object.isSkinnedMesh ) return
    if ( object.geometry.isBufferGeometry !== true ) throw new Error( 'Only BufferGeometry supported.' )

    var positionAttribute = object.geometry.getAttribute( 'position' )
    var normalAttribute = object.geometry.getAttribute( 'normal' )

    for ( var j = 0; j < positionAttribute.count; j ++ ) {
      object.boneTransform( j, v1 )
      positionAttribute.setXYZ( j, v1.x, v1.y, v1.z)

      getBoneNormalTransform.call( object, j, v1 )
      normalAttribute.setXYZ( j, v1.x, v1.y, v1.z )
    }

    positionAttribute.needsUpdate = true
    normalAttribute.needsUpdate = true

    object.skeleton.bones.forEach(bone => bone.rotation.set(0,0,0))
  } );
}


const getBoneNormalTransform = (function () {

  var baseNormal = new global.THREE.Vector3()

  var skinIndex = new global.THREE.Vector4()
  var skinWeight = new global.THREE.Vector4()

  var vector = new global.THREE.Vector3()
  var matrix = new global.THREE.Matrix4()
  var matrix3 = new global.THREE.Matrix3()

  return function ( index, target ) {

    var skeleton = this.skeleton
    var geometry = this.geometry

    skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index )
    skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index )

    baseNormal.fromBufferAttribute( geometry.attributes.normal, index ).applyNormalMatrix( matrix3.getNormalMatrix(this.bindMatrix) )

    target.set( 0, 0, 0 )

    for ( var i = 0; i < 4; i ++ ) {

      var weight = skinWeight.getComponent( i )

      if ( weight !== 0 ) {

        var boneIndex = skinIndex.getComponent( i )

        matrix.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] )

        target.addScaledVector( vector.copy( baseNormal ).applyNormalMatrix( matrix3.getNormalMatrix(matrix) ), weight )

      }

    }
    matrix3.getNormalMatrix(this.bindMatrixInverse)
    return target.applyNormalMatrix( matrix3 )

  };

}())



module.exports = {
  bakeSkeleton: bakeSkeleton
}
