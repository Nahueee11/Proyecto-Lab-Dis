document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión de bodega
    const sessionData = localStorage.getItem('entreCopasSession');
    if (!sessionData) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(sessionData);
    if (user.role !== 'BODEGA' || user.activeMode !== 'WINERY') {
        window.location.href = 'panel.html'; // Redirigir al panel de cliente si no corresponde
        return;
    }

    // 2. Mostrar datos de la bodega
    const wineryNameEl = document.getElementById('winery-name');
    const wineryAvatarEl = document.getElementById('winery-avatar');
    
    if (wineryNameEl) wineryNameEl.textContent = user.nombre;
    if (wineryAvatarEl && user.nombre) {
        // Iniciales del nombre
        const initials = user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        wineryAvatarEl.textContent = initials;
    }

    // Contenedores del DOM
    const reservationsList = document.getElementById('winery-reservations-list');
    const kpiTotalEl = document.getElementById('kpi-total-reservas');
    const kpiInvitadosEl = document.getElementById('kpi-total-invitados');
    const kpiPendientesEl = document.getElementById('kpi-pendientes');
    const kpiAceptadasEl = document.getElementById('kpi-aceptadas');
    const filterDateInput = document.getElementById('filter-date');

    // Inicializar input de fecha con la fecha de hoy
    if (filterDateInput) {
        const today = new Date().toISOString().split('T')[0];
        filterDateInput.value = today;
        filterDateInput.addEventListener('change', cargarReservas);
    }

    // 3. Cargar y Renderizar Reservas por Fecha
    function cargarReservas() {
        const reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
        const selectedDate = filterDateInput ? filterDateInput.value : '';
        
        // Filtrar reservas que pertenezcan a esta bodega
        const totalWineryReservations = reservations.filter(res => 
            res.bodega && res.bodega.toLowerCase().trim() === user.nombre.toLowerCase().trim()
        );

        // Filtrar además por la fecha seleccionada para el listado del día
        const dailyReservations = totalWineryReservations.filter(res => res.fecha === selectedDate);

        // Calcular estadísticas basadas en el día seleccionado
        let totalInvitados = 0;
        let pendientes = 0;
        let aceptadas = 0;

        dailyReservations.forEach(res => {
            totalInvitados += parseInt(res.invitados || 0, 10);
            if (res.status === 'Pendiente') pendientes++;
            if (res.status === 'Aceptada' || res.status === 'Confirmada') aceptadas++;
        });

        if (kpiTotalEl) kpiTotalEl.textContent = dailyReservations.length;
        if (kpiInvitadosEl) kpiInvitadosEl.textContent = totalInvitados;
        if (kpiPendientesEl) kpiPendientesEl.textContent = pendientes;
        if (kpiAceptadasEl) kpiAceptadasEl.textContent = aceptadas;

        // Renderizar listado
        if (!reservationsList) return;

        if (dailyReservations.length === 0) {
            // Formatear la fecha seleccionada para mostrarla en el estado vacío
            let formattedDate = selectedDate;
            try {
                const dateObj = new Date(selectedDate + 'T00:00:00'); // Evitar desfase de zona horaria
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch (e) {}

            reservationsList.innerHTML = `
                <div class="empty-state">
                    <p style="font-weight: 700; color: var(--primary);">No hay experiencias programadas para la fecha:</p>
                    <p style="margin-top: 4px; font-size: 16px; color: var(--on-surface-variant);">${formattedDate}</p>
                </div>
            `;
            return;
        }

        // Ordenar por hora
        dailyReservations.sort((a, b) => a.hora.localeCompare(b.hora));

        reservationsList.innerHTML = ''; // Limpiar estado anterior
        dailyReservations.forEach(res => {
            // Colores por estado
            let badgeBg = '#f2f2f2';
            let badgeColor = '#555555';
            if (res.status === 'Pendiente') {
                badgeBg = '#fef7e0';
                badgeColor = '#b06000';
            } else if (res.status === 'Aceptada' || res.status === 'Confirmada') {
                badgeBg = '#e6f4ea';
                badgeColor = '#137333';
            } else if (res.status === 'Rechazada') {
                badgeBg = '#fce8e6';
                badgeColor = '#c5221f';
            }

            const cardHTML = `
                <div class="reservation-card" style="align-items: stretch; flex-wrap: wrap; gap: var(--space-sm);">
                    <div class="res-details" style="flex: 1; min-width: 250px;">
                        <h4 style="font-family: var(--font-heading); font-size: 20px; font-weight:600; margin-bottom:4px;">${res.nombre}</h4>
                        <div class="res-meta" style="font-size:14px; margin-bottom: 8px;">
                            <span>${res.email}</span>
                        </div>
                        <div class="res-meta" style="font-size:14px; color: var(--on-surface-variant);">
                            <strong>Hora:</strong> ${res.hora} hs | <strong>Invitados:</strong> ${res.invitados}
                        </div>
                    </div>
                    <div class="res-actions" style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; gap: var(--space-sm); min-width: 150px;">
                        <span class="res-status" style="background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 4px;">
                            ${res.status}
                        </span>
                        ${res.status === 'Pendiente' ? `
                            <div style="display: flex; gap: 8px; margin-top: 8px;">
                                <button class="btn btn-primary btn-aceptar" data-id="${res.id}" style="padding: 6px 12px; font-size: 10px;">Aceptar</button>
                                <button class="btn btn-ghost btn-rechazar" data-id="${res.id}" style="padding: 6px 12px; font-size: 10px; border-color: #c5221f; color: #c5221f;">Rechazar</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            reservationsList.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Configurar eventos para botones
        document.querySelectorAll('.btn-aceptar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resId = e.currentTarget.getAttribute('data-id');
                actualizarEstadoReserva(resId, 'Aceptada');
            });
        });

        document.querySelectorAll('.btn-rechazar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resId = e.currentTarget.getAttribute('data-id');
                actualizarEstadoReserva(resId, 'Rechazada');
            });
        });
    }

    // 4. Modificar estado en localStorage
    function actualizarEstadoReserva(id, nuevoEstado) {
        const reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
        const index = reservations.findIndex(res => res.id.toString() === id.toString());
        
        if (index !== -1) {
            reservations[index].status = nuevoEstado;
            localStorage.setItem('entreCopasReservations', JSON.stringify(reservations));
            cargarReservas(); // Re-renderizar lista y KPIs
        }
    }

    // Carga inicial
    cargarReservas();
});
