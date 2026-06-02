document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.getElementById('cart-items-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const btnCheckout = document.getElementById('btn-checkout');
    const checkoutMsg = document.getElementById('checkout-message');

    // 1. Cargar y Renderizar Carrito
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');

        if (cart.length === 0) {
            if (cartItemsList) {
                cartItemsList.innerHTML = `
                    <div class="empty-state">
                        <p>Su carrito está actualmente vacío.</p>
                        <a href="explorar.html" class="btn btn-ghost mt-sm">Explorar Bodegas</a>
                    </div>
                `;
            }
            if (summarySubtotal) summarySubtotal.textContent = '$0';
            if (summaryTotal) summaryTotal.textContent = '$0';
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        if (btnCheckout) btnCheckout.disabled = false;
        if (cartItemsList) cartItemsList.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            subtotal += itemTotal;

            const cardHTML = `
                <div class="reservation-card" style="align-items: stretch; flex-wrap: wrap; gap: var(--space-sm); padding: var(--space-md); margin-bottom: var(--space-sm);">
                    <!-- Detalles del Item -->
                    <div style="flex: 1.5; min-width: 250px;">
                        <span class="label-caps" style="color: var(--primary); font-size: 11px;">${item.bodega}</span>
                        <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 600; margin-top: 4px; margin-bottom: 8px;">${item.titulo}</h3>
                        <p style="font-size: 14px; color: var(--on-surface-variant);">
                            Región: ${item.regionName} | Precio unitario: $${item.precio.toLocaleString('es-AR')}
                        </p>
                        <p style="font-size: 16px; font-weight: 700; margin-top: 8px; color: var(--black);">
                            Subtotal: $${itemTotal.toLocaleString('es-AR')}
                        </p>
                    </div>

                    <!-- Inputs de Configuración del checkout -->
                    <div style="flex: 1.2; display: flex; flex-direction: column; gap: 10px; min-width: 220px; justify-content: space-between; border-left: 1px solid var(--surface-dim); padding-left: var(--space-sm);">
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <label style="margin-bottom: 0; font-size: 11px;">Invitados:</label>
                            <input type="number" class="form-control item-quantity" 
                                   data-id="${item.id}" 
                                   value="${item.cantidad}" 
                                   min="1" max="30" 
                                   style="width: 70px; padding: 6px; font-size: 14px; text-align: center; height: auto;">
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <label style="margin-bottom: 0; font-size: 11px;">Fecha:</label>
                            <input type="date" class="form-control item-date" 
                                   data-id="${item.id}" 
                                   value="${item.fecha}" 
                                   style="width: 140px; padding: 6px; font-size: 13px; height: auto;">
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <label style="margin-bottom: 0; font-size: 11px;">Horario:</label>
                            <select class="form-control item-hour" 
                                    data-id="${item.id}" 
                                    style="width: 140px; padding: 6px; font-size: 13px; height: auto;">
                                ${item.horarios.map(h => `<option value="${h}" ${h === item.hora ? 'selected' : ''}>${h} AM/PM</option>`).join('')}
                            </select>
                        </div>

                        <div style="text-align: right; margin-top: 8px;">
                            <button class="btn btn-ghost btn-remove-item" 
                                    data-id="${item.id}" 
                                    style="padding: 4px 10px; font-size: 10px; border-color: #c5221f; color: #c5221f;">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            if (cartItemsList) cartItemsList.insertAdjacentHTML('beforeend', cardHTML);
        });

        if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
        if (summaryTotal) summaryTotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;

        setupEventListeners();
    }

    // 2. Vincular Escuchas a los Inputs
    function setupEventListeners() {
        // Inputs de Cantidad
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) {
                    e.target.value = 1;
                    actualizarCantidad(id, 1);
                } else {
                    actualizarCantidad(id, val);
                }
            });
        });

        // Inputs de Fecha
        document.querySelectorAll('.item-date').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const val = e.target.value;
                actualizarFecha(id, val);
            });
        });

        // Select de Horarios
        document.querySelectorAll('.item-hour').forEach(select => {
            select.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const val = e.target.value;
                actualizarHora(id, val);
            });
        });

        // Botones de Eliminar
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                eliminarItem(id);
            });
        });
    }

    // Funciones Auxiliares de Actualización
    function actualizarCantidad(id, cant) {
        let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
        const idx = cart.findIndex(item => item.id === id);
        if (idx !== -1) {
            cart[idx].cantidad = cant;
            localStorage.setItem('entreCopasCart', JSON.stringify(cart));
            renderCart();
            window.dispatchEvent(new CustomEvent('cartUpdated')); // UX optimista
        }
    }

    function actualizarFecha(id, fecha) {
        let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
        const idx = cart.findIndex(item => item.id === id);
        if (idx !== -1) {
            cart[idx].fecha = fecha;
            localStorage.setItem('entreCopasCart', JSON.stringify(cart));
        }
    }

    // Establecer límites de fecha min (hoy) para inputs de fecha del carrito
    const todayStr = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.item-date').forEach(input => {
        input.setAttribute('min', todayStr);
    });

    function actualizarHora(id, hora) {
        let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
        const idx = cart.findIndex(item => item.id === id);
        if (idx !== -1) {
            cart[idx].hora = hora;
            localStorage.setItem('entreCopasCart', JSON.stringify(cart));
        }
    }

    function eliminarItem(id) {
        let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('entreCopasCart', JSON.stringify(cart));
        renderCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    // 3. Procesar Compra / Checkout
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
            if (cart.length === 0) return;

            // Obtener sesión del usuario para asignar titular
            const sessionData = localStorage.getItem('entreCopasSession');
            const user = sessionData ? JSON.parse(sessionData) : { nombre: 'Julien Moreau', email: 'julien@test.com' };

            // Cargar reservas existentes
            let reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');

            // Mover ítems a reservas como confirmados/aceptados
            cart.forEach(item => {
                const newRes = {
                    id: 'res-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
                    nombre: user.nombre,
                    email: user.email,
                    bodega: item.bodega,
                    fecha: item.fecha,
                    hora: item.hora,
                    invitados: item.cantidad,
                    status: 'Aceptada' // Confirmada
                };
                reservations.push(newRes);
            });

            // Guardar cambios
            localStorage.setItem('entreCopasReservations', JSON.stringify(reservations));
            localStorage.removeItem('entreCopasCart'); // Vaciar carrito

            // UX feedback
            if (checkoutMsg) {
                checkoutMsg.textContent = '¡Compra finalizada con éxito! Sus reservas están confirmadas. Redirigiendo...';
                checkoutMsg.className = 'form-message success';
                checkoutMsg.classList.remove('hidden');
            }

            // Actualizar Navbar en tiempo real
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            // Redirigir al panel del cliente tras 2 segundos
            setTimeout(() => {
                window.location.href = 'panel.html';
            }, 2000);
        });
    }

    // Render Inicial
    renderCart();
});
