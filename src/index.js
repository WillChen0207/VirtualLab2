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
var titlearray = ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','🚗'];
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
scene.background = new THREE.Color(0xdddddd)//场景背景色
scene.fog = new THREE.Fog( 0xf2f7ff, 1, 100000 );

//初始化cannonjs物理世界
const world = new CANNON.World();
const G = -9.82;
world.gravity.set(0, 0.0001*G, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
world.solver.tolerance = 0.01;


function Init(){
  //创建刚体球体
  sphereBody = new CANNON.Body({ 
    mass: 0.5 ,
    position: new CANNON.Vec3(0, ballheight, 0),
    shape: sphereShape,
    material: new CANNON.Material({
      friction: 0.5,
      restitution: 0.8
    })
  });
  sphereBody.velocity.set(0, 0, 0);
  sphereBody.angularVelocity.set(0, 0, 0);
  sphereBody.force.set(0, 0, 0);
  sphereBody.addShape(sphereShape);
  world.add(sphereBody);
  //创建上面球体的网格
  sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, ballheight, 0);
  scene.add(sphereMesh);
  update();
}

//创建刚体球体
var ballheight = 150;
var sphereShape = new CANNON.Sphere(8);
var sphereBody = new CANNON.Body({ 
  mass: 0.5 ,
  position: new CANNON.Vec3(0, ballheight, 0),
  shape: sphereShape,
  material: new CANNON.Material({
    friction: 0.5,
    restitution: 0.8
  })
});
sphereBody.addShape(sphereShape);
world.add(sphereBody);

//创建上面球体的网格
var sphereGeometry = new THREE.SphereGeometry(8, 10, 10);
var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(0, ballheight, 0);
scene.add(sphereMesh);


//创建地面刚体
var planeShape = new CANNON.Plane();
var planeBody = new CANNON.Body({
  mass: 0,
  shape: planeShape,
  position: new CANNON.Vec3(0, 0, 0),
  quaternion: new CANNON.Quaternion().setFromEuler( - Math.PI / 2, 0, 0),
  material: new CANNON.Material({
    restitution: 1,
    friction: 0.5
  })
});
planeBody.addShape(planeShape);
world.add(planeBody);

//创建地面网格
var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
var planeMaterial = new THREE.MeshLambertMaterial({ 
  texture: new THREE.TextureLoader().load('./static/floortexture.jpg')
});
var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.receiveShadow = true;
planeMesh.rotation.z = -Math.PI / 2;
planeMesh.position.y = -0.5;
scene.add(planeMesh);

//将上面创建的刚体球体和网格关联起来并为物理世界开启持续更新
function update(){
  requestAnimationFrame(update)
  world.step(1 / 60) 
  if (sphereMesh) { 
    if (sphereMesh.position.y < 0) { // 如果球体落地
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
 * Object
 */

//创建键盘触发事件
function onKeyDown(event) {
  switch (event.keyCode) {
    case 38:{ // 删除sphereMesh并重新生成
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

//添加一个环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight);
//添加一个点光源
const pointLight = new THREE.DirectionalLight(0xff0000, 1);
pointLight.position.set(0, 50, 0);
let helper = new THREE.DirectionalLightHelper(pointLight, 10);
scene.add(pointLight);
scene.add(helper);


// 辅助坐标
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

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
  const elapsedTime = clock.getElapsedTime()


  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
  update()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
