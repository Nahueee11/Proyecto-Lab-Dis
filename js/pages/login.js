document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const msgEl = document.getElementById('login-message');
            
            try {
                const response = await fetch('http://localhost:8080/api/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    msgEl.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
                    msgEl.classList.remove('hidden');
                    msgEl.style.color = 'green';
                    loginForm.reset();
                    setTimeout(() => {
                        window.location.href = 'panel.html';
                    }, 2000);
                } else {
                    let errorMsg = 'Error al iniciar sesión. Verifique sus credenciales.';
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
                msgEl.textContent = 'Error de red. No se pudo conectar con el servidor.';
                msgEl.classList.remove('hidden');
                msgEl.style.color = 'red';
            }
        });
    }
});
