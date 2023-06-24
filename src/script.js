import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Reflector from './data/reflector.js';
import {
    CSS3DRenderer,
    CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

import { gsap } from "gsap";

import * as position from "./data/position.js";
import TextScramble from "./data/textScramble";

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// renderer.toneMapping = THREE.ACESFilmicToneMapping;

const cssScene = new THREE.Scene();
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = "absolute";
cssRenderer.domElement.style.top = 0;
cssRenderer.domElement.style.zIndex = 1;
document.body.appendChild(cssRenderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 15, -40);
scene.add(camera);

/**
 * Addition
 */
// Controls
const orbitControls = new OrbitControls(camera, cssRenderer.domElement);
orbitControls.target.set(0, 5, 0);
orbitControls.enableDamping = true;
orbitControls.enablePan = false;
orbitControls.minPolarAngle = 0.5;
orbitControls.maxPolarAngle = 1.6;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// const pointLight_1 = new THREE.PointLight(0xc9f24f, 10, 7);
// pointLight_1.position.set(0, 4, 15);
// scene.add(pointLight_1);

const spotLight_1 = new THREE.SpotLight(0xc9f24f, 15, 80, Math.PI / 2, 1, 2);
spotLight_1.position.set(0, 4, -15);
const targetObject_1 = new THREE.Object3D();
targetObject_1.position.set(0, 0, -15);
spotLight_1.target = targetObject_1;
scene.add(spotLight_1);
scene.add(spotLight_1.target);

const spotLight_2 = new THREE.SpotLight(0xdddddd, 20, 100, Math.PI / 2, 1, 2);
spotLight_2.position.set(-13, 4, -7);
const targetObject_2 = new THREE.Object3D();
targetObject_2.position.set(-13, 0, -7);
spotLight_2.target = targetObject_2;
scene.add(spotLight_2);
scene.add(spotLight_2.target);

const spotLight_3 = new THREE.SpotLight(0xdddddd, 20, 100, Math.PI / 2, 1, 2);
spotLight_3.position.set(14, 4, 7);
const targetObject_3 = new THREE.Object3D();
targetObject_3.position.set(14, 0, 7);
spotLight_3.target = targetObject_3;
scene.add(spotLight_3);
scene.add(spotLight_3.target);

const spotLight_4 = new THREE.SpotLight(0xffffff, 5, 30, Math.PI / 3, 1, 1);
spotLight_4.position.set(-10, 4, -18);
spotLight_4.castShadow = true;
const targetObject_4 = new THREE.Object3D();
targetObject_4.position.set(-10, 0, -18);
spotLight_4.target = targetObject_4;
scene.add(spotLight_4);
scene.add(spotLight_4.target);

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pointedObject;

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */
// Main Model
let building;

// Moving Positions
let pos_community = position.position_community;
let pos_exclusive_drop = position.position_exclusive_drop;
let pos_insider_access = position.position_insider_access;
let pos_Sign_Up = position.position_Sign_Up;

let status = "ACTIVE";

// Temp
let before_target, before_position;

// Loading
let initInterval, loadInterval, mainInterval;
let count = 2;

// Billboard List
const OUTLINES = [
    "billboard_exclusivedrops",
    "billboard_insideraccess",
    "billboard_signup",
    "billboard_communityvibes",
];

const menuSVG = `
    <svg fill="#ffffff" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xml:space="preserve" stroke="#ffffff">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
            <g>
                <g>
                    <g>
                        <path
                            d="M280.214,39.211H16.786C7.531,39.211,0,46.742,0,55.997v24.335c0,9.256,7.531,16.787,16.786,16.787h263.428 c9.255,0,16.786-7.531,16.786-16.787V55.997C297,46.742,289.469,39.211,280.214,39.211z">
                        </path>
                        <path
                            d="M280.214,119.546H16.786C7.531,119.546,0,127.077,0,136.332v24.336c0,9.255,7.531,16.786,16.786,16.786h263.428 c9.255,0,16.786-7.531,16.786-16.786v-24.336C297,127.077,289.469,119.546,280.214,119.546z">
                        </path>
                        <path
                            d="M280.214,199.881H16.786C7.531,199.881,0,207.411,0,216.668v24.335c0,9.255,7.531,16.786,16.786,16.786h263.428 c9.255,0,16.786-7.531,16.786-16.786v-24.335C297,207.411,289.469,199.881,280.214,199.881z">
                        </path>
                    </g>
                </g>
            </g>
        </g>
    </svg>
`;

const timesSVG = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
            <path d="M16 8L8 16M8 8L16 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"></path>
        </g>
    </svg>
`;

const signUpHTML = `
    <div class='close'>&times;</div>
    <h2>SIGN UP</h2>
    <div>
        <input type='text' name='email' id='email' placeholder='Email' />
        <input type='password' name='pwd' id='pwd' placeholder='Password' />
    </div>
    <input type='button' name='submit' id='submit' value='Sign Up' />
`;

// Loading phrases
const phrases = [
    "Initializing DSTRKT World...",
    "Loading the New Dimension of Streetwear...",
    "Running script...",
    "Establishing Mainframe...",
    "Loading components...",
    "System Live...",
    "Welcome to DSTRKT - The New Age Streetwear Marketplace...",
    "Get exclusive access and discover brands from around the world...",
    "Ready to enter...",
];

const el = document.createElement("div");
document.querySelector(".loading-screen .body").append(el);
const fx = new TextScramble(el);

/**
 * Bloom
 */
const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const params = {
    threshold: 0.5,
    strength: 0.5,
    radius: 0,
    exposure: 0.2,
};

const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const materials = {};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: `
            varying vec2 vUv;

            void main() {

                vUv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

            }
        `,
        fragmentShader: `
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;

            varying vec2 vUv;

            void main() {

                gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

            }
        `,
        defines: {},
    }),
    "baseTexture"
);
mixPass.needsSwap = true;

const outputPass = new OutputPass(THREE.ReinhardToneMapping);
const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 0.5;
outlinePass.edgeThickness = 1;
outlinePass.pulsePeriod = 2;
outlinePass.visibleEdgeColor = new THREE.Color(0xa020f0);
outlinePass.hiddenEdgeColor = new THREE.Color(0x000000);
outlinePass.pulseSpeed = 1;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);
finalComposer.addPass(outlinePass);

/**
 * Models
 */
// Loading Bar
const manager = new THREE.LoadingManager();
manager.onStart = function () {
    clearInterval(initInterval);

    const tmpLine = document.createElement("div");
    tmpLine.innerHTML = "<br />";

    document.querySelector(".loading-screen .body").append(tmpLine);

    const el = document.createElement("div");
    document.querySelector(".loading-screen .body").append(el);
    const fx = new TextScramble(el);
    fx.setText(phrases[1]);
    loadInterval = setInterval(() => fx.setText(phrases[1]), 2000);
    document.querySelector(".body").scrollTop =
        document.querySelector(".body").scrollHeight;
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    if (itemsLoaded == itemsTotal) {
        clearInterval(loadInterval);
        mainInterval = setInterval(() => {
            if (count == phrases.length) {
                setTimeout(() => {
                    clearInterval(mainInterval);
                    document.querySelector(".loading-screen").style.opacity = 1;
                    gsap.to(document.querySelector(".loading-screen").style, {
                        duration: 1,
                        opacity: 0,
                        delay: 2,
                        onComplete: () =>
                            document.querySelector(".loading-screen").remove(),
                    });
                }, 500);

                return;
            }
            const tmpLine = document.createElement("div");
            tmpLine.innerHTML = "<br />";
            document.querySelector(".loading-screen .body").append(tmpLine);
            const el = document.createElement("div");
            document.querySelector(".loading-screen .body").append(el);
            const fx = new TextScramble(el);
            fx.setText(phrases[count]);
            count++;
            document.querySelector(".body").scrollTop =
                document.querySelector(".body").scrollHeight;
        }, 600);
    }
};
manager.on;

// Draco
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

// GLTF Loader
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

fx.setText(phrases[0]).then(() => {
    // Load main model
    gltfLoader.load("/models/scifi_billboards.glb", (gltf) => {
        building = gltf.scene;

        building.getObjectByName("Cube102_2").layers.toggle(BLOOM_SCENE);
        building
            .getObjectByName("billboard_neon_future")
            .layers.toggle(BLOOM_SCENE);
        building
            .getObjectByName("billboard_neon_dukan")
            .layers.toggle(BLOOM_SCENE);
        building.getObjectByName("billboard_logo").layers.toggle(BLOOM_SCENE);
        building.getObjectByName("Cube061_2").layers.toggle(BLOOM_SCENE);

        building.traverse((child) => {
            if (child.name.startsWith("billboard_text_")) {
                child.layers.toggle(BLOOM_SCENE);
            }
            if (child.name.startsWith("billboard_update_")) {
                child.visible = false;
                child.layers.toggle(BLOOM_SCENE);
            }
            if (child.name.startsWith("billboard_cross_")) {
                child.visible = false;
            }
            if (child.name.startsWith("billboard_text0")) {
                child.layers.toggle(BLOOM_SCENE);
            }
            if (child.name.startsWith("billboard_title")) {
                child.layers.toggle(BLOOM_SCENE);
            }
            if (child.name.startsWith("rounding_caption")) {
                child.layers.toggle(BLOOM_SCENE);
            }
            if (child.name == "billboard_bigtitle") {
                console.log("big_title");
                
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        scene.add(building);
    });
});

// Ground
const floorG = new THREE.PlaneBufferGeometry(5000, 5000);
const floorM = new THREE.MeshLambertMaterial({
    color: 0x243142,
});
const floor = new THREE.Mesh(floorG, floorM);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// Mirror Ground
const geometry = new THREE.CircleGeometry(100, 5);
const groundMirror = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth,
    textureHeight: window.innerHeight,
    color: 0x243142
});
groundMirror.position.y = -1.8;
groundMirror.material.transparent = true;
groundMirror.material.uniforms.opacity.value = 0.04;
groundMirror.rotateX(- Math.PI / 2);
scene.add(groundMirror);

// Sign Up Object
const signupDiv = document.querySelector(".signup");
const signupObj = new CSS3DObject(signupDiv);
signupObj.position.set(12.291, 7.409, -2.149);
signupObj.rotation.y = (189.29 * Math.PI) / 180;
signupObj.scale.set(0.01676, 0.01676, 1);

cssScene.add(signupObj);

// Ground



/**
 * Action
 */

function itemClickEvent(name) {
    if (status == "DISABLE") return;
    before_position = camera.position.clone();
    before_target = orbitControls.target.clone();
    orbitControls.enabled = false;
    if (
        window
            .getComputedStyle(document.querySelector(".menu-action"))
            .getPropertyValue("display") == "flex" &&
        document.querySelector(".menu").classList.contains("show")
    ) {
        document.querySelector(".menu-action").click();
    }
    if (name == "billboard_exclusivedrops") {
        gsap.to(camera.position, {
            duration: 1,
            x: pos_exclusive_drop.x,
            y: pos_exclusive_drop.y,
            z: pos_exclusive_drop.z,
            onComplete: () => {
                scene.getObjectByName(
                    "billboard_update_title003"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_text0_exclusivedrops"
                ).visible = false;
                scene.getObjectByName(
                    "billboard_update_text_exclusivedrops"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_cross_exclusivedrops"
                ).visible = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 1,
            x: building.getObjectByName("billboard_exclusivedrops").position.x,
            y: building.getObjectByName("billboard_exclusivedrops").position.y,
            z: building.getObjectByName("billboard_exclusivedrops").position.z,
        });
    } else if (name == "billboard_communityvibes") {
        gsap.to(camera.position, {
            duration: 1,
            x: pos_community.x,
            y: pos_community.y,
            z: pos_community.z,
            onComplete: () => {
                scene.getObjectByName(
                    "billboard_update_title001"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_text0_communityvibes"
                ).visible = false;
                scene.getObjectByName(
                    "billboard_update_text_communityvibes"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_cross_communityvibes"
                ).visible = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 1,
            x: building.getObjectByName("billboard_communityvibes").position.x,
            y: building.getObjectByName("billboard_communityvibes").position.y,
            z: building.getObjectByName("billboard_communityvibes").position.z,
        });
    } else if (name == "billboard_signup") {
        gsap.to(camera.position, {
            duration: 1,
            x: pos_Sign_Up.x,
            y: pos_Sign_Up.y,
            z: pos_Sign_Up.z,
            onComplete: () => {
                status = "DISABLE";
                signupDiv.style.opacity = 0;
                gsap.to(signupDiv.style, { duration: 1, opacity: 1 });
            },
        });
        gsap.to(orbitControls.target, {
            duration: 1,
            x: building.getObjectByName("billboard_signup").position.x,
            y: building.getObjectByName("billboard_signup").position.y,
            z: building.getObjectByName("billboard_signup").position.z,
        });
    } else if (name == "billboard_insideraccess") {
        gsap.to(camera.position, {
            duration: 1,
            x: pos_insider_access.x,
            y: pos_insider_access.y,
            z: pos_insider_access.z,
            onComplete: () => {
                scene.getObjectByName(
                    "billboard_update_title002"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_text0_inneraccess"
                ).visible = false;
                scene.getObjectByName(
                    "billboard_update_text_inneraccess"
                ).visible = true;
                scene.getObjectByName(
                    "billboard_cross_inneraccess"
                ).visible = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 1,
            x: building.getObjectByName("billboard_insideraccess").position.x,
            y: building.getObjectByName("billboard_insideraccess").position.y,
            z: building.getObjectByName("billboard_insideraccess").position.z,
        });
    }
}

document.querySelector("#about").addEventListener("click", (event) => {
    itemClickEvent("");
});

document.querySelector("#exclusive").addEventListener("click", (event) => {
    itemClickEvent("billboard_exclusivedrops");
});

document.querySelector("#insider").addEventListener("click", (event) => {
    itemClickEvent("billboard_insideraccess");
});

document.querySelector("#community").addEventListener("click", (event) => {
    itemClickEvent("billboard_communityvibes");
});

document.querySelector(".menu-action").addEventListener("click", (event) => {
    document.querySelector(".menu").classList.contains("show")
        ? (document.querySelector(".menu-action").innerHTML = menuSVG)
        : (document.querySelector(".menu-action").innerHTML = timesSVG);
    document.querySelector(".menu").classList.toggle("show");
});

cssRenderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Camera Limit
    // if(camera.position.y <= 5) camera.position.y = 5;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
        pointedObject = intersects[0].object;

        for (const outline of OUTLINES) {
            const result = untilParent(pointedObject, outline);
            if (result) {
                outlinePass.selectedObjects = [result[1]];
            }
        }
    }

    if (untilParent(pointedObject, "billboard_exclusivedrops")) {
        itemClickEvent("billboard_exclusivedrops");
    }
    if (untilParent(pointedObject, "billboard_communityvibes")) {
        itemClickEvent("billboard_communityvibes");
    }
    if (untilParent(pointedObject, "billboard_signup")) {
        itemClickEvent("billboard_signup");
    }
    if (untilParent(pointedObject, "billboard_insideraccess")) {
        itemClickEvent("billboard_insideraccess");
    }
    if (pointedObject.name == "billboard_cross_exclusivedrops") {
        scene.getObjectByName("billboard_update_title003").visible = false;
        scene.getObjectByName("billboard_text0_exclusivedrops").visible = true;
        scene.getObjectByName(
            "billboard_update_text_exclusivedrops"
        ).visible = false;
        scene.getObjectByName("billboard_cross_exclusivedrops").visible = false;
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                status = "ACTIVE";
                orbitControls.enabled = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 2,
            x: 0,
            y: 5,
            z: 0,
        });
    }

    if (pointedObject.name == "billboard_cross_inneraccess") {
        scene.getObjectByName("billboard_update_title002").visible = false;
        scene.getObjectByName("billboard_text0_inneraccess").visible = true;
        scene.getObjectByName(
            "billboard_update_text_inneraccess"
        ).visible = false;
        scene.getObjectByName("billboard_cross_inneraccess").visible = false;
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                status = "ACTIVE";
                orbitControls.enabled = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 2,
            x: 0,
            y: 5,
            z: 0,
        });
    }

    if (pointedObject.name == "billboard_cross_communityvibes") {
        scene.getObjectByName("billboard_update_title001").visible = false;
        scene.getObjectByName("billboard_text0_communityvibes").visible = true;
        scene.getObjectByName(
            "billboard_update_text_communityvibes"
        ).visible = false;
        scene.getObjectByName("billboard_cross_communityvibes").visible = false;
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                status = "ACTIVE";
                orbitControls.enabled = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 2,
            x: 0,
            y: 5,
            z: 0,
        });
    }
});

document.querySelector(".signup .close").addEventListener("click", (e) => {
    gsap.to(signupDiv.style, { duration: 1, opacity: 0 });
    gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: 15,
        z: -40,
        onComplete: () => {
            status = "ACTIVE";
            orbitControls.enabled = true;
        },
    });
    gsap.to(orbitControls.target, {
        duration: 2,
        x: 0,
        y: 5,
        z: 0,
    });
});

cssRenderer.domElement.addEventListener("pointermove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Camera Limit
    // if(camera.position.y <= 5) camera.position.y = 5;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
        pointedObject = intersects[0].object;

        for (const outline of OUTLINES) {
            const result = untilParent(pointedObject, outline);
            if (result) {
                outlinePass.selectedObjects = [result[1]];
            }
        }
    }
});
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && orbitControls.enabled == false) {
        gsap.to(signupDiv.style, { duration: 1, opacity: 0 });
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                status = "ACTIVE";
                orbitControls.enabled = true;
            },
        });
        gsap.to(orbitControls.target, {
            duration: 2,
            x: 0,
            y: 5,
            z: 0,
        });
    }
});

// Auto Resize
window.addEventListener("resize", () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Functions
 */
function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
    }
}

function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}

function untilParent(obj, name) {
    let parent = obj;
    let flag = false;
    while (true) {
        if (parent == null) break;
        else if (parent.name == name) {
            flag = true;
            break;
        }

        parent = parent.parent;
    }

    return flag ? [flag, parent] : false;
}

/**
 * Animate
 */
const animate = () => {
    // Update controls
    orbitControls.update();

    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);

    // render the entire scene, then render bloom scene on top
    finalComposer.render();

    // Rounding Letters
    try {
        scene.getObjectByName("rounding_caption_top").rotation.z += 0.008;
        scene.getObjectByName("rounding_caption_down").rotation.z += 0.01;
    } catch {}

    // Render Scene
    // renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();
