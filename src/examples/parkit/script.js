import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
import rhino3dm from 'rhino3dm'
import { RhinoCompute } from 'rhinocompute'

const rhino = await rhino3dm()
console.log('Loaded rhino3dm.')

const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download

let renderer, scene, camera
let doc

const definitionName = 'hops_geom_test.gh'
let url = definitionName
let res = await fetch(url)
let buffer = await res.arrayBuffer()
const definition = new Uint8Array(buffer)

let geometry, polyline,  rhinoPolyline


const button = document.getElementById('compute');
button.addEventListener('click', () => {
    button.classList.add('animate-button');
    setTimeout(() => {
    button.classList.remove('animate-button');
    }, 300);

    compute();

});
  


init()
create()
animate()

// create //

function create () 
{
    // create three polyline

    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } )

    const points = [];

    // Create a closed loop of vertices
    points.push( new THREE.Vector3( -10, 0, 0 ) )
    points.push( new THREE.Vector3( 0, 12, 0 ) )
    points.push( new THREE.Vector3( 10, 0, 0 ) )
    points.push( new THREE.Vector3( 0, -10, 0 ) )
    points.push( new THREE.Vector3( -10, 0, 0 ) )
    

    geometry = new THREE.BufferGeometry().setFromPoints( points )

    polyline = new THREE.Line( geometry, material )

    scene.add( polyline )

    // convert polyline buffer geo to rhino polyline

    doc = new rhino.File3dm()

    const count = geometry.attributes.position.count
    rhinoPolyline = new rhino.Polyline()

    for (let i = 0; i < count; i++) {

        const x = geometry.attributes.position.getX(i)
        const y = geometry.attributes.position.getY(i)
        const z = geometry.attributes.position.getZ(i)

        rhinoPolyline.add( x, y, z )

    }

    doc.objects().addPolyline( rhinoPolyline, null )

     // hide spinner
    document.getElementById('loader').style.display = 'none'

    // enable download button
    downloadButton.disabled = false

}

// BOILERPLATE //



// download button handler
function download() {
    const options = new rhino.File3dmWriteOptions()
    options.version = 8
    let buffer = doc.toByteArrayOptions(options)
    saveByteArray('rhinoObjectTypes' + options.version + '.3dm', buffer)
  }
  
  function saveByteArray(fileName, byte) {
    let blob = new Blob([byte], { type: 'application/octect-stream' })
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  }

function init () {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1)
  
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1,1,1)
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )
    camera.position.z = 50
  
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )
  
    const controls = new OrbitControls( camera, renderer.domElement  )
  
    const light = new THREE.DirectionalLight()
    scene.add( light )
  
    window.addEventListener( 'resize', onWindowResize, false )
  
    animate()
  }
  
  function animate () {
    requestAnimationFrame( animate )
    renderer.render( scene, camera )
  }
    
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
    animate()
  }

  /**
 * Call appserver
 */
  async function compute() {

   

    const crvPoints = new rhino.Point3dList()
    crvPoints.add( -10, 0, 0  )
    crvPoints.add( 0, 12, 0  )
    crvPoints.add( 10, 0, 0  )
    crvPoints.add( 0, -10, 0  )
    crvPoints.add( -10, 0, 0  )

    const nCrv = rhino.NurbsCurve.create( false, 3, crvPoints)

    const crvData = JSON.stringify( nCrv.encode() )
    console.log(crvData)

    // format data
    let param1 = new RhinoCompute.Grasshopper.DataTree('Get Geometry')
    param1.append([0], [crvData] )

    // Add all params to an array
    let trees = []
    trees.push( param1 )

    // Call RhinoCompute
    RhinoCompute.url = 'http://localhost:5000/'
    const res = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees)

    console.log(res) 

    collectResults(res)

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



    // set up loader for converting the results to threejs
    const loader = new Rhino3dmLoader()
    loader.setLibraryPath( 'https://unpkg.com/rhino3dm@8.6.1/' )

    const resMaterial = new THREE.MeshBasicMaterial( {wireframe: true, color: 0x00ff00} )

    // load rhino doc into three.js scene
    const buffer = new Uint8Array(doc.toByteArray()).buffer
    loader.parse(buffer, function ( object ) 
    {

        // add material to resulting meshes
        object.traverse( child => {
            child.material = resMaterial
            child.rotateOnWorldAxis(new THREE.Vector3(1,0,0), THREE.MathUtils.degToRad(-90))
        } )

        console.log(object)
        // add object graph from rhino model to three.js scene
        scene.add( object )

        // // hide spinner
        // showSpinner(false)

    }, (error) => {
      console.error( error )
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
  