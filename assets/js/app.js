let scene, camera, renderer, controls, stars, starGeo;

let textureBackground, textureGrass;
let plane, plane2;
let ambientLight, sunLight, sunLightForward;

let playing = false;

//================================== SOUND =================================
// create an AudioListener and add it to the camera
let listener = new THREE.AudioListener();

// create an Audio source
let sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
let audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/sounds/mrbean.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});

function play() {
    sound.play();
    playing = true;
    console.log("music playing");
}

// Geometries
let geometry;
let stage;
let ring1, ring2;

// Models
let followCenter = true;
let model;
let modelUFO, modelTilt = 0.01, modelTiltStatus = true, ufoArrive = false, followUFO = false;
let modelCar, driveSpeed = 0.1, driveForward = true, followCar = false;
let modelBean, liftSpeed = 0.01;
let modelBalloon, flySpeed = 0.01, flyForward = true, followBalloon = false;
 
let keyboard = {};
let player = { height: 12, speed: 0.2, turnSpeed: Math.PI*0.02 }; // change me
let USE_WIREFRAME = false;

// Button Clicks
document.getElementById("button").onclick = function() {play()};
document.getElementById("followCar").onclick = function() {funcFollowCar()};
document.getElementById("followBalloon").onclick = function() {funcFollowBalloon()};
document.getElementById("followCenter").onclick = function() {funcCenter()};
document.getElementById("followUFO").onclick = function() {funcFollowUFO()};

function funcFollowCar() {  
  followCar = true;
  followBalloon = false;
  followCenter = false;
  followUFO = false;
}

function funcFollowBalloon() {
  followCar = false;
  followBalloon = true;
  followCenter = false;
  followUFO = false;
}

function funcCenter() {
  camera.position.set(0, 70, 50); 
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  followCar = false;
  followBalloon = false;
  followCenter = true;
  followUFO = false;
}

function funcFollowUFO() {
  followCar = false;
  followBalloon = false;
  followCenter = false;
  followUFO = true;
}

