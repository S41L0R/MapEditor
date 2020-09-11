import {
	MathUtils,
	Spherical,
	Vector3,
	Euler
} from "../../../build/three.module.js";

var FirstPersonControls = function ( object, domElement ) {

	if ( domElement === undefined ) {

		console.warn( 'THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.' );
		domElement = document;

	}

	this.object = object;
	this.domElement = domElement;

	// API

	this.enabled = true;

	this.movementSpeed = 1.0;
	this.lookSpeed = 1;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.mouseDragOn = false;

	// internals

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	// private variables

	var lat = 0;
	var lon = 0;

	var lookDirection = new Vector3();
	var spherical = new Spherical();
	var target = new Vector3();


	//

	// Technically public, but just don't mess with them. They weren't working as private for some scope reason.

	this.movementX = 0;
	this.movementY = 0;

	this.mouseMoving = false;

	this.rMouseDown = false;

	//


	// Pointerlock compatibility stuff

	domElement.requestPointerLock = domElement.requestPointerLock ||
                            domElement.mozRequestPointerLock;


	//

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', - 1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();
		}
		if (event.button === 2) {
			this.rMouseDown = true;
			domElement.requestPointerLock();
		}

		event.preventDefault();
		event.stopPropagation();

		this.mouseDragOn = true;


	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();


		if (event.button === 2) {
			this.rMouseDown = false;
			document.exitPointerLock();
		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {
		//Variable to check if the mouse is moving
		this.mouseMoving = true;

		this.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		this.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		if ( this.domElement === document ) {
			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 69: /*E*/ this.moveUp = true; break;
			case 81: /*Q*/ this.moveDown = true; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 69: /*E*/ this.moveUp = false; break;
			case 81: /*Q*/ this.moveDown = false; break;

		}

	};

	this.lookAt = function ( x, y, z ) {

		if ( x.isVector3 ) {

			target.copy( x );

		} else {

			target.set( x, y, z );

		}

		this.object.lookAt( target );

		setOrientation( this );

		return this;

	};

	this.update = function () {

		return function update( delta ) {
			if (this.rMouseDown == true) {
				var mouseDiffX = 1;
				var mouseDiffY = 1;
				//mouseDiffX = this.mouseX - this.prevMouseX;
				//mouseDiffY = this.mouseY - this.prevMouseY;
				console.warn(this.object.rotation);
				//this.object.rotation._x = this.object.rotation._x + mouseDiffX;
				if (this.mouseMoving == true) {
					//this.object.rotateX(-this.movementY/4 * this.lookSpeed);
					//this.object.rotateY(-this.movementX/4 * this.lookSpeed);
					var minPolarAngle = 0; // radians
					var maxPolarAngle = Math.PI;
					var euler = new Euler( 0, 0, 0, 'YXZ' );
					euler.setFromQuaternion( this.object.quaternion );
					var PI_2 = Math.PI / 2;
					euler.y -= this.movementX/30 * this.lookSpeed;
					euler.x -= this.movementY/30 * this.lookSpeed;

					euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );

					this.object.quaternion.setFromEuler( euler );
				}
				//this.object.rotation._z = 0;
				//this.object.rotation._x = this.object.rotation._x + mouseDiffX;
				//this.object.rotateX(mouseDiffX);
				//console.warn(mouseDiffX);

				var actualMoveSpeed = delta * this.movementSpeed;
				if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
				if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

				if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
				if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

				if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
				if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

				// Sets mouseMoving to false. If the mouse is moved, it will be set to true for a frame, until this goes through and clears it.
				this.mouseMoving = false;
			}
		}


	}();

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

		window.removeEventListener( 'keydown', _onKeyDown, false );
		window.removeEventListener( 'keyup', _onKeyUp, false );

	};

	var _onMouseMove = bind( this, this.onMouseMove );
	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );
	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

	window.addEventListener( 'keydown', _onKeyDown, false );
	window.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function setOrientation( controls ) {

		var quaternion = controls.object.quaternion;

		lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
		spherical.setFromVector3( lookDirection );

		lat = 90 - MathUtils.radToDeg( spherical.phi );
		lon = MathUtils.radToDeg( spherical.theta );

	}

	this.handleResize();

	setOrientation( this );

};

export { FirstPersonControls };
