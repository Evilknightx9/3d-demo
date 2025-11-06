// Hide loading screen when page is ready
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 300);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Throttle function for performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Navbar scroll effect - throttled
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

const handleNavbarScroll = throttle(() => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
}, 16); // ~60fps

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .project-card, .skill-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Here you would typically send the data to a server
        console.log('Form submitted:', { name, email, message });
        
        // Show success message (you can customize this)
        alert('Thank you for your message! I will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// Video play/pause on hover (optional enhancement)
const video = document.querySelector('.hero-video video');
if (video) {
    video.addEventListener('mouseenter', () => {
        // Video will continue playing as it's set to autoplay
    });
}

// Parallax effect for hero section - throttled with requestAnimationFrame
let rafId = null;
const handleParallax = () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        }
    }
    rafId = null;
};

const handleParallaxScroll = throttle(() => {
    if (rafId === null) {
        rafId = requestAnimationFrame(handleParallax);
    }
}, 16);

window.addEventListener('scroll', handleParallaxScroll, { passive: true });

// Add active state to navigation based on scroll position - throttled
const sections = document.querySelectorAll('section[id]');

const handleNavActive = throttle(() => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, 100); // Update every 100ms instead of every scroll

window.addEventListener('scroll', handleNavActive, { passive: true });


// 3D Tilt Effect for Cards - optimized with throttling
function init3DTiltEffect() {
    // Only enable on non-touch devices for better performance
    if (window.matchMedia('(pointer: coarse)').matches) {
        return; // Disable on touch devices
    }
    
    const projectCards = document.querySelectorAll('.project-card');
    const skillCards = document.querySelectorAll('.skill-item');
    
    // Throttled mousemove handler
    const handleCardMove = (card, isProject) => {
        let rafId = null;
        const handler = (e) => {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const divisor = isProject ? 15 : 20;
                    const translateY = isProject ? -12 : -8;
                    const scale = isProject ? 1.03 : 1.02;
                    
                    const rotateX = (y - centerY) / divisor;
                    const rotateY = (centerX - x) / divisor;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) scale(${scale})`;
                    rafId = null;
                });
            }
        };
        
        card.addEventListener('mousemove', handler, { passive: true });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = isProject ? 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)' : 'all 0.3s ease';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    };
    
    // Project cards - more dramatic tilt
    projectCards.forEach(card => handleCardMove(card, true));
    
    // Skill cards - subtle tilt
    skillCards.forEach(card => handleCardMove(card, false));
}

// Initialize 3D tilt effect when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DTiltEffect);
} else {
    init3DTiltEffect();
}

