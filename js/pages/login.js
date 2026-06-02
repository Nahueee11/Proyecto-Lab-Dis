document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const email = emailInput ? emailInput.value.trim() : '';
            const msgEl = document.getElementById('login-message');
            
            // Simular asignación de roles según requerimiento
            let userSession = {
                email: email,
                nombre: email === 'bodega@test.com' ? 'Bodegas de Alva' : 'Julien Moreau',
                role: email === 'bodega@test.com' ? 'BODEGA' : 'CLIENT',
                activeMode: 'CLIENT' // Por defecto inicia en modo cliente
            };
            
            localStorage.setItem('entreCopasSession', JSON.stringify(userSession));
            
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
