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
import { ExplosionManager } from './modules/explosion.js';
import { ProjectileManager } from './modules/projectile.js'; // Sistem tembakan
import { AudioManager } from './core/audio.js'; // Audio/Music manager
// Import Firebase untuk menyimpan skor online
import { initFirebase, saveScoreToFirebase, getHighScoreFromFirebase, getLeaderboard, isNewHighScore, listenToHighScore } from './core/firebase.js';
// ------------------------------------------------------------
// SETUP SCENE (TEMPAT 3D)
// ------------------------------------------------------------
// Scene adalah "dunia 3D" tempat semua objek berada
let scene = new THREE.Scene();

// Warna background hitam untuk efek luar angkasa
scene.background = new THREE.Color(0x000011);

// ------------------------------------------------------------
// SETUP KAMERA
// ------------------------------------------------------------
// PerspectiveCamera = kamera dengan perspektif seperti mata manusia
// Parameter: FOV (sudut pandang), aspect ratio, near plane, far plane
let camera = new THREE.PerspectiveCamera(
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
let renderer = new THREE.WebGLRenderer({
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
let controls = new OrbitControls(camera, renderer.domElement);

// Aktifkan pan (geser kamera)
controls.enablePan = true;
controls.enableRotate = false;
controls.enableZoom = false;

// Set tombol mouse untuk pan
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: null
};

// Posisi awal kamera (untuk kembali setelah pan)
let originalCameraPos = camera.position.clone();
let originalTarget = new THREE.Vector3(0, 0, 0);
let isPanning = false;

// Batas pan kamera
let minPan = new THREE.Vector3(-3, 0, -2);
let maxPan = new THREE.Vector3(3, 4, 8);

// Event: saat mulai pan
controls.addEventListener('start', function() {
    isPanning = true;
});

// Event: saat selesai pan (lepas mouse)
controls.addEventListener('end', function() {
    isPanning = false;
});

// Event: batasi pan
controls.addEventListener('change', function() {
    controls.target.clamp(minPan, maxPan);
});

// ------------------------------------------------------------
// SETUP PENCAHAYAAN
// ------------------------------------------------------------
// AmbientLight = cahaya merata dari segala arah (seperti cahaya siang)
let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);  // Lebih terang
scene.add(ambientLight);

// DirectionalLight = cahaya dari satu arah (seperti matahari)
let directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);  // Lebih terang
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// SpotLight = lampu sorot untuk menyorot pesawat
let spotLight = new THREE.SpotLight(0x00ffff, 8);  // Cyan, SANGAT terang
spotLight.position.set(0, 8, 5);  // Posisi di atas belakang
spotLight.angle = Math.PI / 5;    // Sudut sorot lebih lebar
spotLight.penumbra = 0.3;         // Tepi lebih tajam
spotLight.decay = 0.5;            // Peluruhan lebih lambat
spotLight.distance = 50;          // Jarak lebih jauh
scene.add(spotLight);

// Target spotlight = pesawat (akan diupdate setelah spaceship dibuat)
let spotLightTarget = new THREE.Object3D();
scene.add(spotLightTarget);
spotLight.target = spotLightTarget;

// SpotLight kedua dari depan (rim light)
let rimLight = new THREE.SpotLight(0xff00ff, 5);  // Magenta, lebih terang
rimLight.position.set(0, 3, -10);  // Di depan pesawat
rimLight.angle = Math.PI / 4;
rimLight.penumbra = 0.5;
rimLight.decay = 0.5;
rimLight.distance = 40;
scene.add(rimLight);

// Point light di bawah untuk efek dramatic
let underLight = new THREE.PointLight(0x0066ff, 3, 15);  // Biru, lebih terang
underLight.position.set(0, -2, 0);
scene.add(underLight);

// Tambahan: Hemisphere light untuk fill
let hemiLight = new THREE.HemisphereLight(0x00ffff, 0xff00ff, 0.5);  // Langit cyan, tanah magenta
scene.add(hemiLight);

// ------------------------------------------------------------
// INISIALISASI GAME OBJECTS
// ------------------------------------------------------------
// Buat spaceship (pesawat pemain)
let spaceship = new Spaceship(scene);

