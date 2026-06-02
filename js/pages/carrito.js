document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.getElementById('cart-items-list');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const btnCheckout = document.getElementById('btn-checkout');
    const checkoutMsg = document.getElementById('checkout-message');

    // 1. Cargar y Renderizar Carrito (Solo Lectura - Estilo Cine)
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

            // Formatear la fecha elegida
            let dateStr = item.fecha;
            try {
                const dateObj = new Date(item.fecha + 'T00:00:00'); // Evitar desfase de zona horaria
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch (err) {}

            const cardHTML = `
                <div class="reservation-card" style="align-items: center; flex-wrap: wrap; gap: var(--space-md); padding: var(--space-md); margin-bottom: var(--space-sm);">
                    <!-- Detalles de la Experiencia (Lado Izquierdo) -->
                    <div style="flex: 1.5; min-width: 250px;">
                        <span class="label-caps" style="color: var(--primary); font-size: 11px;">${item.bodega}</span>
                        <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 600; margin-top: 4px; margin-bottom: 8px;">${item.titulo}</h3>
                        <p style="font-size: 14px; color: var(--on-surface-variant);">
                            Región: ${item.regionName} | Precio por entrada: $${item.precio.toLocaleString('es-AR')}
                        </p>
                    </div>

                    <!-- Detalles del Ticket Fijo (Centro - Solo Lectura) -->
                    <div style="flex: 1.2; display: flex; flex-direction: column; gap: 6px; min-width: 200px; padding-left: var(--space-md); border-left: 1px solid var(--surface-dim);">
                        <div style="font-size: 14px;">
                            <strong>Fecha:</strong> ${dateStr}
                        </div>
                        <div style="font-size: 14px;">
                            <strong>Horario:</strong> ${item.hora} hs
                        </div>
                        <div style="font-size: 14px;">
                            <strong>Entradas:</strong> ${item.cantidad} ${item.cantidad === 1 ? 'persona' : 'personas'}
                        </div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--primary); margin-top: 4px;">
                            Total: $${itemTotal.toLocaleString('es-AR')}
                        </div>
                    </div>

                    <!-- Botón Eliminar (Lado Derecho) -->
                    <div style="display: flex; align-items: center; justify-content: flex-end; min-width: 100px; flex-grow: 1;">
                        <button class="btn btn-ghost btn-remove-item" 
                                data-id="${item.id}" 
                                style="padding: 6px 12px; font-size: 10px; border-color: #c5221f; color: #c5221f;">Eliminar</button>
                    </div>
                </div>
            `;
            if (cartItemsList) cartItemsList.insertAdjacentHTML('beforeend', cardHTML);
        });

        if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
        if (summaryTotal) summaryTotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;

        setupEventListeners();
    }

    // 2. Vincular Botones de Eliminar
    function setupEventListeners() {
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                eliminarItem(id);
            });
        });
    }

    function eliminarItem(id) {
        let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('entreCopasCart', JSON.stringify(cart));
        renderCart();
        window.dispatchEvent(new CustomEvent('cartUpdated')); // Notificar cambio
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
                checkoutMsg.textContent = '¡Compra finalizada con éxito! Sus tickets han sido generados. Redirigiendo...';
                checkoutMsg.className = 'form-message success';
                checkoutMsg.classList.remove('hidden');
            }

            // Actualizar Navbar
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
