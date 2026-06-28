const videos = document.querySelectorAll('.video');
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const closeBtn = document.querySelector('.close-btn');

const videoVolumes = {
    1:  0.99, 2:  0.55, 3:  0.25, 4:  0.90,
    5:  0.70, 6:  0.60, 7:  0.45, 8:  0.15,
    9:  0.20,10: 0.55,11: 0.80,12: 0.60,
    13: 0.15,14: 0.40,15: 0.40,16: 0.15,
    17: 0.15,18: 0.55,19: 0.50,20: 0.70,
    21: 0.55,22: 0.40,23: 0.30,24: 0.65
};

const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 window.innerWidth <= 768;

let currentPlaying = null;
let hasInteracted = false;

// Enable playback after first interaction
document.addEventListener('click', () => { hasInteracted = true; }, { once: true });
document.addEventListener('touchstart', () => { hasInteracted = true; }, { once: true });

// ====================== DESKTOP HOVER ======================
if (!isMobile) {
    videos.forEach((video, index) => {
        const videoNumber = index + 1;
        const maxVol = videoVolumes[videoNumber] || 0.70;

        video.addEventListener('pointerenter', () => {
            if (!hasInteracted) return;
            videos.forEach(v => {
                if (v !== video) {
                    v.pause();
                    v.volume = 0;
                }
            });
            video.currentTime = 0;
            video.volume = 0;
            video.play().catch(() => {});
            fadeAudio(video, maxVol, 400);
        });

        video.addEventListener('pointerleave', () => {
            if (!hasInteracted) return;
            fadeAudio(video, 0, 300);
            setTimeout(() => video.pause(), 350);
        });
    });
}

// ====================== MOBILE CENTER PLAYBACK ======================
if (isMobile) {
    videos.forEach(video => video.style.pointerEvents = 'none');

    const observer = new IntersectionObserver((entries) => {
        if (!hasInteracted) return;

        let bestVideo = null;
        let bestScore = Infinity;

        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                entry.target.classList.remove('active-video');
                return;
            }

            const rect = entry.target.getBoundingClientRect();
            const distance = Math.abs((rect.top + rect.height / 2) - (window.innerHeight / 2));

            if (distance < bestScore) {
                bestScore = distance;
                bestVideo = entry.target;
            }
        });

        if (bestVideo && bestVideo !== currentPlaying) {
            if (currentPlaying) {
                currentPlaying.pause();
                currentPlaying.classList.remove('active-video');
            }

            const index = Array.from(videos).indexOf(bestVideo);
            const maxVol = videoVolumes[index + 1] || 0.70;

            bestVideo.currentTime = 0;
            bestVideo.volume = maxVol;
            bestVideo.play().catch(() => {});
            bestVideo.classList.add('active-video');

            currentPlaying = bestVideo;
        }
    }, {
        threshold: 0.55,
        rootMargin: "-25% 0px -25% 0px"
    });

    videos.forEach(video => observer.observe(video));
}

// ====================== CLICK TO MODAL (Desktop only) ======================
videos.forEach(video => {
    video.addEventListener('click', (e) => {
        if (isMobile) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

        videos.forEach(v => {
            if (v !== video) v.pause();
        });

        modalVideo.src = video.src;
        modalVideo.currentTime = video.currentTime;
        modalVideo.volume = videoVolumes[Array.from(videos).indexOf(video) + 1] || 0.70;
        modal.style.display = 'flex';
        modalVideo.play().catch(() => {});
    });
});

// ====================== LOADING SPINNER ======================
videos.forEach(video => {
    const card = video.parentElement;
    
    // Show loading state
    card.classList.add('loading');

    video.addEventListener('loadeddata', () => {
        card.classList.remove('loading');
        card.classList.add('loaded');
    });

    video.addEventListener('canplay', () => {
        card.classList.remove('loading');
        card.classList.add('loaded');
    });

    // Fallback for cached videos
    if (video.readyState >= 2) {
        card.classList.remove('loading');
        card.classList.add('loaded');
    }
});

// Close modal
function closeModal() {
    modalVideo.pause();
    modal.style.display = 'none';
    modalVideo.src = '';
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Fade function
function fadeAudio(video, targetVolume, duration) {
    const startVolume = video.volume;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        video.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            video.volume = targetVolume;
        }
    }
    animate();
}