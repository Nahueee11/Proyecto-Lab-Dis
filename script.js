document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');

    // Handle header transparency on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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

    // --- Explorar Page Logic: Filters ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                filterItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        // Small timeout to allow display block to apply before changing opacity
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300); // Wait for transition
                    }
                });
            });
        });
        
        // Auto-select bodega if passed in URL
        const urlParams = new URLSearchParams(window.location.search);
        const bodegaParam = urlParams.get('bodega');
        if (bodegaParam) {
            const selectEl = document.getElementById('bodega');
            if (selectEl) {
                // Find matching option (simplified matching)
                for (let i = 0; i < selectEl.options.length; i++) {
                    if (selectEl.options[i].value.toLowerCase().includes(bodegaParam.toLowerCase())) {
                        selectEl.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }

    // --- Reservas Page Logic: Form Handling ---
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(reservationForm);
            const resData = {
                id: Date.now().toString(36),
                bodega: formData.get('bodega'),
                fecha: formData.get('fecha'),
                hora: formData.get('hora'),
                invitados: formData.get('invitados'),
                status: 'Confirmada'
            };

            // Save to localStorage
            let reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
            reservations.push(resData);
            localStorage.setItem('entreCopasReservations', JSON.stringify(reservations));

            // Show success message
            const msgEl = document.getElementById('form-message');
            msgEl.textContent = '¡Su reserva ha sido confirmada con éxito!';
            msgEl.className = 'form-message success';
            msgEl.classList.remove('hidden');

            reservationForm.reset();
            
            // Redirect to panel after 2 seconds
            setTimeout(() => {
                window.location.href = 'panel.html';
            }, 2000);
        });
    }

    // --- Panel Page Logic: Render Reservations ---
    const reservationsList = document.getElementById('reservations-list');
    if (reservationsList) {
        const reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
        
        if (reservations.length > 0) {
            reservationsList.innerHTML = ''; // Clear empty state
            
            // Sort by date (newest first)
            reservations.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            reservations.forEach(res => {
                // Format date roughly
                const dateObj = new Date(res.fecha);
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

                const cardHTML = `
                    <div class="reservation-card">
                        <div class="res-details">
                            <h4>${res.bodega}</h4>
                            <div class="res-meta">
                                <span>${dateStr} a las ${res.hora}</span> | <span>${res.invitados} Invitado(s)</span>
                            </div>
                        </div>
                        <div class="res-status">${res.status}</div>
                    </div>
                `;
                reservationsList.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    }

    // --- Registro Page Logic ---
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show success message
            const msgEl = document.getElementById('registro-message');
            msgEl.textContent = '¡Cuenta creada con éxito! Redirigiendo al panel...';
            msgEl.className = 'form-message success';
            msgEl.classList.remove('hidden');

            registroForm.reset();
            
            // Redirect to panel after 2 seconds
            setTimeout(() => {
                window.location.href = 'panel.html';
            }, 2000);
        });
    }
});
