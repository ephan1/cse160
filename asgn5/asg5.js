import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    RectAreaLightUniformsLib.init();

	const fov = 50;
	const aspect = 2; 
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );




	{

		const planeSize = 4000;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'mine.jpg' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		const repeats = planeSize / 190;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

	{

		const skyColor = 0xB1E1FF; 
		const groundColor = 0xB97A20; 
		const intensity = 3;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

    {

		const loader = new THREE.TextureLoader();
		const texture = loader.load('purple.png',() => {texture.mapping = THREE.EquirectangularReflectionMapping; texture.colorSpace = THREE.SRGBColorSpace;scene.background = texture;} );

	}

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

    class ColorGUI {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}

	}

	class DegRad {

		constructor( obj, prop ) {
			this.obj = obj;
			this.prop = prop;
		}
		get value() {
			return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );
		}
		set value( v ) {
			this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

		}

	}

	function makeXYZGUI( gui, vector3, name, onChangeFn ) {

		const folder = gui.addFolder( name );
		folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
		folder.open();

	}

	{

		const color = 0xFFFFFF;
		const intensity = 5;
		const width = 12;
		const height = 4;
		const light = new THREE.RectAreaLight( color, intensity, width, height );
		light.position.set( 0, 2.5, 0 );
		light.rotation.x = THREE.MathUtils.degToRad( - 90 );
		scene.add( light );

		const helper = new RectAreaLightHelper( light );
		light.add( helper );

		const gui = new GUI();
		gui.addColor( new ColorGUI( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 10, 0.01 );
		gui.add( light, 'width', 0, 20 );
		gui.add( light, 'height', 0, 20 );
		gui.add( new DegRad( light.rotation, 'x' ), 'value', - 180, 180 ).name( 'x rotation' );
		gui.add( new DegRad( light.rotation, 'y' ), 'value', - 180, 180 ).name( 'y rotation' );
		gui.add( new DegRad( light.rotation, 'z' ), 'value', - 180, 180 ).name( 'z rotation' );

		makeXYZGUI( gui, light.position, 'position' );

	}



	function frameArea( sizeToFit, boxSize, boxCenter, camera ) {

		const halfSizeToFitOnScreen = sizeToFit * 0.5;
		const halfFovY = THREE.MathUtils.degToRad( camera.fov * 0.5 );
		const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );
		const direction = ( new THREE.Vector3() ).subVectors( camera.position, boxCenter ).multiply( new THREE.Vector3( 1, 0, 1 ) ).normalize();
		camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );
		camera.near = boxSize / 100;
		camera.far = boxSize * 100;
		camera.updateProjectionMatrix();
		camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

	}

	{

		const mtlLoader = new MTLLoader();
		mtlLoader.load( 'base_tri.obj.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( 'base_tri.obj', ( root ) => {
				scene.add( root );
				const box = new THREE.Box3().setFromObject( root );
				const boxSize = box.getSize( new THREE.Vector3() ).length();
				const boxCenter = box.getCenter( new THREE.Vector3() );
				frameArea( boxSize * 1.2, boxSize, boxCenter, camera );
				controls.maxDistance = boxSize * 10;
				controls.target.copy( boxCenter );
				controls.update();

			} );

		} );

	}

	function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;

	}

    {

		const cubeSize = 1;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshStandardMaterial( { color: 0x8844aa } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
		scene.add( mesh );

	}

	{

		const sphereRadius = 1;
		const sphereWidthDivisions = 16;
		const sphereHeightDivisions = 8;
        const loader1 = new THREE.TextureLoader();
		const texture1 = loader1.load( 'obama.png' );
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial({ map: texture1});
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius - 1, sphereRadius / 1.5, 0 );
		scene.add( mesh );

        const sphereRadius2 = 1;
		const sphereWidthDivisions2 = 16;
		const sphereHeightDivisions2 = 8;
        const loader2 = new THREE.TextureLoader();
		const texture2 = loader2.load( 'kevin.jpg' );
		const sphereGeo2 = new THREE.SphereGeometry( sphereRadius2, sphereWidthDivisions2, sphereHeightDivisions2);
		const sphereMat2 = new THREE.MeshPhongMaterial({ map: texture2});
		const mesh2 = new THREE.Mesh( sphereGeo2, sphereMat2 );
		mesh2.position.set( - sphereRadius2 - 4, sphereRadius2 / 1.5, 0 );
		scene.add( mesh2 );

        const sphereRadius3 = 1;
		const sphereWidthDivisions3 = 16;
		const sphereHeightDivisions3 = 8;
        const loader3 = new THREE.TextureLoader();
		const texture3 = loader3.load( 'kanye.png' );
		const sphereGeo3 = new THREE.SphereGeometry( sphereRadius3, sphereWidthDivisions3, sphereHeightDivisions3);
		const sphereMat3 = new THREE.MeshPhongMaterial({ map: texture3});
		const mesh3 = new THREE.Mesh( sphereGeo3, sphereMat3 );
		mesh3.position.set( - sphereRadius3 - 6, sphereRadius3 / 1.5, 0 );
		scene.add( mesh3 );

	}

    const boxWidth = 0.5;
	const boxHeight = 0.5;    
	const boxDepth = 0.5;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
    //const cube = new THREE.Mesh(geometry, material);
    const cubes = [
		makeInstance( geometry, 0x8844aa, 0),
	];

	function makeInstance( geometry, x ) {
        const loader = new THREE.TextureLoader();
		const texture = loader.load( 'kanye.png' );

		const material = new THREE.MeshPhongMaterial({ map: texture});

		const cube = new THREE.Mesh( geometry, material);
		scene.add( cube );

		cube.position.x = x;

		return cube;

	}

    function render(time) {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}
        time *= 0.001;

		cubes.forEach( ( cube, ndx ) => {
			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );

		renderer.render( scene, camera );
		requestAnimationFrame( render );

	}
	requestAnimationFrame( render );


}


main();
