// ============================================================
// MAIN.JS - FILE UTAMA PROGRAM
// ============================================================
// File ini adalah entry point (titik masuk) program
// Semua inisialisasi dan game loop ada di sini
// ============================================================

// ------------------------------------------------------------
// IMPORT LIBRARY DAN MODUL
// ------------------------------------------------------------
// Import THREE.js untuk membuat grafik 3D
import * as THREE from 'three';

// Import OrbitControls untuk kontrol kamera (geser, zoom, rotasi)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Import modul yang kita buat sendiri
import { Spaceship } from './modules/spaceship.js';      // Pesawat pemain
import { ObstacleManager } from './modules/obstacle.js'; // Manager meteor
import { setupBackground, updateBackground } from './modules/background.js'; // Latar belakang
import { GameState, UIManager, InputHandler } from './core/game.js'; // Logic game

// ------------------------------------------------------------
// SETUP SCENE (TEMPAT 3D)
// ------------------------------------------------------------
// Scene adalah "dunia 3D" tempat semua objek berada
var scene = new THREE.Scene();

// Warna background hitam untuk efek luar angkasa
scene.background = new THREE.Color(0x000011);

// ------------------------------------------------------------
// SETUP KAMERA
// ------------------------------------------------------------
// PerspectiveCamera = kamera dengan perspektif seperti mata manusia
// Parameter: FOV (sudut pandang), aspect ratio, near plane, far plane
var camera = new THREE.PerspectiveCamera(
    75,                                      // FOV: 75 derajat
    window.innerWidth / window.innerHeight,  // Aspect ratio layar
    0.1,                                     // Jarak terdekat yang terlihat
    1000                                     // Jarak terjauh yang terlihat
);

// Posisi kamera: di belakang dan atas pesawat
camera.position.set(0, 3, 7);  // x=0 (tengah), y=3 (atas), z=7 (belakang)
camera.lookAt(0, 0, 0);        // Kamera melihat ke titik pusat

// ------------------------------------------------------------
// SETUP RENDERER (PENGGAMBAR)
// ------------------------------------------------------------
// Renderer bertugas menggambar scene ke layar
var renderer = new THREE.WebGLRenderer({
    antialias: true  // Menghaluskan garis-garis (anti jagged)
});

// Ukuran renderer = ukuran layar penuh
renderer.setSize(window.innerWidth, window.innerHeight);

// Tambahkan canvas renderer ke halaman HTML
document.body.appendChild(renderer.domElement);

// ------------------------------------------------------------
// SETUP KONTROL KAMERA (ORBIT CONTROLS)
// ------------------------------------------------------------
// OrbitControls memungkinkan user menggeser kamera
var controls = new OrbitControls(camera, renderer.domElement);

// Aktifkan pan (geser kamera) dengan batas
controls.enablePan = true;

// Matikan rotate dan zoom (agar view tetap konsisten)
controls.enableRotate = false;
controls.enableZoom = false;

// Batas pan kamera (agar tidak terlalu jauh)
// minPan = batas minimum (kiri-bawah)
// maxPan = batas maximum (kanan-atas)
var minPan = new THREE.Vector3(-5, 0, -3);  // Batas kiri dan depan
var maxPan = new THREE.Vector3(5, 6, 10);   // Batas kanan dan belakang

// Event listener: saat kamera berubah, cek batasnya
controls.addEventListener('change', function() {
    // Clamp = membatasi nilai agar tidak keluar batas
    // Jika target.x < -5, maka jadi -5
    // Jika target.x > 5, maka jadi 5
    controls.target.clamp(minPan, maxPan);
});

// ------------------------------------------------------------
// SETUP PENCAHAYAAN
// ------------------------------------------------------------
// AmbientLight = cahaya merata dari segala arah (seperti cahaya siang)
var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);  // Putih, intensitas 0.6
scene.add(ambientLight);

// DirectionalLight = cahaya dari satu arah (seperti matahari)
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);  // Putih, intensitas 0.8
directionalLight.position.set(5, 10, 5);  // Posisi cahaya
scene.add(directionalLight);

// ------------------------------------------------------------
// INISIALISASI GAME OBJECTS
// ------------------------------------------------------------
// Buat spaceship (pesawat pemain)
var spaceship = new Spaceship(scene);

// Buat obstacle manager (pengatur meteor)
var obstacleManager = new ObstacleManager(scene);

// Setup background (bintang-bintang)
setupBackground(scene);

// Inisialisasi game state (skor, status game, dll)
GameState.init();

// Setup UI Manager (tampilan skor, tombol, dll)
UIManager.init();

// Setup input handler (kontrol keyboard)
InputHandler.init();

// ------------------------------------------------------------
// VARIABEL GAME
// ------------------------------------------------------------
var isGameRunning = false;  // Apakah game sedang berjalan?
var gameSpeed = 0.05;       // Kecepatan game (makin besar = makin cepat)

