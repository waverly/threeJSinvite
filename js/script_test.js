//var world;
//var dt = .1 / 60;

var scene, camera, renderer;
//var phoneurl = "assets/";
var modelURL = "assets/iphone18-pedals.json";
//var scene2, camera2, renderer2;
//var controls;

var clock = new THREE.Clock();

var params = {
  projection: "normal",
  background: false,
  exposure: 0.9,
  bloomStrength: 1.5,
  bloomThreshold: 0.85,
  bloomRadius: 0.4
};
var shouldHandleAudio = false;
var effectFXAA, bloomPass, renderScene;
var composer;

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var container1 = document.getElementById("container1");
var containerShopping = document.getElementById("shopping-overlay");
//var container2 = document.getElementById( 'container2' );

var loadedObject;
var standardMatEnvMap;
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
var raycaster = new THREE.Raycaster();
var rollOverCube;
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);
var benny, faceMat;
var targRotation = new THREE.Quaternion();

var iphoneHolder = new THREE.Object3D();

var storeItems = {
  iphone: [],
  hair: [],
  music: [],
  benny: [],
  hoodie: []
};

var playingAudio = false;

var pedals;

var previousMousePosition = {
  x: 0,
  y: 0
};
var deltaMove = {
  x: 0,
  y: 0
};

var cam2Parent = new THREE.Object3D();
var bg;
var playSinInc = 0;
var domSize = 1024;

var rendererStore,
  cameraStore,
  sceneStore,
  hoodie,
  showingStore = true;

//renderer = new THREE.WebGLRenderer();

renderer = new THREE.WebGLRenderer({
  antialias: true,
  /*preserveDrawingBuffer:true*/ alpha: true
});
//rendererStore = new THREE.WebGLRenderer( { antialias: true, /*preserveDrawingBuffer:true*/ alpha:true } );
renderer.toneMapping = THREE.LinearToneMapping;
//rendererStore.toneMapping = THREE.LinearToneMapping;
//renderer.setClearColor(new THREE.Color(0xffffff),1.0) ;
renderer.setPixelRatio(window.devicePixelRatio);
//rendererStore.setPixelRatio( window.devicePixelRatio );
// renderer.autoClear = true;
// renderer.autoClearDepth = true;
// renderer.autoClearColor = false;
// renderer.autoClearSencil = true;

renderer.setSize(window.innerWidth, window.innerHeight);

// renderer2 = new THREE.WebGLRenderer( {preserveDrawingBuffer:true } );
// renderer2.setPixelRatio( window.devicePixelRatio );
// renderer2.setSize( domSize, domSize );
// renderer2.gammaOutput = true;
// renderer2.toneMappingExposure = 3;
// renderer2.autoClearColor = false;

container1.appendChild(renderer.domElement);
//containerShopping.appendChild( rendererStore.domElement );
//container2.appendChild( renderer2.domElement );

//var tex = new THREE.Texture(renderer2.domElement);
scene = new THREE.Scene();
//sceneStore = new THREE.Scene();
//scene2 = new THREE.Scene();

scene.add(iphoneHolder);
scene.add(new THREE.HemisphereLight(0x111111, 0x444444));
//sceneStore.add( new THREE.HemisphereLight( 0x111111, 0x444444 ) );

var light = new THREE.DirectionalLight(0xebf3ff, 1.5);
light.position.set(0, 140, 500).multiplyScalar(1.1);
//var light2 = new THREE.DirectionalLight( 0xebf3ff, 1.5 );
//light2.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );

scene.add(light);
//sceneStore.add( light2 );

$(".full-width-slider").bind("change", function(event, ui) {
  var val = parseInt(event.target.value);

  adjustPlaybackRate(val);
});

camera = new THREE.PerspectiveCamera(
  30,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  10,
  100000
);
camera.position.set(0, 0, 70);

cameraStore = new THREE.PerspectiveCamera(
  30,
  ((window.innerWidth * 0.9) / window.innerHeight) * 0.9,
  10,
  100000
);
cameraStore.position.set(0, 0, 70);

renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.toneMappingExposure = 1;

var mobileDomMod = 100;
var canv = document.getElementById("canv");
canv.width = canv.height = 256;
var ctx = canv.getContext("2d");
var interactiveMap;

var playObj, musicCubeObj;

var manager = new THREE.LoadingManager();
manager.onProgress = function(item, loaded, total) {
  //console.log( item, loaded, total );
  var border = "5px solid black";
  if (loaded == 2) {
    $("#loader-spinner").css("border-right", border);
  } else if (loaded == 4) {
    $("#loader-spinner").css("border-bottom", border);
  } else if (loaded == 7) {
    $("#loader-spinner").css("border-left", border);
  }
};

