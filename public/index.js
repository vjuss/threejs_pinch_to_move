//most impor5tant bits from from https://github.com/AnnaKap/facefun
//and https://codepen.io/p5js/pen/apVPVx?editors=1111


import * as THREE from './vendor/three/build/three.module.js';


let video, vidDiv, options;
let threeJSDiv;
let scene, camera, renderer, light;
let geometry, material, cube;
let mlModel;
let predictions = [];

let nose = {};

let lastXPosition = 100;
let lastYPosition = 100;
let changeX = 1;
let changeY = 1;


init();
animate();

// to do THURSDAY: 
//make it pinch instead of poseNet - let go of object when hand is opened
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
        //flipHorizontal: true,
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
    findFingers(); // this gives us nose xy values now, next: conversion
    // changeX = nose.x - lastXPosition;
    // changeY = nose.y - lastYPosition;
    // let convertedChangeX = changeX * 0.01; // 0.20 may still move cube with 10 units, it's too much
    // let convertedChangeY = changeY * 0.01;
    // console.log(convertedChangeX);
    // console.log(convertedChangeY);
    // cube.position.x = convertedChangeX; // above with += was not working, fix this
    // cube.position.y = -convertedChangeY;
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
        let indextip = prediction.annotations.indexFinger[3];
        let thumbtip = prediction.annotations.thumb[3];
        console.log(indextip);
        console.log(thumbtip);


        // We calculate the distance between the two points 
        //let distance = dist(indextip[0], indextip[1], thumbtip[0], thumbtip[1]);
        //console.log(distance);
      }
}