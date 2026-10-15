const video = document.querySelector('.splash__background-video');

if (video) {
    const playSilently = async () => {
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');

        try {
            await video.play();
            video.classList.add('is-active');
        } catch {
            // The poster remains visible if the browser blocks autoplay.
        }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        playSilently();
    } else {
        video.addEventListener('canplay', playSilently, { once: true });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
            return;
        }

        playSilently();
    });

    window.addEventListener('pageshow', playSilently);
    document.addEventListener('touchstart', playSilently, {
        once: true,
        passive: true,
    });
}
