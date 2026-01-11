// ============================================================
// FIREBASE.JS - KONFIGURASI DAN FUNGSI FIREBASE
// ============================================================
// File ini berisi setup Firebase untuk menyimpan skor online
// Skor akan tersimpan di cloud dan bisa dilihat semua orang!
// ============================================================

// Import Firebase SDK (versi modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue,
    query,
    orderByChild,
    limitToLast 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ============================================================
// KONFIGURASI FIREBASE
// ============================================================
// PENTING: Ganti dengan konfigurasi Firebase project kamu!
// Buka: https://console.firebase.google.com
// 1. Buat project baru
// 2. Klik "Add app" -> Web
// 3. Copy konfigurasi ke bawah ini
// ============================================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc3fw1AYwNt407AiV3bp_EZIS5i_BwEAY",
  authDomain: "spaceship-2f9a9.firebaseapp.com",
  databaseURL: "https://spaceship-2f9a9-default-rtdb.firebaseio.com",
  projectId: "spaceship-2f9a9",
  storageBucket: "spaceship-2f9a9.firebasestorage.app",
  messagingSenderId: "350653733598",
  appId: "1:350653733598:web:80d984e7803ac18528c04f",
  measurementId: "G-9SEZNVS5PH"
};

// Inisialisasi Firebase
let app = null;
let database = null;

// ============================================================
// FUNGSI: INISIALISASI FIREBASE
// ============================================================
export function initFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        console.log('✅ Firebase berhasil diinisialisasi!');
        return true;
    } catch (error) {
        console.error('❌ Gagal inisialisasi Firebase:', error);
        return false;
    }
}

// ============================================================
// FUNGSI: SIMPAN SKOR KE FIREBASE
// ============================================================
// Menyimpan skor ke database
// Parameter:
// - playerName: Nama pemain
// - score: Skor yang didapat
// - level: Level yang dimainkan
export async function saveScoreToFirebase(playerName, score, level) {
    if (!database) {
        console.warn('⚠️ Firebase belum diinisialisasi');
        return false;
    }
    
    try {
        // Simpan ke leaderboard dengan timestamp
        const timestamp = Date.now();
        const scoreRef = ref(database, 'scores/' + timestamp);
        
        await set(scoreRef, {
            name: playerName,
            score: score,
            level: level,
            date: new Date().toISOString()
        });
        
        console.log('✅ Skor tersimpan ke Firebase!');
        return true;
    } catch (error) {
        console.error('❌ Gagal menyimpan skor:', error);
        return false;
    }
}

// ============================================================
// FUNGSI: AMBIL HIGH SCORE TERTINGGI
// ============================================================
// Mengambil skor tertinggi dari semua pemain
export async function getHighScoreFromFirebase() {
    if (!database) {
        console.warn('⚠️ Firebase belum diinisialisasi');
        return null;
    }
    
    try {
        // Query untuk mendapatkan skor tertinggi
        const scoresRef = ref(database, 'scores');
        const highScoreQuery = query(
            scoresRef, 
            orderByChild('score'), 
            limitToLast(1)
        );
        
        const snapshot = await get(highScoreQuery);
        
        if (snapshot.exists()) {
            let highScoreData = null;
            
            // Ambil data dari snapshot
            snapshot.forEach((child) => {
                highScoreData = child.val();
            });
            
            return highScoreData;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Gagal mengambil high score:', error);
        return null;
    }
}

// ============================================================
// FUNGSI: AMBIL TOP 10 LEADERBOARD
// ============================================================
// Mengambil 10 skor tertinggi untuk leaderboard
export async function getLeaderboard(limit = 10) {
    if (!database) {
        console.warn('⚠️ Firebase belum diinisialisasi');
        return [];
    }
    
    try {
        const scoresRef = ref(database, 'scores');
        const leaderboardQuery = query(
            scoresRef, 
            orderByChild('score'), 
            limitToLast(limit)
        );
        
        const snapshot = await get(leaderboardQuery);
        
        if (snapshot.exists()) {
            const scores = [];
            
            snapshot.forEach((child) => {
                scores.push({
                    id: child.key,
                    ...child.val()
                });
            });
            
            // Urutkan dari tertinggi ke terendah
            scores.sort((a, b) => b.score - a.score);
            
            return scores;
        }
        
        return [];
    } catch (error) {
        console.error('❌ Gagal mengambil leaderboard:', error);
        return [];
    }
}

// ============================================================
// FUNGSI: LISTEN PERUBAHAN HIGH SCORE (REALTIME)
// ============================================================
// Callback dipanggil setiap kali ada skor baru
export function listenToHighScore(callback) {
    if (!database) {
        console.warn('⚠️ Firebase belum diinisialisasi');
        return null;
    }
    
    try {
        const scoresRef = ref(database, 'scores');
        const highScoreQuery = query(
            scoresRef, 
            orderByChild('score'), 
            limitToLast(1)
        );
        
        // onValue akan dipanggil setiap ada perubahan
        const unsubscribe = onValue(highScoreQuery, (snapshot) => {
            if (snapshot.exists()) {
                let highScoreData = null;
                
                snapshot.forEach((child) => {
                    highScoreData = child.val();
                });
                
                callback(highScoreData);
            }
        });
        
        // Return fungsi untuk berhenti listen
        return unsubscribe;
    } catch (error) {
        console.error('❌ Gagal setup listener:', error);
        return null;
    }
}

// ============================================================
// FUNGSI: CEK APAKAH INI REKOR BARU
// ============================================================
export async function isNewHighScore(score) {
    const currentHighScore = await getHighScoreFromFirebase();
    
    if (!currentHighScore) {
        return true; // Belum ada skor, pasti rekor baru!
    }
    
    return score > currentHighScore.score;
}
