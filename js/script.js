// Three.js - Load .GLTF
// from https://threejsfundamentals.org/threejs/threejs-load-gltf.html

"use strict";

/* global THREE */

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function main() {
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  var mouseX = 0,
    mouseY = 0,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2;

  var mouse = {
    position: new THREE.Vector2(),
    uv: new THREE.Vector2(),
    ray: new THREE.Vector2(),
    vel: new THREE.Vector2(),
    downPosition: new THREE.Vector2(),
    normal: new THREE.Vector2(),
    hover: false,
    down: false,
    moved: false,
    prev: new THREE.Vector2(),
    center: new THREE.Vector2(),
    onDown: new THREE.Vector2()
  };

  var previousMousePosition = {
    x: 0,
    y: 0
  };
  var deltaMove = {
    x: 0,
    y: 0
  };

  var targRotation = new THREE.Quaternion();
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  // Configure renderer clear color
  renderer.setClearColor("#0000ff");
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.toneMappingExposure = 1;

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 100);

  // const controls = new THREE.OrbitControls(camera, canvas);
  // controls.target.set(0, 5, 0);
  // controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("blue");

  scene.add(new THREE.HemisphereLight(0x111111, 0x444444));
  //sceneStore.add( new THREE.HemisphereLight( 0x111111, 0x444444 ) );

  var light = new THREE.DirectionalLight(0xfdebff, 1.5);
  light.position.set(0, 140, 500).multiplyScalar(1.1);
  //var light2 = new THREE.DirectionalLight( 0xebf3ff, 1.5 );
  //light2.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );
  scene.add(light);

  // LIGHTS
  // var dirLight = new THREE.DirectionalLight(0xffb6c1, 5.125);
  // dirLight.position.set(0, 0, 1).normalize();
  // scene.add(dirLight);

  // var pointLight = new THREE.PointLight(0xffffff, 1.5);
  // pointLight.position.set(50, 100, 90);
  // scene.add(pointLight);

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  {
    const gltfLoader = new THREE.GLTFLoader();
    var model;
    gltfLoader.load("models/gltf/iphone_gltf/iphone.gltf", gltf => {
      const root = gltf.scene;
      scene.add(root);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      model = scene;
      gltf.scenes; // Array<THREE.Scene>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 1, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      // controls.maxDistance = boxSize * 10;
      // controls.target.copy(boxCenter);
      // controls.update();
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  var xForth = false;
  var yForth = false;

  function render() {
    mouse.vel.x *= 0.92;
    mouse.vel.y *= 0.92;

    if (!mouse.down) {
      var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          toRadians(mouse.vel.y * 0.5),
          toRadians(mouse.vel.x * 0.5),
          0,
          "XYZ"
        )
      );

      targRotation.multiplyQuaternions(deltaRotationQuaternion, targRotation);
    }

    if (model) {
      if (!xForth) {
        model.rotation.x += 0.0009;
        if (model.rotation.x >= 0.3) {
          xForth = true;
        }
      } else {
        model.rotation.x -= 0.0009;
        if (model.rotation.x <= 0.3) {
          xForth = false;
        }
      }

      if (!yForth) {
        model.rotation.y += 0.0009;
        if (model.rotation.y >= 0.3) {
          yForth = true;
        }
      } else {
        model.rotation.y -= 0.0009;
        if (model.rotation.y <= -0.3) {
          yForth = false;
        }
      }

      model.quaternion.copy(targRotation);
    }

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // camera.lookAt(scene.position);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  /* events */
  if (isMobile) {
    container1.addEventListener("touchstart", onTouchStart, { passive: false });
    container1.addEventListener("touchend", onTouchEnd, { passive: false });
    container1.addEventListener("touchmove", onTouchMove, { passive: false });
  } else {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  }

  function onMouseDown(e) {
    mouse.down = true;
    // handle3dInteractions(event.clientX, event.clientY, true);
  }

  function onMouseMove(e) {
    mouse.position.x = e.clientX - window.innerWidth / 2;
    mouse.position.y = e.clientY - window.innerHeight / 2;

    deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    if (mouse.down) {
      mouse.moved = true;

      var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          toRadians(deltaMove.y * 0.5),
          toRadians(deltaMove.x * 0.5),
          0,
          "XYZ"
        )
      );

      targRotation.multiplyQuaternions(deltaRotationQuaternion, targRotation);
    }

    mouse.normal.x = e.clientX / window.innerWidth;
    //mouse.normal.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    previousMousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  }

  function onMouseUp(e) {
    console.log(mouse);

    mouse.vel.x = deltaMove.x;
    mouse.vel.y = deltaMove.y;

    console.log({ deltaMove });

    //console.log(mouse.vel)

    mouse.down = false;
    mouse.moved = false;
    //checkDistanceMoved(e.clientX, e.clientY);
  }

  function onTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    mouse.down = true;
    mouse.hover = true;

    var x = touch.pageX;
    var y = touch.pageY;

    mouse.position.x = x - window.innerWidth / 2;
    mouse.position.y = y - window.innerHeight / 2;

    deltaMove = {
      x: x - previousMousePosition.x,
      y: y - previousMousePosition.y
    };

    previousMousePosition = {
      x: touch.pageX,
      y: touch.pageY
    };
  }

  function onTouchMove(e) {
    e.preventDefault();

    var touch = e.touches[0];

    var x = touch.pageX;
    var y = touch.pageY;

    deltaMove = {
      x: x - previousMousePosition.x,
      y: y - previousMousePosition.y
    };

    mouse.position.x = x - window.innerWidth / 2;
    mouse.position.y = y - window.innerHeight / 2;

    mouse.moved = true;

    var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        toRadians(deltaMove.y * 0.5),
        toRadians(deltaMove.x * 0.5),
        0,
        "XYZ"
      )
    );

    targRotation.multiplyQuaternions(deltaRotationQuaternion, targRotation);

    previousMousePosition = {
      x: touch.pageX,
      y: touch.pageY
    };
  }
  function onTouchEnd(e) {
    //checkDistanceMoved();
    e.preventDefault();

    mouse.vel.x = deltaMove.x;
    mouse.vel.y = deltaMove.y;

    mouse.down = false;
    mouse.hover = false;
    mouse.moved = false;
  }

  requestAnimationFrame(render);
}

main();
