import './style.css'
import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.fog = new THREE.Fog(0xffffff, 0.1, 15)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
scene.add(ambientLight)

const light = new THREE.HemisphereLight(0x478FFF, 0x000000, 1);
light.position.set(0, 0.4, 0)
light.intensity = 1
scene.add(light);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
// directionalLight.position.set(5, 5, 0)
// scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()

dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// const textureLoader = new THREE.TextureLoader()
// const texture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_baseColor.jpeg')
// const metallicTexture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_metallicRoughness.png')
// texture.minFilter = THREE.LinearFilter

gltfLoader.load('models/mont_blanc_massif_photographed_from_iss/scene.gltf', (gltf) => {
    const childrens = [...gltf.scene.children]

    for (const children of childrens) {
        const model = children

        console.log(model.getObjectByName('material')); // gives undefined
        console.log(model); // the object result

        model.receiveShadow = true

        model.scale.set(1, 1, 1)
        scene.add(model)
    }
}, console.log, console.error)

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshPhongMaterial({ color: 0x000000, fog: true });
const torus = new THREE.Mesh(geometry, material);

torus.position.set(-6.037, 4.846, -4.747)
torus.scale.set(0.198, 0.198, 0.198)

scene.add(torus);




/**
 * Mouse
 */
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

let activeState = 0
let clicked = false
let lastCoordinates

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', (event) => {
    clicked = true

    if (currentIntersect) {
        torus.material.color.set(0x11944F)

        lastCoordinates = {
            x: currentIntersect.object.position.x,
            y: currentIntersect.object.position.y,
            z: currentIntersect.object.position.z
        }

        gsap.to(camera.position, {
            x: lastCoordinates.x + 3,
            y: lastCoordinates.y + 1,
            z: lastCoordinates.z,
            duration: 1,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.position.set(camera.position.x, camera.position.y, camera.position.z)
            }
        }).then(() => {
            activeState = 1
            clicked = false
        })
    }
})






/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1e3)

camera.position.set(0, 3, -15)
camera.lookAt(torus.position)
// camera.lookAt(-50, 0, 90)

scene.add(camera)

// Controls (OrbitControls)
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 3, 0)
// controls.enableDamping = true
// controls.maxDistance = 10

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff, 1)

// First person controls
const controls = new FirstPersonControls(camera, renderer.domElement)
controls.maxDistance = 20
controls.lookSpeed = 0.05

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let currentIntersect

const tick = () => {
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime

    previousTime = elapsedTime

    // Raycaster
    raycaster.setFromCamera(mouse, camera)

    const object = torus
    const intersect = raycaster.intersectObject(object)

    switch (activeState) {
        case 1:
            console.log(activeState, 'cameraStatus');

            torus.material.color.set(0x11944F)

            const coordinates = {
                x: Math.cos(elapsedTime) * 3 + lastCoordinates.x,
                z: Math.sin(elapsedTime) * 3 + lastCoordinates.z
            }

            // gsap.to(camera.position, {
            //     x: elapsedTime,
            //     y: lastCoordinates.y,
            //     z: elapsedTime,
            //     duration: 1,
            //     ease: 'power3.inOut',
            //     onUpdate: () => {
            //         camera.position.set(camera.position.x, camera.position.y, camera.position.z)
            //     }
            // })

            camera.position.x = coordinates.x
            camera.position.z = coordinates.z

            controls.lookSpeed = 0
            controls.lookAt(torus.position)
            break
    }

    if (intersect.length) {
        if (currentIntersect && activeState === 0) {
            console.log(currentIntersect);
            currentIntersect.object.material.color.set(0x11944F)
            document.body.style.cursor = 'pointer'
        }

        currentIntersect = intersect[0]
    } else {
        if (!currentIntersect) {
            if (activeState === 0 && !clicked) object.material.color.set(0x000000)
            document.body.style.cursor = 'default'
        }

        currentIntersect = null
    }

    // Update controls
    controls.update(deltaTime)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()