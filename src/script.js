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

import Reflector from './scripts/reflector.js';
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

import { gsap } from "gsap";

import * as CONSTANT from './data/constants.js';
import TextScramble from "./scripts/textScramble.js";

/**
 ******************************
 ****** Three.js Initialize ******
 ******************************
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// CSS3DScene
const cssScene = new THREE.Scene();
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = "absolute";
cssRenderer.domElement.style.top = 0;
cssRenderer.domElement.style.zIndex = 1;
document.body.appendChild(cssRenderer.domElement);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, -40);
scene.add(camera);

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

for (const light of CONSTANT.SPOT_LIGHTS) {
    const spotLight = new THREE.SpotLight(...light.params);
    spotLight.position.set(...light.position);
    const target = new THREE.Object3D();
    target.position.set(...light.target_pos);
    spotLight.target = target;
    scene.add(spotLight);
    scene.add(target);
}

// MODELVIEWER
let pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pointedObject;

// Postprocessing for bloom & outline effect
const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const bloomParams = {
    threshold: 0.5,
    strength: 0.5,
    radius: 0,
    exposure: 0.2,
};

const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const materials = {};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomParams.threshold;
bloomPass.strength = bloomParams.strength;
bloomPass.radius = bloomParams.radius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const outputPass = new OutputPass(THREE.ReinhardToneMapping);
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

const outlineParams = {
    edgeStrength: 3,
    edgeGlow: 0.5,
    edgeThickness: 1,
    pulsePeriod: 2,
    visibleEdgeColor: new THREE.Color(0xa020f0),
    hiddenEdgeColor: new THREE.Color(0x000000),
    pulseSpeed: 1,
}

outlinePass.edgeStrength = outlineParams.edgeStrength;
outlinePass.edgeGlow = outlineParams.edgeGlow;
outlinePass.edgeThickness = outlineParams.edgeThickness;
outlinePass.pulsePeriod = outlineParams.pulsePeriod;
outlinePass.visibleEdgeColor = outlineParams.visibleEdgeColor;
outlinePass.hiddenEdgeColor = outlineParams.hiddenEdgeColor;
outlinePass.pulseSpeed = outlineParams.pulseSpeed;

const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: CONSTANT.SHADERS.vertexShader,
        fragmentShader: CONSTANT.SHADERS.fragmentShader,
        defines: {},
    }),
    "baseTexture"
);
mixPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);
finalComposer.addPass(outlinePass);

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Initialize variables
 */
// status variable for saying current state
let STATUS = "ACTIVE";

// Timeout intervals for loading text
let initInterval, loadInterval, mainInterval;
let count = 2;

/**
 * Models
 */
