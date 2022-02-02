//most impor5tant bits from from https://github.com/AnnaKap/facefun
//and https://codepen.io/p5js/pen/apVPVx?editors=1111

import * as THREE from './vendor/three/build/three.module.js';


let video, vidDiv, options;
let threeJSDiv;
let scene, camera, renderer, light;
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

//let pinchActive = false; // pinch not active on launch


init();
animate();

//pinch as a boolean, not noisy
//DIFFICULT: only make this happen when pinch starts on top of object
//make a better coord conversion system

//video & three js pairs now: 



function init(){

    //Video & ML5 init

    video = document.createElement('video');
    vidDiv = document.getElementById('video');
    video.setAttribute('width', 250);
    video.setAttribute('height', 250);
    video.autoplay = true;
    vidDiv.appendChild(video);

    // get the users webcam stream to render in the video
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        // video.hiddend();
    })
    .catch(function(err) {
        console.log("An error occurred! " + err);
    });

    options = { 
        flipHorizontal: true,
        detectionConfidence: 0.999
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
    //renderer.setSize(1000, 1000);
    threeJSDiv = document.getElementById('ThreeJS');
    threeJSDiv.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 3;

    light = new THREE.PointLight();
    light.position.set(10, 10, 10);
    scene.add(light);

    geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    matColor = new THREE.Color( 0xff0000 );

    material = new THREE.MeshPhongMaterial({ color: matColor, transparent: true });
    //activeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true });

    cube = new THREE.Mesh(geometry, material);
    cube.position.x = 0;
    cube.position.y = 0;
    scene.add(cube); // first add to scene to position 0,0,0

    //markerCube for debugging

    //markerCube.position.z = 0.5;

    window.addEventListener('resize', onWindowResize, false);

}

 function animate() {
    requestAnimationFrame(animate);
    findFingers(); // check finger location constantly
    renderer.render(scene, camera);

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
        console.log(indextipX); // shouldnt give values whn hand is not visible, but does: make predictioon threshold 0.99 or so

        let xDist = indextipX - thumbtipX;
        let yDist = indextipY - thumbtipY;
        dist = Math.sqrt(xDist*xDist + yDist*yDist);
       // console.log(dist);
        if (dist < 12) {
            console.log("That's a pinch!");
            isPinch = true;
            moveCube();
        }

        else if (dist > 50) {
            isPinch = false; // def not pinch anymore
            cube.material.color.setHex( 0xff0000 ); // color back to red

        }
        else {
            isPinch = true; // still true, fingers remain quite close to each other 
            moveCube();
        }

    }
}

function moveCube() {
    changeX = thumbtipX - lastXPosition;
    changeY = thumbtipY - lastYPosition;
    let convertedChangeX = changeX * 0.005; // 0.20 may still move cube with 10 units, it's too much
    let convertedChangeY = changeY * 0.005;
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
    scene.add(markerCube);
}