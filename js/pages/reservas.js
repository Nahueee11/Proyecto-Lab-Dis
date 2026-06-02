document.addEventListener('DOMContentLoaded', () => {
    // --- Reservas Page Logic: Form Handling ---
    const reservationForm = document.getElementById('reservation-form');
    const API_BASE_URL = 'http://localhost:8080/api'; // Centralized API URL

    // Helper function to display form messages
    function showFormMessage(message, type) {
        const msgEl = document.getElementById('form-message');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.className = `form-message ${type}`; // 'success' or 'error'
            msgEl.classList.remove('hidden');
        }
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
                console.warn('Servidor desconectado. Guardando copia local para pruebas...');
                
                // Fallback local para permitir testing offline sin prender el backend
                const localRes = {
                    id: Date.now().toString(36),
                    nombre: payload.nombre,
                    email: payload.email,
                    bodega: payload.bodega,
                    fecha: payload.fecha,
                    hora: payload.hora,
                    invitados: payload.invitados,
                    status: 'Pendiente'
                };

                let reservations = JSON.parse(localStorage.getItem('entreCopasReservations') || '[]');
                reservations.push(localRes);
                localStorage.setItem('entreCopasReservations', JSON.stringify(reservations));

                showFormMessage('¡Modo Demo: Servidor offline! Solicitud guardada localmente.', 'success');
                reservationForm.reset();

                setTimeout(() => { window.location.href = 'panel.html'; }, 2000);
            }
        }
    }

    // Auto-select bodega if passed in URL
    const urlParams = new URLSearchParams(window.location.search);
    const bodegaParam = urlParams.get('bodega');
    if (bodegaParam) {
        const selectEl = document.getElementById('bodega');
        if (selectEl) {
            for (let i = 0; i < selectEl.options.length; i++) {
                if (selectEl.options[i].value.toLowerCase().includes(bodegaParam.toLowerCase())) {
                    selectEl.selectedIndex = i;
                    break;
                }
            }
        }
    }
});
