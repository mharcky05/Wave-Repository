document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.hero .carousel-image');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let current = 0;

    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
        current = index;
    }

    function showNextImage() {
        showImage((current + 1) % images.length);
    }

    function showPrevImage() {
        showImage((current - 1 + images.length) % images.length);
    }

    // Dots click
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showImage(index);
        });
    });

    // Buttons click
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);

    // Auto slide every 5 seconds
    setInterval(showNextImage, 5000);
});