var genCubeUrls = function(prefix, postfix) {
  return [
    prefix + "px" + postfix,
    prefix + "nx" + postfix,
    prefix + "py" + postfix,
    prefix + "ny" + postfix,
    prefix + "pz" + postfix,
    prefix + "nz" + postfix
  ];
};

var hdrUrls = genCubeUrls("assets/textures/cube/benny3/", ".hdr");
var loader = new THREE.HDRCubeTextureLoader();
loader.load(THREE.UnsignedByteType, hdrUrls, function(hdrCubeMap) {
  //pitchShifter.init();

  var pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
  pmremGenerator.update(renderer);
  var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
  pmremCubeUVPacker.update(renderer);
  var hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

  standardMatEnvMap = hdrCubeRenderTarget.texture;

  loadObj();
});

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
camera.position.set(0, -10, 80);
if (isMobile || window.innerWidth < 767) {
  handleResizeMobile();
} else {
  handleResizeDesktop();
}

function onMouseDown(e) {
  mouse.down = true;
  handle3dInteractions(event.clientX, event.clientY, true);
}

function onMouseMove(e) {
  mouse.position.x = e.clientX - window.innerWidth / 2;
  mouse.position.y = e.clientY - window.innerHeight / 2;

  deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y
  };

  if (shouldHandleAudio) {
    handle3dInteractions(event.clientX, event.clientY, false);
  } //end shouldhandle audio

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

function handle3dInteractions(x, y, down) {
  var d = container1.getBoundingClientRect();

  mouse.ray.x = (x / window.innerWidth) * 2 - 1;
  mouse.ray.y = -(y / d.height) * 2 + 1;
  raycaster.setFromCamera(mouse.ray, camera);
  var intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    if (!playingAudio) {
      if (intersects[0].object.name == "music-play") {
        $("body").css("cursor", "pointer");

        if (down) {
          //console.log("asdf")
          //musicCubeObj.visible = true;
          //playObj.visible = false;
          playAudio();
          playingAudio = true;
          mouse.uv.x = 1 / 3;
        }
      }
    } else {
      if (intersects[0].object.name == "music-cube") {
        $("body").css("cursor", "pointer");

        if (mouse.down) {
          mouse.uv = new THREE.Vector2(intersects[0].uv.x, intersects[0].uv.y);
          // 	playingAudio = false;
          // 	musicCubeObj.visible = false;
          // 	playObj.visible = true;
        }
      }
    } //end playing audio
  } else {
    $("body").css("cursor", "default");
  } //end intersects
}

