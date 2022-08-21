import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import gsap from 'gsap'

import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

gsap.registerPlugin(ScrollToPlugin)
gsap.registerPlugin(ScrollTrigger)

let pointActived = false

/**
 * HTML Animations
 */
// Loader
const boxWidth = 2000,
    totalWidth = boxWidth * 2,  //  * n of boxes
    no01 = document.querySelectorAll("#no01 .box"),
    no02 = document.querySelectorAll("#no02 .box"),
    dirFromLeft = "+=" + totalWidth,
    dirFromRight = "-=" + totalWidth;

const mod = gsap.utils.wrap(0, totalWidth);

const marquee = (which, time, direction) => {
    gsap.set(which, {
        x: function (i) {
            return i * boxWidth;
        }
    });

    const action = gsap.timeline()
        .to(which, {
            x: direction,
            modifiers: {
                x: x => mod(parseFloat(x)) + "px"
            },
            duration: time,
            ease: 'none',
            repeat: -1
        });

    return action
}

gsap.timeline({ play: true })
    .add(marquee(no01, 15, dirFromLeft))
    .add(marquee(no02, 15, dirFromRight), 0)

// Navbar
const navbarButton = document.getElementById('navbar-button'),
    menuToggle = new gsap.timeline({ paused: true, reversed: true });
menuToggle
    .add('rotate')
    .to('#navbar-button .mid', .2, { scale: 0.1, opacity: 0, transformOrigin: '50% 50%' }, 'burg')
    .to('#navbar-button .top', .2, { y: '7' }, 'rotate')
    .to('#navbar-button .bot', .2, { y: '-7' }, 'rotate')
    .to('#navbar-button .top', .2, { rotationZ: 45, transformOrigin: '50% 50%' }, 'rotate')
    .to('#navbar-button .bot', .2, { rotationZ: -45, transformOrigin: '50% 50%' }, 'rotate')

navbarButton.onclick = async () => {
    
    if (menuToggle.reversed()) { // show menu
        menuToggle.restart()
        
        const menuElement = document.createElement('div')
        const menu = await fetch('pages/navbar/menu.html').then(res => res.clone().text())

        menuElement.innerHTML = menu
        menuElement.id = 'menu'

        document.body.appendChild(menuElement)

        gsap.fromTo('nav', {
            height: 0
        }, {
            height: '100vh',
            duration: 0.5,
            ease: 'linear',
            onComplete: () => {
                gsap.to('nav li button', {
                    y: 0,
                    duration: 1.5,
                    ease: 'power3.out',
                    stagger: 0.1
                });
            }
        })
    } else { // hide menu
        menuToggle.reverse()

        gsap.to('nav li button', {
            y: '100%',
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.1,
            onComplete: () => {
                gsap.to('nav', {
                    height: 0,
                    duration: 0.5,
                    ease: 'linear',
                    onComplete: () => {
                        document.getElementById('menu').remove()
                    }
                })
            }
        })
    }
}

// Points
const handleShowAnimation = (title, element) => {
    if (!document.getElementById('text-point')) {
        const container = document.createElement('div')

        element.onmouseover = () => {
            if (!pointActived && activeState === 0) {
                const text = document.createElement('p')

                text.innerHTML = title

                container.id = 'text-point'

                const snow = document.createElement('div')

                snow.classList.add('snow')

                container.append(text)

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
            if (!pointActived && activeState === 0) gsap.to(container, {
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
// Points
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

gltfLoader.load('models/mont_blanc_massif_photographed_from_iss/scene.gltf', (gltf) => {
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
let activeState = 0

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
            pointActived = false
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

    switch (activeState) {
        case 1:
            document.body.style.overflow = 'scroll'
            controls.target.copy(points[0].position)

            if (!document.querySelector('article')) {
                // add text
                const articleContainer = document.createElement('article')

                const article = await fetch('pages/articles/montblanc.html').then(res => res.clone().text())

                articleContainer.innerHTML = article

                document.body.appendChild(articleContainer)

                // image parallax effect
                let getRatio = element => window.innerHeight / (window.innerHeight + element.offsetHeight);

                gsap.utils.toArray("article div#thumbnail img").forEach((element, i) => {
                    gsap.to(element, {
                        y: () => `${(-window.innerHeight * (1 - getRatio(element))) / 2}px`,
                        ease: "none",
                        scrollTrigger: {
                            trigger: element,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                            markers: false,
                            invalidateOnRefresh: true
                        }
                    });
                });

                // add view more button
                const moreButton = document.createElement('button')

                moreButton.id = 'more-button'
                moreButton.innerHTML = `
                    <p>View more</p>
                    <img src="assets/icons/arrow.webp" />
                `
                moreButton.onmouseover = () => {
                    gsap.to('#more-button p', {
                        rotateZ: -15,
                        duration: 0.5,
                        ease: 'back.out(1.4)'
                    })
                }
                moreButton.onmouseleave = () => {
                    gsap.to('#more-button p', {
                        rotateZ: -10,
                        duration: 0.5,
                        ease: 'back.out(1.4)'
                    })
                }
                moreButton.onclick = e => {
                    e.preventDefault()
                    e.stopPropagation()

                    // scroll to article
                    gsap.to(window, {
                        scrollTo: 'article',
                        duration: 1.5,
                        ease: 'power4.inOut'
                    });
                }

                // add close button
                const closeButton = document.createElement('button')

                closeButton.innerHTML = `
                    <p>Close</p>
                    <img src="assets/icons/cross.png" />
                `
                closeButton.id = 'close-button'
                closeButton.onclick = e => {
                    e.preventDefault()
                    e.stopPropagation()

                    handleShowMenu(articleContainer)
                    document.querySelector('article').remove()

                    gsap.to([closeButton, moreButton], {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            closeButton.remove()
                            moreButton.remove()
                        }
                    })
                }

                document.body.appendChild(closeButton)

                gsap.fromTo(moreButton, {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'back.in(1.4)'
                })

                document.body.appendChild(moreButton)
            }
            break

        case 0:
            document.body.style.overflow = 'hidden'
            break
    }

    /**
     * Points
     */
    for (const point of points) {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = -screenPosition.y * sizes.height * 0.5

        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        point.element.onclick = () => {
            console.log(point.index, 'point.index');

            pointActived = true

            const textPoint = document.getElementById('text-point')

            // remove text
            gsap.to(textPoint, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    if (textPoint) textPoint.remove()

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