// ------------------------------------------------------------
// FUNGSI UNTUK MEMULAI GAME
// ------------------------------------------------------------
function startGame() {
    // Set flag game berjalan
    isGameRunning = true;
    
    // Reset skor ke 0
    GameState.resetScore();
    
    // Hapus semua meteor yang ada
    obstacleManager.clearAll();
    
    // Reset posisi pesawat ke tengah
    spaceship.resetPosition();
    
    // Sembunyikan tombol start/stop saat bermain
    UIManager.hideControls();
    
    // Tampilkan pesan di console (untuk debugging)
    console.log('Game dimulai!');
}

// ------------------------------------------------------------
// FUNGSI UNTUK MENGHENTIKAN GAME
// ------------------------------------------------------------
function stopGame() {
    // Set flag game berhenti
    isGameRunning = false;
    
    // Hapus semua meteor
    obstacleManager.clearAll();
    
    // Tampilkan tombol kembali
    UIManager.showControls();
    
    console.log('Game dihentikan');
}

// ------------------------------------------------------------
// FUNGSI GAME OVER
// ------------------------------------------------------------
function gameOver() {
    // Hentikan game
    isGameRunning = false;
    
    // Simpan skor tertinggi jika lebih tinggi dari sebelumnya
    GameState.saveHighScore();
    
    // Hapus semua meteor
    obstacleManager.clearAll();
    
    // Tampilkan tombol kembali
    UIManager.showControls();
    
    // Tampilkan alert game over
    alert('GAME OVER! Skor kamu: ' + GameState.score);
    
    console.log('Game Over! Skor:', GameState.score);
}

// ------------------------------------------------------------
// FUNGSI ANIMASI (GAME LOOP)
// ------------------------------------------------------------
// Fungsi ini dipanggil 60 kali per detik (60 FPS)
function animate() {
    // Minta browser memanggil animate() di frame berikutnya
    requestAnimationFrame(animate);
    
    // Jika game sedang berjalan...
    if (isGameRunning) {
        // ----------------------------------------------------
        // UPDATE GAME OBJECTS
        // ----------------------------------------------------
        
        // Update posisi bintang (bergerak ke arah pemain)
        updateBackground();
        
        // Update meteor (spawn baru, gerakkan, hapus yang lewat)
        obstacleManager.update(gameSpeed);
        
        // Update efek engine pesawat (glow berkedip)
        spaceship.updateEngineGlow();
        
        // ----------------------------------------------------
        // PROSES INPUT KEYBOARD
        // ----------------------------------------------------
        
        // Cek tombol yang ditekan dan gerakkan pesawat
        if (InputHandler.isPressed('left')) {
            spaceship.moveLeft();    // Gerak kiri
        }
        if (InputHandler.isPressed('right')) {
            spaceship.moveRight();   // Gerak kanan
        }
        if (InputHandler.isPressed('up')) {
            spaceship.moveUp();      // Gerak atas (mundur)
        }
        if (InputHandler.isPressed('down')) {
            spaceship.moveDown();    // Gerak bawah (maju)
        }
        
        // ----------------------------------------------------
        // CEK TABRAKAN (COLLISION DETECTION)
        // ----------------------------------------------------
        
        // Ambil posisi pesawat
        var spaceshipPosition = spaceship.getPosition();
        
        // Cek apakah ada meteor yang menabrak pesawat
        var isCollision = obstacleManager.checkCollision(spaceshipPosition, 0.5);
        
        // Jika tabrakan, game over!
        if (isCollision) {
            gameOver();
        }
        
        // ----------------------------------------------------
        // UPDATE SKOR
        // ----------------------------------------------------
        
        // Tambah skor setiap frame
        GameState.addScore(1);
        
        // Update tampilan skor di layar
        UIManager.updateScore(GameState.score, GameState.highScore);
    }
    
    // Update kontrol kamera (untuk pan)
    controls.update();
    
    // Gambar scene ke layar
    renderer.render(scene, camera);
}

// ------------------------------------------------------------
// EVENT: RESIZE WINDOW
// ------------------------------------------------------------
// Saat ukuran window berubah, update kamera dan renderer
window.addEventListener('resize', function() {
    // Update aspect ratio kamera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update ukuran renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ------------------------------------------------------------
// EVENT: TOMBOL START
// ------------------------------------------------------------
var startButton = document.getElementById('startButton');
startButton.addEventListener('click', function() {
    startGame();
});

// ------------------------------------------------------------
// EVENT: TOMBOL STOP
// ------------------------------------------------------------
var stopButton = document.getElementById('stopButton');
stopButton.addEventListener('click', function() {
    stopGame();
});

// ------------------------------------------------------------
// MULAI GAME LOOP
// ------------------------------------------------------------
// Panggil fungsi animate() untuk memulai rendering
animate();

// Tampilkan pesan bahwa game sudah siap
console.log('Space Runner siap! Klik START untuk bermain.');
