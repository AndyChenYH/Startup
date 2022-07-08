
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.141.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.141.0/examples/jsm/loaders/OBJLoader.js';
import { Vector3 } from 'three';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });
const canvasWid = Math.floor(window.innerWidth * 2 / 3), canvasHei = (window.innerHeight * 2 / 3);
renderer.setSize(canvasWid, canvasHei);

const fov = 45;
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
		}
	};

	var onError = function (xhr) { };

	// Manager
	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
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
			scene.add(object);
		},
		onProgress,
		onError
	);
}
loadObj("Andy");
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = (event.clientX / canvasWid) * 2 - 1;
	pointer.y = - (event.clientY / canvasHei) * 2 + 1;

}
class Comment {
	constructor(pos, text) {
		this.pos = pos;
		this.text = text;
	}
}
var comments = [];

var commenting = false;
function onClick(event) {
	if (commenting) {
		const mouse = {
			x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
			y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
		}
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera(pointer, camera);

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(scene.children);
		if (intersects.length !== 0) {
			var poo = intersects[0].point;
			var fetch = fetchComment(poo);
			// make new comment
			if (fetch === -1) {
				var prom = prompt("enter your comment");
				// user didn't cancel the prompt or enter empty input
				if (prom !== null && prom !== "") {
					const n = new THREE.Vector3()
					n.copy(intersects[0].face.normal)
					n.transformDirection(intersects[0].object.matrixWorld)
			
					// using a flattened cone as circular plane
					const coneGeometry = new THREE.ConeGeometry(1, 0, 8);
					const cone = new THREE.Mesh(coneGeometry, material)
					cone.lookAt(n)
					cone.rotateX(Math.PI / 2)
					cone.position.copy(intersects[0].point)
					cone.position.addScaledVector(n, 0.1)
			
					scene.add(cone)
					addComment(poo, prom);
				}
			}
			// fetch existing comment
			else {
				var curColor = document.getElementById(fetch.toString()).style.backgroundColor;
				document.getElementById(fetch.toString()).style.backgroundColor = "yellow";
				setInterval(function() {document.getElementById(fetch.toString()).style.backgroundColor = curColor; }, 1000);
			}
		}
		commenting = false;
	}
}
function fetchComment(coord) {
	function dist(a, b) {
		var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
	// minimum radius the mouse has to click within
	const minRad = 1;
	
	for (var i = 0; i < comments.length; i ++) {
		if (dist(coord, comments[i].pos) < minRad) {
			return i;
		}
	}
	return -1;
}
function getFormattedDate() {
    var date = new Date();
    var str = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}
function addComment(coord, text) {
	comments.push(new Comment(coord, text));
	var lis = document.getElementById("comm");
	var entry = document.createElement("li");
	var time = document.createElement("div");
	time.className = "time";
	time.appendChild(document.createTextNode(getFormattedDate()));
	var tex = document.createElement("p");
	tex.appendChild(document.createTextNode(text));
	tex.setAttribute("id", comments.length - 1);
	entry.appendChild(time);
	entry.appendChild(tex);
	lis.appendChild(entry);
}

// tester
{
	addComment(new Vector3(0, 0, 0), "this is a very bad design please fix this thanks");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
	addComment(new Vector3(0, 0, 0), "gay");
}	

function render() {
	controls.update();


	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

window.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('click', onClick, false)

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
function keyDown(e) {
	if (e.key === "Alt") {
		commenting = true;
	}
}
function keyUp(e) {
	if (e.key === "Alt") {
		commenting = false;
	}
}

window.requestAnimationFrame(render);
