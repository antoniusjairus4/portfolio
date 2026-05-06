document.addEventListener('DOMContentLoaded', () => {
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    document.body.appendChild(spotlight);

    const bentoElements = document.querySelectorAll('.magic-bento-card');

    document.addEventListener('mousemove', (e) => {
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'none'
        });

        bentoElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            
            // Map mouse to local card coordinates
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty('--glow-x', `${x}%`);
            el.style.setProperty('--glow-y', `${y}%`);

            // Proximity intensity calculation
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            
            // Increased detection sensitivity (450px)
            const intensity = Math.max(0, 1 - dist / 450);
            el.style.setProperty('--glow-intensity', intensity);
            
            if (intensity > 0) {
                gsap.to(spotlight, { opacity: intensity * 0.8, duration: 0.1 });
            }
        });
    });

    // Reset spotlight when leaving viewport
    document.addEventListener('mouseleave', () => {
        gsap.to(spotlight, { opacity: 0, duration: 0.3 });
    });

    // Add Tilt for all bento cards (Headers and Images)
    bentoElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const rotateX = ((e.clientY - (rect.top + rect.height/2)) / (rect.height/2)) * -6;
            const rotateY = ((e.clientX - (rect.left + rect.width/2)) / (rect.width/2)) * 6;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.2,
                transformPerspective: 1000,
                ease: 'power1.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // Fade-in Observer
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
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
});