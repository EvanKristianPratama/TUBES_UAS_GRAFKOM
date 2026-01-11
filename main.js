// ============================================================
//                    IMPORT DEPENDENCIES
// ============================================================
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { setupBackground, updateBackground } from './background.js'

// ============================================================
//                    THREE.JS SETUP
// ============================================================

// ----- Scene -----
const scene = new THREE.Scene()
setupBackground(scene)

// ----- Camera -----
function createCamera() {
    const FOV = 80
    const NEAR = 0.1
    const FAR = 1000
    const POSITION = { x: 0, y: 6, z: 9 }

    const camera = new THREE.PerspectiveCamera(
        FOV,
        window.innerWidth / window.innerHeight,
        NEAR,
        FAR
    )
    camera.position.set(POSITION.x, POSITION.y, POSITION.z)
    return camera
}

const camera = createCamera()

// ----- Renderer (Transparan) -----
function createRenderer() {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    return renderer
}

const renderer = createRenderer()
document.body.appendChild(renderer.domElement)

// ----- Controls -----
function createControls(camera, domElement) {
    const controls = new OrbitControls(camera, domElement)
    controls.enablePan = false
    controls.enableZoom = false
    return controls
}

const controls = createControls(camera, renderer.domElement)

// ----- Grid Helper -----
function createGrid() {
    const SIZE = 10
    const DIVISIONS = 10
    return new THREE.GridHelper(SIZE, DIVISIONS)
}

scene.add(createGrid())

// ----- Lighting -----
function createLighting() {
    const AMBIENT_INTENSITY = 0.5
    const POINT_INTENSITY = 1
    const POINT_POSITION = { x: 5, y: 5, z: 5 }

    const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY)
    const pointLight = new THREE.PointLight(0xffffff, POINT_INTENSITY)
    pointLight.position.set(POINT_POSITION.x, POINT_POSITION.y, POINT_POSITION.z)

    return { ambientLight, pointLight }
}

const { ambientLight, pointLight } = createLighting()
scene.add(ambientLight)
scene.add(pointLight)

// ============================================================
//                    PLAYER (SPACESHIP)
// ============================================================
function createPlayer() {
    const START_Y = 0.5

    const player = new THREE.Group()

    // Badan utama (Fuselage)
    const fuselage = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 1.5, 32),
        new THREE.MeshPhongMaterial({ color: 0xdddddd, shininess: 100 })
    )
    fuselage.rotation.x = -Math.PI / 2
    player.add(fuselage)

    // Kokpit (Cockpit)
    const cockpit = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.5),
        new THREE.MeshPhongMaterial({ 
            color: 0x88ccff, 
            transparent: true, 
            opacity: 0.8 
        })
    )
    cockpit.position.set(0, 0.2, -0.2)
    player.add(cockpit)

    // Sayap (Wings)
    const wings = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 0.5),
        new THREE.MeshPhongMaterial({ color: 0xff3333 })
    )
    wings.position.set(0, 0, 0.2)
    player.add(wings)

    // Mesin kiri & kanan (Engines)
    const engineGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5)
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 })

    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial)
    leftEngine.rotation.x = Math.PI / 2
    leftEngine.position.set(-0.6, 0, 0.4)
    player.add(leftEngine)

    const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial)
    rightEngine.rotation.x = Math.PI / 2
    rightEngine.position.set(0.6, 0, 0.4)
    player.add(rightEngine)

    // Posisi awal player
    player.position.y = START_Y

    return player
}

const player = createPlayer()
scene.add(player)

// ============================================================
//                    GAME STATE (Status Game)
// ============================================================
const gameState = {
    obstacles: [],
    isRunning: false,
    score: 0,
    obstacleTimer: 0,
    highScore: parseInt(localStorage.getItem('highScore')) || 0
}

// Tampilkan high score saat halaman dimuat
document.getElementById('highScore').textContent = gameState.highScore

// ============================================================
//                    OBSTACLE FUNCTIONS
// ============================================================
function spawnObstacle() {
    const SIZE = 0.8
    const SPAWN_RANGE_X = 8
    const SPAWN_Y = 0.4
    const SPAWN_Z = -10

    const obstacle = new THREE.Mesh(
        new THREE.BoxGeometry(SIZE, SIZE, SIZE),
        new THREE.MeshStandardMaterial({ color: 0xff3333 })
    )

    obstacle.position.set(
        (Math.random() - 0.5) * SPAWN_RANGE_X,
        SPAWN_Y,
        SPAWN_Z
    )

    scene.add(obstacle)
    gameState.obstacles.push(obstacle)
}

