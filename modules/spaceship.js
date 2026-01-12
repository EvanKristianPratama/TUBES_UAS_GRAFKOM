// ============================================================
// SPACESHIP.JS - MODUL PESAWAT (PERSON 1)
// ============================================================
// File ini mengatur semua hal tentang pesawat pemain:
// - Membuat model 3D pesawat
// - Gerakan pesawat (kiri, kanan, atas, bawah)
// - Efek engine glow (mesin menyala)
// - Batas gerakan agar tidak keluar layar
// ============================================================

// Import THREE.js untuk membuat objek 3D
import * as THREE from 'three';

// ------------------------------------------------------------
// KONSTANTA (NILAI TETAP)
// ------------------------------------------------------------
// Batas pergerakan pesawat agar tidak keluar layar
var BOUNDARY_X = 4;   // Batas kiri-kanan (sumbu X)
var BOUNDARY_Y = 2;   // Batas atas-bawah (sumbu Y)   // Batas depan-belakang (sumbu Z)
var MOVE_SPEED = 0.1; // Kecepatan gerak pesawat

// ------------------------------------------------------------
// CLASS SPACESHIP
// ------------------------------------------------------------
// Class adalah blueprint/cetakan untuk membuat objek
// Setiap spaceship yang dibuat akan punya properties dan methods yang sama
export class Spaceship {
    
    // --------------------------------------------------------
    // CONSTRUCTOR - Dipanggil saat membuat spaceship baru
    // --------------------------------------------------------
    // Parameter: scene = tempat 3D untuk menaruh pesawat
    constructor(scene) {
        // Simpan referensi ke scene
        this.scene = scene;
        
        // Array untuk menyimpan efek glow engine
        // PENTING: Harus dibuat SEBELUM createMesh()!
        this.engineGlows = [];
        
        // Buat model 3D pesawat
        this.mesh = this.createMesh();
        
        // Tambahkan pesawat ke scene
        this.scene.add(this.mesh);
    }
    
