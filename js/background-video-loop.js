const videos = [...document.querySelectorAll('.splash__background-video')];

if (videos.length >= 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const crossfadeSeconds = 1.2;
    const crossfadeMilliseconds = crossfadeSeconds * 1000;
    let activeIndex = 0;
    let isCrossfading = false;
    let animationFrame = 0;
    let swapTimer = 0;

    const activeVideo = () => videos[activeIndex];
    const standbyVideo = () => videos[(activeIndex + 1) % videos.length];

    const playSilently = async (video) => {
        try {
            await video.play();
            return true;
        } catch {
            return false;
        }
    };

    const finishCrossfade = (outgoing, incoming) => {
        outgoing.pause();
        outgoing.currentTime = 0;
        outgoing.classList.remove('is-active');
        incoming.classList.add('is-active');
        activeIndex = (activeIndex + 1) % videos.length;
        isCrossfading = false;
    };

    const beginCrossfade = async () => {
        if (isCrossfading) return;

        const outgoing = activeVideo();
        const incoming = standbyVideo();
        if (incoming.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

        isCrossfading = true;
        incoming.currentTime = 0;

        if (!await playSilently(incoming)) {
            isCrossfading = false;
            return;
        }

        incoming.classList.add('is-active');
        requestAnimationFrame(() => outgoing.classList.remove('is-active'));
        clearTimeout(swapTimer);
        swapTimer = window.setTimeout(
            () => finishCrossfade(outgoing, incoming),
            crossfadeMilliseconds,
        );
    };

    const monitorPlayback = () => {
        const video = activeVideo();
        const remaining = video.duration - video.currentTime;

        if (Number.isFinite(remaining) && remaining <= crossfadeSeconds) {
            beginCrossfade();
        }

        animationFrame = requestAnimationFrame(monitorPlayback);
    };

    const start = async () => {
        const firstVideo = activeVideo();
        firstVideo.currentTime = 0;

        if (!await playSilently(firstVideo)) return;

        firstVideo.classList.add('is-active');
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(monitorPlayback);
    };

    videos.forEach((video) => {
        video.loop = false;
        video.muted = true;
        video.addEventListener('ended', beginCrossfade);
    });

    if (activeVideo().readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        start();
    } else {
        activeVideo().addEventListener('canplay', start, { once: true });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            videos.forEach(video => video.pause());
            return;
        }

        playSilently(activeVideo());
    });
}