function init(){
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 100, 950); // FOG

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
  // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 70, 50); 
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // Enable Shadows in the Renderer
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  controls = new THREE.OrbitControls (camera, renderer.domElement);

  //================================== TEXTURES =================================
  textureBackground = new THREE.TextureLoader().load('assets/textures/bg1.jpg');
  scene.background = textureBackground;
  textureGrass = new THREE.TextureLoader().load('assets/textures/floor.jpg');
  textureAbigail = new THREE.TextureLoader().load('assets/textures/abigail.jpg');
  textureRaphael = new THREE.TextureLoader().load('assets/textures/raphael.jpg');

  //================================= MATERIALS ================================
  let materialWhite = new THREE.MeshPhongMaterial({color:0xffffff});
  let materialAbigail = new THREE.MeshPhongMaterial({map: textureAbigail});
  let materialRaphael = new THREE.MeshPhongMaterial({map: textureRaphael});
  let materialPlane = new THREE.MeshPhongMaterial({color:0xa2a8b3});
  let materialGrass = new THREE.MeshLambertMaterial({map: textureGrass, wireframe:USE_WIREFRAME});

  //================================== OBJECTS ==================================
  // PLANE
  plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 30, 30), materialGrass);
  plane.rotation.x -= Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  // PLANE2
  plane2 = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 30, 30), materialPlane);
  plane2.rotation.x -= Math.PI / 2;
  plane2.position.y -= 0.1;
  plane2.receiveShadow = true;
  scene.add(plane2);

  // Ring 1
  geometry = new THREE.TorusBufferGeometry(15, 2, 8, 24);
  ring1 = new THREE.Mesh(geometry, materialAbigail);
  ring1.rotation.x -= Math.PI / 2 + 0.5;
  ring1.position.y = -25;
  scene.add(ring1);

  // Ring 2
  ring2 = new THREE.Mesh(geometry, materialRaphael);
  ring2.rotation.x -= Math.PI / 2 - 0.5;
  ring2.position.y = -25;
  scene.add(ring2);

  // Stage
  geometry = new THREE.BoxBufferGeometry(10, 20, 10);
  stage = new THREE.Mesh( geometry, materialWhite );
  stage.receiveShadow = true;
  stage.castShadow = true;
  stage.position.y = -39; 
  scene.add( stage );

  //================================== RAIN ==================================
  starGeo = new THREE.Geometry();
    for(let i=0;i<6000;i++) {
        star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.05;
        starGeo.vertices.push(star);
    }
    
    let sprite = new THREE.TextureLoader().load( 'assets/textures/star.png' );
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

  //================================== MODELS ==================================
  // UFO
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelUFO/scene.gltf", function ( gltf ) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = 80;
    gltf.scene.position.z = 500;
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    scene.add( gltf.scene );
    modelUFO = gltf.scene;
    console.log('added');
  }, undefined, function ( error ) {
    console.error( error );
  } );

  // Main Mr. Bean
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelBean/scene.gltf", function ( gltf ) {
    gltf.scene.position.x = 0;
    gltf.scene.position.y = -30; //-30
    gltf.scene.position.z = 0;
    scene.add( gltf.scene );
    modelBean = gltf.scene;
    console.log('added');
  }, undefined, function ( error ) {
    console.error( error );
  } );

  // Car
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelCar/scene.gltf", function ( gltf ) {
    gltf.scene.position.x = 100;
    gltf.scene.position.y = 4;
    gltf.scene.position.z = 0;
    gltf.scene.scale.set(10, 10, 10);
    scene.add( gltf.scene );
    modelCar = gltf.scene;
    console.log('added');
  }, undefined, function ( error ) {
    console.error( error );
  } );

  // Hot Air Balloon
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelBalloon/scene.gltf", function ( gltf ) {
    gltf.scene.position.x = -100;
    gltf.scene.position.y = 50;
    gltf.scene.position.z = 0;
    //  gltf.scene.scale.set(0.3, 0.3, 0.3);
    scene.add( gltf.scene );
    modelBalloon = gltf.scene;
    console.log('balloon added');
  }, undefined, function ( error ) {
    console.error( error );
    console.log("balloong error");
  } );

  // MOUNTAIN PLANE
  let planeMountain = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000, 30, 30), new THREE.MeshLambertMaterial({color: 0xFFFFFF, wireframe:USE_WIREFRAME}));
  planeMountain.rotation.x -= Math.PI / 2;
  planeMountain.receiveShadow = true;
  planeMountain.position.y = -20;
  scene.add(planeMountain);

  // Back Mountain
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelMountain/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = 0;
        gltf.scene.position.y = -250;
        gltf.scene.position.z = 2000;
        gltf.scene.scale.set(250, 250, 250);
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Front Mountain
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelMountain/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = 0;
        gltf.scene.position.y = -250;
        gltf.scene.position.z = -2000;
        gltf.scene.scale.set(250, 250, 250);
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Left Mountain
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelMountain/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = 2000;
        gltf.scene.position.y = -250;
        gltf.scene.position.z = 0;
        gltf.scene.scale.set(250, 250, 250);
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Right Mountain
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelMountain/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = -2000;
        gltf.scene.position.y = -250;
        gltf.scene.position.z = 0;
        gltf.scene.scale.set(250, 250, 250);
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Front Cloud
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelCloud/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = 10;
        gltf.scene.position.y = 500;
        gltf.scene.position.z = 500;
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Left Cloud
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelCloud/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = 500;
        gltf.scene.position.y = 500;
        gltf.scene.position.z = -200;
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  // Right Cloud
  model = new THREE.GLTFLoader();
  model.load("assets/models/modelCloud/scene.gltf", function ( gltf ) {
        gltf.scene.position.x = -500;
        gltf.scene.position.y = 500;
        gltf.scene.position.z = -200;
        scene.add( gltf.scene );
        console.log('added');
  }, undefined, function ( error ) {
        console.error( error );
  } );

  //================================== LIGHTS ===================================
  // AMBIENT LIGHT - OVERALL
  ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Point Light
  sunLight = new THREE.PointLight(0xffffff, 2, 4000); // ffb6c1
  sunLight.position.set(0,250,0);
  sunLight.castShadow = true;
  scene.add(sunLight);
  sunLightForward = true;

  animate();
}