    // --------------------------------------------------------
    // FUNGSI: MEMBUAT MODEL 3D PESAWAT (MODERN FIGHTER JET)
    // --------------------------------------------------------
    createMesh() {
        // Group adalah container untuk menggabungkan beberapa objek 3D
        var ship = new THREE.Group();
        
        // ====================================================
        // BAGIAN 1: BADAN UTAMA (FUSELAGE) - RAMPING & TAJAM
        // ====================================================
        // Bentuk utama: kerucut panjang untuk look aerodinamis
        var bodyGeometry = new THREE.ConeGeometry(0.2, 1.8, 6);
        var bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,       // Biru gelap metalik
            metalness: 0.9,
            roughness: 0.2
        });
        var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        ship.add(body);
        
        // Bagian tengah badan (lebih tebal)
        var midBodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.6, 6);
        var midBody = new THREE.Mesh(midBodyGeo, bodyMaterial);
        midBody.rotation.x = Math.PI / 2;
        midBody.position.z = 0.3;
        ship.add(midBody);
        
        // ====================================================
        // BAGIAN 2: COCKPIT (CANOPY) - KACA FUTURISTIK
        // ====================================================
        var cockpitGeo = new THREE.SphereGeometry(0.12, 16, 16);
        cockpitGeo.scale(1, 0.6, 1.5);  // Gepengkan dan perpanjang
        var cockpitMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,       // Cyan neon
            metalness: 1,
            roughness: 0,
            transparent: true,
            opacity: 0.7,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3
        });
        var cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.12, -0.4);
        ship.add(cockpit);
        
        // ====================================================
        // BAGIAN 3: SAYAP UTAMA - DELTA WING (SEGITIGA)
        // ====================================================
        var wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(-1.2, 0.5);
        wingShape.lineTo(-0.3, 0.5);
        wingShape.lineTo(0, 0);
        
        var wingGeo = new THREE.ExtrudeGeometry(wingShape, {
            depth: 0.03,
            bevelEnabled: false
        });
        var wingMat = new THREE.MeshStandardMaterial({
            color: 0x16213e,
            metalness: 0.8,
            roughness: 0.3
        });
        
        // Sayap kanan
        var wingRight = new THREE.Mesh(wingGeo, wingMat);
        wingRight.rotation.x = -Math.PI / 2;
        wingRight.position.set(0.1, 0, 0.7);
        ship.add(wingRight);
        
        // Sayap kiri (mirror)
        var wingLeft = new THREE.Mesh(wingGeo, wingMat);
        wingLeft.rotation.x = -Math.PI / 2;
        wingLeft.rotation.z = Math.PI;
        wingLeft.position.set(-0.1, 0, 0.1);
        ship.add(wingLeft);
        
        // ====================================================
        // BAGIAN 4: WINGLETS (UJUNG SAYAP KE ATAS)
        // ====================================================
        var wingletGeo = new THREE.BoxGeometry(0.03, 0.2, 0.15);
        var wingletMat = new THREE.MeshStandardMaterial({
            color: 0xff0055,       // Pink neon
            metalness: 0.7,
            emissive: 0xff0055,
            emissiveIntensity: 0.2
        });
        
        var wingletRight = new THREE.Mesh(wingletGeo, wingletMat);
        wingletRight.position.set(1.1, 0.1, 0.45);
        wingletRight.rotation.z = -0.2;
        ship.add(wingletRight);
        
        var wingletLeft = new THREE.Mesh(wingletGeo, wingletMat);
        wingletLeft.position.set(-1.1, 0.1, 0.45);
        wingletLeft.rotation.z = 0.2;
        ship.add(wingletLeft);
        
        // ====================================================
        // BAGIAN 5: TAIL (EKOR VERTIKAL)
        // ====================================================
        var tailGeo = new THREE.BoxGeometry(0.03, 0.35, 0.25);
        var tail = new THREE.Mesh(tailGeo, wingMat);
        tail.position.set(0, 0.2, 0.55);
        ship.add(tail);
        
        // ====================================================
        // BAGIAN 6: ENGINE PODS (MESIN GANDA)
        // ====================================================
        var enginePositions = [
            { x: -0.25, y: -0.05, z: 0.5 },
            { x: 0.25, y: -0.05, z: 0.5 }
        ];
        
        for (var i = 0; i < enginePositions.length; i++) {
            var pos = enginePositions[i];
            
            // Engine housing
            var engineGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8);
            var engineMat = new THREE.MeshStandardMaterial({
                color: 0x2d2d2d,
                metalness: 0.9,
                roughness: 0.3
            });
            var engine = new THREE.Mesh(engineGeo, engineMat);
            engine.rotation.x = Math.PI / 2;
            engine.position.set(pos.x, pos.y, pos.z);
            ship.add(engine);
            
            // Engine nozzle (ujung mesin)
            var nozzleGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8);
            var nozzleMat = new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 1,
                roughness: 0.1
            });
            var nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
            nozzle.rotation.x = Math.PI / 2;
            nozzle.position.set(pos.x, pos.y, pos.z + 0.25);
            ship.add(nozzle);
            
            // Engine inner glow (api dalam)
            var innerGlowGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.05, 8);
            var innerGlowMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.9
            });
            var innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
            innerGlow.rotation.x = Math.PI / 2;
            innerGlow.position.set(pos.x, pos.y, pos.z + 0.28);
            ship.add(innerGlow);
            
            // Engine light (cahaya mesin)
            var engineGlow = new THREE.PointLight(0x00ffff, 2, 3);
            engineGlow.position.set(pos.x, pos.y, pos.z + 0.3);
            ship.add(engineGlow);
            this.engineGlows.push(engineGlow);
        }
        
        // ====================================================
        // BAGIAN 7: DETAIL STRIPS (GARIS LED)
        // ====================================================
        var stripMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        // Strip di badan
        var stripGeo = new THREE.BoxGeometry(0.02, 0.02, 1.2);
        var stripLeft = new THREE.Mesh(stripGeo, stripMat);
        stripLeft.position.set(-0.15, 0.1, -0.1);
        ship.add(stripLeft);
        
        var stripRight = new THREE.Mesh(stripGeo, stripMat);
        stripRight.position.set(0.15, 0.1, -0.1);
        ship.add(stripRight);
        
        // Kembalikan group ship yang sudah jadi
        return ship;
    }
    
    // --------------------------------------------------------
    // FUNGSI: UPDATE EFEK GLOW ENGINE (ANIMASI)
    // --------------------------------------------------------
    updateEngineGlow() {
        // Animasi intensitas glow berdasarkan waktu
        var time = Date.now() * 0.01;
        var intensity = 1.5 + Math.sin(time * 2) * 0.5;  // Lebih terang
        
        // Terapkan ke semua engine glow
        for (var i = 0; i < this.engineGlows.length; i++) {
            this.engineGlows[i].intensity = intensity;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK KIRI
    // --------------------------------------------------------
    moveLeft() {
        // Kurangi posisi X (geser ke kiri)
        // Tapi jangan melebihi batas kiri (-BOUNDARY_X)
        if (this.mesh.position.x > -BOUNDARY_X) {
            this.mesh.position.x -= MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK KANAN
    // --------------------------------------------------------
    moveRight() {
        // Tambah posisi X (geser ke kanan)
        // Tapi jangan melebihi batas kanan (+BOUNDARY_X)
        if (this.mesh.position.x < BOUNDARY_X) {
            this.mesh.position.x += MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK ATAS (NAIK)
    // --------------------------------------------------------
    moveUp() {
        // Gerak ke atas = tambah Y
        if (this.mesh.position.y < BOUNDARY_Y) {
            this.mesh.position.y += MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK BAWAH (TURUN)
    // --------------------------------------------------------
    moveDown() {
        // Gerak ke bawah = kurang Y
        // Batas bawah = 0 (tidak bisa di bawah lantai)
        if (this.mesh.position.y > 0) {
            this.mesh.position.y -= MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: AMBIL POSISI PESAWAT
    // --------------------------------------------------------
    getPosition() {
        // Return posisi mesh (Vector3 dengan x, y, z)
        return this.mesh.position;
    }
    
    // --------------------------------------------------------
    // FUNGSI: RESET POSISI KE TENGAH
    // --------------------------------------------------------
    resetPosition() {
        // Set posisi ke titik awal (tengah layar)
        this.mesh.position.set(0, 0, 0);
    }
}
