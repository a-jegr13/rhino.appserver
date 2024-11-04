import * as THREE from 'three';

import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'rhino3dm'

const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://unpkg.com/rhino3dm@8.0.0-beta3/' )


const definition = 'newparkinghops.gh'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("three-canvas"), });
renderer.setPixelRatio(window.devicePixelRatio*20);

camera.position.x = 5
camera.position.y = 0;
camera.position.z = 15;
camera.lookAt(5,0,0);

var vertexGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
var vertexMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 5 } );

var threeVertices = new Map()
var threeLines = new Map()

let rhino, doc
rhino3dm().then( async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global
})


// Styling of the button is in index.html
document.addEventListener('DOMContentLoaded', (event) => {
	const button = document.querySelector('button');
	button.addEventListener('click', () => {
	  button.classList.add('animate-button');
	  setTimeout(() => {
		button.classList.remove('animate-button');
	  }, 300);

	  compute();

	});
  });

function updateVertices() {
	spatialGraph.spaces.forEach(space => {

		var pts = []
		
		space.vertices.forEach(vertexId => {
			if (!threeVertices.has(vertexId)) {
				let vertex = spatialGraph.vertices[vertexId]
				let sphere = new THREE.Mesh( vertexGeometry, vertexMaterial );
				sphere.position.x = vertex.x / 100 ;   							// Axes work differently between p5js and THREEjs
				sphere.position.y = vertex.y / 100; 							// Need to create some function to translate between coordinate systems.
				sphere.position.z = 0;											// For now, we just set y to 0 and plot y values on the z axis
				threeVertices.set(vertexId, sphere)
				scene.add( sphere );

				pts.push(new THREE.Vector3(vertex.x / 100, vertex.y / 100, 0))


		} else {
			let vertex = spatialGraph.vertices[vertexId]
			let sphere = threeVertices.get(vertexId)
			sphere.position.x = vertex.x / 100 ;
			sphere.position.y = vertex.y / 100;

			pts.push(new THREE.Vector3(vertex.x / 100, vertex.y / 100, 0))

		}
		})

		pts.push(pts[0]) // Make sure that the line for each space is closed.

		if  (threeLines.has(space.id)) {
			let line = threeLines.get(space.id)
			line.geometry.setFromPoints( pts )
		}
		else {
			const geometry = new THREE.BufferGeometry().setFromPoints( pts );
			const line = new THREE.Line( geometry, lineMaterial );
			threeLines.set(space.id, line)
			scene.add(line)
		}
	})
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

/**
 * Call appserver
 */
async function compute() {
	
	const data = {
		definition: definition,
		inputs: {
		  'Get Geometry': 1,
		}
	  }
	
	//   console.log(data.inputs)
	
	  const request = {
		'method':'POST',
		'body': JSON.stringify(data),
		'headers': {'Content-Type': 'application/json'}
	  }
	
	  try {
		const response = await fetch('/solve', request)
	
	  if(!response.ok) {
		// TODO: check for errors in response json
		throw new Error(response.statusText)
	  }
  
	  const responseJson = await response.json()
	  console.log(responseJson)
  
	//   collectResults(responseJson)
  
	} catch(error) {
	  console.error(error)
	}
  }
  
  /**
   * Parse response
   */
  function collectResults(responseJson) {
  
	  const values = responseJson.values
  
	  // clear doc
	  if( doc !== undefined)
		  doc.delete()
  
	  //console.log(values)
	  doc = new rhino.File3dm()
  
	  // for each output (RH_OUT:*)...
	  for ( let i = 0; i < values.length; i ++ ) {
		// ...iterate through data tree structure...
		for (const path in values[i].InnerTree) {
		  const branch = values[i].InnerTree[path]
		  // ...and for each branch...
		  for( let j = 0; j < branch.length; j ++) {
			// ...load rhino geometry into doc
			const rhinoObject = decodeItem(branch[j])
			console.log(rhinoObject)
			if (rhinoObject !== null) {
			  doc.objects().add(rhinoObject, null)
			}
		  }
		}
	  }
  
	  if (doc.objects().count < 1) {
		console.error('No rhino objects to load!')
		showSpinner(false)
		return
	  }
  
	  // load rhino doc into three.js scene
	  const buffer = new Uint8Array(doc.toByteArray()).buffer
	  loader.parse( buffer, function ( object ) 
	  {
		  // debug 
		  /*
		  object.traverse(child => {
			if (child.material !== undefined)
			  child.material = new THREE.MeshNormalMaterial()
		  }, false)
		  */
  
		  // clear objects from scene. do this here to avoid blink
		  scene.traverse(child => {
			  if (!child.isLight) {
				  scene.remove(child)
			  }
		  })
  
		  //console.log(object)
  
		  // add object graph from rhino model to three.js scene
		  scene.add( object )
  
		  // hide spinner and enable download button
		  showSpinner(false)
		  downloadButton.disabled = false
  
		  // zoom to extents
		  //zoomCameraToSelection(camera, controls, scene.children)
	  })
  }
  
  /**
   * Attempt to decode data tree item to rhino geometry
   */
  function decodeItem(item) {
	const data = JSON.parse(item.data)
	if (item.type === 'System.String') {
	  // hack for draco meshes
	  try {
		  return rhino.DracoCompression.decompressBase64String(data)
	  } catch {} // ignore errors (maybe the string was just a string...)
	} else if (typeof data === 'object') {
	  //console.log(data)
	  return rhino.CommonObject.decode(data)
	}
	return null
  }
  




animate();







