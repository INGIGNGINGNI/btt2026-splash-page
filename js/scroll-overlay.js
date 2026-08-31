const frame = document.querySelector('.splash__frame');

if (frame) {
    let animationFrame = 0;

    const updateOverlay = () => {
        frame.classList.toggle('is-scrolled', window.scrollY > 1);
        animationFrame = 0;
    };

    const handleScroll = () => {
        if (animationFrame) return;
        animationFrame = requestAnimationFrame(updateOverlay);
    };

    updateOverlay();
    window.addEventListener('scroll', handleScroll, { passive: true });
}