function updateObstacles() {
    const SPEED = 0.4
    const COLLISION_DISTANCE = 0.8
    const REMOVE_Z = 5

    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i]
        
        // Gerakkan obstacle ke arah player
        obstacle.position.z += SPEED

        // Cek tabrakan dengan player
        if (obstacle.position.distanceTo(player.position) < COLLISION_DISTANCE) {
            gameOver()
            return
        }

        // Hapus obstacle yang sudah melewati player
        if (obstacle.position.z > REMOVE_Z) {
            scene.remove(obstacle)
            gameState.obstacles.splice(i, 1)
        }
    }
}

function clearAllObstacles() {
    gameState.obstacles.forEach(obstacle => scene.remove(obstacle))
    gameState.obstacles = []
}

// ============================================================
//                    RADAR FUNCTIONS
// ============================================================
function updateRadar() {
    const RANGE_X = 12
    const RANGE_Z = 25
    const OFFSET_X = 6
    const OFFSET_Z = 20

    const radar = document.getElementById('radar')
    radar.innerHTML = ''

    // Blip untuk player (di tengah-bawah radar)
    const playerBlip = document.createElement('div')
    playerBlip.className = 'radar-blip player-blip'
    playerBlip.style.left = '50%'
    playerBlip.style.top = '80%'
    radar.appendChild(playerBlip)

    // Blip untuk setiap obstacle
    gameState.obstacles.forEach(obstacle => {
        // Konversi koordinat 3D ke posisi radar (0% - 100%)
        const radarX = (obstacle.position.x + OFFSET_X) / RANGE_X * 100
        const radarZ = (obstacle.position.z + OFFSET_Z) / RANGE_Z * 100

        // Hanya tampilkan jika dalam jangkauan radar
        if (radarX >= 0 && radarX <= 100 && radarZ >= 0 && radarZ <= 100) {
            const blip = document.createElement('div')
            blip.className = 'radar-blip'
            blip.style.left = `${radarX}%`
            blip.style.top = `${radarZ}%`
            radar.appendChild(blip)
        }
    })
}

function clearRadar() {
    const radar = document.getElementById('radar')
    radar.innerHTML = ''
}

// ============================================================
//                    GAME CONTROL FUNCTIONS
// ============================================================
function startGame() {
    resetGame()
    gameState.isRunning = true
}

function stopGame() {
    gameState.isRunning = false
}

function resetGame() {
    const START_Y = 0.5

    clearAllObstacles()
    clearRadar()
    
    gameState.score = 0
    gameState.obstacleTimer = 0
    
    document.getElementById('score').textContent = 0
    player.position.set(0, START_Y, 0)
}

function gameOver() {
    gameState.isRunning = false

    // Update high score jika perlu
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score
        localStorage.setItem('highScore', gameState.highScore)
        document.getElementById('highScore').textContent = gameState.highScore
    }

    alert('Game Over!')
}

// ============================================================
//                    INPUT HANDLERS
// ============================================================
function handleKeyDown(event) {
    const MOVE_SPEED = 0.3

    if (!gameState.isRunning) return

    const key = event.key.toLowerCase()
    
    switch (key) {
        case 'a':
        case 'arrowleft':
            player.position.x -= MOVE_SPEED
            break
        case 'd':
        case 'arrowright':
            player.position.x += MOVE_SPEED
            break
        case 'w':
        case 'arrowup':
            player.position.z -= MOVE_SPEED
            break
        case 's':
        case 'arrowdown':
            player.position.z += MOVE_SPEED
            break
    }
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

// ============================================================
//                    EVENT LISTENERS
// ============================================================
window.addEventListener('keydown', handleKeyDown)
window.addEventListener('resize', handleResize)

document.getElementById('startBtn').addEventListener('click', startGame)
document.getElementById('stopBtn').addEventListener('click', stopGame)

// ============================================================
//                    MAIN GAME LOOP
// ============================================================
function animate() {
    const SPAWN_INTERVAL = 60

    requestAnimationFrame(animate)

    if (gameState.isRunning) {
        // Update score
        gameState.score++
        document.getElementById('score').textContent = gameState.score

        // Spawn obstacles secara berkala
        gameState.obstacleTimer++
        if (gameState.obstacleTimer >= SPAWN_INTERVAL) {
            spawnObstacle()
            gameState.obstacleTimer = 0
        }

        // Update game elements
        updateBackground()
        updateObstacles()
        updateRadar()
    }

    // Render scene
    renderer.render(scene, camera)
}

// Mulai game loop
animate()
