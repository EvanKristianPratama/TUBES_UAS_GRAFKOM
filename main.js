// ================= IMPORT THREE.JS =================
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ================= SETUP SCENE =================
const scene = new THREE.Scene()
// ❌ JANGAN pakai background warna
// scene.background = new THREE.Color(0x0a0a0a)

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 3, 6)

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

// ================= PLAYER (MOBIL) =================
const player = new THREE.Group()

// Body
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.3, 0.8),
  new THREE.MeshPhongMaterial({ color: 0x88aa00 })
)
body.position.y = 0.4
player.add(body)

// Atap
const roof = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.3, 1),
  new THREE.MeshPhongMaterial({ color: 0x666666 })
)
roof.position.set(0, 0.75, -0.2)
player.add(roof)

// Roda
const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16)
const wheelMat = new THREE.MeshPhongMaterial({ color: 0x000000 })

function addWheel(x, z) {
  const wheel = new THREE.Mesh(wheelGeo, wheelMat)
  wheel.rotation.z = Math.PI / 2
  wheel.position.set(x, 0.2, z)
  player.add(wheel)
}

addWheel(-0.6, 0.7)
addWheel(0.6, 0.7)
addWheel(-0.6, -0.7)
addWheel(0.6, -0.7)

player.position.y = 0.2
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

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i]
      obs.position.z += 0.15

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
  player.position.set(0, 0.2, 0)
}

// ================= RESIZE =================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
