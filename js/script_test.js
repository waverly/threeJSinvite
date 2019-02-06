// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

var mouseX = 0,
  mouseY = 0,
  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,
  camera,
  scene,
  renderer;

init();
animate();

function init() {
  var container, particle;

  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0x000000, 250, 1400);
  // LIGHTS
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  var pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(50, 100, 90);
  scene.add(pointLight);

  renderer = new THREE.WebGLRenderer({ alpha: true }); // gradient; this can be swapped for WebGLRenderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Configure renderer clear color
  renderer.setClearColor("#FF4500");

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 100;

  var controls = new THREE.OrbitControls(camera);

  // Instantiate a loader
  // var loader = new THREE.GLTFLoader();

  // // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  // // Configure decoder and create loader.
  // // THREE.DRACOLoader.setDecoderPath("../");
  // // THREE.DRACOLoader.setDecoderConfig({ type: "js" });
  // // var dracoLoader = new THREE.DRACOLoader();

  // // Load a glTF resource
  // loader.load(
  //   // resource URL
  //   "models/gltf/iphone_gltf/iphone.gltf",
  //   // called when the resource is loaded
  //   function(gltf) {
  //     scene.add(gltf.scene);

  //     gltf.animations; // Array<THREE.AnimationClip>
  //     gltf.scene; // THREE.Scene
  //     gltf.scenes; // Array<THREE.Scene>
  //     gltf.cameras; // Array<THREE.Camera>
  //     gltf.asset; // Object
  //   },
  //   // called while loading is progressing
  //   function(xhr) {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   // called when loading has errors
  //   function(error) {
  //     console.log("An error happened");
  //   }
  // );

  // mousey
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchmove", onDocumentTouchMove, false);

  // window.addEventListener("resize", onWindowResize, false);
} // end init();

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY + 200 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // controls.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length > 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}
