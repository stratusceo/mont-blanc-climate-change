import './style.css'
import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

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

const light = new THREE.HemisphereLight(0x4A96F8, 0x000000, 1);
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

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_baseColor.jpeg')
const metallicTexture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_metallicRoughness.png')

texture.minFilter = THREE.LinearFilter

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
const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
const torus = new THREE.Mesh(geometry, material);

torus.position.set(-6.037, 4.846, -4.747)
torus.scale.set(0.198, 0.198, 0.198)

scene.add(torus);

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


const controls = new FirstPersonControls(camera, renderer.domElement)
// controls.movementSpeed = 150;
controls.maxDistance = 20
controls.lookSpeed = 0.1

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update(deltaTime)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()