function onMouseUp(e) {
  mouse.vel.x = deltaMove.x;
  mouse.vel.y = deltaMove.y;

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

  handle3dInteractions(x, y, true);

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

  handle3dInteractions(x, y, false);

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

function checkDistanceMoved() {
  if (!isMobile) {
    var diff = Math.abs(
      mouse.position.x +
        mouse.position.y -
        (mouse.downPosition.x + mouse.downPosition.y)
    );

    if (diff < 5 && mouse.hover) {
      window.open("", "_blank");
    }
  } else {
    if (!mouse.moved) {
      window.open("", "_blank");
    }
  }
}

function loadObj() {
  //var loader = new THREE.FBXLoader(manager);
  var loader = new THREE.ObjectLoader(manager);
  loader.setCrossOrigin("Anonymous");
  loader.load(
    modelURL,
    function(loadedScene) {
      //loader.load( 'assets/blender/copCar2.fbx', function ( object ) {
      //loader.load( 'assets/blender/copCar2.fbx', function ( object ) {
      var capBump = new THREE.TextureLoader().load(
        "assets/textures/bottleBump.jpg"
      );
      var screenMap = new THREE.TextureLoader().load(
        "assets/textures/screen2.jpg"
      );
      var hoodieMap = new THREE.TextureLoader().load(
        "assets/textures/hoodie-compile-folded.jpg"
      );
      //interactiveMap = new THREE.Texture(canv);
      //loadedObject = loadedScene;

      var base = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1,
        metalness: 0.8,
        envMap: standardMatEnvMap,
        refractionRatio: 0.01
      });
      var baseWhite = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.5,
        metalness: 0.0,
        envMap: standardMatEnvMap
      });
      var baseRed = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.1,
        metalness: 0.5,
        envMap: standardMatEnvMap
      });
      var baseBlack = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.0,
        envMap: standardMatEnvMap
      });
      var baseSilver = new THREE.MeshStandardMaterial({
        color: 0x4d4d4d,
        roughness: 0.0,
        metalness: 1.0,
        envMap: standardMatEnvMap
      });

      var metal = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 1.0,
        envMap: standardMatEnvMap
      });
      var back = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.2,
        metalness: 0.5,
        envMap: standardMatEnvMap,
        transparent: true,
        opacity: 0.2
      });
      var glass = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.0,
        metalness: 1.0,
        emissive: 0x6d6d6d,
        envMap: standardMatEnvMap,
        transparent: true,
        opacity: 0.25
      });
      var glass2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 1.0,
        emissive: 0x6d6d6d,
        envMap: standardMatEnvMap,
        transparent: true,
        opacity: 0.25
      });
      var capBlue = new THREE.MeshStandardMaterial({
        color: 0xffee5e,
        bumpMap: capBump,
        roughness: 0.25,
        bumpScale: 0.009,
        metalness: 1,
        envMap: standardMatEnvMap
      });
      var hairColor = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 1.0,
        metalness: 0.0
      });
      var screen = new THREE.MeshBasicMaterial({ map: screenMap });
      var musicBox = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.8,
        envMap: standardMatEnvMap
      });
      var hoodieMat = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        metalness: 0.1,
        envMap: standardMatEnvMap,
        map: hoodieMap
      });

      //scene = loadedScene;
      var pedalsMeshArr = [];
      for (var i = 0; i < loadedScene.children.length; i++) {
        var child = loadedScene.children[i].clone();
        child.material = base;
        child.parent = iphoneHolder;
        //iphoneHolder.add(child);

        //if(child.name == "music-play" || child.name == "hoodie"){
        if (
          child.name == "pedal0" ||
          child.name == "pedal1" ||
          child.name == "pedal2"
        ) {
          //scene.add(child);
          pedalsMeshArr.push(child);
        } else {
          iphoneHolder.add(child);
        }
      }

      pedals = new PedalsParticlesEmitter(pedalsMeshArr);

      setObjectMaterial(iphoneHolder, "iphone_x_glass_back", back);
      setObjectMaterial(iphoneHolder, "iphone_x_back", base);
      setObjectMaterial(iphoneHolder, "iphone_x_body", metal);
      setObjectMaterial(iphoneHolder, "hair_capsul", glass);
      setObjectMaterial(iphoneHolder, "hair_lid", capBlue);
      setObjectMaterial(iphoneHolder, "hair_hair", hairColor);
      setObjectMaterial(iphoneHolder, "iphone_x_logo", baseWhite);
      setObjectMaterial(iphoneHolder, "iphone_x_camera", baseSilver);
      setObjectMaterial(iphoneHolder, "iphone_x_screen", screen);
      setObjectMaterial(iphoneHolder, "iphone_x_glass_front", glass2);

      addObjectToArray(iphoneHolder, "iphone_", storeItems.iphone, 7);
      addObjectToArray(iphoneHolder, "hair_", storeItems.hair, 5);

      //toggleStoreItem(false,storeItems.iphone)
      toggleStoreItem(false, storeItems.hair);

      var tx = new THREE.TextureLoader().load("assets/textures/benny5.png");
      tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
      var uniforms = {
        map: { value: tx },
        offset_x: { value: 0.0 },
        offset_y: { value: 0.0 }
      };

      //console.log(document.getElementById( 'vs' ).textContent)

      faceMat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: document.getElementById("vs").textContent,
        fragmentShader: document.getElementById("fs").textContent
      });

      benny = new THREE.Mesh(
        new THREE.BoxGeometry(12, 12, 12, 150, 150, 150),
        faceMat
      );
      faceMat.side = THREE.DoubleSide;
      storeItems.benny.push(benny);
      iphoneHolder.add(benny);
      toggleStoreItem(false, storeItems.benny);

      toggleStoreItem(false, storeItems.benny);

      //setObjectMaterial(iphoneHolder, "music-cube", musicBox);
      //setObjectMaterial(scene, "music-play", baseRed);
      //musicCubeObj = iphoneHolder.getObjectByName("music-cube");
      //musicCubeObj.position.x-=2000;

      //playObj = scene.getObjectByName("music-play");

      //storeItems.music.push(musicCubeObj)
      //storeItems.music.push(playObj)

      toggleStoreItem(false, storeItems.music);
      toggleStoreItem(false, storeItems.iphone);

      setObjectMaterial(iphoneHolder, "hoodie", hoodieMat);

      addItemToArray(iphoneHolder, "hoodie", storeItems.hoodie);
      //console.log(scene);

      //addObjectToArray(scene, "music-", storeItems.music,7);

      //scene.add()
      //var g = new THREE.BoxBufferGeometry( .5, .5, 10, 1, 1, 1 );
      //var mat = new THREE.MeshStandardMaterial();
      // for(var i = 0; i < 30; i++){
      // 	var x = (-15 + i)*0.7;
      // 	var e = new THREE.Object3D();
      // 	iphoneHolder.add(e);

      // 	var m = new THREE.Mesh(g,baseSilver);
      // 	e.add(m);
      // 	m.position.set(0,.25,0);
      // 	e.position.set(x,-2,0);
      // 	//m.position.y+=5;
      // 	storeItems.music.push(e);
      // }

      $("#loader").fadeOut();

      animate();
    },
    onProgress,
    onError
  );
}

