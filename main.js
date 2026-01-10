// ================= IMPORT THREE.JS =================
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { setupBackground, updateBackground } from './background.js'

// ================= SETUP SCENE =================
const scene = new THREE.Scene()
setupBackground(scene)

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 6, 9)

// ================= RENDERER (TRANSPARAN) =================
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true // 🔥 PENTING
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0) // 🔥 TRANSPARAN
document.body.appendChild(renderer.domElement)

// ================= CONTROLS =================
const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = false
controls.enableZoom = false

// ================= GRID =================
scene.add(new THREE.GridHelper(10, 10))

// ================= PLAYER (SPACESHIP) =================
const player = new THREE.Group()

// Fuselage
const fuselage = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 1.5, 32),
    new THREE.MeshPhongMaterial({ color: 0xdddddd, shininess: 100 })
)
fuselage.rotation.x = -Math.PI / 2
player.add(fuselage)

// Cockpit
const cockpit = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.5),
    new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.8 })
)
cockpit.position.set(0, 0.2, -0.2)
player.add(cockpit)

// Wings
const wingGeo = new THREE.BoxGeometry(2, 0.1, 0.5)
const wingMat = new THREE.MeshPhongMaterial({ color: 0xff3333 })
const wings = new THREE.Mesh(wingGeo, wingMat)
wings.position.set(0, 0, 0.2)
player.add(wings)

// Engines
const engineGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5)
const engineMat = new THREE.MeshPhongMaterial({ color: 0x666666 })
const leftEngine = new THREE.Mesh(engineGeo, engineMat)
leftEngine.rotation.x = Math.PI / 2
leftEngine.position.set(-0.6, 0, 0.4)
player.add(leftEngine)

const rightEngine = new THREE.Mesh(engineGeo, engineMat)
rightEngine.rotation.x = Math.PI / 2
rightEngine.position.set(0.6, 0, 0.4)
player.add(rightEngine)

player.position.y = 0.5
scene.add(player)

// ================= LIGHT =================
scene.add(new THREE.AmbientLight(0xffffff, 0.5))
const light = new THREE.PointLight(0xffffff, 1)
light.position.set(5, 5, 5)
scene.add(light)

// ================= GAME VAR =================
let obstacles = []
let running = false
let score = 0
let obstacleTimer = 0

let highScore = localStorage.getItem('highScore') || 0
document.getElementById('highScore').textContent = highScore

// ================= SPAWN OBSTACLE =================
function spawnObstacle() {
    const obs = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xff3333 })
    )

    obs.position.set(
        (Math.random() - 0.5) * 8,
        0.4,
        -10
    )

    scene.add(obs)
    obstacles.push(obs)
}

// ================= KEYBOARD =================
window.addEventListener('keydown', e => {
    if (!running) return

    if (e.key === 'a') player.position.x -= 0.3
    if (e.key === 'd') player.position.x += 0.3
    if (e.key === 'w') player.position.z -= 0.3
    if (e.key === 's') player.position.z += 0.3
})

// ================= BUTTON =================
document.getElementById('startBtn').onclick = () => {
    resetGame()
    running = true
}

document.getElementById('stopBtn').onclick = () => {
    running = false
}

// ================= GAME LOOP =================
function animate() {
    requestAnimationFrame(animate)

    if (running) {
        score++
        document.getElementById('score').textContent = score

        obstacleTimer++
        if (obstacleTimer > 60) {
            spawnObstacle()
            obstacleTimer = 0
        }

        updateBackground()

        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i]
            obs.position.z += 0.4 // Lebih cepat

            if (obs.position.distanceTo(player.position) < 0.8) {
                gameOver()
            }

            if (obs.position.z > 5) {
                scene.remove(obs)
                obstacles.splice(i, 1)
                i--
            }
        }
    }

    renderer.render(scene, camera)
}

animate()

// ================= GAME OVER =================
function gameOver() {
    running = false

    if (score > highScore) {
        highScore = score
        localStorage.setItem('highScore', highScore)
        document.getElementById('highScore').textContent = highScore
    }

    alert('Game Over!')
}

// ================= RESET =================
function resetGame() {
    obstacles.forEach(o => scene.remove(o))
    obstacles = []
    score = 0
    document.getElementById('score').textContent = 0
    player.position.set(0, 0.5, 0)

    // Clear radar
    const radar = document.getElementById('radar')
    while (radar.firstChild) {
        radar.removeChild(radar.firstChild)
    }
}

// ================= RADAR =================
function updateRadar() {
    const radar = document.getElementById('radar')
    // Reset radar content (simple approach: clear and redraw)
    // Optimization: Pool elements instead of clear/redraw if lagging, but for < 50 items it's fine
    radar.innerHTML = ''

    // Add player blip (center)
    const playerBlip = document.createElement('div')
    playerBlip.className = 'radar-blip player-blip'
    playerBlip.style.left = '50%'
    playerBlip.style.top = '80%' // Player is near bottom of radar usually (forward view)
    radar.appendChild(playerBlip)

    // Add obstacles
    obstacles.forEach(obs => {
        // Map 3D coordinates (x: -4 to 4, z: -10 to 5) to Radar (0% to 100%)
        // Radar range: X +/- 6, Z -20 to +5

        const rangeX = 12 // -6 to 6
        const rangeZ = 25 // -20 to 5

        let rx = (obs.position.x + 6) / rangeX * 100
        let rz = (obs.position.z + 20) / rangeZ * 100

        // Invert Z because screen Y is down, but 3D Z increases towards camera
        // Actually, Z increases towards camera (+5 is behind player). -10 is far.
        // Screen Top (0%) should be far Z (-20). Screen Bottom (100%) should be near Z (+5).

        rz = (obs.position.z + 20) / 25 * 100;

        if (rx >= 0 && rx <= 100 && rz >= 0 && rz <= 100) {
            const blip = document.createElement('div')
            blip.className = 'radar-blip'
            blip.style.left = rx + '%'
            blip.style.top = rz + '%'
            radar.appendChild(blip)
        }
    })
}

// ================= RESIZE =================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})
