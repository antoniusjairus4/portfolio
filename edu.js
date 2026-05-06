document.addEventListener('DOMContentLoaded', () => {
    // 1. Create Global Spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    const cards = document.querySelectorAll('.magic-bento-card');

    // 2. Global Mouse Tracking
    document.addEventListener('mousemove', (e) => {
        // Move spotlight
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.15,
            ease: 'power2.out'
        });

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            
            // Calculate Glow Position
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--glow-x', `${x}%`);
            card.style.setProperty('--glow-y', `${y}%`);

            // Intensity based on distance to card center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            
            const intensity = Math.max(0, 1 - dist / 500);
            card.style.setProperty('--glow-intensity', intensity);
            
            if (intensity > 0) {
                gsap.to(spotlight, { opacity: intensity * 0.7, duration: 0.2 });
            }
        });
    });

    // 3. Card-Specific Tilt Effect
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    // 4. Fade-in Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});