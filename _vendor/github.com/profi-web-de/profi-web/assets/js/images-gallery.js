(() => {
    const gallery = document.querySelector('[data-image-gallery]');
    const dialog = document.getElementById('image-lightbox');
    const preview = document.getElementById('image-lightbox-preview');
    const title = document.getElementById('image-lightbox-title');
    const caption = document.getElementById('image-lightbox-caption');
    const prevButton = dialog?.querySelector('.image-lightbox-nav--prev');
    const nextButton = dialog?.querySelector('.image-lightbox-nav--next');
    const triggers = Array.from(document.querySelectorAll('.gallery-lightbox-trigger'));

    if (!gallery || !dialog || !preview || !title || !caption || !prevButton || !nextButton || triggers.length === 0 || typeof dialog.showModal !== 'function') {
        return;
    }

    let currentIndex = 0;

    const items = triggers
        .map((trigger, index) => ({
            index,
            src: trigger.dataset.lightboxSrc || '',
            alt: trigger.dataset.lightboxAlt || '',
            title: trigger.dataset.lightboxTitle || '',
            description: trigger.dataset.lightboxDescription || '',
        }))
        .filter((item) => item.src);

    if (items.length === 0) {
        return;
    }

    const updateNav = () => {
        const isSingle = items.length < 2;
        prevButton.disabled = isSingle;
        nextButton.disabled = isSingle;
    };

    const render = (index) => {
        const normalizedIndex = ((index % items.length) + items.length) % items.length;
        const item = items[normalizedIndex];

        currentIndex = normalizedIndex;
        preview.src = item.src;
        preview.alt = item.alt || item.title;
        title.textContent = item.title;
        caption.textContent = item.description;
        updateNav();
    };

    const openAt = (index) => {
        render(index);
        if (!dialog.open) {
            dialog.showModal();
        }
    };

    const closeDialogState = () => {
        preview.src = '';
        preview.alt = '';
        title.textContent = '';
        caption.textContent = '';
    };

    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => {
            openAt(index);
        });
    });

    prevButton.addEventListener('click', () => {
        openAt(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        openAt(currentIndex + 1);
    });

    dialog.addEventListener('click', (event) => {
        const frame = dialog.querySelector('.image-lightbox-frame');
        if (frame && !frame.contains(event.target)) {
            dialog.close();
        }
    });

    dialog.addEventListener('keydown', (event) => {
        if (!dialog.open) {
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            openAt(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            openAt(currentIndex + 1);
        }
    });

    dialog.addEventListener('close', closeDialogState);
})();