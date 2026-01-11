// ============================================================
// GAME.JS - MODUL LOGIC GAME (SHARED/BERSAMA)
// ============================================================
// File ini berisi logic game yang dipakai bersama:
// - GameState: Menyimpan status game (skor, highscore)
// - UIManager: Mengatur tampilan UI (skor, tombol)
// - InputHandler: Mengatur input keyboard
// ============================================================

// ============================================================
// OBJECT: GAME STATE
// ============================================================
// Object untuk menyimpan dan mengelola status game
// Menggunakan object literal (bukan class) untuk kesederhanaan
export var GameState = {
    // --------------------------------------------------------
    // PROPERTIES (DATA)
    // --------------------------------------------------------
    score: 0,           // Skor saat ini
    highScore: 0,       // Skor tertinggi
    isPlaying: false,   // Apakah sedang bermain?
    
    // --------------------------------------------------------
    // METHOD: INISIALISASI
    // --------------------------------------------------------
    // Dipanggil sekali saat game dimulai
    init: function() {
        // Ambil high score dari localStorage
        // localStorage = penyimpanan browser yang permanen
        var savedScore = localStorage.getItem('spaceRunnerHighScore');
        
        // Jika ada skor tersimpan, gunakan; jika tidak, 0
        if (savedScore !== null) {
            this.highScore = parseInt(savedScore);
        } else {
            this.highScore = 0;
        }
        
        // Reset skor ke 0
        this.score = 0;
    },
    
    // --------------------------------------------------------
    // METHOD: TAMBAH SKOR
    // --------------------------------------------------------
    addScore: function(points) {
        // Tambah skor dengan jumlah poin
        this.score += points;
    },
    
    // --------------------------------------------------------
    // METHOD: RESET SKOR
    // --------------------------------------------------------
    resetScore: function() {
        // Set skor kembali ke 0
        this.score = 0;
    },
    
    // --------------------------------------------------------
    // METHOD: SIMPAN HIGH SCORE
    // --------------------------------------------------------
    saveHighScore: function() {
        // Jika skor sekarang lebih tinggi dari high score...
        if (this.score > this.highScore) {
            // Update high score
            this.highScore = this.score;
            
            // Simpan ke localStorage
            // localStorage hanya bisa menyimpan string
            localStorage.setItem('spaceRunnerHighScore', this.highScore.toString());
        }
    }
};

// ============================================================
// OBJECT: UI MANAGER
// ============================================================
// Object untuk mengatur User Interface (tampilan)
export var UIManager = {
    // --------------------------------------------------------
    // PROPERTIES (REFERENSI KE ELEMEN HTML)
    // --------------------------------------------------------
    scoreElement: null,      // Elemen untuk menampilkan skor
    highScoreElement: null,  // Elemen untuk menampilkan high score
    controlsElement: null,   // Container tombol start/stop
    
    // --------------------------------------------------------
    // METHOD: INISIALISASI UI
    // --------------------------------------------------------
    init: function() {
        // Ambil referensi elemen dari HTML menggunakan ID
        // document.getElementById('id') mencari elemen dengan id tertentu
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.controlsElement = document.querySelector('.controls');
        
        // Tampilkan high score yang tersimpan
        if (this.highScoreElement) {
            this.highScoreElement.textContent = GameState.highScore;
        }
    },
    
    // --------------------------------------------------------
    // METHOD: UPDATE TAMPILAN SKOR
    // --------------------------------------------------------
    updateScore: function(currentScore, highScore) {
        // Update teks skor jika elemen ada
        if (this.scoreElement) {
            this.scoreElement.textContent = currentScore;
        }
        
        // Update teks high score jika elemen ada
        if (this.highScoreElement) {
            this.highScoreElement.textContent = highScore;
        }
    },
    
    // --------------------------------------------------------
    // METHOD: SEMBUNYIKAN TOMBOL KONTROL
    // --------------------------------------------------------
    // Dipanggil saat game dimulai
    hideControls: function() {
        if (this.controlsElement) {
            // CSS display: none = elemen tidak terlihat
            this.controlsElement.style.display = 'none';
        }
    },
    
    // --------------------------------------------------------
    // METHOD: TAMPILKAN TOMBOL KONTROL
    // --------------------------------------------------------
    // Dipanggil saat game berhenti atau game over
    showControls: function() {
        if (this.controlsElement) {
            // CSS display: flex = elemen terlihat dengan flexbox layout
            this.controlsElement.style.display = 'flex';
        }
    }
};

// ============================================================
// OBJECT: INPUT HANDLER
// ============================================================
// Object untuk menangani input keyboard
export var InputHandler = {
    // --------------------------------------------------------
    // PROPERTIES (STATUS TOMBOL)
    // --------------------------------------------------------
    // Object untuk menyimpan status setiap tombol (ditekan/tidak)
    keys: {
        left: false,
        right: false,
        up: false,
        down: false
    },
    
    // --------------------------------------------------------
    // METHOD: INISIALISASI INPUT
    // --------------------------------------------------------
    init: function() {
        // Simpan referensi 'this' untuk digunakan di dalam callback
        // Karena 'this' di dalam callback merujuk ke window, bukan InputHandler
        var self = this;
        
        // ====================================================
        // EVENT: TOMBOL DITEKAN
        // ====================================================
        window.addEventListener('keydown', function(event) {
            // event.key = nama tombol yang ditekan
            
            // Cek tombol apa yang ditekan dan set status true
            if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
                self.keys.left = true;
            }
            if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
                self.keys.right = true;
            }
            if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
                self.keys.up = true;
            }
            if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
                self.keys.down = true;
            }
        });
        
        // ====================================================
        // EVENT: TOMBOL DILEPAS
        // ====================================================
        window.addEventListener('keyup', function(event) {
            // Saat tombol dilepas, set status false
            
            if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
                self.keys.left = false;
            }
            if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
                self.keys.right = false;
            }
            if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
                self.keys.up = false;
            }
            if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
                self.keys.down = false;
            }
        });
    },
    
    // --------------------------------------------------------
    // METHOD: CEK APAKAH TOMBOL SEDANG DITEKAN
    // --------------------------------------------------------
    isPressed: function(action) {
        // action bisa: 'left', 'right', 'up', 'down'
        return this.keys[action];
    }
};

// ============================================================
// PENJELASAN KONSEP
// ============================================================
/*
 * 1. OBJECT LITERAL vs CLASS
 *    - Kita menggunakan object literal ({...}) untuk GameState, UIManager, InputHandler
 *    - Lebih sederhana dari class untuk singleton (objek tunggal)
 *    
 * 2. LOCAL STORAGE
 *    - localStorage.setItem('key', 'value') = simpan data
 *    - localStorage.getItem('key') = ambil data
 *    - Data tersimpan meski browser ditutup
 *    
 * 3. EVENT LISTENER
 *    - window.addEventListener('keydown', callback) = dengarkan event keyboard
 *    - keydown = saat tombol ditekan
 *    - keyup = saat tombol dilepas
 *    
 * 4. REFERENCE 'this'
 *    - Dalam callback, 'this' tidak merujuk ke object asli
 *    - Solusi: simpan 'this' ke variabel (var self = this)
 */
