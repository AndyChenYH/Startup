
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.141.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.141.0/examples/jsm/loaders/OBJLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize( window.innerWidth, window.innerHeight );

const fov = 100;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 20);

const controls = new OrbitControls(camera, canvas);
controls.screenSpacePanning = true;
controls.target.set(0, 0, 0);
controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color('grey');
{
	const skyColor = 0xB1E1FF;  // light blue
	const groundColor = 0xB97A20;  // brownish orange
	const intensity = 1;
	const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	scene.add(light);
}

function loadObj(objName) {
	var onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			var percentComplete = (xhr.loaded / xhr.total) * 100;
			console.log(Math.round(percentComplete, 2) + "% downloaded");
		}
	};

	var onError = function (xhr) {};

	// Manager
	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(
			"Started loading file: " +
			item +
			".\nLoaded " +
			loaded +
			" of " +
			total +
			" files."
		);
	};

	var loader = new OBJLoader(manager);
	loader.load(
		objName + ".obj",
		function (object) {
			var objBbox = new THREE.Box3().setFromObject(object);

			// Geometry vertices centering to world axis
			try {
				var bboxCenter = new THREE.Vector3();
				objBbox.getCenter(bboxCenter);
				bboxCenter.multiplyScalar(-1);
			}
			catch (err) {
				console.log(err);
			}

			object.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.geometry.translate(bboxCenter.x, bboxCenter.y, bboxCenter.z);
				}
			});

			objBbox.setFromObject(object); // Update the bounding box
			console.log(object);
			scene.add(object);
		},
		onProgress,
		onError
	);
}
loadObj("Andy");
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onClick(event) {
	const mouse = {
		x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
		y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
	}
	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
	console.log(intersects);
	if (intersects.length !== 0) {
		var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
		intersects[0].object.material.color.set(randomColor);
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );
		var poo = intersects[0].point;
		cube.position.set(poo.x, poo.y, poo.z);
		scene.add(cube)
	}
}

function render() {
	controls.update();


	renderer.render( scene, camera );
	requestAnimationFrame(render);
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', onClick);
renderer.domElement.addEventListener('click', onClick, false)

window.requestAnimationFrame(render);
