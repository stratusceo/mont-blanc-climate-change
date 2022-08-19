import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as dat from 'lil-gui'
import gsap from 'gsap'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)


let actived = false

/**
 * HTML Animations
 */
const handleShowAnimation = (title, element) => {
    if (!document.getElementById('text-point')) {
        const container = document.createElement('div')

        element.onmouseover = () => {
            if (!actived) {
                const text = document.createElement('p')

                text.innerHTML = title

                container.id = 'text-point'

                const snow = document.createElement('div')

                snow.classList.add('snow')

                container.append(text, snow)

                document.body.appendChild(container)

                gsap.fromTo(snow, {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.inOut'
                })

                gsap.fromTo(container, {
                    opacity: 0,
                }, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power2.inOut'
                })
            }
        }

        element.onmouseleave = () => {
            if (!actived) gsap.to(container, {
                opacity: 0,
                curosr: 'grab',
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => {
                    container.remove()
                }
            })
        }
    }
}

document.querySelectorAll('.point').forEach(element => {
    if (element.classList.contains('point-0')) handleShowAnimation('Mont-Blanc', element)
})

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

const points = [
    {
        position: new THREE.Vector3(-5.2, 4.85, -5.3),
        element: document.querySelector('.point-0'),
        index: 0
    }
]

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.fog = new THREE.Fog(0xffffff, 0.1, 75)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
scene.add(ambientLight)

const light = new THREE.HemisphereLight(0x77BAF5, 0x77BAF5, 1);
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
let model

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
        model = children

        model.castShadow = true
        model.receiveShadow = true

        model.scale.set(1, 1, 1)
        scene.add(model)
    }

    if (document.getElementById('load')) {
        controls.target.copy(model.position)

        // show website
        gsap.to('#load div.progress-bar', {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                gsap.to('#load h1', {
                    opacity: 0,
                    duration: 1,
                })

                gsap.to('#load h2', {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        gsap.fromTo(model.position, {
                            x: model.position.x,
                            y: 25,
                            z: model.position.z
                        }, {
                            x: 0,
                            y: 0,
                            z: 0,
                            duration: 1,
                            ease: 'back.inOut(2.4)',
                            onUpdate: () => {
                                model.position.y = model.position.y
                            }
                        })

                        gsap.to('#load', {
                            opacity: 0,
                            duration: 2,
                            onComplete: () => {
                                document.querySelector('#load').remove()
                            }
                        })
                    }
                })
            }
        })
    }
}, e => {
    console.log(e)

    const percent = Math.round((e.loaded / e.total) * 100)

    gsap.to('#load div.progress-bar', {
        width: percent === Infinity ? '200vw' : `${percent * 2}vw`,
        duration: 0.25
    })
}, console.error)

/**
 * Mouse
 */
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

let activeState = 0

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
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
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff, 1)

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enableZoom = false
controls.minPolarAngle = Math.PI / 2.25
controls.maxPolarAngle = Math.PI / 2.25
controls.minDistance = 50
controls.maxDistance = 50
controls.autoRotate = true
controls.autoRotateSpeed = 1

const handleShowMenu = element => {
    activeState = 0

    if (element) gsap.to(element, {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: 'back.in(1.4)',
        onComplete: () => {
            element.remove()
            actived = false
        }
    })

    gsap.to(camera.position, {
        x: 50,
        y: 2,
        z: -50,
        duration: 1,
        ease: 'back.in(1.4)',
        onUpdate: () => {
            camera.position.set(camera.position.x, camera.position.y, camera.position.z)
        }
    })

    gsap.to(camera, {
        fov: 50,
        duration: 1,
        ease: 'back.in(1.4)',
        onUpdate: () => {
            camera.fov = camera.fov
            controls.target.copy(points[0].position)
            camera.updateProjectionMatrix()
        },
        onComplete: () => {
            if (model) controls.target.copy(model.position)
        }
    })
}

handleShowMenu()

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = async () => {
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime

    previousTime = elapsedTime

    controls.update()

    // Raycaster
    raycaster.setFromCamera(mouse, camera)

    // const object = torus
    // const intersect = raycaster.intersectObject(object)

    switch (activeState) {
        case 1:
            controls.target.copy(points[0].position)

            if (!document.getElementById('popup')) {
                // add text
                const popupContainer = document.createElement('div')
                const articleContainer = document.createElement('article')

                const popup = await fetch('articles/MontBlanc/popup.html').then(res => res.clone().text())
                const article = await fetch('articles/MontBlanc/article.html').then(res => res.clone().text())

                popupContainer.id = 'popup'
                popupContainer.innerHTML = popup

                popupContainer.addEventListener('scroll', event => {
                    const image = document.querySelector('#thumbnail img')
                    const scrollY = event.target.scrollTop

                    image.style.transform = `translateY(${scrollY / 2}px)`
                })

                articleContainer.innerHTML = article

                document.body.append(popupContainer, articleContainer)

                // add close button
                const button = document.createElement('button')

                button.innerHTML = '<img src="assets/icons/cross.png" />'
                button.id = 'close-button'
                button.onclick = e => {
                    e.preventDefault()
                    e.stopPropagation()

                    handleShowMenu(popupContainer)
                }

                popupContainer.querySelector('#thumbnail').appendChild(button)

                // add view more button
                // ...

                gsap.fromTo(popupContainer, {
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

    /**
     * Points
     */
    for (const point of points) {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = screenPosition.y * sizes.height * 0.5

        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        point.element.onclick = () => {
            console.log(point.index, 'point.index');

            actived = true

            const textPoint = document.getElementById('text-point')

            // remove text
            gsap.to(textPoint, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    textPoint.remove()

                    // transition to description
                    switch (point.index) {
                        case 0:
                            controls.target.copy(points[0].position)

                            gsap.to(camera, {
                                fov: 25,
                                duration: 2,
                                ease: 'back.in(1.4)',
                                onUpdate: () => {
                                    controls.target.copy(points[0].position)

                                    camera.fov = camera.fov
                                    camera.updateProjectionMatrix()
                                }
                            }).then(() => {
                                activeState = 1
                            })
                            break;

                        default:
                            break;
                    }
                }
            })
        }
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