function onProgress(xhr) {
  if (xhr.lengthComputable) {
    var percentComplete = (xhr.loaded / xhr.total) * 100;
    //console.log( Math.round(percentComplete, 2) + '% downloaded' );
  }
}

function toggleStoreItem(visible, array) {
  for (var i = 0; i < array.length; i++) {
    array[i].visible = visible;
  }
}

function onError(xhr) {}

function setObjectMaterial(parent, name, mat) {
  for (var i = 0; i < parent.children.length; i++) {
    if (parent.children[i].name == name) parent.children[i].material = mat;
  }
}
function addObjectToArray(parent, name, arr, len) {
  for (var i = 0; i < parent.children.length; i++) {
    var str = parent.children[i].name.substring(0, len);
    if (str == name) arr.push(parent.children[i]);
  }
}

function addItemToArray(parent, name, arr) {
  for (var i = 0; i < parent.children.length; i++) {
    var str = parent.children[i].name;
    if (str == name) arr.push(parent.children[i]);
  }
}

window.onresize = function() {
  if (isMobile || window.innerWidth < 767) {
    handleResizeMobile();
  } else {
    handleResizeDesktop();
  }
};

function handleResizeMobile() {
  camera.aspect = window.innerWidth / (window.innerHeight - mobileDomMod);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - mobileDomMod);
}

function handleResizeDesktop() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  //composer.setSize( window.innerWidth, window.innerHeight );
  //effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  //if(shouldHandleAudio)
  //handleAudioVis();

  if (isMobile || window.innerWidth < 767) {
    camera.position.set(0, -5, 90);
  } else {
    camera.position.set(0, 0, 70);
  }

  var m = 3.14;
  var mult = 20;

  var delta = 0.75 * clock.getDelta();

  camera.updateMatrixWorld();

  if (shouldHandleAudio) {
    if (playingAudio) {
      // ctx.fillStyle="rgba(100,100,100,0.05)";
      // ctx.fillRect(0,0,canv.width,canv.height);
      // ctx.fillRect(0,0,canv.width,canv.height);
      // ctx.fillStyle="#FFFFFF";
      // ctx.beginPath();
      // ctx.arc(mouse.uv.x*canv.width,canv.height - mouse.uv.y*canv.height,25,0,2*Math.PI);
      // ctx.fill();

      adjustPlaybackRate(1 + Math.abs(iphoneHolder.rotation.z) * 0.5);
      //interactiveMap.needsUpdate = true;

      //musicCubeObj.rotation.x+=-.005;
      //musicCubeObj.rotation.y+=-.005;
    } else {
      playSinInc += 0.02;
      //playObj.rotation.z = Math.PI+Math.sin(playSinInc)*0.5;
    }
    //musicCubeObj.position.x = iphoneHolder.position.x;
    //playObj.position.x = iphoneHolder.position.x;
  }
  // this._xCross = x * this._canvas.width;
  // this._yCross = y * this._canvas.height;

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

  // camera.lookAt(scene.position);
  // cameraStore.lookAt(scene.position);
  // //camera2.lookAt(scene.position);
  if (window.innerWidth >= 900) {
    iphoneHolder.position.x = -window.innerWidth / 180;
    // hoodie.scale.set(.8,.8,.8);
    // hoodie.position.set(0,0,0);
  } else if (window.innerWidth > 767 && window.innerWidth < 900) {
    iphoneHolder.position.x = -window.innerWidth / 80;
    // hoodie.scale.set(.8,.8,.8);
    // hoodie.position.set(0,0,0);
  } else {
    // hoodie.scale.set(0.65,0.65,0.65);
    // hoodie.position.set(0,2,0);
    iphoneHolder.position.x = 0;
  }

  iphoneHolder.quaternion.copy(targRotation);

  var texMod = 0.000015;
  //if(isMobile)texMod = 0.00015;

  faceMat.uniforms.offset_x.value -= mouse.position.x * texMod;
  faceMat.uniforms.offset_y.value += mouse.position.y * texMod;

  if (pedals) pedals.update();

  //hoodie.rotation.copy(iphoneHolder.rotation);

  renderer.render(scene, camera);
}
// end render

