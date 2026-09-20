(() => {
    const carousel = document.querySelector('[data-home-carousel]');
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const intervalMs = Number(carousel.dataset.intervalMs || 4000);
    let activeIndex = 0;

    window.setInterval(() => {
        slides[activeIndex].classList.remove('is-active');
        activeIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex].classList.add('is-active');
    }, intervalMs);
})();