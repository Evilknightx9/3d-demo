// Framer Import 3D Component Implementation
// https://framer.com/m/Import-3D-OBJ-FBX-Hdnx.js@boIq97YnKyX0IhrsQb0i
// Supports OBJ and FBX file formats

(function() {
    'use strict';
    
    // Wait for Three.js and loaders to be ready
    function initImport3D() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded');
            return;
        }
        
        const container = document.getElementById('model-3d-container');
        if (!container) return;
        
        // Set container styles
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1';
        container.style.opacity = '1'; // Make visible by default
        container.style.transition = 'opacity 0.5s ease';
        
        const { width, height } = container.getBoundingClientRect();
        
        // Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        
        renderer.setSize(width, height);
        // Limit pixel ratio more aggressively for performance
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const maxPixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
        renderer.setPixelRatio(maxPixelRatio);
        container.appendChild(renderer.domElement);
        
        camera.position.set(0, 0, 10);
        
        // Detect device performance - defined at scope level
        function isLowPerformanceDevice() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const isTablet = window.matchMedia('(max-width: 1024px)').matches;
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;
            const deviceMemory = navigator.deviceMemory || 4;
            
            return isMobile || (isTablet && hardwareConcurrency < 4) || deviceMemory < 4;
        }
        
        // Update camera to follow scroll for floating effect - throttled
        let scrollY = 0;
        let scrollRafId = null;
        const handleScroll = () => {
            if (scrollRafId === null) {
                scrollRafId = requestAnimationFrame(() => {
                    scrollY = window.scrollY / window.innerHeight;
                    scrollRafId = null;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Enhanced Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        // Multiple colored lights for better effect
        const light1 = new THREE.DirectionalLight(0x6366f1, 1.2);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        
        const light2 = new THREE.DirectionalLight(0x8b5cf6, 0.8);
        light2.position.set(-5, 3, -5);
        scene.add(light2);
        
        const light3 = new THREE.PointLight(0xa78bfa, 0.6);
        light3.position.set(0, 0, 5);
        scene.add(light3);
        
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.8, 50);
        pointLight1.position.set(3, -3, 3);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.6, 50);
        pointLight2.position.set(-3, 3, 3);
        scene.add(pointLight2);
        
        let currentModel = null;
        let animationMixer = null;
        let clock = new THREE.Clock();
        
        // Create beautiful 3D objects matching the UI
        function createDefaultObjects() {
            const objects = [];
            
            // Create multiple floating geometric shapes with varied sizes
            const geometries = [
                { geo: new THREE.OctahedronGeometry(2, 0), size: 1.2 },
                { geo: new THREE.TetrahedronGeometry(1.8, 0), size: 1.0 },
                { geo: new THREE.IcosahedronGeometry(1.6, 0), size: 1.1 },
                { geo: new THREE.TorusGeometry(1.2, 0.5, 16, 100), size: 1.0 },
                { geo: new THREE.BoxGeometry(2, 2, 2), size: 1.2 },
                { geo: new THREE.DodecahedronGeometry(1.6, 0), size: 1.1 },
                { geo: new THREE.ConeGeometry(1.2, 2.5, 8), size: 1.0 },
                { geo: new THREE.CylinderGeometry(1, 1, 2.5, 16), size: 1.0 },
                { geo: new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16), size: 1.1 },
                { geo: new THREE.SphereGeometry(1.5, 32, 32), size: 1.0 }
            ];
            
            // Color palette for variety
            const colors = [
                0x6366f1, // Indigo
                0x8b5cf6, // Violet
                0xa78bfa, // Purple
                0x7c3aed, // Deep purple
                0x9333ea, // Fuchsia purple
                0xec4899, // Pink
                0x06b6d4, // Cyan
                0x3b82f6  // Blue
            ];
            
            // Distribute objects across the entire page height with better spacing
            const positions = [
                { x: -5, y: 8, z: -2 },   { x: 5, y: 7, z: -3 },   { x: -4, y: 5, z: -2.5 },
                { x: 4, y: 3, z: -3.5 }, { x: -3, y: 1, z: -4 },  { x: 3, y: -1, z: -2.5 },
                { x: -5, y: -3, z: -3 }, { x: 5, y: -5, z: -2.5 }, { x: -2, y: -7, z: -3.5 },
                { x: 2, y: -9, z: -2.5 }
            ];
            
            // Create objects with better materials and effects
            geometries.forEach((geomData, index) => {
                const pos = positions[index % positions.length];
                const color = colors[index % colors.length];
                const size = geomData.size;
                
                // Enhanced wireframe material with glow
                const wireframeMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                
                // Enhanced solid material with better glow
                const solidMaterial = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,
                    roughness: 0.1,
                    emissive: color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                });
                
                // Create wireframe mesh with scaling
                const wireframe = new THREE.Mesh(geomData.geo, wireframeMaterial);
                wireframe.position.set(pos.x, pos.y, pos.z);
                wireframe.scale.set(size, size, size);
                scene.add(wireframe);
                
                // Create solid mesh for depth
                const solid = new THREE.Mesh(geomData.geo, solidMaterial);
                solid.position.set(pos.x, pos.y, pos.z);
                solid.scale.set(size * 0.95, size * 0.95, size * 0.95); // Slightly smaller
                scene.add(solid);
                
                // Add glow effect using additional mesh
                const glowGeometry = geomData.geo.clone();
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.BackSide
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.set(pos.x, pos.y, pos.z);
                glow.scale.set(size * 1.2, size * 1.2, size * 1.2);
                scene.add(glow);
                
                // Store for animation
                objects.push({
                    wireframe: wireframe,
                    solid: solid,
                    glow: glow,
                    basePosition: { x: pos.x, y: pos.y, z: pos.z },
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.015,
                        y: (Math.random() - 0.5) * 0.015,
                        z: (Math.random() - 0.5) * 0.015
                    },
                    floatOffset: Math.random() * Math.PI * 2,
                    floatSpeed: 0.4 + Math.random() * 0.6,
                    pulseSpeed: 0.5 + Math.random() * 0.5
                });
            });
            
            // Reduce particle count on mobile/low-performance devices
            const particleCount = isLowPerformanceDevice() ? 10 : 20;
            
            // Add enhanced floating particles/spheres with varied sizes and colors
            for (let i = 0; i < particleCount; i++) {
                const size = 0.08 + Math.random() * 0.15;
                const geometry = new THREE.SphereGeometry(size, 16, 16);
                const particleColor = colors[Math.floor(Math.random() * colors.length)];
                const material = new THREE.MeshStandardMaterial({
                    color: particleColor,
                    transparent: true,
                    opacity: 0.5 + Math.random() * 0.3,
                    emissive: particleColor,
                    emissiveIntensity: 0.6,
                    metalness: 0.7,
                    roughness: 0.3
                });
                
                const sphere = new THREE.Mesh(geometry, material);
                // Distribute across entire page height
                const yPosition = (Math.random() - 0.5) * 22; // Full page height
                sphere.position.set(
                    (Math.random() - 0.5) * 14,
                    yPosition,
                    (Math.random() - 0.5) * 10 - 5
                );
                scene.add(sphere);
                
                // Add glow to particles
                const glowGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: particleColor,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.BackSide
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.copy(sphere.position);
                scene.add(glow);
                
                objects.push({
                    solid: sphere,
                    glow: glow,
                    basePosition: { 
                        x: sphere.position.x, 
                        y: sphere.position.y, 
                        z: sphere.position.z 
                    },
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.04,
                        y: (Math.random() - 0.5) * 0.04,
                        z: (Math.random() - 0.5) * 0.04
                    },
                    floatOffset: Math.random() * Math.PI * 2,
                    floatSpeed: 0.2 + Math.random() * 0.5,
                    pulseSpeed: 0.3 + Math.random() * 0.4
                });
            }
            
            // Store objects for animation
            window.import3DObjects = objects;
            
            // Show container
            container.style.opacity = '1';
            
            console.log('3D objects created:', objects.length);
        }
        
        // Create default objects immediately
        createDefaultObjects();
        
        // Load OBJ model
        function loadOBJ(url) {
            // Check for OBJLoader
            let OBJLoaderClass = null;
            
            if (typeof THREE.OBJLoader !== 'undefined') {
                OBJLoaderClass = THREE.OBJLoader;
            } else if (typeof window.OBJLoader !== 'undefined') {
                OBJLoaderClass = window.OBJLoader;
            } else {
                console.error('OBJLoader not available. Please ensure OBJLoader.js is loaded.');
                console.log('Available on window:', Object.keys(window).filter(k => k.includes('Loader')));
                return;
            }
            
            const loader = new OBJLoaderClass();
            
            loader.load(
                url,
                function(object) {
                    // Remove previous model and default objects
                    if (currentModel) {
                        scene.remove(currentModel);
                    }
                    
                    // Clear default objects when loading custom model
                    if (window.import3DObjects) {
                        window.import3DObjects.forEach(obj => {
                            if (obj.wireframe) scene.remove(obj.wireframe);
                            if (obj.solid) scene.remove(obj.solid);
                            if (obj.glow) scene.remove(obj.glow);
                        });
                        window.import3DObjects = null;
                    }
                    
                    // Center and scale model
                    object.traverse(function(child) {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x6366f1,
                                metalness: 0.7,
                                roughness: 0.3,
                                emissive: 0x6366f1,
                                emissiveIntensity: 0.2
                            });
                        }
                    });
                    
                    // Calculate bounding box
                    const box = new THREE.Box3().setFromObject(object);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Center the model
                    object.position.sub(center);
                    
                    // Scale to fit
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 3 / maxDim;
                    object.scale.multiplyScalar(scale);
                    
                    scene.add(object);
                    currentModel = object;
                    
                    // Show container (already visible but ensure it stays)
                    container.style.opacity = '1';
                    console.log('OBJ model loaded successfully');
                },
                function(progress) {
                    console.log('Loading OBJ:', (progress.loaded / progress.total * 100) + '%');
                },
                function(error) {
                    console.error('Error loading OBJ:', error);
                }
            );
        }
        
        // Load FBX model
        function loadFBX(url) {
            // Check for FBXLoader
            let FBXLoaderClass = null;
            
            if (typeof THREE.FBXLoader !== 'undefined') {
                FBXLoaderClass = THREE.FBXLoader;
            } else if (typeof window.FBXLoader !== 'undefined') {
                FBXLoaderClass = window.FBXLoader;
            } else {
                console.error('FBXLoader not available. Please ensure FBXLoader.js is loaded.');
                console.log('Available on window:', Object.keys(window).filter(k => k.includes('Loader')));
                return;
            }
            
            const loader = new FBXLoaderClass();
            
            loader.load(
                url,
                function(object) {
                    // Remove previous model and default objects
                    if (currentModel) {
                        scene.remove(currentModel);
                    }
                    
                    // Clear default objects when loading custom model
                    if (window.import3DObjects) {
                        window.import3DObjects.forEach(obj => {
                            if (obj.wireframe) scene.remove(obj.wireframe);
                            if (obj.solid) scene.remove(obj.solid);
                            if (obj.glow) scene.remove(obj.glow);
                        });
                        window.import3DObjects = null;
                    }
                    
                    // Set material
                    object.traverse(function(child) {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x6366f1,
                                metalness: 0.7,
                                roughness: 0.3,
                                emissive: 0x6366f1,
                                emissiveIntensity: 0.2
                            });
                        }
                    });
                    
                    // Calculate bounding box
                    const box = new THREE.Box3().setFromObject(object);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Center the model
                    object.position.sub(center);
                    
                    // Scale to fit
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 3 / maxDim;
                    object.scale.multiplyScalar(scale);
                    
                    scene.add(object);
                    currentModel = object;
                    
                    // Setup animation if available
                    if (object.animations && object.animations.length > 0) {
                        animationMixer = new THREE.AnimationMixer(object);
                        object.animations.forEach((clip) => {
                            animationMixer.clipAction(clip).play();
                        });
                    }
                    
                    // Show container (already visible but ensure it stays)
                    container.style.opacity = '1';
                    console.log('FBX model loaded successfully');
                },
                function(progress) {
                    console.log('Loading FBX:', (progress.loaded / progress.total * 100) + '%');
                },
                function(error) {
                    console.error('Error loading FBX:', error);
                }
            );
        }
        
        // Auto-rotate animation - optimized with frame skipping on slow devices
        let frameSkip = 0;
        const isLowPerf = isLowPerformanceDevice();
        const frameSkipCount = isLowPerf ? 1 : 0; // Skip every other frame on low-end devices
        
        function animate() {
            requestAnimationFrame(animate);
            
            // Skip frames on low-end devices
            if (frameSkipCount > 0 && frameSkip % (frameSkipCount + 1) !== 0) {
                frameSkip++;
                return;
            }
            frameSkip++;
            
            const delta = clock.getDelta();
            
            // Update animation mixer if available
            if (animationMixer) {
                animationMixer.update(delta);
            }
            
            // Rotate current model if loaded
            if (currentModel) {
                currentModel.rotation.y += 0.005;
            }
            
            // Enhanced animation with scroll offset and pulsing effects
            if (window.import3DObjects) {
                const time = clock.getElapsedTime();
                const scrollOffset = scrollY * 2; // Move based on scroll
                
                window.import3DObjects.forEach(obj => {
                    // Animate wireframe
                    if (obj.wireframe) {
                        obj.wireframe.rotation.x += obj.rotationSpeed.x;
                        obj.wireframe.rotation.y += obj.rotationSpeed.y;
                        obj.wireframe.rotation.z += obj.rotationSpeed.z;
                        
                        // Floating animation with scroll parallax
                        const baseY = obj.basePosition.y;
                        const floatY = Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.8;
                        obj.wireframe.position.y = baseY - scrollOffset + floatY;
                        obj.wireframe.position.x = obj.basePosition.x + Math.cos(time * obj.floatSpeed * 0.5 + obj.floatOffset) * 0.3;
                        
                        // Pulsing scale effect
                        if (!obj.wireframe.userData.baseScale) {
                            obj.wireframe.userData.baseScale = obj.wireframe.scale.x;
                        }
                        const pulse = 1 + Math.sin(time * obj.pulseSpeed) * 0.1;
                        obj.wireframe.scale.setScalar(obj.wireframe.userData.baseScale * pulse);
                    }
                    
                    // Animate solid
                    if (obj.solid) {
                        obj.solid.rotation.x += obj.rotationSpeed.x;
                        obj.solid.rotation.y += obj.rotationSpeed.y;
                        obj.solid.rotation.z += obj.rotationSpeed.z;
                        
                        // Sync position with wireframe or float independently
                        if (obj.wireframe) {
                            obj.solid.position.copy(obj.wireframe.position);
                        } else {
                            const baseY = obj.basePosition.y;
                            const floatY = Math.sin(time * obj.floatSpeed + obj.floatOffset) * 0.8;
                            obj.solid.position.y = baseY - scrollOffset + floatY;
                            obj.solid.position.x = obj.basePosition.x + Math.cos(time * obj.floatSpeed * 0.5 + obj.floatOffset) * 0.3;
                        }
                        
                        // Pulsing scale and opacity
                        if (!obj.solid.userData.baseScale) {
                            obj.solid.userData.baseScale = obj.solid.scale.x;
                        }
                        const pulse = 1 + Math.sin(time * obj.pulseSpeed) * 0.1;
                        obj.solid.scale.setScalar(obj.solid.userData.baseScale * pulse);
                        obj.solid.material.opacity = 0.3 + Math.sin(time * obj.pulseSpeed) * 0.2;
                    }
                    
                    // Animate glow
                    if (obj.glow) {
                        if (obj.wireframe) {
                            obj.glow.position.copy(obj.wireframe.position);
                            obj.glow.rotation.copy(obj.wireframe.rotation);
                        } else if (obj.solid) {
                            obj.glow.position.copy(obj.solid.position);
                            obj.glow.rotation.copy(obj.solid.rotation);
                        }
                        
                        // Pulsing glow size and opacity
                        if (!obj.glow.userData.baseScale) {
                            obj.glow.userData.baseScale = obj.glow.scale.x;
                        }
                        const glowPulse = 1 + Math.sin(time * obj.pulseSpeed * 1.2) * 0.2;
                        obj.glow.scale.setScalar(obj.glow.userData.baseScale * glowPulse);
                        obj.glow.material.opacity = 0.15 + Math.sin(time * obj.pulseSpeed * 1.5) * 0.1;
                    }
                });
                
                // Update camera position based on scroll with smooth movement
                camera.position.y = -scrollOffset * 0.5;
                camera.lookAt(0, -scrollOffset * 0.5, 0);
            }
            
            renderer.render(scene, camera);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const { width, height } = container.getBoundingClientRect();
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        
        // Start animation loop
        animate();
        
        // Export functions for external use
        window.import3D = {
            loadOBJ: loadOBJ,
            loadFBX: loadFBX,
            loadModel: function(url) {
                const extension = url.split('.').pop().toLowerCase();
                if (extension === 'obj') {
                    loadOBJ(url);
                } else if (extension === 'fbx') {
                    loadFBX(url);
                } else {
                    console.error('Unsupported file format:', extension);
                }
            },
            setModelPosition: function(x, y, z) {
                if (currentModel) {
                    currentModel.position.set(x, y, z);
                }
            },
            setModelRotation: function(x, y, z) {
                if (currentModel) {
                    currentModel.rotation.set(x, y, z);
                }
            },
            setModelScale: function(x, y, z) {
                if (currentModel) {
                    currentModel.scale.set(x, y, z);
                }
            },
            setCameraPosition: function(x, y, z) {
                camera.position.set(x, y, z);
            },
            show: function() {
                container.style.opacity = '1';
            },
            hide: function() {
                container.style.opacity = '0';
            }
        };
    }
    
    // Initialize when DOM and Three.js are ready
    function checkAndInit() {
        if (typeof THREE !== 'undefined') {
            // Wait a bit more for loaders
            setTimeout(() => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initImport3D);
                } else {
                    initImport3D();
                }
            }, 500);
        } else {
            setTimeout(checkAndInit, 100);
        }
    }
    
    checkAndInit();
})();

