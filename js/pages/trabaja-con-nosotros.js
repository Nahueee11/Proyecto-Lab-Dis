document.addEventListener('DOMContentLoaded', () => {
    // --- Trabaja con Nosotros Page Logic ---
    const partnerForm = document.getElementById('partner-form');
    const API_BASE_URL = 'http://localhost:8080/api'; // Centralized API URL

    if (partnerForm) {
        partnerForm.addEventListener('submit', enviarPropuestaBodega);

        async function enviarPropuestaBodega(e) {
            e.preventDefault();

            const formData = new FormData(partnerForm);
            const payload = {
                nombreBodega: formData.get('nombreBodega'),
                nombreContacto: formData.get('nombreContacto'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                region: formData.get('region'),
                mensaje: formData.get('mensaje')
            };

            const msgEl = document.getElementById('partner-form-message');

            function showPartnerMessage(message, type) {
                if (msgEl) {
                    msgEl.textContent = message;
                    msgEl.className = `form-message ${type}`; // 'success' or 'error'
                    msgEl.classList.remove('hidden');
                }
            }

            try {
                const resp = await fetch(`${API_BASE_URL}/bodegas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (resp.ok) {
                    showPartnerMessage('¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.', 'success');
                    partnerForm.reset();
                } else {
                    let respBody = null;
                    try { respBody = await resp.json(); } catch (err) {}
                    const errorMsg = (respBody && respBody.message) ? respBody.message : 'Error al enviar la solicitud. Intente de nuevo.';
                    showPartnerMessage(errorMsg, 'error');
                }
            } catch (networkErr) {
                console.error('Error de red al enviar solicitud de bodega:', networkErr);
                
                // Fallback for demonstration/offline purposes:
                let partnerRequests = JSON.parse(localStorage.getItem('entreCopasPartnerRequests') || '[]');
                partnerRequests.push({
                    id: Date.now().toString(36),
                    ...payload,
                    fechaSolicitud: new Date().toISOString()
                });
                localStorage.setItem('entreCopasPartnerRequests', JSON.stringify(partnerRequests));

                showPartnerMessage('¡Solicitud registrada localmente! Nos contactaremos pronto.', 'success');
                partnerForm.reset();
            }
        }
    }
});
