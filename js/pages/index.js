document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Carousel Logic ---
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            // Remove active classes from current slide
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');

            // Update index with wrap-around
            currentSlide = (index + slides.length) % slides.length;

            // Add active classes to new current slide
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay() {
            clearInterval(slideInterval);
            startAutoPlay();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoPlay();
            });
        }

        indicators.forEach((indicator, idx) => {
            indicator.addEventListener('click', () => {
                showSlide(idx);
                resetAutoPlay();
            });
        });

        // Initialize autoplay
        startAutoPlay();
    }
});
