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
});
