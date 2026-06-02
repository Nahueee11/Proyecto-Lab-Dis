document.addEventListener('DOMContentLoaded', () => {
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

                // Determinar colores del badge de estado
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
                    <div class="reservation-card">
                        <div class="res-details">
                            <h4>${res.bodega}</h4>
                            <div class="res-meta">
                                <span>${dateStr} a las ${res.hora}</span> | <span>${res.invitados} Invitado(s)</span>
                            </div>
                        </div>
                        <div class="res-status" style="background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 4px;">
                            ${res.status}
                        </div>
                    </div>
                `;
                reservationsList.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    }
});
