import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as CANNON from 'cannon'
/**
 * GUI Controls
 */
import * as dat from 'dat.gui'
const gui = new dat.GUI()
var sceneAttribute = new function() {
  this.ballheight = 150;
  this.ballmass = 0.5;
}

gui.add(sceneAttribute, 'ballmass', -2, 2).listen().onChange(function(value){
  sphereBody.mass = value
})
gui.add(sceneAttribute, 'ballheight', 0, 200).listen().onChange(function(value){
  ballheight = value
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('#webgl')
var titlearray = ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','ð'];
var timer = window.setInterval(function(){
  titlechange();
}, 1000);
function titlechange(){
  var tmp = titlearray[0];
  var titleText = "";
  for (var i = 0; i <= 19; i++){
    titlearray[i] = titlearray[i+1];
  }
  titlearray[20] = tmp;
  for (var i = 0; i <= 20; i++){
    titleText += titlearray[i];
  }
  document.getElementById("titletext").innerHTML = titleText;
}

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xdddddd)//åºæ¯èæ¯è²
scene.fog = new THREE.Fog( 0xf2f7ff, 1, 100000 );

//åå§åcannonjsç©çä¸ç
const world = new CANNON.World();
const G = -9.82;
world.gravity.set(0, 0.0001*G, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
world.solver.tolerance = 0.01;


function Init(){
  //åå»ºåä½çä½
  sphereBody = new CANNON.Body({ 
    mass: 0.5 ,
    position: new CANNON.Vec3(0, ballheight, 0),
    shape: sphereShape,
    material: spherePhysicalMaterial
  });
  sphereBody.velocity.set(0, 0, 0);
  sphereBody.angularVelocity.set(0, 0, 0);
  sphereBody.force.set(0, 0, 0);
  sphereBody.addShape(sphereShape);
  sphereBody.applyLocalForce(new CANNON.Vec3(50, 0, 0), new CANNON.Vec3(0, 0, 0), true);
  world.add(sphereBody);
  //åå»ºä¸é¢çä½çç½æ ¼
  sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, ballheight, 0);
  scene.add(sphereMesh);
  update();
}

//åå»ºåä½çä½
var ballheight = 150;
var sphereShape = new CANNON.Sphere(8);
var spherePhysicalMaterial = new CANNON.Material({
  friction: 0,
  restitution: 0.8
});
var sphereBody = new CANNON.Body({ 
  mass: 0.5 ,
  position: new CANNON.Vec3(0, ballheight, 0),
  shape: sphereShape,
  material: spherePhysicalMaterial
});
sphereBody.addShape(sphereShape);
world.add(sphereBody);

//åå»ºä¸é¢çä½çç½æ ¼
var sphereGeometry = new THREE.SphereGeometry(8, 20, 20);
var sphereMaterial = new THREE.MeshPhysicalMaterial({ 
  color: 0xcccccc, 
  metalness: 1, 
  roughness: 0.4 
});
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(0, ballheight, 0);
scene.add(sphereMesh);


//åå»ºå°é¢åä½
var planeShape = new CANNON.Plane();
var planePhysicalMaterial = new CANNON.Material({
  friction: 0,
  restitution: 0.9
});
var planeBody = new CANNON.Body({
  mass: 0,
  shape: planeShape,
  position: new CANNON.Vec3(0, 0, 0),
  quaternion: new CANNON.Quaternion().setFromEuler( - Math.PI / 2, 0, 0),
  material: planePhysicalMaterial
});
planeBody.addShape(planeShape);
world.add(planeBody);

//åå»ºå°é¢ç½æ ¼
var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
var planeMaterial = new THREE.MeshPhysicalMaterial({ 
  color: 0xdddddd,
  metalness: 0.8,
  roughness: 0.5
});
var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.rotation.z = -Math.PI / 2;
planeMesh.position.y = -0.5;
scene.add(planeMesh);

//åå»ºèç³»æè´¨
const contactMaterial = new CANNON.ContactMaterial(
  planePhysicalMaterial,
  spherePhysicalMaterial,
  {
    friction : 0,
    restitution : 0.9,
  }
)
world.addContactMaterial(contactMaterial);
/**
 * Object
 */

//åå»ºé®çè§¦åäºä»¶
function onKeyDown(event) {
  switch (event.keyCode) {
    case 38:{ // å é¤sphereMeshå¹¶éæ°çæ
      scene.remove(sphereMesh);
      world.remove(sphereBody);
      Init();
      break;
    }
  }
}
document.addEventListener('keydown', onKeyDown, false);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  20000
)
camera.position.x = 1
camera.position.y = 20
camera.position.z = 200
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = false
// controls.enableZoom = false
controls.enablePan = false
controls.dampingFactor = 0.05
controls.maxDistance = 1000
controls.minDistance = 30
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
}

//æ·»å ä¸ä¸ªç¯å¢å
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight);
//æ·»å ä¸ä¸ªç¹åæº
const pointLight = new THREE.DirectionalLight(0xffffff, 1);
pointLight.position.set(50, 200, 0);
let helper = new THREE.DirectionalLightHelper(pointLight, 10);
scene.add(pointLight);
scene.add(helper);


// è¾å©åæ 
// var axesHelper = new THREE.AxesHelper( 150 );
// scene.add( axesHelper );

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  backgroundColor: 0xffffff
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


//å°ä¸é¢åå»ºçåä½åç½æ ¼å³èèµ·æ¥å¹¶ä¸ºç©çä¸çå¼å¯æç»­æ´æ°
function update(){
  requestAnimationFrame(update)
  // console.log(sphereBody.velocity)
  world.step(1 / 60) 
  if (sphereMesh) { 
    if (sphereMesh.position.y < 0) { // å¦æçä½è½å°
      sphereMesh.position.y = 0;
      sphereBody.velocity.set(0, 0, 0);
      sphereBody.angularVelocity.set(0, 0, 0);
    }
    sphereMesh.position.copy(sphereBody.position) 
    sphereMesh.quaternion.copy(sphereBody.quaternion) 
  } 
  if (planeMesh) { 
    planeMesh.position.copy(planeBody.position) 
    planeMesh.quaternion.copy(planeBody.quaternion) 
  }
}


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedtime = 0
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltatime = elapsedTime - oldElapsedtime
  oldElapsedtime = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
  update()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
