const frame = document.querySelector('.splash__frame');
const content = document.querySelector('.splash__content');
const scene = document.querySelector('.splash__scene');
const logoSubtitle = document.querySelector('.splash__logo-sub');

if (frame && content && scene && logoSubtitle) {
    const mobileQuery = window.matchMedia('(max-width: 991px)');
    const tabletQuery = window.matchMedia('(min-width: 576px)');
    const tallTabletQuery = window.matchMedia(
        '(min-width: 768px) and (max-width: 991px) and (min-height: 900px)',
    );
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

        const frameBounds = frame.getBoundingClientRect();
        const subtitleBounds = logoSubtitle.getBoundingClientRect();
        const sceneBounds = scene.getBoundingClientRect();
        const top = subtitleBounds.bottom - frameBounds.top
            + desiredGap
            - sceneBounds.height * firstAssetTopRatio;

        scene.style.setProperty('--splash-scene-responsive-top', `${top}px`);
        scene.classList.add('is-gap-aligned');

        const visualBottom = [scene, ...scene.querySelectorAll('*')]
            .reduce((lowestEdge, element) => {
                const elementBounds = element.getBoundingClientRect();
                return Math.max(lowestEdge, elementBounds.bottom - frameBounds.top);
            }, 0);
        const responsiveBaseHeight = document.documentElement.clientHeight
            + (tabletQuery.matches && !tallTabletQuery.matches ? 96 : 0);
        const requiredHeight = Math.ceil(
            tallTabletQuery.matches
                ? responsiveBaseHeight
                : Math.max(responsiveBaseHeight, visualBottom),
        );

        frame.style.minHeight = `${requiredHeight}px`;
        content.style.minHeight = `${requiredHeight}px`;
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
    tallTabletQuery.addEventListener('change', scheduleAlignment);
    window.addEventListener('resize', scheduleAlignment, { passive: true });
    window.addEventListener('load', scheduleAlignment, { once: true });

    if (document.fonts?.ready) {
        document.fonts.ready.then(scheduleAlignment);
    }

    scheduleAlignment();
}