function killStoreOverlay() {
  showingStore = false;

  $("#shopping-overlay, #shopping-overlay-x").hide();

  container1.addEventListener("touchstart", onTouchStart, { passive: false });
  container1.addEventListener("touchend", onTouchEnd, { passive: false });
  container1.addEventListener("touchmove", onTouchMove, { passive: false });

  var deltaRotationQuaternion = new THREE.Quaternion();
  targRotation.multiplyQuaternions(deltaRotationQuaternion, targRotation);
  targRotation = new THREE.Quaternion();
  $("body,html").css("overflow-y", "auto");
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

function toggleStoreItemHoodie() {
  //$("#coming-soon").hide();
  toggleStoreItem(true, storeItems.hoodie);
  toggleStoreItem(false, storeItems.hair);
  toggleStoreItem(false, storeItems.iphone);
  toggleStoreItem(false, storeItems.benny);
  toggleStoreItem(false, storeItems.music);
  killAllActives();
  //stopAudio();
  $("#hoodie-store-item-tab").attr("class", "store-title-active");
  $("#hoodie-store-item").show();
}
function toggleStoreItemHair() {
  //$("#coming-soon").hide();
  toggleStoreItem(false, storeItems.hoodie);
  toggleStoreItem(true, storeItems.hair);
  toggleStoreItem(false, storeItems.iphone);
  toggleStoreItem(false, storeItems.benny);
  toggleStoreItem(false, storeItems.music);
  killAllActives();
  //stopAudio();
  $("#hair-store-item-tab").attr("class", "store-title-active");
  $("#hair-store-item").show();
}
function toggleStoreItemIphone() {
  //$("#coming-soon").hide();
  toggleStoreItem(false, storeItems.hoodie);
  toggleStoreItem(true, storeItems.iphone);
  toggleStoreItem(false, storeItems.hair);
  toggleStoreItem(false, storeItems.benny);
  toggleStoreItem(false, storeItems.music);
  killAllActives();
  //stopAudio();
  $("#phone-store-item-tab").attr("class", "store-title-active");
  $("#phone-store-item").show();
}

function toggleStoreItemMusic() {
  toggleStoreItem(false, storeItems.hoodie);
  toggleStoreItem(false, storeItems.iphone);
  toggleStoreItem(false, storeItems.hair);
  toggleStoreItem(false, storeItems.benny);

  //toggleStoreItem(true, storeItems.music)

  killAllActives();
  pedals.show();

  shouldHandleAudio = true;
  player.playTrack();
  $("#playlist").show();
  //$("#music-slider").show();

  //musicCubeObj.visible = false;

  //playAudio();
  $("#music-store-item-tab").attr("class", "store-title-active");
  $("#music-store-item").show();
}

function toggleStoreItemMe() {
  //$("#coming-soon").hide();
  toggleStoreItem(false, storeItems.hoodie);
  toggleStoreItem(false, storeItems.music);
  toggleStoreItem(false, storeItems.iphone);
  toggleStoreItem(false, storeItems.hair);
  toggleStoreItem(true, storeItems.benny);

  killAllActives();
  //stopAudio();
  $("#me-store-item-tab").attr("class", "store-title-active");
  $("#me-store-item").show();
}

function killAllActives() {
  shouldHandleAudio = false;
  player.pauseTrack();
  pedals.hide();
  $(
    "#hoodie-store-item-tab, #phone-store-item-tab, #hair-store-item-tab, #music-store-item-tab, #me-store-item-tab"
  ).attr("class", "store-title");
  $(
    "#hoodie-store-item, #phone-store-item, #hair-store-item, #music-store-item, #me-store-item, #playlist"
  ).hide();
}

function updateHairPrice() {
  var val = $("#hair-store-option").val();
  switch (val) {
    case "1 inch":
      $("#hair-price").html("$4,995.<span class='cents'>00</span>");
      break;
    case "3 inch":
      $("#hair-price").html("$6,995.<span class='cents'>00</span>");
      break;
    case "braid":
      $("#hair-price").html("$14,995.<span class='cents'>00</span>");
      break;
  }
}

function getMousePosition(dom, x, y) {
  var rect = dom.getBoundingClientRect();
  return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}
function getIntersects(point, objects) {
  mouse.ray.set(point.x * 2 - 1, -(point.y * 2) + 1);
  raycaster.setFromCamera(mouse.ray, camera);
  return raycaster.intersectObjects(objects);
}
