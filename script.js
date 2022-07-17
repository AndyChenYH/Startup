
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
// unique ID of the base object; this is to make sure we only highlight the object itself
var obj;
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
					obj = child;
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

	var rect = canvas.getBoundingClientRect();
	pointer.x = ((event.clientX - rect.left) / canvasWid) * 2 - 1;
	pointer.y = - ((event.clientY - rect.top) / canvasHei) * 2 + 1;

}
class Comment {
	constructor() {
		this.pos = [];
		this.text = "";
	}
}
var comments = [];
var curComment;
var alting = false;
var clicking = false;
function getFormattedDate() {
    var date = new Date();
    var str = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}
function addComment(text) {
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
	entry.scrollIntoView();
}

// tester
{
	addComment(new Vector3(0, 0, 0), "this is a very bad design please fix this thanks");
}	

// only checks for one pressed point
function checkMouse() {
	if (!alting || !clicking) return;
	var rect = canvas.getBoundingClientRect();
	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera(pointer, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(scene.children);
	
	if (intersects.length !== 0) {
		console.log(obj.uuid);
		console.log(intersects[0].uuid);
		// make new comment
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

		curComment.pos.push(intersects[0].point);
	}
}
function render() {
	controls.update();
	if (alting) checkMouse();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

window.addEventListener('pointermove', onPointerMove);
function mouseDown() {
	clicking = true;
}
function mouseUp() {
	clicking = false;
}
window.addEventListener("mousedown", mouseDown);
window.addEventListener("mouseup", mouseUp);


window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
function keyDown(e) {
	if (e.key === "Alt") {
		alting = true;
		controls.enabled = false;
		curComment = new Comment();
	}
}
function keyUp(e) {
	if (e.key === "Alt") {
		alting = false;
		controls.enabled = true;
		var prom = prompt("please enter ur comment");
		curComment.text = prom;
		comments.push(curComment);
		addComment(prom);
	}
}

window.requestAnimationFrame(render);
