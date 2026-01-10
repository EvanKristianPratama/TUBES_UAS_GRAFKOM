import * as THREE from 'three'

let stars, starGeo

export function setupBackground(scene) {
    starGeo = new THREE.BufferGeometry()
    const starCount = 6000
    const posArray = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 600
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

    const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true
    })

    stars = new THREE.Points(starGeo, starMaterial)
    scene.add(stars)
}

export function updateBackground() {
    if (stars) {
        stars.rotation.y -= 0.0005 
    }
}
