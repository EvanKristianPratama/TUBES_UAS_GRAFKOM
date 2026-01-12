// ============================================================
// EXPLOSION.JS - MODUL EFEK LEDAKAN PARTIKEL
// ============================================================
// Mengatur efek ledakan: spawn partikel, gerak + gravitasi,
// fade out, dan cleanup memory
// ============================================================

import * as THREE from 'three';

// ------------------------------------------------------------
// CLASS EXPLOSION MANAGER - Mengelola semua efek ledakan
// ------------------------------------------------------------
export class ExplosionManager {
    
    // Constructor: scene = THREE.Scene tempat partikel ditaruh
    constructor(scene) {
        this.scene = scene;
        this.explosions = [];  // Array ledakan aktif
    }

    // --------------------------------------------------------
    // SPAWN LEDAKAN BARU
    // --------------------------------------------------------
    // position = Vector3 titik ledakan (misal: meteor.position)
    // options  = { count: 30, colors: [...], duration: 0.9 }
    // --------------------------------------------------------
    spawn(position, options = {}) {
        // Ambil pengaturan (pakai default jika tidak diisi)
        const count = options.count || 30;              // Jumlah partikel
        const colors = options.colors || [0xffaa33, 0xff5533, 0xffff66, 0xff3366];
        const maxLife = options.duration || 0.9;        // Umur dalam detik
        
        // Variabel internal
        const particles = [];
        const velocities = [];
        const particleSize = 0.06;
        const sizeVariation = 0.8 + Math.random() * 1.6;
        const speedMin = 1;
        const speedMax = 3;
        const gravityForce = 1.5;

        // Buat partikel sebanyak 'count'
        for (let i = 0; i < count; i++) {
            // Buat bola kecil (geometry + material)
            const geometry = new THREE.SphereGeometry(particleSize * sizeVariation, 6, 6);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1  });
            const mesh = new THREE.Mesh(geometry, material);
            
            // Posisikan di titik ledakan
            mesh.position.copy(position);

            // Hitung arah acak (normalize = panjang jadi 1)
            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.2,  // Agak condong bawah
                Math.random() - 0.5
            ).normalize();
            
            // Hitung velocity = arah x kecepatan random
            const speed = speedMin + Math.random() * speedMax;
            const velocity = direction.multiplyScalar(speed);

            // Masukkan ke scene dan array
            this.scene.add(mesh);
            particles.push(mesh);
            velocities.push(velocity);
        }

        // Simpan ledakan untuk di-update tiap frame
        this.explosions.push({particles, velocities, life: maxLife, maxLife, gravity: gravityForce });
    }

    // AI REFRENCE
    // --------------------------------------------------------
    // UPDATE SEMUA LEDAKAN (panggil tiap frame)
    // dt = delta time (detik), dari clock.getDelta()
    // --------------------------------------------------------
    update(dt) {
        // Loop mundur (aman untuk splice)
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            
            explosion.life -= dt;  // Kurangi umur
            const lifeFraction = Math.max(0, explosion.life / explosion.maxLife);

            this.updateParticles(explosion, dt, lifeFraction);

            // Hapus jika umur habis
            if (explosion.life <= 0) {
                this.cleanupExplosion(explosion);
                this.explosions.splice(i, 1);
            }
        }
    }
    // AI REFRENCE
    // --------------------------------------------------------
    // UPDATE PARTIKEL: gerak, gravitasi, fade, scale
    // --------------------------------------------------------
    updateParticles(explosion, dt, lifeFraction) {
        const { particles, velocities, gravity } = explosion;

        for (let j = 0; j < particles.length; j++) {
            const particle = particles[j];
            const velocity = velocities[j];

            // Gerakkan partikel (posisi += velocity x dt)
            particle.position.x += velocity.x * dt;
            particle.position.y += velocity.y * dt;
            particle.position.z += velocity.z * dt;

            // Gravitasi: velocity Y berkurang (jatuh)
            velocity.y -= gravity * dt;

            // Efek visual
            if (particle.material) {
                particle.material.opacity = lifeFraction;  // Fade out
                particle.scale.setScalar(0.5 + (1 - lifeFraction));  // Membesar
            }
        }
    }

    // --------------------------------------------------------
    // CLEANUP: Hapus partikel dari scene + dispose memory GPU
    // --------------------------------------------------------
    cleanupExplosion(explosion) {
        explosion.particles.forEach((particle) => {
            this.scene.remove(particle);
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
            }
        );
    }
}