// Buat obstacle manager (pengatur meteor)
let obstacleManager = new ObstacleManager(scene);

// Explosion manager (efek ledakan)
let explosionManager = new ExplosionManager(scene);

// Projectile manager (sistem tembakan)
let projectileManager = new ProjectileManager(scene);

// Setup background (bintang-bintang)
setupBackground(scene);

// Inisialisasi game state (skor, status game, dll)
GameState.init();

// Setup UI Manager (tampilan skor, tombol, dll)
UIManager.init();

// Setup input handler (kontrol keyboard)
InputHandler.init();

// Inisialisasi Audio Manager (musik background)
// Musik akan otomatis play saat user interact pertama kali (browser policy)
let audioManager = new AudioManager();

// ------------------------------------------------------------
// INISIALISASI FIREBASE
// ------------------------------------------------------------
// Inisialisasi Firebase dan load high score dari cloud
initFirebase();

// Load high score dan leaderboard dengan delay kecil
setTimeout(function() {
    loadHighScoreFromCloud();
    loadLeaderboard();
}, 500);

// Listen perubahan high score secara realtime
listenToHighScore(function(highScoreData) {
    if (highScoreData) {
        // Update UI dengan high score dari Firebase
        GameState.highScore = highScoreData.score;
        GameState.highScoreName = highScoreData.name;
        UIManager.updateHighScore(highScoreData.score);
        UIManager.updateBestPlayerName(highScoreData.name);
    }
});

// Fungsi untuk load high score dari cloud
async function loadHighScoreFromCloud() {
    try {
        let timeoutPromise = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Timeout')); }, 3000);
        });
        let highScoreData = await Promise.race([getHighScoreFromFirebase(), timeoutPromise]);
        if (highScoreData) {
            GameState.highScore = highScoreData.score;
            GameState.highScoreName = highScoreData.name;
            UIManager.updateHighScore(highScoreData.score);
            UIManager.updateBestPlayerName(highScoreData.name);
            console.log('☁️ High score dari cloud:', highScoreData.score, 'by', highScoreData.name);
        }
    } catch (e) {
        console.warn('⚠️ Gagal load high score:', e.message);
    }
}

// ------------------------------------------------------------
// FUNGSI LOAD LEADERBOARD
// ------------------------------------------------------------
async function loadLeaderboard() {
    let leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;
    
    try {
        // Timeout 3 detik
        let timeoutPromise = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Timeout')); }, 3000);
        });
        
        let scores = await Promise.race([getLeaderboard(10), timeoutPromise]);
        
        if (!scores || scores.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet.<br>Be the first!</div>';
            return;
        }
        
        let html = '';
        scores.forEach(function(item, index) {
            let rank = index + 1;
            let topClass = '';
            if (rank === 1) topClass = 'top-1';
            else if (rank === 2) topClass = 'top-2';
            else if (rank === 3) topClass = 'top-3';
            
            let medal = '';
            if (rank === 1) medal = '🥇';
            else if (rank === 2) medal = '🥈';
            else if (rank === 3) medal = '🥉';
            else medal = rank;
            
            html += '<div class="leaderboard-item ' + topClass + '">';
            html += '  <span class="leaderboard-rank">' + medal + '</span>';
            html += '  <div class="leaderboard-info">';
            html += '    <div class="leaderboard-name">' + (item.name || 'Player') + '</div>';
            html += '    <div class="leaderboard-level">Level ' + (item.level || 1) + '</div>';
            html += '  </div>';
            html += '  <span class="leaderboard-score">' + item.score + '</span>';
            html += '</div>';
        });
        
        leaderboardList.innerHTML = html;
        console.log('🏆 Leaderboard loaded:', scores.length, 'scores');
    } catch (error) {
        console.warn('⚠️ Leaderboard timeout/error:', error.message);
        leaderboardList.innerHTML = '<div class="leaderboard-empty">Offline mode</div>';
    }
}

