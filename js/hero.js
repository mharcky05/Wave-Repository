// ===== HERO CAROUSEL FUNCTIONALITY =====
document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.hero .carousel-image');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let current = 0;

    // ===== IMAGE DISPLAY CONTROL =====
    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
        current = index;
    }

    // ===== NAVIGATION FUNCTIONS =====
    function showNextImage() {
        showImage((current + 1) % images.length);
    }

    function showPrevImage() {
        showImage((current - 1 + images.length) % images.length);
    }

    // ===== DOT INDICATOR CLICK HANDLERS =====
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showImage(index);
        });
    });

    // ===== NAVIGATION BUTTON HANDLERS =====
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);

    // ===== AUTO-SLIDE INTERVAL =====
    setInterval(showNextImage, 5000);
});
