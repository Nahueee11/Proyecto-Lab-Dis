document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');

    // Handle header transparency on scroll
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Dynamic Navbar & Hamburger Menu Logic (B2B Module) ---
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (header && navLinksContainer) {
        // 1. Inject Hamburger Button for Mobile
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger-toggle';
        hamburgerBtn.setAttribute('aria-label', 'Menú de navegación');
        hamburgerBtn.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(hamburgerBtn, navLinksContainer);

        // Toggle mobile menu
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when clicking links
        navLinksContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('button')) {
                hamburgerBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            }
        });

        // 2. Read Session and dynamically render Navbar
        const sessionData = localStorage.getItem('entreCopasSession');
        const isRoot = !window.location.pathname.includes('/views/');
        const basePath = isRoot ? 'views/' : '';
        const rootPrefix = isRoot ? '' : '../';

        let isWinery = false;
        let isWineryMode = false;

        if (sessionData) {
            const user = JSON.parse(sessionData);
            if (user.role === 'BODEGA') {
                isWinery = true;
                isWineryMode = (user.activeMode === 'WINERY');
            }
        }

        if (isWinery && isWineryMode) {
            // Render Winery Mode Links
            navLinksContainer.innerHTML = `
                <a href="${rootPrefix}${isRoot ? 'index.html' : '../index.html'}">Inicio</a>
                <a href="${basePath}panel-bodega.html">Dashboard Bodega</a>
                <a href="${basePath}crear-experiencia.html">Crear Experiencia</a>
            `;
        } else {
            // Render Client Mode Links (including Carrito for guests, normal clients, and wineries in CLIENT mode)
            navLinksContainer.innerHTML = `
                <a href="${basePath}explorar.html">Explorar</a>
                <a href="${basePath}panel.html">Panel</a>
                <a href="${basePath}reservas.html">Reservas</a>
                <a href="${basePath}carrito.html" id="cart-nav-link">Carrito (0)</a>
                <a href="${basePath}trabaja-con-nosotros.html">Asociarse</a>
                <a href="${basePath}registro.html" class="nav-icon-link" aria-label="Registrarse">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </a>
            `;
        }

        // If BODEGA, inject dividers and Switch Mode button
        if (isWinery) {
            const user = JSON.parse(sessionData);
            const dividerDesktop = document.createElement('div');
            dividerDesktop.className = 'nav-divider-desktop';
            
            const dividerMobile = document.createElement('div');
            dividerMobile.className = 'nav-divider-mobile';

            const switchBtn = document.createElement('button');
            switchBtn.className = 'btn btn-ghost role-switch-btn';
            
            if (isWineryMode) {
                switchBtn.textContent = 'Modo Cliente';
                switchBtn.style.borderColor = 'var(--primary)';
                switchBtn.style.color = 'var(--primary)';
            } else {
                switchBtn.textContent = 'Modo Bodega';
            }

            switchBtn.addEventListener('click', () => {
                // Toggle active mode
                user.activeMode = user.activeMode === 'WINERY' ? 'CLIENT' : 'WINERY';
                localStorage.setItem('entreCopasSession', JSON.stringify(user));
                
                // Redirect based on new mode
                if (user.activeMode === 'WINERY') {
                    window.location.href = `${basePath}panel-bodega.html`;
                } else {
                    window.location.href = `${basePath}panel.html`;
                }
            });

            // Add to navbar container
            navLinksContainer.appendChild(dividerDesktop);
            navLinksContainer.appendChild(dividerMobile);
            navLinksContainer.appendChild(switchBtn);
        }

        // 3. Update Cart count badge function
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
            const cartLink = document.getElementById('cart-nav-link');
            if (cartLink) {
                cartLink.textContent = `Carrito (${totalItems})`;
                
                // Dynamic micro-animation feedback
                cartLink.style.transform = 'scale(1.15)';
                cartLink.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                setTimeout(() => {
                    cartLink.style.transform = 'scale(1)';
                }, 150);
            }
        }

        // Initial count display
        updateCartCount();

        // Listen for shopping cart changes
        window.addEventListener('cartUpdated', updateCartCount);
    }

    // Simple fade-in animation for elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation starting styles to elements
    const animateElements = document.querySelectorAll('.winery-card, .feature-item, .testimonial blockquote');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});
