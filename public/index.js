//most impor5tant bits from from https://github.com/AnnaKap/facefun
//and https://codepen.io/p5js/pen/apVPVx?editors=1111
//and https://github.com/charliegerard/splat/blob/master/utils/full-code.js


import * as THREE from './vendor/three/build/three.module.js';


let video, vidDiv, options;
let threeJSDiv;
let scene, camera, renderer, lightUp, lightFront, lightLeft, lightRight, lightDirectional;
let geometry, material, cube;
let mlModel;
let predictions = [];
let matColor;

let indextip, thumbtip, indextipX, indextipY, thumbtipX, thumbtipY;
let dist;

let lastXPosition = 100;
let lastYPosition = 100;
let changeX = 1;
let changeY = 1;
let isPinch = false;

const pointer = new THREE.Vector2();

//raycasting variables

let normXY = new THREE.Vector2();
let handVector = new THREE.Vector3();

init();
animate();


function init(){

    //Video & ML5 init
    video = document.createElement('video');
    vidDiv = document.getElementById('video');

    //video.setAttribute('width', window.innerWidth);
   // video.setAttribute('height', window.innerHeight);
    video.setAttribute('width', 250);
    video.setAttribute('height', 250);
    video.autoplay = true;
    vidDiv.appendChild(video);
    console.log(video.width);

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
    })
    .catch(function(err) {
        console.log("An error occurred! " + err);
    });

    //add image scale thingy for 0.2
  
    //settings for ML model

    options = { 
        //flipHorizontal: true,
        detectionConfidence: 0.999,
        //imageScaleFactor: 0.2,
        imageScaleFactor: 0.5
    } 

    mlModel = ml5.handpose(video, options, modelReady);
    mlModel.on("predict", function (results) {
        predictions = results;

    });

    // Three.js init

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setSize(600, 600);
    threeJSDiv = document.getElementById('ThreeJS');
    threeJSDiv.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(0, 0, 3);
    scene.add(camera);

    lightUp = new THREE.SpotLight();
    lightUp.castShadow = true;
    lightUp.position.set(0, 5, 0);
    scene.add(lightUp);

    lightFront = new THREE.SpotLight({penumbra: 0.5});
    lightFront.castShadow = true;
    lightFront.position.set(0, -0.5, 5);
    //scene.add(lightFront);

    lightLeft = new THREE.SpotLight();
    lightLeft.castShadow = true;
    lightLeft.position.set(-5, 0, 0);
    scene.add(lightLeft);

    lightRight = new THREE.SpotLight();
    lightRight.castShadow = true;
    lightRight.position.set(5, 0, 0);
    scene.add(lightRight);

    lightDirectional = new THREE.DirectionalLight('white', 2);
    lightDirectional.castShadow = true;
    lightDirectional.position.set(0, -0.5, 6);
    scene.add(lightDirectional);


    let ambientLight = new THREE.AmbientLight(0x000000, 6.0);
    scene.add(ambientLight);

    geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    matColor = new THREE.Color( 0xff0000 );

    //material = new THREE.MeshPhongMaterial({ color: matColor, transparent: true });
    material = new THREE.MeshStandardMaterial({ color: 0xf6046d, emissive: 0x4a4408, roughness: 0.09, metalness: 0.03 });
    //activeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true });

    cube = new THREE.Mesh(geometry, material);
    cube.position.x = 0;
    cube.position.y = -1.5;


    scene.add(cube); // first add to scene to position 0,0,0


    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener( 'mousemove', onMouseMove, false );

}

 function animate() {
    requestAnimationFrame(animate);
    findFingers(); // check finger location constantly
    renderer.render(scene, camera);
    //onPointerMove();

}

function onWindowResize() {
    camera.aspect = (window.innerWidth/2) / (window.innerHeight/2);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    renderer.render(scene, camera);
}

function modelReady() {
    console.log("model Loaded");
}

function findFingers (){
    for (let i = 0; i < predictions.length; i++) {
        // For each pose detected, loop through all the keypoints
        let prediction = predictions[i];

        indextip = prediction.annotations.indexFinger[3];
        thumbtip = prediction.annotations.thumb[3];
        indextipX = indextip[0];
        indextipY = indextip[1];
        thumbtipX = thumbtip[0];
        thumbtipY = thumbtip[1];
        //console.log(indextipX); // shouldnt give values whn hand is not visible, but does: make predictioon threshold 0.99 or so

        let xDist = indextipX - thumbtipX;
        let yDist = indextipY - thumbtipY;
        dist = Math.sqrt(xDist*xDist + yDist*yDist);
        if (dist < 12) {
            console.log("That's a pinch!");
            isPinch = true;
            cube.material.color.setHex( 0xff0000 ); // color to red
        }

        else if (dist > 40) {
            isPinch = false; // def not pinch anymore
            cube.material.color.setHex( 0xf6046d ); // color back to pink
        }
        else {
            isPinch = true; // still true, fingers remain quite close to each other 
        }
        //new from ninja game

        //handVector.x = ((window.innerWidth - thumbtipX) / window.innerWidth) * 2 - 1;
        //handVector.y = -(thumbtipY / window.innerHeight) * 2 + 1;
        //handVector.z = 0;
   
        console.log("ThumbtipX is", indextipX); //200-600
        console.log("ThumbtipY is", indextipY); //0-400

        let translatorX = window.innerWidth / video.width; //gives a decimal like 1.56 to use to translate the hand coords to full screen
        let translatorY = window.innerHeight / video.height;
        let translateFingerTipX = indextipX * translatorX;
        let translateFingerTipY = indextipY * translatorY;
        console.log("Translated tip is", translateFingerTipX);
        console.log("Translated tip is", translateFingerTipY);

        //edit these next to use full screen and new coords
        // handVector.x = ((video.width - thumbtipX) / video.width) * 2 - 1;
        // handVector.y = -(thumbtipY / video.height) * 2 + 1;
        // handVector.z = 0;

        handVector.x = (translateFingerTipX / window.innerWidth) * 2 - 1;
        handVector.y = -(translateFingerTipY / window.innerHeight) * 2 + 1;
        handVector.z = 0;
        console.log(handVector);
    

        let markerGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        let markerMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true });
        let markerCube = new THREE.Mesh(markerGeo, markerMat);
        markerCube.position.x = handVector.x;
        markerCube.position.y = handVector.y;
        markerCube.position.z = handVector.z;
        scene.add(markerCube);
        //next add camera pos
        //imagescalefactor check

    }
}

function moveCube() {
    changeX = thumbtipX - lastXPosition;
    changeY = thumbtipY - lastYPosition;
    let convertedChangeX = changeX * 0.007; // 0.20 may still move cube with 10 units, it's too much
    let convertedChangeY = changeY * 0.007; // was 0.005
    console.log(convertedChangeX);
    console.log(convertedChangeY);
    cube.position.x = convertedChangeX; // when pinch stops, this is the location where cube will be dropped 
    cube.position.y = -convertedChangeY;
    cube.material.color.setHex(0xF2239A); //make pink on pinch
    //markercube trail for debuggisng
    let markerGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    let markerMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true });
    let markerCube = new THREE.Mesh(markerGeo, markerMat);
    markerCube.position.x = convertedChangeX;
    markerCube.position.y = -convertedChangeY;
    //scene.add(markerCube);
}

function onMouseMove( event ) {

    event.preventDefault();
    console.log("MouseX", event.clientX);
    console.log("MouseY", event.clientY); //about 0-900 for both 



	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	//pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	//pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //console.log("Pointer is", pointer);

}
