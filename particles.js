// Particle Animation using Anime.js
// Adapted for modern black UI portfolio

let particleAnimations = [];

// Initialize particles after page load for better performance
window.addEventListener('load', function() {
    // Delay particle initialization to prevent blocking
    setTimeout(() => {
        // Check if anime is available (might be different versions)
        if (typeof anime === 'undefined' && typeof window.animejs === 'undefined') {
            console.warn('Anime.js not loaded, using fallback animation');
            initParticlesFallback();
            return;
        }

        // Try to use the provided API structure
        try {
            initParticlesAnime();
        } catch (e) {
            console.warn('Anime.js API not compatible, using fallback:', e);
            initParticlesFallback();
        }
    }, 500);
});

function initParticlesAnime() {
    // Try to use the new animejs API if available
    const container = document.querySelector('.particle-container');
    if (!container) return;

        // Check for new API
        if (window.animejs && window.animejs.engine && window.animejs.animate && window.animejs.utils) {
            const { engine, animate, utils } = window.animejs;
            
            // Reduce particle count on mobile/low-performance devices
            const particleCount = isLowPerformanceDevice() ? 15 : 30;
            
            for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            container.appendChild(particle);
            
            const anim = animate(particle, {
                x: utils.random(-10, 10, 2) + 'rem',
                y: utils.random(-3, 3, 2) + 'rem',
                scale: [{ from: 0, to: 1 }, { to: 0 }],
                delay: utils.random(0, 1000),
                loop: true,
            });
            
            if (anim) {
                particleAnimations.push(anim);
            }
        }
    } else {
        // Fallback to standard anime.js
        initParticlesFallback();
    }
}

// Detect device performance
function isLowPerformanceDevice() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTablet = window.matchMedia('(max-width: 1024px)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4;
    
    return isMobile || (isTablet && hardwareConcurrency < 4) || deviceMemory < 4;
}

function initParticlesFallback() {
    const container = document.querySelector('.particle-container');
    if (!container) return;

    // Reduce particle count on mobile/low-performance devices
    const particleCount = isLowPerformanceDevice() ? 15 : 30;

    // Create particles with standard anime.js or CSS animations
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        container.appendChild(particle);
        
        // Random starting position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const size = Math.random() * 6 + 4; // Bigger size range (4-10px)
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Use anime.js if available
        if (typeof anime !== 'undefined') {
            const anim = anime({
                targets: particle,
                x: [
                    { value: anime.random(-100, 100) + 'px' },
                    { value: anime.random(-100, 100) + 'px' }
                ],
                y: [
                    { value: anime.random(-30, 30) + 'px' },
                    { value: anime.random(-30, 30) + 'px' }
                ],
                rotateX: [
                    { value: anime.random(0, 360) + 'deg' },
                    { value: anime.random(0, 360) + 'deg' }
                ],
                rotateY: [
                    { value: anime.random(0, 360) + 'deg' },
                    { value: anime.random(0, 360) + 'deg' }
                ],
                rotateZ: [
                    { value: anime.random(0, 360) + 'deg' },
                    { value: anime.random(0, 360) + 'deg' }
                ],
                scale: [
                    { value: 0 },
                    { value: 1, duration: 500 },
                    { value: 0, duration: 500 }
                ],
                opacity: [
                    { value: 0 },
                    { value: 1, duration: 500 },
                    { value: 0, duration: 500 }
                ],
                delay: anime.random(0, 1000),
                duration: duration * 1000,
                loop: true,
                easing: 'easeInOutQuad'
            });
            particleAnimations.push(anim);
        } else {
            // Pure CSS animation fallback
            const randomDelay = Math.random() * 2;
            particle.style.animation = `particleFloat ${duration}s ${randomDelay}s infinite ease-in-out`;
            particle.style.opacity = '0';
        }
    }
}

