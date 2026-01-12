// ============================================================
// PROJECTILE.JS - MODUL PELURU/TEMBAKAN
// ============================================================
// Mengatur sistem tembakan: spawn, gerak, collision, ammo & reload
// ============================================================

import * as THREE from 'three';

// ------------------------------------------------------------
// CLASS PROJECTILE MANAGER - Mengelola semua peluru
// ------------------------------------------------------------
export class ProjectileManager {
    
    // Constructor: scene = THREE.Scene
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];   // Array peluru aktif
        
        // Sistem ammo
        this.maxAmmo = 10;       // Kapasitas maksimal
        this.currentAmmo = 10;   // Peluru saat ini
        this.isReloading = false;
        this.reloadTime = 1500;  // 1.5 detik reload
        
        // Cooldown tembak (mencegah spam)
        this.shootCooldown = 150; // 150ms antar tembakan
        this.lastShootTime = 0;
    }

    // --------------------------------------------------------
    // SHOOT - Tembak peluru dari posisi tertentu
    // position = Vector3 posisi asal (spaceship)
    // --------------------------------------------------------
    shoot(position) {
        const now = Date.now();
        
        // Cek cooldown
        if (now - this.lastShootTime < this.shootCooldown) return false;
        
        // Cek ammo
        if (this.currentAmmo <= 0 || this.isReloading) return false;
        
        // Kurangi ammo
        this.currentAmmo--;
        this.lastShootTime = now;
        
        // Buat peluru
        const projectile = this.createProjectile(position);
        this.scene.add(projectile);
        this.projectiles.push(projectile);
        
        return true;
    }

    // --------------------------------------------------------
    // CREATE PROJECTILE - Buat mesh peluru
    // --------------------------------------------------------
    createProjectile(position) {
        // Geometry: silinder kecil (bentuk laser)
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        
        // Material: cyan glowing
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Rotasi agar menghadap depan (sumbu Z)
        mesh.rotation.x = Math.PI / 2;
        
        // Posisi = depan spaceship
        mesh.position.copy(position);
        mesh.position.z -= 1;  // Sedikit di depan
        
        // Kecepatan peluru
        mesh.userData.speed = 0.8;
        
        return mesh;
    }

    // --------------------------------------------------------
    // RELOAD - Isi ulang ammo
    // --------------------------------------------------------
    reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo) return;
        
        this.isReloading = true;
        
        setTimeout(() => {
            this.currentAmmo = this.maxAmmo;
            this.isReloading = false;
        }, this.reloadTime);
    }

    // --------------------------------------------------------
    // UPDATE - Gerakkan semua peluru (panggil tiap frame)
    // --------------------------------------------------------
    update() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Gerak maju (sumbu Z negatif)
            projectile.position.z -= projectile.userData.speed;
            
            // Hapus jika terlalu jauh
            if (projectile.position.z < -50) {
                this.removeProjectile(i);
            }
        }
    }

    // --------------------------------------------------------
    // CHECK COLLISION - Cek tabrakan dengan obstacles
    // obstacles = array meteor dari ObstacleManager
    // Returns: array index obstacle yang kena
    // --------------------------------------------------------
    checkCollision(obstacles) {
        const hitIndices = [];
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let j = 0; j < obstacles.length; j++) {
                const obstacle = obstacles[j];
                const distance = projectile.position.distanceTo(obstacle.position);
                const hitRadius = (obstacle.userData.size || 0.3) + 0.2;
                
                if (distance < hitRadius) {
                    // Catat obstacle yang kena
                    if (!hitIndices.includes(j)) {
                        hitIndices.push(j);
                    }
                    // Hapus peluru
                    this.removeProjectile(i);
                    break;
                }
            }
        }
        
        return hitIndices;
    }

    // --------------------------------------------------------
    // REMOVE PROJECTILE - Hapus peluru dari scene & array
    // --------------------------------------------------------
    removeProjectile(index) {
        const projectile = this.projectiles[index];
        this.scene.remove(projectile);
        projectile.geometry.dispose();
        projectile.material.dispose();
        this.projectiles.splice(index, 1);
    }

    // --------------------------------------------------------
    // CLEAR ALL - Hapus semua peluru (saat reset game)
    // --------------------------------------------------------
    clearAll() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.removeProjectile(i);
        }
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
    }

    // --------------------------------------------------------
    // GETTERS - Untuk UI
    // --------------------------------------------------------
    getAmmoInfo() {
        return {
            current: this.currentAmmo,
            max: this.maxAmmo,
            isReloading: this.isReloading
        };
    }
}
