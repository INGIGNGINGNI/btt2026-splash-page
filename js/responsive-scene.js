const frame = document.querySelector('.splash__frame');
const content = document.querySelector('.splash__content');
const scene = document.querySelector('.splash__scene');
const logoSubtitle = document.querySelector('.splash__logo-sub');

if (frame && content && scene && logoSubtitle) {
    const mobileQuery = window.matchMedia('(max-width: 991px)');
    const desiredGap = 24;
    const firstAssetTopRatio = 0.255;
    let animationFrame = 0;

    const alignScene = () => {
        if (!mobileQuery.matches) {
            scene.classList.remove('is-gap-aligned');
            scene.style.removeProperty('--splash-scene-responsive-top');
            frame.style.removeProperty('min-height');
            content.style.removeProperty('min-height');
            animationFrame = 0;
            return;
        }

        // Landscape lets the content column scroll; after rotating back to the locked portrait
        // layout that offset would be stuck, so drop it.
        if (content.scrollTop && getComputedStyle(content).overflowY === 'hidden') {
            content.scrollTop = 0;
        }

        const frameBounds = frame.getBoundingClientRect();
        const subtitleBounds = logoSubtitle.getBoundingClientRect();
        const sceneBounds = scene.getBoundingClientRect();
        // The scene sits outside the scrolling column, so measure the subtitle as if unscrolled.
        const top = subtitleBounds.bottom + content.scrollTop - frameBounds.top
            + desiredGap
            - sceneBounds.height * firstAssetTopRatio;

        scene.style.setProperty('--splash-scene-responsive-top', `${top}px`);
        scene.classList.add('is-gap-aligned');
        frame.style.removeProperty('min-height');
        content.style.removeProperty('min-height');
        animationFrame = 0;
    };

    const scheduleAlignment = () => {
        if (animationFrame) return;
        animationFrame = requestAnimationFrame(alignScene);
    };

    const resizeObserver = new ResizeObserver(scheduleAlignment);
    resizeObserver.observe(frame);
    resizeObserver.observe(scene);
    resizeObserver.observe(logoSubtitle);

    mobileQuery.addEventListener('change', scheduleAlignment);
    window.addEventListener('resize', scheduleAlignment, { passive: true });
    window.addEventListener('load', scheduleAlignment, { once: true });

    if (document.fonts?.ready) {
        document.fonts.ready.then(scheduleAlignment);
    }

    scheduleAlignment();
}
