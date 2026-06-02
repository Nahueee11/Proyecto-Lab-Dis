document.addEventListener('DOMContentLoaded', () => {
    // --- Registro Bodega Page Logic ---
    const registroBodegaForm = document.getElementById('registro-bodega-form');
    if (registroBodegaForm) {
        registroBodegaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombreOficial = document.getElementById('nombre-oficial').value;
            const region = document.getElementById('region').value;
            const municipio = document.getElementById('municipio').value;
            
            // Collect experiences checkbox values
            const experienciasCheckboxes = document.querySelectorAll('input[name="experiencias"]:checked');
            const experiencias = Array.from(experienciasCheckboxes).map(cb => cb.value);
            
            const msgEl = document.getElementById('registro-bodega-message');
            
            try {
                const response = await fetch('http://localhost:8080/api/bodegas/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombreOficial, region, municipio, experiencias })
                });
                
                if (response.status === 201 || response.ok) {
                    msgEl.textContent = '¡Bodega registrada con éxito en el sistema B2B!';
                    msgEl.classList.remove('hidden');
                    msgEl.style.color = 'green';
                    registroBodegaForm.reset();
                } else {
                    let errorMsg = 'Error al registrar la bodega. Intente de nuevo.';
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMsg = errorData.message;
                        }
                    } catch (err) {}
                    msgEl.textContent = errorMsg;
                    msgEl.classList.remove('hidden');
                    msgEl.style.color = 'red';
                }
            } catch (error) {
                msgEl.textContent = 'Error de red. No se pudo conectar con el servidor B2B.';
                msgEl.classList.remove('hidden');
                msgEl.style.color = 'red';
            }
        });
    }
});
