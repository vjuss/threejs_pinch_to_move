//most impor5tant bits from from https://github.com/AnnaKap/facefun
//and https://codepen.io/p5js/pen/apVPVx?editors=1111


import * as THREE from './vendor/three/build/three.module.js';


let video, vidDiv, options;
let threeJSDiv;
let scene, camera, renderer, light;
let geometry, material, cube;
let mlModel;
let predictions = [];

let indextip, thumbtip, indextipX, indextipY, thumbtipX, thumbtipY;
let dist;

let lastXPosition = 100;
let lastYPosition = 100;
let changeX = 1;
let changeY = 1;


init();
animate();

// to do FRIDAY: 
// when pinch, make cube position the same as pinch coordinates
//save coords to an array or similar
//when pinch is released, use latest array coords for cube position
//make video bigger for more intuitive movement
//DIFFICULT: only make this happen when pinch starts on top of object
//make a better coord conversion system

function init(){

    //Video & ML5 init

    video = document.createElement('video');
    vidDiv = document.getElementById('video');
    video.setAttribute('width', 255);
    video.setAttribute('height', 255);
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
        minConfidence: 0.5
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

    geometry = new THREE.BoxGeometry();

    material = [
        new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true }),
        new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true }),
        new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true })
    ];

    cube = new THREE.Mesh(geometry, material[0]);
    cube.position.x = 0;
    cube.position.y = 0;
    scene.add(cube); // first add to scene to position 0,0,0

    window.addEventListener('resize', onWindowResize, false);

}

 function animate() {
    requestAnimationFrame(animate);
    findFingers(); // this gives us thumbtip xy values now, next: conversion if needed


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

        let xDist = indextipX - thumbtipX;
        let yDist = indextipY - thumbtipY;
        dist = Math.sqrt(xDist*xDist + yDist*yDist);
       // console.log(dist);
        if (dist < 25) {
            console.log("That's a pinch!");
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
    cube.position.x = convertedChangeX; // above with += was not working, fix this
    cube.position.y = -convertedChangeY;
}