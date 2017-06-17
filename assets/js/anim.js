var Anim = {

	// STANDARD GLOBAL VARIABLES

	container : "",
	scene : "",
	camera : "",
	renderer : "",
	controls : "", 
	stats : "", 
	keyboard : new THREEx.KeyboardState(), 
	clock : new THREE.Clock(),

	// CUSTOM VARIABLES

	ballsVis : false,

	// FUNCTIONS

	init: function () {

		var self = this;

		// SCENE
		this.scene = new THREE.Scene();
		// CAMERA
		var SCREEN_WIDTH = window.innerWidth, 
			SCREEN_HEIGHT = window.innerHeight,
			VIEW_ANGLE = 45, 
			ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
			NEAR = 0.1, 
			FAR = 20000;
		this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.scene.add( this.camera );
		this.camera.position.set(2,1,14);
		// ADDED
		// var rotSpeed = .02 
		// camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		// camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
		// camera.lookAt(scene.position);	

		// RENDERER
		if ( Detector.webgl )
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer(); 
		this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		this.container = document.getElementById( 'ThreeJS' );
		this.container.appendChild( this.renderer.domElement );
		// EVENTS
		THREEx.WindowResize( this.renderer, this.camera );
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
		// CONTROLS
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		
		this.addBox( "moondust", 21000, 1 );	
		this.addBox( "dawnmountain", 20000, 0.5 );
		// 
		

		// BOX TWO
		// IMAGE SRCs
		// var imagePrefix = "images/dawnmountaintwo-";
		// var imagePrefix = "assets/images/moondust-";
		// var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
		// var imageSuffix = ".png";
		// // SIZE OF CUBE
		// var skyGeometryTwo = new THREE.CubeGeometry( 500, 500, 500 );	

		// var urls = [];
		// for (var i = 0; i < 6; i++)
		// 	urls.push( imagePrefix + directions[i] + imageSuffix );
		
		// var materialArray = [];
		// for (var i = 0; i < 6; i++)
		// 	materialArray.push( new THREE.MeshBasicMaterial({
		// 		map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
		// 		side: THREE.BackSide,
		// 		// FOLLOWING THREE LINES ADDED
		// 		transparent: true, 
		// 		opacity: 0.5, 
		// 		// color: 0xFF0000
		// 	}));
		// var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
		// var skyBoxTwo = new THREE.Mesh( skyGeometryTwo, skyMaterial );
		// this.scene.add( skyBoxTwo );

		

		// OPACITY WHEN PUSHING TO ARRAY IS IMPORTANT

		////////////
		// CUSTOM //
		////////////

		var axisMin = -5;
		var axisMax =  5;
		var axisRange = axisMax - axisMin;
		
		// The Marching Cubes Algorithm draws an isosurface of a given value.
		// To use this for a Metaballs simulation, we need to:
		// (1) Initialize the domain - create a grid of size*size*size points in space
		// (2) Initialize the range  - a set of values, corresponding to each of the points, to zero.
		// (3) Add 1 to values array for points on boundary of the sphere;
		//       values should decrease to zero quickly for points away from sphere boundary.
		// (4) Repeat step (3) as desired
		// (5) Implement Marching Cubes algorithm with isovalue slightly less than 1.
		
		var size  = 30; 
		var size2 = size*size; 
		var size3 = size*size*size;
		
		var points = [];
		
		// generate the list of 3D points
		for (var k = 0; k < size; k++)
		for (var j = 0; j < size; j++)
		for (var i = 0; i < size; i++)
		{
			var x = axisMin + axisRange * i / (size - 1);
			var y = axisMin + axisRange * j / (size - 1);
			var z = axisMin + axisRange * k / (size - 1);
			points.push( new THREE.Vector3(x,y,z) );
		}
		
	    var values = [];
		// initialize values
		for (var i = 0; i < size3; i++) 
			values[i] = 0;
		 
		// resetValues();
		this.addBall( points, values, new THREE.Vector3(0,3.5,0) );
		this.addBall( points, values, new THREE.Vector3(0,0,0) );
		this.addBall( points, values, new THREE.Vector3(-1,-1,0) );
		
		// isolevel = 0.5;
		var geometry = this.marchingCubes( points, values, 0.5 );
		
		// RELEASE THE BUBBLES!

		// TEXTURE FOR BUBBLES
		var imagePrefix = "assets/images/moondust-", 
			directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"], 
			imageSuffix = ".png", 
			urls = [];
		for (var i = 0; i < 6; i++)
			urls.push( imagePrefix + directions[i] + imageSuffix );

		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;
		var fShader = THREE.FresnelShader;
		var fresnelUniforms = 
		{
			"mRefractionRatio": { type: "f", value: 1.02 },
			"mFresnelBias": 	{ type: "f", value: 0.1 },
			"mFresnelPower": 	{ type: "f", value: 2.0 },
			"mFresnelScale": 	{ type: "f", value: 0.5 }, // CHANGED FROM 1.0
			"tCube": 			{ type: "t", value: textureCube }
		};	
		// create custom material for the shader
		var customMaterial = new THREE.ShaderMaterial({
		    uniforms: 		fresnelUniforms,
			vertexShader:   fShader.vertexShader,
			fragmentShader: fShader.fragmentShader
		});

		// customMaterial.uniforms.opacity = 0;
		// customMaterial.uniforms.needsUpdate = true;
		
		var mesh = new THREE.Mesh( geometry, customMaterial );
		// scene.add(mesh);
		
	    // bubbles like to move around
		this.ballUpdate = function(t) {
			self.resetValues( values );
			self.addBall( points, values, new THREE.Vector3( 2.0 * Math.cos(1.1 * t), 1.5 * Math.sin(1.6 * t), 3.0 * Math.sin(1.0 * t) ) );
			self.addBall( points, values, new THREE.Vector3( 2.4 * Math.sin(1.8 * t), 1.5 * Math.sin(1.3 * t), 1.9 * Math.cos(1.9 * t) ) );
			self.addBall( points, values, new THREE.Vector3( 3.0 * Math.cos(1.5 * t), 2.5 * Math.cos(1.2 * t), 2.1 * Math.sin(1.7 * t) ) );
				
			this.scene.remove( mesh );
			var newGeometry = this.marchingCubes( points, values, 0.5 );
			mesh = new THREE.Mesh( newGeometry, customMaterial );
			
			// BALLS ON/OFF SWITCH
			if ( this.ballsVis ) {
				this.scene.add( mesh );
			}

		}
		
	}, 

	addBox : function ( filename, size, _opacity ) {

		console.log("Anim.addBox", filename, _opacity );

		// SKYBOX
		// IMAGE SRCs
		var imagePrefix = "assets/images/" + filename + "-";
		var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
		var imageSuffix = ".png";
		// SIZE OF CUBE
		var skyGeometry = new THREE.CubeGeometry( size, size, size );

		this.urls = [];
		for (var i = 0; i < 6; i++)
			this.urls.push( imagePrefix + directions[i] + imageSuffix );
		
		var materialArray = [];
		for (var i = 0; i < 6; i++)
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
				side: THREE.BackSide,
				transparent: true, 
				opacity: _opacity 
			}));
		var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
		var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
		this.scene.add( skyBox );

	},

	animate: function () {
	    
		var self = this;

	    requestAnimationFrame( this.animate.bind(this) );
		this.render();		
		this.update();

	},

	update: function () {

		this.controls.update();
		// stats.update();
			
		var t = this.clock.getElapsedTime();
		this.ballUpdate(0.05 * t);

	},

	render: function () {

		// SPEED OF ROTATION
		var speed = 0.00005,
			distanceFromScene = 10, 
			timer = Date.now() * speed;

		this.camera.position.x = Math.cos( timer ) * distanceFromScene;
		this.camera.position.z = Math.sin( timer ) * distanceFromScene * 3;
		this.camera.lookAt( this.scene.position );

		if ( this.camera.position.x.toFixed(3) == 10.000 ) {
			// WHEN FACING XNEG
			console.log("Switch");
		}

		this.renderer.render( this.scene, this.camera );

	}, 

	// METABALLS FUNCTIONS

	resetValues: function ( values ) {
	    for (var i = 0; i < values.length; i++)
			values[i] = 0;
	}, 

	// add values corresponding to a ball with radius 1 to values array
	addBall: function (points, values, center) {
		for (var i = 0; i < values.length; i++)
		{
			var OneMinusD2 = 1.0 - center.distanceToSquared( points[i] );
			values[i] += Math.exp( -(OneMinusD2 * OneMinusD2) );
		}
	}, 


	// MARCHING CUBES ALGORITHM
	// parameters: domain points, range values, isolevel 
	// returns: geometry
	marchingCubes: function ( points, values, isolevel ) {
		// assumes the following global values have been defined: 
		//   THREE.edgeTable, THREE.triTable
		
		var size = Math.round(Math.pow(values.length, 1/3));
		var size2 = size * size;
		var size3 = size * size * size;
		
		// Vertices may occur along edges of cube, when the values at the edge's endpoints
		//   straddle the isolevel value.
		// Actual position along edge weighted according to function values.
		var vlist = new Array(12);
		
		var geometry = new THREE.Geometry();
		var vertexIndex = 0;
		
		for (var z = 0; z < size - 1; z++)
		for (var y = 0; y < size - 1; y++)
		for (var x = 0; x < size - 1; x++)
		{
			// index of base point, and also adjacent points on cube
			var p    = x + size * y + size2 * z,
				px   = p   + 1,
				py   = p   + size,
				pxy  = py  + 1,
				pz   = p   + size2,
				pxz  = px  + size2,
				pyz  = py  + size2,
				pxyz = pxy + size2;
			
			// store scalar values corresponding to vertices
			var value0 = values[ p    ],
				value1 = values[ px   ],
				value2 = values[ py   ],
				value3 = values[ pxy  ],
				value4 = values[ pz   ],
				value5 = values[ pxz  ],
				value6 = values[ pyz  ],
				value7 = values[ pxyz ];
			
			// place a "1" in bit positions corresponding to vertices whose
			//   isovalue is less than given constant.
			
			var cubeindex = 0;
			if ( value0 < isolevel ) cubeindex |= 1;
			if ( value1 < isolevel ) cubeindex |= 2;
			if ( value2 < isolevel ) cubeindex |= 8;
			if ( value3 < isolevel ) cubeindex |= 4;
			if ( value4 < isolevel ) cubeindex |= 16;
			if ( value5 < isolevel ) cubeindex |= 32;
			if ( value6 < isolevel ) cubeindex |= 128;
			if ( value7 < isolevel ) cubeindex |= 64;
			
			// bits = 12 bit number, indicates which edges are crossed by the isosurface
			var bits = THREE.edgeTable[ cubeindex ];
			
			// if none are crossed, proceed to next iteration
			if ( bits === 0 ) continue;
			
			// check which edges are crossed, and estimate the point location
			//    using a weighted average of scalar values at edge endpoints.
			// store the vertex in an array for use later.
			var mu = 0.5; 
			
			// bottom of the cube
			if ( bits & 1 )
			{		
				mu = ( isolevel - value0 ) / ( value1 - value0 );
				vlist[0] = points[p].clone().lerp( points[px], mu );
			}
			if ( bits & 2 )
			{
				mu = ( isolevel - value1 ) / ( value3 - value1 );
				vlist[1] = points[px].clone().lerp( points[pxy], mu );
			}
			if ( bits & 4 )
			{
				mu = ( isolevel - value2 ) / ( value3 - value2 );
				vlist[2] = points[py].clone().lerp( points[pxy], mu );
			}
			if ( bits & 8 )
			{
				mu = ( isolevel - value0 ) / ( value2 - value0 );
				vlist[3] = points[p].clone().lerp( points[py], mu );
			}
			// top of the cube
			if ( bits & 16 )
			{
				mu = ( isolevel - value4 ) / ( value5 - value4 );
				vlist[4] = points[pz].clone().lerp( points[pxz], mu );
			}
			if ( bits & 32 )
			{
				mu = ( isolevel - value5 ) / ( value7 - value5 );
				vlist[5] = points[pxz].clone().lerp( points[pxyz], mu );
			}
			if ( bits & 64 )
			{
				mu = ( isolevel - value6 ) / ( value7 - value6 );
				vlist[6] = points[pyz].clone().lerp( points[pxyz], mu );
			}
			if ( bits & 128 )
			{
				mu = ( isolevel - value4 ) / ( value6 - value4 );
				vlist[7] = points[pz].clone().lerp( points[pyz], mu );
			}
			// vertical lines of the cube
			if ( bits & 256 )
			{
				mu = ( isolevel - value0 ) / ( value4 - value0 );
				vlist[8] = points[p].clone().lerp( points[pz], mu );
			}
			if ( bits & 512 )
			{
				mu = ( isolevel - value1 ) / ( value5 - value1 );
				vlist[9] = points[px].clone().lerp( points[pxz], mu );
			}
			if ( bits & 1024 )
			{
				mu = ( isolevel - value3 ) / ( value7 - value3 );
				vlist[10] = points[pxy].clone().lerp( points[pxyz], mu );
			}
			if ( bits & 2048 )
			{
				mu = ( isolevel - value2 ) / ( value6 - value2 );
				vlist[11] = points[py].clone().lerp( points[pyz], mu );
			}
			
			// construct triangles -- get correct vertices from triTable.
			var i = 0;
			cubeindex <<= 4;  // multiply by 16... 
			// "Re-purpose cubeindex into an offset into triTable." 
			//  since each row really isn't a row.
			 
			// the while loop should run at most 5 times,
			//   since the 16th entry in each row is a -1.
			while ( THREE.triTable[ cubeindex + i ] != -1 ) 
			{
				var index1 = THREE.triTable[cubeindex + i];
				var index2 = THREE.triTable[cubeindex + i + 1];
				var index3 = THREE.triTable[cubeindex + i + 2];
				
				geometry.vertices.push( vlist[index1].clone() );
				geometry.vertices.push( vlist[index2].clone() );
				geometry.vertices.push( vlist[index3].clone() );
				var face = new THREE.Face3(vertexIndex, vertexIndex+1, vertexIndex+2);
				geometry.faces.push( face );

				geometry.faceVertexUvs[ 0 ].push( [ new THREE.Vector2(0,0), new THREE.Vector2(0,1), new THREE.Vector2(1,1) ] );

				vertexIndex += 3;
				i += 3;
			}
		}
		
		geometry.mergeVertices();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
	 	
		return geometry;
	}

}