// ------------------------------------------------------------
// letIABEL GAME
// ------------------------------------------------------------
let isGameRunning = false;  // Apakah game sedang berjalan?
let selectedLevel = 1;      // Level yang dipilih (1-5)
let gameSpeed = 0.03;       // Kecepatan game (akan diatur berdasarkan level)
let collisionHandled = false; // flag untuk mencegah multi-trigger tabrakan
let _lastTime = null; // untuk menghitung dt di animate

// Kecepatan untuk setiap level
let levelSpeeds = {
    1: 0.03,   // Pelan
    2: 0.05,   // Normal
    3: 0.08,   // Cepat
    4: 0.12,   // Sangat cepat
    5: 0.18    // Gila!
};

// ------------------------------------------------------------
// FUNGSI UNTUK MEMULAI GAME
// ------------------------------------------------------------
function startGame() {
    // Ambil nama pemain dari input
    let nameInput = document.getElementById('playerName');
    let playerName = nameInput ? nameInput.value.trim() : 'Player';
    if (!playerName) playerName = 'Player';
    GameState.setPlayerName(playerName);
    
    // Set flag game berjalan
    isGameRunning = true;
    
    // Set kecepatan berdasarkan level
    gameSpeed = levelSpeeds[selectedLevel];
    
    // Reset skor ke 0
    GameState.resetScore();
    
    // Hapus semua meteor yang ada
    obstacleManager.clearAll();
    
    // Reset peluru
    projectileManager.clearAll();
    
    // Reset posisi pesawat ke tengah
    spaceship.resetPosition();
    // Pastikan pesawat terlihat (jika sebelumnya disembunyikan oleh ledakan)
    if (spaceship && spaceship.mesh) spaceship.mesh.visible = true;

    // Reset flag collision
    collisionHandled = false;
    
    // Sembunyikan tombol start/stop saat bermain
    UIManager.hideControls();
    
    // Tampilkan ammo display
    let ammoEl = document.querySelector('.score-item.ammo');
    if (ammoEl) ammoEl.classList.remove('hidden');
    
    // Tambah class playing untuk hide leaderboard
    document.getElementById('hud').classList.add('playing');
    
    // Mulai musik background
    audioManager.playBackgroundMusic();
    
    // Tampilkan pesan di console (untuk debugging)
    console.log('Game dimulai! Player:', playerName);
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
    
    // Sembunyikan ammo display
    let ammoEl = document.querySelector('.score-item.ammo');
    if (ammoEl) ammoEl.classList.add('hidden');
    
    // Hapus class playing untuk show leaderboard
    document.getElementById('hud').classList.remove('playing');
    
    console.log('Game dihentikan');
}

// ------------------------------------------------------------
// FUNGSI GAME OVER
// ------------------------------------------------------------
async function gameOver() {
    // Hentikan game
    isGameRunning = false;
    
    // Hapus semua meteor dulu
    obstacleManager.clearAll();
    
    // Default: bukan rekor baru
    let isNewRecord = false;
    
    // Coba simpan ke Firebase dengan timeout 3 detik
    try {
        // Promise dengan timeout
        let timeoutPromise = new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Timeout')); }, 3000);
        });
        
        // Cek apakah rekor baru
        let checkPromise = isNewHighScore(GameState.score);
        isNewRecord = await Promise.race([checkPromise, timeoutPromise]);
        
        // Simpan skor ke Firebase
        let savePromise = saveScoreToFirebase(GameState.playerName, GameState.score, selectedLevel);
        await Promise.race([savePromise, timeoutPromise]);
        
        console.log('✅ Skor tersimpan ke Firebase');
        
        // Refresh leaderboard setelah simpan skor
        loadLeaderboard();
    } catch (error) {
        console.warn('⚠️ Firebase error (offline mode):', error.message);
        // Fallback: cek local high score
        isNewRecord = GameState.score > GameState.highScore;
    }
    
    // Update local high score juga
    if (isNewRecord) {
        GameState.highScore = GameState.score;
        GameState.highScoreName = GameState.playerName;
        UIManager.updateHighScore(GameState.score);
        UIManager.updateBestPlayerName(GameState.playerName);
    }
    
    // Tampilkan modal game over
    showGameOverModal(GameState.score, isNewRecord, GameState.playerName);
    
    console.log('Game Over! Skor:', GameState.score, '| Rekor Baru:', isNewRecord);
}

