document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión de bodega
    const sessionData = localStorage.getItem('entreCopasSession');
    if (!sessionData) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(sessionData);
    if (user.role !== 'BODEGA' || user.activeMode !== 'WINERY') {
        window.location.href = 'panel.html';
        return;
    }

    const form = document.getElementById('create-experience-form');
    const msgEl = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('titulo').value.trim();
            const type = document.getElementById('tipo').value;
            const price = parseFloat(document.getElementById('precio').value);
            const cupo = parseInt(document.getElementById('cupo').value, 10);
            const desc = document.getElementById('descripcion').value.trim();

            // Validar que el precio sea mayor a 0 y menor a 100.000
            if (isNaN(price) || price <= 0 || price >= 100000) {
                showFormMessage('El precio debe ser mayor a $0 y menor a $100.000.', 'error');
                return;
            }

            // Obtener horarios seleccionados
            const checkedBoxes = form.querySelectorAll('input[name="horarios"]:checked');
            const schedules = Array.from(checkedBoxes).map(cb => cb.value);

            if (schedules.length === 0) {
                showFormMessage('Por favor, seleccione al menos un horario disponible.', 'error');
                return;
            }

            // Mapear región de bodega según el catálogo estático del proyecto
            let regionKey = 'uco';
            let regionName = 'Valle de Uco';
            const wineryLower = user.nombre.toLowerCase();

            if (wineryLower.includes('alva') || wineryLower.includes('marini')) {
                regionKey = 'lujan';
                regionName = 'Luján de Cuyo';
            } else if (wineryLower.includes('mar')) {
                regionKey = 'maipu';
                regionName = 'Maipú';
            } else if (wineryLower.includes('piedra') || wineryLower.includes('reserve')) {
                regionKey = 'uco';
                regionName = 'Valle de Uco';
            }

            // Crear objeto de experiencia (sin duración)
            const nuevaExperiencia = {
                id: 'exp-' + Date.now().toString(36),
                bodega: user.nombre,
                regionKey: regionKey,
                regionName: regionName,
                titulo: title,
                tipo: type, // 'cata', 'visita', 'degustacion'
                precio: price,
                cupo: cupo,
                descripcion: desc,
                horarios: schedules
            };

            // Guardar en LocalStorage
            let experiences = JSON.parse(localStorage.getItem('entreCopasExperiencias') || '[]');
            experiences.push(nuevaExperiencia);
            localStorage.setItem('entreCopasExperiencias', JSON.stringify(experiences));

            showFormMessage('¡Experiencia publicada con éxito! Redirigiendo...', 'success');
            form.reset();

            // Redirigir al panel de la bodega
            setTimeout(() => {
                window.location.href = 'panel-bodega.html';
            }, 2000);
        });
    }

    function showFormMessage(message, type) {
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.className = `form-message ${type}`;
            msgEl.classList.remove('hidden');
        }
    }
});
