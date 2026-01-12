import { useEffect, useRef } from 'react';
import styles from '@/styles/ParticleBackground.module.css';

export default function ParticleBackground() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
        let isRunning = true;

        // Initialize mouse position
        mouseRef.current = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        };

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            mouseRef.current.x = canvas.width / 2;
            mouseRef.current.y = canvas.height / 2;
            mouseRef.current.targetX = canvas.width / 2;
            mouseRef.current.targetY = canvas.height / 2;
        };
        resizeCanvas();

        // Track mouse movement
        const handleMouseMove = (e) => {
            mouseRef.current.targetX = e.clientX;
            mouseRef.current.targetY = e.clientY;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        // Particle class
        class Particle {
            constructor(originX, originY) {
                this.originX = originX;
                this.originY = originY;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = 0.5 + Math.random() * 0.5;
                this.distance = 0;
                this.maxDistance = 200 + Math.random() * 100;
                this.size = 1.5 + Math.random() * 1.5;
                this.baseOpacity = 0.4 + Math.random() * 0.3;
            }

            update() {
                this.distance += this.speed;
                return this.distance < this.maxDistance;
            }

            draw(ctx) {
                const x = this.originX + Math.cos(this.angle) * this.distance;
                const y = this.originY + Math.sin(this.angle) * this.distance;

                // Smooth fade in and out
                const fadeIn = Math.min(this.distance / 30, 1);
                const fadeOut = Math.max(0, 1 - (this.distance / this.maxDistance));
                const opacity = this.baseOpacity * fadeIn * fadeOut;

                if (opacity > 0.01) {
                    ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Optimized particle count based on screen size
        const getParticleCount = () => {
            const area = canvas.width * canvas.height;
            return Math.min(100, Math.floor(area / 20000));
        };

        let particleSpawnCounter = 0;
        const spawnInterval = 2; // Spawn particles every N frames

        // Animation loop
        const animate = () => {
            if (!isRunning) return;

            // Smooth mouse following
            const mouse = mouseRef.current;
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            // CRITICAL: Complete frame clear - no trail effect
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const alive = particles[i].update();
                if (alive) {
                    particles[i].draw(ctx);
                } else {
                    particles.splice(i, 1);
                }
            }

            // Spawn new particles at controlled rate
            particleSpawnCounter++;
            if (particleSpawnCounter >= spawnInterval) {
                particleSpawnCounter = 0;
                const maxParticles = getParticleCount();

                if (particles.length < maxParticles) {
                    // Spawn multiple particles per interval for smooth effect
                    const spawnCount = Math.min(3, maxParticles - particles.length);
                    for (let i = 0; i < spawnCount; i++) {
                        particles.push(new Particle(mouse.x, mouse.y));
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Cleanup
        return () => {
            isRunning = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            particlesRef.current = [];
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={styles.particleCanvas}
        />
    );
}