// ------------------------------------------------------------
// FUNGSI TAMPILKAN MODAL GAME OVER
// ------------------------------------------------------------
function showGameOverModal(score, isNewRecord, playerName) {
    let modal = document.getElementById('gameOverModal');
    let finalScore = document.getElementById('finalScore');
    let newRecordText = document.getElementById('newRecord');
    let gameOverName = document.getElementById('gameOverName');
    
    // Set nama pemain
    if (gameOverName) {
        gameOverName.textContent = playerName;
    }
    
    // Set skor
    finalScore.textContent = score;
    
    // Tampilkan "NEW RECORD" jika rekor baru
    if (isNewRecord) {
        newRecordText.classList.remove('hidden');
    } else {
        newRecordText.classList.add('hidden');
    }
    
    // Tampilkan modal
    modal.classList.remove('hidden');
}

// ------------------------------------------------------------
// FUNGSI SEMBUNYIKAN MODAL
// ------------------------------------------------------------
function hideGameOverModal() {
    let modal = document.getElementById('gameOverModal');
    modal.classList.add('hidden');
    
    // Tampilkan leaderboard lagi
    document.getElementById('hud').classList.remove('playing');
}

// ------------------------------------------------------------
// FUNGSI ANIMASI (GAME LOOP)
// ------------------------------------------------------------
// Fungsi ini dipanggil 60 kali per detik (60 FPS)
function animate() {
    // Minta browser memanggil animate() di frame berikutnya
    requestAnimationFrame(animate);
    // Hitung delta time (detik)
    let now = performance.now();
    let dt = 0;
    if (_lastTime !== null) dt = (now - _lastTime) / 1000;
    _lastTime = now;
    
    // --------------------------------------------------------
    // UPDATE SPOTLIGHT MENGIKUTI PESAWAT
    // --------------------------------------------------------
    let shipPos = spaceship.getPosition();
    spotLightTarget.position.copy(shipPos);
    spotLight.position.set(shipPos.x, shipPos.y + 8, shipPos.z + 5);
    rimLight.target = spotLightTarget;
    underLight.position.set(shipPos.x, shipPos.y - 2, shipPos.z);
    
    // --------------------------------------------------------
    // PAN KEMBALI KE POSISI AWAL (jika tidak sedang pan)
    // --------------------------------------------------------
    if (!isPanning) {
        // Lerp = Linear interpolation (pergerakan halus)
        // Kamera perlahan kembali ke posisi awal
        controls.target.lerp(originalTarget, 0.05);
    }
    
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
        
        // Tembak (Spasi)
        if (InputHandler.isPressed('shoot')) {
            let shipPos = spaceship.getPosition();
            projectileManager.shoot(shipPos);
        }
        
        // Reload (R)
        if (InputHandler.isPressed('reload')) {
            projectileManager.reload();
        }
        
        // ----------------------------------------------------
        // UPDATE PELURU & CEK COLLISION PELURU-METEOR
        // ----------------------------------------------------
        projectileManager.update();
        
        // Cek peluru kena meteor
        let hitIndices = projectileManager.checkCollision(obstacleManager.obstacles);
        
        // Hancurkan meteor yang kena (dari belakang biar aman splice)
        hitIndices.sort((a, b) => b - a);
        for (let idx of hitIndices) {
            let meteor = obstacleManager.obstacles[idx];
            // Spawn ledakan kecil di posisi meteor
            explosionManager.spawn(meteor.position, { count: 15, duration: 0.5 });
            // Hapus meteor
            obstacleManager.scene.remove(meteor);
            meteor.geometry.dispose();
            meteor.material.dispose();
            obstacleManager.obstacles.splice(idx, 1);
            // Bonus skor
            GameState.addScore(50);
        }
        
        // Update UI ammo
        UIManager.updateAmmo(projectileManager.getAmmoInfo());
        
        // ----------------------------------------------------
        // CEK TABRAKAN (COLLISION DETECTION)
        // ----------------------------------------------------
        
        // Ambil posisi pesawat
        let spaceshipPosition = spaceship.getPosition();
        
        // Cek apakah ada meteor yang menabrak pesawat
        let isCollision = obstacleManager.checkCollision(spaceshipPosition, 0.5);
        
        // Jika tabrakan, trigger efek ledakan dan game over setelah delay
        if (isCollision && !collisionHandled) {
            collisionHandled = true;

            console.log('Collision detected at', spaceshipPosition.toArray());

            // Sembunyikan pesawat visualnya
            if (spaceship && spaceship.mesh) spaceship.mesh.visible = false;

            // Spawn ledakan di posisi pesawat
            explosionManager.spawn(spaceshipPosition, { count: 48, duration: 1.1 });

            // Delay singkat sebelum gameOver agar efek kelihatan
            setTimeout(function() {
                gameOver();
            }, 800);
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
    
    // Update explosions
    if (explosionManager) explosionManager.update(dt);
    
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
let startButton = document.getElementById('startBtn');
if (startButton) {
    startButton.addEventListener('click', function() {
        startGame();
    });
}

// ------------------------------------------------------------
// EVENT: TOMBOL STOP
// ------------------------------------------------------------
let stopButton = document.getElementById('stopBtn');
if (stopButton) {
    stopButton.addEventListener('click', function() {
        stopGame();
    });
}

// ------------------------------------------------------------
// EVENT: TOMBOL MUSIK
// ------------------------------------------------------------
let musicBtn = document.getElementById('musicBtn');
let volumeSlider = document.getElementById('volumeSlider');
let musicControl = document.querySelector('.music-control');

function syncAudioUI() {
    if (!musicControl) return;

    let enabled = musicControl.classList.contains('active');
    if (volumeSlider) {
        volumeSlider.disabled = !enabled;
        volumeSlider.style.setProperty('--vol', volumeSlider.value + '%');
    }
}

// init volume dari slider
if (volumeSlider) {
    audioManager.setVolume(volumeSlider.value / 100);
}
syncAudioUI();

if (musicBtn) {
    musicBtn.addEventListener('click', function() {
        let enabled = audioManager.toggleMusic();
        if (musicControl) {
            musicControl.classList.toggle('active', enabled);
        }
        syncAudioUI();
    });
}

// ------------------------------------------------------------
// EVENT: VOLUME SLIDER
// ------------------------------------------------------------
if (volumeSlider) {
    volumeSlider.addEventListener('input', function() {
        let volume = volumeSlider.value / 100;
        audioManager.setVolume(volume);
        volumeSlider.style.setProperty('--vol', volumeSlider.value + '%');
    });
}

// ------------------------------------------------------------
// EVENT: TOMBOL LEVEL
// ------------------------------------------------------------
let levelButtons = document.querySelectorAll('.level-btn');
levelButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        // Hapus class active dari semua tombol
        levelButtons.forEach(function(b) {
            b.classList.remove('active');
        });
        
        // Tambah class active ke tombol yang diklik
        btn.classList.add('active');
        
        // Set level yang dipilih
        selectedLevel = parseInt(btn.getAttribute('data-level'));
        
        console.log('Level dipilih:', selectedLevel);
    });
});

// ------------------------------------------------------------
// EVENT: TOMBOL RESTART (DI MODAL)
// ------------------------------------------------------------
let restartBtn = document.getElementById('restartBtn');
if (restartBtn) {
    restartBtn.addEventListener('click', function() {
        hideGameOverModal();
        startGame();
    });
}

// ------------------------------------------------------------
// EVENT: TOMBOL MENU (DI MODAL)
// ------------------------------------------------------------
let menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
    menuBtn.addEventListener('click', function() {
        hideGameOverModal();
        UIManager.showControls();
    });
}

// ------------------------------------------------------------
// MULAI GAME LOOP
// ------------------------------------------------------------
// Panggil fungsi animate() untuk memulai rendering
animate();

// Tampilkan pesan bahwa game sudah siap
console.log('Space Runner siap! Klik START untuk bermain.');
