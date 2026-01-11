// ============================================================
// EXPLOSION.JS - PARTICLE EXPLOSION MANAGER
// ============================================================
// Creates particle bursts for visual feedback when collisions occur.
// ============================================================

import * as THREE from 'three';

export class ExplosionManager {
    constructor(scene) {
        this.scene = scene;
        this.explosions = [];
    }

    spawn(position, options = {}) {
        const count = options.count || 30;
        const colors = options.colors || [0xffaa33, 0xff5533, 0xffff66, 0xff3366];
        const maxLife = options.duration || 0.9;
        const particles = [];
        const velocities = [];
        const particleSize = 0.06;
        const sizeVariation = 0.8 + Math.random() * 1.6;
        const speedMin = 1;
        const speedMax = 3;
        const gravityForce = 1.5;

        for (let i = 0; i < count; i++) {
            const geometry = new THREE.SphereGeometry(particleSize * sizeVariation, 6, 6);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);

            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.2,
                Math.random() - 0.5
            ).normalize();
            const speed = speedMin + Math.random() * speedMax;
            const velocity = direction.multiplyScalar(speed);

            this.scene.add(mesh);
            particles.push(mesh);
            velocities.push(velocity);
        }

        this.explosions.push({
            particles,
            velocities,
            life: maxLife,
            maxLife,
            gravity: gravityForce
        });
    }

    update(dt) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= dt;
            const lifeFraction = Math.max(0, explosion.life / explosion.maxLife);

            this.updateParticles(explosion, dt, lifeFraction);

            if (explosion.life <= 0) {
                this.cleanupExplosion(explosion);
                this.explosions.splice(i, 1);
            }
        }
    }

    updateParticles(explosion, dt, lifeFraction) {
        const { particles, velocities, gravity } = explosion;

        for (let j = 0; j < particles.length; j++) {
            const particle = particles[j];
            const velocity = velocities[j];

            particle.position.x += velocity.x * dt;
            particle.position.y += velocity.y * dt;
            particle.position.z += velocity.z * dt;

            velocity.y -= gravity * dt;

            if (particle.material) {
                particle.material.opacity = lifeFraction;
                particle.scale.setScalar(0.5 + (1 - lifeFraction));
            }
        }
    }

    cleanupExplosion(explosion) {
        explosion.particles.forEach((particle) => {
            this.scene.remove(particle);
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
        });
    }
}
