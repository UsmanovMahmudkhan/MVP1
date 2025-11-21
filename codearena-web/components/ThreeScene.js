'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from '@/styles/ThreeScene.module.css';

export default function ThreeScene() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let isRunning = true;
        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 8;

        // Renderer setup with optimizations
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 1);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
        pointLight.position.set(0, 0, 10);
        scene.add(pointLight);

        // Texture loader
        const textureLoader = new THREE.TextureLoader();

        // Create logo planes with actual images from CDN
        const createLogoPlane = (imageUrl, position, scale = 2.5) => {
            return new Promise((resolve) => {
                textureLoader.load(
                    imageUrl,
                    (texture) => {
                        const geometry = new THREE.PlaneGeometry(scale, scale);
                        const material = new THREE.MeshStandardMaterial({
                            map: texture,
                            transparent: true,
                            side: THREE.DoubleSide,
                            metalness: 0.1,
                            roughness: 0.6
                        });

                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.position.copy(position);
                        resolve(mesh);
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading texture:', error);
                        // Fallback to a simple colored plane
                        const geometry = new THREE.PlaneGeometry(scale, scale);
                        const material = new THREE.MeshStandardMaterial({
                            color: position.x < 0 ? 0x3b82f6 : 0xf7df1e,
                            transparent: true,
                            opacity: 0.8
                        });
                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.position.copy(position);
                        resolve(mesh);
                    }
                );
            });
        };

        // Official logo URLs from devicon CDN
        const javaLogoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg';
        const jsLogoUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg';

        let javaLogo, jsLogo;

        // Load logos
        Promise.all([
            createLogoPlane(javaLogoUrl, new THREE.Vector3(-3.5, 0, 0)),
            createLogoPlane(jsLogoUrl, new THREE.Vector3(3.5, 0, 0))
        ]).then(([java, js]) => {
            javaLogo = java;
            jsLogo = js;
            scene.add(javaLogo);
            scene.add(jsLogo);
        });

        // Animation variables
        let time = 0;

        // Animation loop
        const animate = () => {
            if (!isRunning) return;

            time += 0.01;

            // Animate logos if they're loaded
            if (javaLogo) {
                javaLogo.rotation.y = Math.sin(time * 0.5) * 0.3;
                javaLogo.position.y = Math.sin(time * 0.8) * 0.4;
                javaLogo.rotation.z = Math.sin(time * 0.3) * 0.05;
            }

            if (jsLogo) {
                jsLogo.rotation.y = Math.sin(time * 0.5 + Math.PI) * 0.3;
                jsLogo.position.y = Math.sin(time * 0.8 + Math.PI) * 0.4;
                jsLogo.rotation.z = Math.sin(time * 0.3 + Math.PI) * 0.05;
            }

            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Start animation
        animate();

        // Cleanup
        return () => {
            isRunning = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);

            // Dispose of Three.js resources
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.map) object.material.map.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            if (renderer) {
                renderer.dispose();
                if (container && renderer.domElement) {
                    container.removeChild(renderer.domElement);
                }
            }
        };
    }, []);

    return <div ref={containerRef} className={styles.threeContainer} />;
}
