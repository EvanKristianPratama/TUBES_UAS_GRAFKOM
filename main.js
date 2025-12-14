// Import libraries Three.js
import * as THREE from '/node_modules/three/build/three.module.js'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'

// ================= SETUP SCENE =================
// Membuat scene
var scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0a0a)

// Membuat camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(0, 3, 6)

// Membuat renderer
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Membuat controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = false
controls.enableZoom = false

// Tambahkan grid
scene.add(new THREE.GridHelper(10, 10))

// ================= MEMBUAT PLAYER =================
var playerGeo = new THREE.DodecahedronGeometry(0.6)
var playerMat = new THREE.MeshPhongMaterial({ color: 0x88aa00 })
var player = new THREE.Mesh(playerGeo, playerMat)
player.position.y = 0.6
scene.add(player)

// ================= MEMBUAT LAMPU =================
scene.add(new THREE.AmbientLight(0xffffff, 0.5))
var light = new THREE.PointLight(0xffffff, 1)
light.position.set(5, 5, 5)
scene.add(light)

// ================= VARIABEL GAME =================
var obstacles = []
var running = false
var score = 0
var highScore = localStorage.getItem('highScore') || 0
var obstacleTimer = 0

// Tampilkan high score
document.getElementById('highScore').textContent = highScore

// ================= FUNGSI SPAWN OBSTACLE =================
function spawnObstacle() {
  var geo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  var mat = new THREE.MeshStandardMaterial({ color: 0xff3333 })
  var obs = new THREE.Mesh(geo, mat)

  obs.position.x = (Math.random() - 0.5) * 8
  obs.position.y = 0.4
  obs.position.z = -10

  scene.add(obs)
  obstacles.push(obs)
}

// ================= KONTROL KEYBOARD =================
window.addEventListener('keydown', function(e) {
  if (!running) return
  
  if (e.key === 'a') {
    player.position.x -= 0.3
  }
  if (e.key === 'd') {
    player.position.x += 0.3
  }
  if (e.key === 'w') {
    player.position.z -= 0.3
  }
  if (e.key === 's') {
    player.position.z += 0.3
  }
})

// ================= TOMBOL START =================
document.getElementById('startBtn').onclick = function() {
  resetGame()
  running = true
}

// ================= TOMBOL STOP =================
document.getElementById('stopBtn').onclick = function() {
  running = false
}

// ================= FUNGSI GAME LOOP =================
function animate() {
  requestAnimationFrame(animate)

  if (running) {
    // Tambah score
    score++
    document.getElementById('score').textContent = score

    // Timer untuk spawn obstacle
    obstacleTimer++
    if (obstacleTimer > 60) {
      spawnObstacle()
      obstacleTimer = 0
    }

    // Update setiap obstacle
    for (var i = 0; i < obstacles.length; i++) {
      var obs = obstacles[i]
      obs.position.z += 0.15

      // Cek tabrakan
      if (obs.position.distanceTo(player.position) < 0.8) {
        gameOver()
      }

      // Hapus obstacle kalau sudah lewat
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

// ================= FUNGSI GAME OVER =================
function gameOver() {
  running = false

  // Update high score
  if (score > highScore) {
    highScore = score
    localStorage.setItem('highScore', highScore)
    document.getElementById('highScore').textContent = highScore
  }

  alert('Game Over!')
}

// ================= FUNGSI RESET GAME =================
function resetGame() {
  // Hapus semua obstacle
  for (var i = 0; i < obstacles.length; i++) {
    scene.remove(obstacles[i])
  }
  obstacles = []
  
  // Reset score
  score = 0
  document.getElementById('score').textContent = 0
  
  // Reset posisi player
  player.position.set(0, 0.6, 0)
}

// ================= RESIZE WINDOW =================
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
