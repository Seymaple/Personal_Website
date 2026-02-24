const menu = document.querySelector('#mobile-menu')
const menuLinks = document.querySelector('.navbar__menu')


menu.addEventListener('click', function () {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
}
);

/* Scroll Animation Observer */
const observerOptions = {
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: "0px 0px -50px 0px" // Trigger slightly before full view
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible'); // Reset animation when out of view
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.video-stream .video-wrapper');
hiddenElements.forEach((el) => observer.observe(el));

/* Detect Scroll Direction and Visibility for Arrows */
let lastScrollTop = 0;
let scrollTimeout;
const body = document.body;

window.addEventListener("scroll", () => {
    // Show arrows while scrolling
    body.classList.add("user-is-scrolling");

    // Clear timeout and hide arrows after scrolling stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        body.classList.remove("user-is-scrolling");
    }, 400); // Arrows stay for 0.4s after stop

    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Enable snapping only after the user has scrolled past the first video
    if (body.classList.contains('animations-page')) {
        const firstVideo = document.querySelector('.video-stream .video-wrapper');
        if (firstVideo) {
            // Trigger earlier: once the first video starts leaving the screen
            const snapThreshold = firstVideo.offsetTop + 100;
            if (scrollTop > snapThreshold) {
                document.documentElement.classList.add("snap-enabled");
            } else {
                document.documentElement.classList.remove("snap-enabled");
            }
        }
    }

    if (scrollTop > lastScrollTop) {
        body.classList.remove("scrolling-up"); // Scrolling Down
    } else {
        body.classList.add("scrolling-up"); // Scrolling Up
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

/* Inject Clickable Scroll Arrows into Video Stream */
const videoWrappers = document.querySelectorAll('.video-stream .video-wrapper');
videoWrappers.forEach((wrapper, index) => {
    // Don't add arrow to the last video
    if (index < videoWrappers.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'scroll-arrow';
        arrow.innerHTML = '▼';

        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const nextVideo = videoWrappers[index + 1];
            if (nextVideo) {
                nextVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        wrapper.appendChild(arrow);
    }
});

/* Video Dot Navigation (Animations Page Only) */
if (document.body.classList.contains('animations-page') && videoWrappers.length > 0) {
    // Build the dot container
    const dotNav = document.createElement('div');
    dotNav.className = 'video-dot-nav';
    document.body.appendChild(dotNav);

    const dots = [];

    videoWrappers.forEach((wrapper, index) => {
        const dot = document.createElement('div');
        dot.className = 'video-dot';
        // Clicking a dot scrolls to that video
        dot.addEventListener('click', () => {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        dotNav.appendChild(dot);
        dots.push(dot);
    });

    // Use IntersectionObserver to mark the centered video's dot as active
    const dotObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const idx = Array.from(videoWrappers).indexOf(entry.target);
            if (idx === -1) return;
            if (entry.isIntersecting) {
                dots.forEach(d => d.classList.remove('active'));
                dots[idx].classList.add('active');
            }
        });
    }, { threshold: 0.5 }); // At least 50% visible = current video

    videoWrappers.forEach(w => dotObserver.observe(w));
}

/* Art Gallery Lightbox Logic — only runs if gallery images exist on this page */
document.addEventListener('DOMContentLoaded', () => {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    if (galleryImages.length === 0) return; // No gallery on this page, skip entirely

    // 1. Create Lightbox Structure
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" src="" alt="Enlarged Image">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    // 2. Open Lightbox on Gallery Image Click
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.classList.add('modal-open');
        });
    });

    // 3. Close Lightbox (on X, background click, or Esc key)
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});