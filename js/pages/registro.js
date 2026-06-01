document.addEventListener('DOMContentLoaded', () => {
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