function animate(){
  controls.update();
  requestAnimationFrame(animate);
  ring1.rotation.z += 0.01;
  ring2.rotation.z += 0.01;

  // Rain
  starGeo.vertices.forEach(p => {
    p.velocity += p.acceleration
    p.z -= p.velocity;    
    if (p.z < -200) {
        p.z = 400;
        p.velocity = 0;
    }
  });

  // Bean Podium Logic
  if (!ufoArrive) {
    if (modelUFO.position.z <= 0) {
      if (modelBean.position.y < 10) {
        modelBean.position.y += liftSpeed;
        ring1.position.y += liftSpeed;
        ring2.position.y += liftSpeed;
        stage.position.y += liftSpeed;
      } 
      else {
        ufoArrive = true;
      }
      }
      if (modelUFO.position.z > 0) {
        modelUFO.position.z -= 1;
      }
    }
    if (ufoArrive){
      if (modelBean.position.y > -30) {
        modelBean.position.y -= liftSpeed;
        ring1.position.y -= liftSpeed;
        ring2.position.y -= liftSpeed;
        stage.position.y -= liftSpeed;
      }
      if (modelBean.position.y <= -30) {
        if ( modelUFO.position.z  < 500) {
          modelUFO.position.z += 1;
        }
        else {
          ufoArrive = false;
        }
      }
  }

  // UFO Rotation and Giggle
  if (modelUFO.rotation.z > 0.2) {
    modelTiltStatus = false;
  }
  if (modelUFO.rotation.z < 0) {
    modelTiltStatus = true;
  }
  if (modelTiltStatus) {
  modelUFO.rotation.z += modelTilt;
  }   
  if (!modelTiltStatus) {
  modelUFO.rotation.z -= modelTilt;
  }   
  modelUFO.rotation.y += 0.01;

  // Car Drive Logic
  if (driveForward) {
  modelCar.position.z += driveSpeed;
  }
  if (!driveForward) {
  modelCar.position.z -= driveSpeed;
  }
  if (modelCar.position.z > 200) {
  driveForward = false;
  }
  if (modelCar.position.z < -200) {
  driveForward = true;
  }

  // Ballon Fly Logic
  if (flyForward) {
    modelBalloon.position.z -= flySpeed;
    }
  if (!flyForward) {
    modelBalloon.position.z += flySpeed;
  }
  if (modelBalloon.position.z > 200) {
    flyForward = false;
  }
  if (modelBalloon.position.z < -200) {
    flyForward = true;
  }

  // Keyboard Controls
  if(keyboard[87]){ // W key
    camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
    camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
  }
  if(keyboard[83]){ // S key
    camera.position.x += Math.sin(camera.rotation.y) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
  }
  if(keyboard[65]){ // A key
    camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
  }
  if(keyboard[68]){ // D key
    camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
    camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
  }
  if(keyboard[37]){ // left arrow key
    camera.rotation.y -= player.turnSpeed;
  }
  if(keyboard[39]){ // right arrow key
    camera.rotation.y += player.turnSpeed;
  }

  if (followCenter) {
    
  }
  if (followCar) {
    camera.position.set(modelCar.position.x, modelCar.position.y + 30, modelCar.position.z - 50); 
    camera.lookAt(new THREE.Vector3(modelCar.position.x, modelCar.position.y, modelCar.position.z));
  }
  if (followBalloon) {
    camera.position.set(modelBalloon.position.x, modelBalloon.position.y + 30, modelBalloon.position.z - 50); 
    camera.lookAt(new THREE.Vector3(modelBalloon.position.x, modelBalloon.position.y, modelBalloon.position.z));
  }

  if (followUFO) {
    camera.position.set(modelUFO.position.x, modelUFO.position.y - 20, modelUFO.position.z + 200); 
    camera.lookAt(new THREE.Vector3(modelUFO.position.x, modelUFO.position.y, modelUFO.position.z));
  }

  renderer.render(scene, camera);
}
 
function keyDown(event){
   keyboard[event.keyCode] = true;
}
 
function keyUp(event){
   keyboard[event.keyCode] = false;
}
 
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
 
window.onload = init;