const manager = new THREE.LoadingManager();
manager.onStart = function () {
    clearInterval(initInterval);

    const tmpLine = document.createElement("div");
    tmpLine.innerHTML = "<br />";

    document.querySelector(".loading-screen .body").append(tmpLine);

    const div = document.createElement("div");
    document.querySelector(".loading-screen .body").append(div);
    const fx = new TextScramble(div);
    fx.setText(CONSTANT.LOADING_TEXT[1]);
    loadInterval = setInterval(() => fx.setText(CONSTANT.LOADING_TEXT[1]), 2000);
    document.querySelector(".body").scrollTop = document.querySelector(".body").scrollHeight;
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    if (itemsLoaded == itemsTotal) {
        clearInterval(loadInterval);
        mainInterval = setInterval(() => {
            if (count == CONSTANT.LOADING_TEXT.length) {
                setTimeout(() => {
                    clearInterval(mainInterval);
                    document.querySelector(".loading-screen").style.opacity = 1;
                    gsap.to(document.querySelector(".loading-screen").style, {
                        duration: 1,
                        opacity: 0,
                        delay: 2,
                        onComplete: () => document.querySelector(".loading-screen").remove()
                    });
                }, 500);

                return
            }
            const tmpLine = document.createElement("div");
            tmpLine.innerHTML = "<br />";
            document.querySelector(".loading-screen .body").append(tmpLine);
            const div = document.createElement("div");
            document.querySelector(".loading-screen .body").append(div);
            const fx = new TextScramble(div);
            fx.setText(CONSTANT.LOADING_TEXT[count]);
            count++;
            document.querySelector(".body").scrollTop = document.querySelector(".body").scrollHeight;
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

// Start showing loading text...
const div = document.createElement("div");
document.querySelector(".loading-screen .body").append(div);
const fx = new TextScramble(div);
fx.setText(CONSTANT.LOADING_TEXT[0]).then(() => {
    // Load main model
    gltfLoader.load("/models/scifi_billboards.glb", (gltf) => {
        const modelScene = gltf.scene;

        modelScene.getObjectByName("Cube102_2").layers.toggle(BLOOM_SCENE);
        modelScene.getObjectByName("billboard_neon_future").layers.toggle(BLOOM_SCENE);
        modelScene.getObjectByName("billboard_neon_dukan").layers.toggle(BLOOM_SCENE);
        modelScene.getObjectByName("billboard_logo").layers.toggle(BLOOM_SCENE);
        modelScene.getObjectByName("Cube061_2").layers.toggle(BLOOM_SCENE);

        modelScene.traverse((child) => {
            if (child.name.startsWith("billboard_text_")) child.layers.toggle(BLOOM_SCENE);
            else if (child.name.startsWith("billboard_update_")) {
                child.visible = false;
                child.layers.toggle(BLOOM_SCENE);
            }
            else if (child.name.startsWith("billboard_cross_")) child.visible = false;
            else if (child.name.startsWith("billboard_text0")) child.layers.toggle(BLOOM_SCENE);
            else if (child.name.startsWith("billboard_title")) child.layers.toggle(BLOOM_SCENE);
            else if (child.name.startsWith("rounding_caption")) child.layers.toggle(BLOOM_SCENE);
            else if (child.name == "billboard_bigtitle") {
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        scene.add(modelScene);
    });
});

// Ground
const floorG = new THREE.PlaneBufferGeometry(5000, 5000);
const floorM = new THREE.MeshLambertMaterial({ color: 0x243142 });
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
signupObj.position.set(-1000, -1000, -1000);
signupObj.rotation.y = (189.29 * Math.PI) / 180;
signupObj.scale.set(0.01676, 0.01676, 1);

cssScene.add(signupObj);

/**
 * Action
 */

function itemClickEvent(name) {
    if (STATUS == "DISABLE") return;

    orbitControls.enabled = false;

    scene.getObjectByName("billboard_update_title003").visible = false;
    scene.getObjectByName("billboard_text0_exclusivedrops").visible = true;
    scene.getObjectByName("billboard_update_text_exclusivedrops").visible = false;
    scene.getObjectByName("billboard_cross_exclusivedrops").visible = false;
    scene.getObjectByName("billboard_update_title002").visible = false;
    scene.getObjectByName("billboard_text0_inneraccess").visible = true;
    scene.getObjectByName("billboard_update_text_inneraccess").visible = false;
    scene.getObjectByName("billboard_cross_inneraccess").visible = false;
    scene.getObjectByName("billboard_update_title001").visible = false;
    scene.getObjectByName("billboard_text0_communityvibes").visible = true;
    scene.getObjectByName("billboard_update_text_communityvibes").visible = false;
    scene.getObjectByName("billboard_cross_communityvibes").visible = false;

    if (window.getComputedStyle(document.querySelector(".menu-action")).getPropertyValue("display") == "flex" && document.querySelector(".menu").classList.contains("show")) document.querySelector(".menu-action").click();

    console.log(name, ":::: is clicked!");

    switch (name) {
        case "billboard_exclusivedrops":
            gsap.to(camera.position, {
                duration: 1,
                x: CONSTANT.POSITION.position_exclusive_drop.x,
                y: CONSTANT.POSITION.position_exclusive_drop.y,
                z: CONSTANT.POSITION.position_exclusive_drop.z,
                onComplete: () => {
                    STATUS = "DISABLE";
                    scene.getObjectByName("billboard_update_title003").visible = true;
                    scene.getObjectByName("billboard_text0_exclusivedrops").visible = false;
                    scene.getObjectByName("billboard_update_text_exclusivedrops").visible = true;
                    scene.getObjectByName("billboard_cross_exclusivedrops").visible = true;
                },
            });
            gsap.to(orbitControls.target, {
                duration: 1,
                x: scene.getObjectByName("billboard_exclusivedrops").position.x,
                y: scene.getObjectByName("billboard_exclusivedrops").position.y,
                z: scene.getObjectByName("billboard_exclusivedrops").position.z,
            });
            break;

        case "billboard_communityvibes":
            gsap.to(camera.position, {
                duration: 1,
                x: CONSTANT.POSITION.position_community.x,
                y: CONSTANT.POSITION.position_community.y,
                z: CONSTANT.POSITION.position_community.z,
                onComplete: () => {
                    STATUS = "DISABLE";
                    scene.getObjectByName("billboard_update_title001").visible = true;
                    scene.getObjectByName("billboard_text0_communityvibes").visible = false;
                    scene.getObjectByName("billboard_update_text_communityvibes").visible = true;
                    scene.getObjectByName("billboard_cross_communityvibes").visible = true;
                },
            });
            gsap.to(orbitControls.target, {
                duration: 1,
                x: scene.getObjectByName("billboard_communityvibes").position.x,
                y: scene.getObjectByName("billboard_communityvibes").position.y,
                z: scene.getObjectByName("billboard_communityvibes").position.z,
            });
            break

        case "billboard_signup":
            gsap.to(camera.position, {
                duration: 1,
                x: CONSTANT.POSITION.position_signup.x,
                y: CONSTANT.POSITION.position_signup.y,
                z: CONSTANT.POSITION.position_signup.z,
                onComplete: () => {
                    STATUS = "DISABLE";
                    signupDiv.style.opacity = 0;
                    signupObj.position.set(12.291, 7.409, -2.149);
                    scene.getObjectByName("billboard_text0_signup").visible = false;
                    gsap.to(signupDiv.style, { duration: 1, opacity: 1 });
                },
            });
            gsap.to(orbitControls.target, {
                duration: 1,
                x: scene.getObjectByName("billboard_signup").position.x,
                y: scene.getObjectByName("billboard_signup").position.y,
                z: scene.getObjectByName("billboard_signup").position.z,
            });
            break

        case "billboard_insideraccess":
            gsap.to(camera.position, {
                duration: 1,
                x: CONSTANT.POSITION.position_insider_access.x,
                y: CONSTANT.POSITION.position_insider_access.y,
                z: CONSTANT.POSITION.position_insider_access.z,
                onComplete: () => {
                    STATUS = "DISABLE";
                    scene.getObjectByName("billboard_update_title002").visible = true;
                    scene.getObjectByName("billboard_text0_inneraccess").visible = false;
                    scene.getObjectByName("billboard_update_text_inneraccess").visible = true;
                    scene.getObjectByName("billboard_cross_inneraccess").visible = true;
                },
            });
            gsap.to(orbitControls.target, {
                duration: 1,
                x: scene.getObjectByName("billboard_insideraccess").position.x,
                y: scene.getObjectByName("billboard_insideraccess").position.y,
                z: scene.getObjectByName("billboard_insideraccess").position.z,
            });
            break

        default:
            break;
    }
}

document.querySelector("#signup").addEventListener("click", (event) => {
    itemClickEvent("billboard_signup");
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
        ? (document.querySelector(".menu-action").innerHTML = CONSTANT.HTML_CONTENT.menuSVG)
        : (document.querySelector(".menu-action").innerHTML = CONSTANT.HTML_CONTENT.timesSVG);
    document.querySelector(".menu").classList.toggle("show");
});

cssRenderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
        pointedObject = intersects[0].object;

        for (const outline of CONSTANT.OUTLINE_OBJECTS) {
            const result = untilParent(pointedObject, outline);
            if (result) {
                outlinePass.selectedObjects = [result[1]];
            }
        }
    }

    if (untilParent(pointedObject, "billboard_exclusivedrops")) itemClickEvent("billboard_exclusivedrops");
    if (untilParent(pointedObject, "billboard_communityvibes")) itemClickEvent("billboard_communityvibes");
    if (untilParent(pointedObject, "billboard_signup")) itemClickEvent("billboard_signup");
    if (untilParent(pointedObject, "billboard_insideraccess")) itemClickEvent("billboard_insideraccess");

    if (pointedObject.name == "billboard_cross_exclusivedrops") {
        scene.getObjectByName("billboard_update_title003").visible = false;
        scene.getObjectByName("billboard_text0_exclusivedrops").visible = true;
        scene.getObjectByName("billboard_update_text_exclusivedrops").visible = false;
        scene.getObjectByName("billboard_cross_exclusivedrops").visible = false;
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                STATUS = "ACTIVE";
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
        scene.getObjectByName("billboard_update_text_inneraccess").visible = false;
        scene.getObjectByName("billboard_cross_inneraccess").visible = false;

        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                STATUS = "ACTIVE";
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
        scene.getObjectByName("billboard_update_text_communityvibes").visible = false;
        scene.getObjectByName("billboard_cross_communityvibes").visible = false;
        gsap.to(camera.position, {
            duration: 2,
            x: 0,
            y: 15,
            z: -40,
            onComplete: () => {
                STATUS = "ACTIVE";
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

    scene.getObjectByName("billboard_text0_signup").visible = true;
    gsap.to(signupDiv.style, { duration: 1, opacity: 0, onComplete: () => signupObj.position.set(-1000, -1000, -1000) });
    gsap.to(camera.position, {
        duration: 2,
        x: 0,
        y: 15,
        z: -40,
        onComplete: () => {
            STATUS = "ACTIVE";
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

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
        pointedObject = intersects[0].object;

        for (const outline of CONSTANT.OUTLINE_OBJECTS) {
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
                STATUS = "ACTIVE";
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
    // cssRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    } catch { }

    // Render Scene
    // renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};

animate();