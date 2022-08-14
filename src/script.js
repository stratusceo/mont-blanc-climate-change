import './style.css'
import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as dat from 'lil-gui'
import gsap from 'gsap'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

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

const light = new THREE.HemisphereLight(0x478FFF, 0x191A19, 1);
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
const gltfLoader = new GLTFLoader()

// const textureLoader = new THREE.TextureLoader()
// const texture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_baseColor.jpeg')
// const metallicTexture = textureLoader.load('models/MontBlanc/textures/MontBlanc_VandeHei_1M_u0_v0.001_metallicRoughness.png')
// texture.minFilter = THREE.LinearFilter

gltfLoader.load('models/mont_blanc_massif_photographed_from_iss/scene.gltf', (gltf) => {
    gltf.scene.traverse(child => {
        if (child.isMesh) {
            // child.material.wireframe = true
        }
    })

    const childrens = [...gltf.scene.children]

    for (const children of childrens) {
        const model = children

        model.castShadow = true
        model.receiveShadow = true

        model.scale.set(1, 1, 1)
        scene.add(model)
    }

    if (document.getElementById('load')) {
        // show website
        gsap.to('#load h1', {
            x: -250,
            opacity: 0,
            duration: 1,
            ease: 'back.in(1.4)'
        })

        gsap.to('#load h2', {
            x: 250,
            opacity: 0,
            duration: 1,
            ease: 'back.in(1.4)'
        })

        gsap.to('#load', {
            opacity: 0,
            duration: 2.5,
            onComplete: () => {
                document.querySelector('#load').remove()
            }
        })
    }
}, console.log, console.error)

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshPhongMaterial({ color: 0x191A19, fog: true });
const torus = new THREE.Mesh(geometry, material);

torus.position.set(-6.037, 4.846, -4.747)
torus.scale.set(0.198, 0.198, 0.198)
torus.material.color.set(0x191A19)

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

window.addEventListener('click', () => {
    clicked = true

    if (currentIntersect) {
        controls.lookSpeed = 0
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
            duration: 2,
            ease: 'back.in(1.4)',
            onUpdate: () => {
                camera.position.set(camera.position.x, camera.position.y, camera.position.z)
                controls.lookAt(torus.position)
            }
        }).then(() => {
            controls.lookSpeed = 0.05
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

scene.add(camera)

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
controls.lookSpeed = 0

camera.position.set(0, 3, -15)

const handleShowMenu = element => {
    controls.lookSpeed = 0
    activeState = 0

    if (element) gsap.to(element, {
        y: -50,
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            element.remove()
        }
    })

    gsap.to(camera.position, {
        x: 0,
        y: 3,
        z: -15,
        duration: 1,
        ease: 'power3.inOut',
        onUpdate: () => {
            camera.position.set(camera.position.x, camera.position.y, camera.position.z)

            controls.lookAt(torus.position)
            controls.lookSpeed = 0.05
        }
    })
}

handleShowMenu()

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
            torus.material.color.set(0x11944F)

            const coordinates = {
                x: Math.cos(elapsedTime) * 3 + lastCoordinates.x,
                z: Math.sin(elapsedTime) * 3 + lastCoordinates.z
            }

            camera.position.x = coordinates.x
            camera.position.z = coordinates.z

            controls.lookSpeed = 0
            controls.lookAt(torus.position)

            if (!document.getElementById('text')) {
                // add text
                const text = document.createElement('div')

                text.id = 'text'
                text.innerHTML = `
                    <div id="thumbnail">
                        <img src="assets/pages/1/mont-blanc.webp" alt="Mont-Blanc's mountain" />
                        <div id="shadow-image"></div>

                        <div id="text-content">
                            <h1>Mont-Blanc</h1>
                            <h2>The highest mountain of Europe 🇪🇺</h2>
                        </div>
                    </div>

                    <h3>Latest news — Closed to visitors in cause of climate change</h3>

                    <q cite="https://www.futura-sciences.com/planete/actualites/montagne-mont-blanc-effrite-devient-trop-dangereux-100166/">Le Mont-Blanc s'effrite et devient trop dangereux</q>

                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                     in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
                     non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                     <h3>What to do</h3>

                     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                     in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
                     non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                     <h3>Any questions?</h3>

                     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                     in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
                     non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                `

                text.addEventListener('scroll', event => {
                    // create parallax effect with image from div#thumbnail
                    const image = document.querySelector('#thumbnail img')
                    const scrollY = event.target.scrollTop

                    console.log(scrollY);

                    // image.style.transform = `translateY(${scrollY / 2}px)`

                    gsap.to(image, {
                        transform: `translateY(${scrollY / 2}px)`,
                        duration: 0.3
                    })
                })

                document.body.appendChild(text)

                // add close button
                const button = document.createElement('button')

                button.innerHTML = '<img src="assets/icons/cross.png" />'
                button.id = 'close-button'
                button.onclick = e => {
                    e.preventDefault()
                    e.stopPropagation()

                    handleShowMenu(text)
                }

                text.querySelector('#thumbnail').appendChild(button)

                gsap.fromTo(text, {
                    y: -50,
                    opacity: 0,
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power3.inOut'
                })
            }
            break
    }

    if (intersect.length) {
        if (currentIntersect && activeState === 0 && document.body.style.cursor !== 'pointer') {
            currentIntersect.object.material.color.set(0x11944F)
            document.body.style.cursor = 'pointer'
        }

        currentIntersect = intersect[0]
    } else {
        if (!currentIntersect) {
            if (activeState === 0 && !clicked) object.material.color.set(0x191A19)
            if (document.body.style.cursor !== 'default') document.body.style.cursor = 'default'
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