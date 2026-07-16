document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // SELECTION OF DOM ELEMENTS
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const progressBar = document.getElementById('progressBar');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const appContainer = document.querySelector('.app-container');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const slidesContainer = document.getElementById('slidesContainer');

    let currentSlide = 0;
    const totalSlides = slides.length;

    // ==========================================
    // INITIALIZATION & HASH SYNC
    // ==========================================
    function initPresentation() {
        // Sync with browser URL hash on load (e.g. index.html#slide-3)
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideIndex = parseInt(hash.replace('#slide-', ''), 10);
            if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < totalSlides) {
                currentSlide = slideIndex;
            }
        }
        showSlide(currentSlide);
    }

    // ==========================================
    // SLIDE DISPLAY LOGIC
    // ==========================================
    function showSlide(index) {
        // Deactivate all slides and nav items
        slides.forEach(slide => slide.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));

        // Activate target slide and nav item
        slides[index].classList.add('active');
        
        // Find corresponding sidebar nav item and activate it
        const targetNavItem = document.querySelector(`.nav-item[data-slide="${index}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
            
            // Auto scroll sidebar to active item if needed
            targetNavItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Update current state variables
        currentSlide = index;

        // Update progress bar
        const progressPercentage = (currentSlide / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update slide count indicator (e.g., 1 / 12)
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

        // Disable/enable control buttons at boundaries
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;

        // Sync browser URL hash without scrolling the browser window
        history.replaceState(null, null, `#slide-${currentSlide}`);

        // Reset scroll position to top on mobile and desktop
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (slidesContainer) {
            slidesContainer.scrollTop = 0;
        }
    }

    function navigateNext() {
        if (currentSlide < totalSlides - 1) {
            showSlide(currentSlide + 1);
        }
    }

    function navigatePrev() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }

    // ==========================================
    // EVENT LISTENERS: CONTROLS & SIDEBAR
    // ==========================================
    // Next/Prev Buttons
    nextBtn.addEventListener('click', navigateNext);
    prevBtn.addEventListener('click', navigatePrev);

    // Sidebar Collapse Toggle
    if (sidebarToggleBtn && sidebar) {
        // Load persistent preference
        if (localStorage.getItem('sidebar-collapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }

        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // Sidebar items click navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetIndex = parseInt(item.getAttribute('data-slide'), 10);
            showSlide(targetIndex);
        });
    });

    // ==========================================
    // KEYBOARD NAVIGATION
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Prevent default actions for navigation keys (like space bar page-scroll)
        switch(e.key) {
            case 'ArrowRight':
            case 'PageDown':
                navigateNext();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                navigatePrev();
                break;
            case ' ': // Space bar
                // Only trigger navigation if user is not typing in a text field
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    navigateNext();
                }
                break;
            case 'Home':
                showSlide(0);
                break;
            case 'End':
                showSlide(totalSlides - 1);
                break;
            default:
                break;
        }
    });

    // ==========================================
    // TOUCH / SWIPE NAVIGATION (MOBILE)
    // ==========================================
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const swipeThreshold = 50; // Minimum swipe distance in px

    if (slidesContainer) {
        slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        slidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipeGesture();
        }, { passive: true });

        function handleSwipeGesture() {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Check if horizontal swipe was larger than vertical swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX < 0) {
                        // Swiped left -> Next Slide
                        navigateNext();
                    } else {
                        // Swiped right -> Previous Slide
                        navigatePrev();
                    }
                }
            }
        }
    }

    // ==========================================
    // FULLSCREEN TOGGLE SYSTEM
    // ==========================================
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            appContainer.requestFullscreen()
                .then(() => {
                    fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
                })
                .catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
        } else {
            document.exitFullscreen()
                .then(() => {
                    fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                })
                .catch(err => {
                    console.error(`Error attempting to exit fullscreen: ${err.message}`);
                });
        }
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Update icon if fullscreen changes via ESC key or system gesture
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        } else {
            fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        }
    });

    // Listen for back/forward browser navigation
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideIndex = parseInt(hash.replace('#slide-', ''), 10);
            if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < totalSlides && slideIndex !== currentSlide) {
                showSlide(slideIndex);
            }
        }
    });

    // Initialize presentation on load
    initPresentation();
});
