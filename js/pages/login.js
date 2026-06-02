document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const msgEl = document.getElementById('login-message');
            
            // Mostrar mensaje de éxito simulado
            msgEl.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
            msgEl.classList.remove('hidden');
            msgEl.style.color = 'green';
            
            // Reiniciar campos del formulario
            loginForm.reset();
            
            // Redirigir al panel de control tras 2 segundos
            setTimeout(() => {
                window.location.href = '../views/panel.html';
            }, 2000);
        });
    }
});
