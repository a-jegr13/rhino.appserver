import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("three-canvas"), });
renderer.setPixelRatio(window.devicePixelRatio*20);

camera.position.x = 5
camera.position.y = 5;
camera.position.z = 15;


var vertexGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
var vertexMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var threeVertices = new Map()



function updateVertices() {
	spatialGraph.spaces.forEach(space => {
		space.vertices.forEach(vertexId => {
			if (!threeVertices.has(vertexId)) {
				let vertex = spatialGraph.vertices[vertexId]
				let sphere = new THREE.Mesh( vertexGeometry, vertexMaterial );
				sphere.position.x = vertex.x / 100 ;   			// Axes work differently between p5js and THREEjs
				sphere.position.y = 0; 							// Need to create some function to translate between coordinate systems.
				sphere.position.z = vertex.y / 100;				// For now, we just set y to 0 and plot y values on the z axis
				threeVertices.set(vertexId, sphere)
				scene.add( sphere );
		} else {
			let vertex = spatialGraph.vertices[vertexId]
			let sphere = threeVertices.get(vertexId)
			sphere.position.x = vertex.x / 100 ;
			sphere.position.z = vertex.y / 100;
		}
	})})
}


function updateScene() {
	updateVertices()
}




function animate() {
	if (spatialGraph.spaces.length > 0) {
		updateScene()
	}


	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();