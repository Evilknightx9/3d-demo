// Three.js Animated Cubes with Anime.js
// Wait for both libraries to load
(function() {
    function initCubes() {
        // Check if both libraries are available
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded');
            return;
        }
        
        // Check for animejs with new API or use fallback
        let engine, createTimeline, utils;
        
        if (window.animejs && window.animejs.engine && window.animejs.createTimeline && window.animejs.utils) {
            // New API available
            engine = window.animejs.engine;
            createTimeline = window.animejs.createTimeline;
            utils = window.animejs.utils;
        } else {
            // Fallback: Create simplified versions
            console.warn('Anime.js new API not available, using fallback implementation');
            engine = {
                useDefaultMainLoop: false,
                update: function() {
                    // Manual update for animations
                }
            };
            
            // Fallback createTimeline using standard anime.js
            createTimeline = function(options) {
                const defaults = options.defaults || {};
                const timeline = {
                    animations: [],
                    add: function(target, props, offset) {
                        this.animations.push({ target, props, offset });
                        return this;
                    },
                    init: function() {
                        this.animations.forEach(anim => {
                            if (typeof anime !== 'undefined') {
                                // Handle function props
                                const processedProps = {};
                                Object.keys(anim.props).forEach(key => {
                                    processedProps[key] = typeof anim.props[key] === 'function' 
                                        ? anim.props[key]() 
                                        : anim.props[key];
                                });
                                
                                anime({
                                    targets: anim.target,
                                    ...processedProps,
                                    delay: (options.delay || 0) + (anim.offset || 0),
                                    duration: defaults.duration || 4000,
                                    easing: defaults.ease || 'easeInOutSine',
                                    loop: defaults.loop || true
                                });
                            }
                        });
                    }
                };
                return timeline;
            };
            
            // Fallback utils
            utils = {
                random: function(min, max, decimals) {
                    const value = Math.random() * (max - min) + min;
                    return decimals ? parseFloat(value.toFixed(decimals)) : value;
                },
                $: function(selector) {
                    return Array.from(document.querySelectorAll(selector));
                },
                get: function(element, property) {
                    return getComputedStyle(element)[property];
                }
            };
        }
        
        // Prevents Anime.js from using its own loop
        if (engine && typeof engine.useDefaultMainLoop !== 'undefined') {
            engine.useDefaultMainLoop = false;
        }
        
        const $container = document.querySelector('.cubes-container');
        if (!$container) return;
        
        // Set container style
        $container.style.position = 'fixed';
        $container.style.top = '0';
        $container.style.left = '0';
        $container.style.width = '100%';
        $container.style.height = '100%';
        $container.style.pointerEvents = 'none';
        $container.style.zIndex = '0';
        
        const color = '#6366f1'; // Purple color
        const { width, height } = $container.getBoundingClientRect();
        
        // Three.js setup - optimized for performance
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: !isMobile, // Disable antialiasing on mobile
            powerPreference: "high-performance",
            stencil: false,
            depth: true
        });
        renderer.shadowMap.enabled = false; // Disable shadows
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        // Shared geometry for all cubes - better performance
        const geometry = new THREE.BoxGeometry(4, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: color, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        renderer.setSize(width, height);
        // Limit pixel ratio more aggressively for performance
        const maxPixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
        renderer.setPixelRatio(maxPixelRatio);
        $container.appendChild(renderer.domElement);
        camera.position.z = 8; // Pulled back to see larger cubes
        
        function createAnimatedCube() {
            // Create main cube - removed glow cube for better performance
            const cube = new THREE.Mesh(geometry, material);
            
            // Removed glow cube mesh to reduce draw calls and improve performance
            
            const x = utils.random(-15, 15, 2); // Larger range
            const y = utils.random(-8, 8, 2); // Larger range
            const z = [-15, 10]; // Larger depth range
            const r = () => utils.random(-Math.PI * 2, Math.PI * 2, 3);
            const duration = 4000;
            
            createTimeline({
                delay: utils.random(0, duration),
                defaults: { loop: true, duration, ease: 'inSine' },
            })
            .add(cube.position, { x, y, z }, 0)
            .add(cube.rotation, { x: r, y: r, z: r }, 0)
            .init();
            
            scene.add(cube);
        }
        
        // Detect device performance and adjust cube count
        function isLowPerformanceDevice() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const isTablet = window.matchMedia('(max-width: 1024px)').matches;
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;
            const deviceMemory = navigator.deviceMemory || 4;
            
            return isMobile || (isTablet && hardwareConcurrency < 4) || deviceMemory < 4;
        }
        
        // Further reduce cube count for better performance
        const cubeCount = isLowPerformanceDevice() ? 5 : 10; // Reduced from 8/15
        
        // Create cubes for better visibility
        for (let i = 0; i < cubeCount; i++) {
            createAnimatedCube();
        }
        
        function render() {
            if (engine && typeof engine.update === 'function') {
                engine.update(); // Manually update Anime.js engine
            }
            renderer.render(scene, camera); // Render Three.js scene
        }
        
        // Calls the builtin Three.js animation loop
        renderer.setAnimationLoop(render);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const { width, height } = $container.getBoundingClientRect();
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    }
    
    // Wait for libraries to load
    function checkAndInit() {
        if (typeof THREE !== 'undefined' && window.animejs && window.animejs.engine && window.animejs.createTimeline) {
            // Delay initialization for better performance
            setTimeout(initCubes, 1000);
        } else {
            // Retry after a short delay
            setTimeout(checkAndInit, 100);
        }
    }
    
    // Start checking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndInit);
    } else {
        checkAndInit();
    }
})();

