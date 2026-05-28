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
    const API_BASE_URL = 'http://localhost:8080/api'; // Centralized API URL

    // Helper function to display form messages
    function showFormMessage(message, type) {
        const msgEl = document.getElementById('form-message');
        msgEl.textContent = message;
        msgEl.className = `form-message ${type}`; // 'success' or 'error'
        msgEl.classList.remove('hidden');
    }

    if (reservationForm) {
        reservationForm.addEventListener('submit', enviarReserva);

        async function enviarReserva(e) {
            e.preventDefault();

            const formData = new FormData(reservationForm);

            // Build payload matching backend field names
            const payload = {
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                bodega: formData.get('bodega'),
                fecha: formData.get('fecha'),
                hora: formData.get('hora'),
                invitados: parseInt(formData.get('invitados'), 10)
            };

            try {
                const resp = await fetch(`${API_BASE_URL}/reservas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                // Try to parse JSON response (if any)
                let respBody = null;
                try { respBody = await resp.json(); } catch (err) { /* no JSON body */ }

                if (resp.ok) {
                    console.log('Reserva enviada correctamente:', respBody || resp.status);

                    // Optionally keep a local copy for the panel view
                    const localRes = {
                        id: respBody && respBody.id ? respBody.id : Date.now().toString(36),
                        nombre: payload.nombre,
                        email: payload.email,
                        bodega: payload.bodega,
                        fecha: payload.fecha,
                        hora: payload.hora,
                        invitados: payload.invitados,
                        status: (respBody && respBody.status) ? respBody.status : 'Pendiente'
                    };

                    let reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
                    reservations.push(localRes);
                    localStorage.setItem('entreCopasReservations', JSON.stringify(reservations));

                    showFormMessage('¡Solicitud enviada! Le confirmaremos por correo.', 'success');

                    reservationForm.reset();

                    setTimeout(() => { window.location.href = 'panel.html'; }, 2000);
                } else {
                    // Server returned validation errors or other failure
                    console.error('Error del servidor al crear la reserva:', resp.status, respBody);
                    const errorMessage = (respBody && respBody.message) ? respBody.message : 'Error al enviar la reserva. Intente de nuevo.';
                    showFormMessage(errorMessage, 'error');
                }
            } catch (networkErr) {
                console.error('Error de red al enviar la reserva:', networkErr);
                showFormMessage('No se pudo conectar con el servidor. Revise su conexión e intente más tarde.', 'error');
            }
        }
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
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const msgEl = document.getElementById('registro-message');
            
            try {
                const response = await fetch('http://localhost:8080/api/usuarios/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, apellido, email, password })
                });
                
                if (response.status === 201 || response.ok) {
                    msgEl.textContent = '¡Cuenta creada con éxito! Ya puedes iniciar sesión.';
                    msgEl.classList.remove('hidden');
                    msgEl.style.color = 'green';
                    registroForm.reset();
                } else {
                    let errorMsg = 'Error al registrar el usuario. Intente de nuevo.';
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMsg = errorData.message;
                        } else if (errorData && errorData.error) {
                            errorMsg = errorData.error;
                        }
                    } catch (e) {
                        // Response is not JSON
                    }
                    msgEl.textContent = errorMsg;
                    msgEl.classList.remove('hidden');
                    msgEl.style.color = 'red';
                }
            } catch (error) {
                msgEl.textContent = 'Error de red. No se pudo conectar con el servidor.';
                msgEl.classList.remove('hidden');
                msgEl.style.color = 'red';
            }
        });
    }
});
