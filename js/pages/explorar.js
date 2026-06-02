document.addEventListener('DOMContentLoaded', () => {
    // --- Explorar Page Logic: Minimal Chip Filters & Sorting ---
    const exploreGrid = document.getElementById('explore-grid');
    const filterSort = document.getElementById('filter-sort');

    // DOM Elements for Cinema Booking Modal
    const modalOverlay = document.getElementById('booking-modal');
    const modalForm = document.getElementById('modal-booking-form');
    const modalExpTitle = document.getElementById('modal-experience-title');
    const modalWineryInfo = document.getElementById('modal-winery-info');
    const modalDate = document.getElementById('modal-date');
    const modalHour = document.getElementById('modal-hour');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalPriceTotal = document.getElementById('modal-price-total');
    const modalCloseX = document.getElementById('modal-close-x');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    let activeExperienceData = null; // Guardará temporalmente la experiencia seleccionada
    let activeTriggerBtn = null;     // Guardará el botón de la tarjeta que abrió el modal

    if (exploreGrid && filterSort) {
        // Cargar experiencias dinámicas creadas por las bodegas
        const dynamicExps = JSON.parse(localStorage.getItem('entreCopasExperiencias') || '[]');
        dynamicExps.forEach(exp => {
            let imgPath = '../assets/winery.png';
            if (exp.tipo === 'cata') imgPath = '../assets/reserve.png';
            if (exp.tipo === 'degustacion') imgPath = '../assets/marini.png';
            
            const cardHTML = `
                <article class="winery-card filter-item" data-category="${exp.regionKey}" data-experience="${exp.tipo}">
                    <img src="${imgPath}" alt="${exp.titulo}" class="winery-image" onerror="this.style.backgroundColor='var(--surface-dim)'">
                    <div class="winery-info">
                        <span class="label-caps">${exp.regionName} | ${exp.bodega}</span>
                        <h3 style="margin-top: 4px; font-size: 22px;">${exp.titulo}</h3>
                        <p style="margin: 6px 0; font-weight: 700; color: var(--primary); font-size: 15px;">
                            $${exp.precio.toLocaleString('es-AR')}
                        </p>
                        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 12px;">${exp.descripcion}</p>
                        <button class="btn btn-ghost mt-sm btn-add-cart" 
                                data-id="${exp.id}" 
                                data-bodega="${exp.bodega}" 
                                data-titulo="${exp.titulo}" 
                                data-precio="${exp.precio}" 
                                data-tipo="${exp.tipo}" 
                                data-region-key="${exp.regionKey}" 
                                data-region-name="${exp.regionName}" 
                                data-horarios="${exp.horarios ? exp.horarios.join(',') : '12:00'}">Añadir al Carrito</button>
                    </div>
                </article>
            `;
            exploreGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // 1. Interceptar click en "Añadir al Carrito" y abrir Modal de Boletería (Cine)
        exploreGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-add-cart');
            if (!btn) return;

            activeTriggerBtn = btn;

            // Almacenar datos en el scope temporal
            activeExperienceData = {
                id: btn.getAttribute('data-id'),
                bodega: btn.getAttribute('data-bodega'),
                titulo: btn.getAttribute('data-titulo'),
                precio: parseFloat(btn.getAttribute('data-precio')),
                tipo: btn.getAttribute('data-tipo'),
                regionKey: btn.getAttribute('data-region-key'),
                regionName: btn.getAttribute('data-region-name'),
                horarios: (btn.getAttribute('data-horarios') || '12:00').split(',')
            };

            // Rellenar cabeceras en el modal
            if (modalExpTitle) modalExpTitle.textContent = activeExperienceData.titulo;
            if (modalWineryInfo) modalWineryInfo.textContent = `${activeExperienceData.bodega} • ${activeExperienceData.regionName}`;

            // Configurar fecha mínima de visita (mañana)
            if (modalDate) {
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                modalDate.value = tomorrow;
                modalDate.setAttribute('min', tomorrow);
            }

            // Inyectar horarios disponibles en el select
            if (modalHour) {
                modalHour.innerHTML = activeExperienceData.horarios.map(h => 
                    `<option value="${h}">${h} hs</option>`
                ).join('');
            }

            // Resetear cantidad a 1 y recalcular total
            if (modalQuantity) modalQuantity.value = 1;
            recalcularTotalModal();

            // Abrir modal con animación
            if (modalOverlay) modalOverlay.classList.add('active');
        });

        // 2. Recalculador de precio total del Modal
        function recalcularTotalModal() {
            if (!activeExperienceData) return;
            const cant = parseInt(modalQuantity.value || 1, 10);
            const total = activeExperienceData.precio * cant;
            if (modalPriceTotal) {
                modalPriceTotal.textContent = `$${total.toLocaleString('es-AR')}`;
            }
        }

        if (modalQuantity) {
            modalQuantity.addEventListener('input', recalcularTotalModal);
            modalQuantity.addEventListener('change', recalcularTotalModal);
        }

        // 3. Cerrar el Modal
        function cerrarModal() {
            if (modalOverlay) modalOverlay.classList.remove('active');
            activeExperienceData = null;
            activeTriggerBtn = null;
        }

        if (modalCloseX) modalCloseX.addEventListener('click', cerrarModal);
        if (modalCancelBtn) modalCancelBtn.addEventListener('click', cerrarModal);
        
        // Cerrar al hacer clic en el fondo oscuro
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) cerrarModal();
            });
        }

        // 4. Confirmar Modal e Inyectar en el Carrito (entreCopasCart)
        if (modalForm) {
            modalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!activeExperienceData) return;

                const fecha = modalDate.value;
                const hora = modalHour.value;
                const cantidad = parseInt(modalQuantity.value, 10);

                if (!fecha || !hora || isNaN(cantidad) || cantidad < 1) return;

                let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');

                // El ticket es único por combinación de Experiencia + Fecha + Hora (estilo boletos de cine)
                const ticketId = `${activeExperienceData.id}-${fecha}-${hora}`;

                const existingTicketIndex = cart.findIndex(item => item.id === ticketId);
                
                if (existingTicketIndex !== -1) {
                    // Si ya existe el mismo boleto para el mismo día y hora, acumular cantidad
                    cart[existingTicketIndex].cantidad += cantidad;
                } else {
                    // De lo contrario, registrar nueva entrada sellada
                    cart.push({
                        id: ticketId, // ID único del boleto
                        experienciaId: activeExperienceData.id,
                        bodega: activeExperienceData.bodega,
                        titulo: activeExperienceData.titulo,
                        precio: activeExperienceData.precio,
                        tipo: activeExperienceData.tipo,
                        regionKey: activeExperienceData.regionKey,
                        regionName: activeExperienceData.regionName,
                        cantidad: cantidad,
                        fecha: fecha,
                        hora: hora,
                        horarios: activeExperienceData.horarios // Guardar por si se necesita
                    });
                }

                localStorage.setItem('entreCopasCart', JSON.stringify(cart));

                // Notificar cambio de carrito optimista en Navbar
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                // Cerrar modal
                cerrarModal();

                // Animación de feedback en el botón original
                if (activeTriggerBtn) {
                    const origText = activeTriggerBtn.textContent;
                    activeTriggerBtn.textContent = '¡Añadido! ✓';
                    activeTriggerBtn.style.backgroundColor = 'var(--primary)';
                    activeTriggerBtn.style.color = 'var(--on-primary)';
                    activeTriggerBtn.style.borderColor = 'var(--primary)';
                    
                    setTimeout(() => {
                        activeTriggerBtn.textContent = origText;
                        activeTriggerBtn.style.backgroundColor = 'transparent';
                        activeTriggerBtn.style.color = 'var(--black)';
                        activeTriggerBtn.style.borderColor = 'var(--black)';
                    }, 1500);
                }
            });
        }

        // Lógica de filtrado y ordenación
        const cards = Array.from(exploreGrid.querySelectorAll('.winery-card'));
        
        cards.forEach((card, index) => {
            card.setAttribute('data-index', index);
        });

        let activeLocation = 'all';
        let activeExperience = 'all';

        function applyFilters() {
            const sortVal = filterSort.value;

            cards.forEach(card => {
                const cardLoc = card.getAttribute('data-category');
                const cardExp = card.getAttribute('data-experience');

                const matchesLoc = (activeLocation === 'all' || cardLoc === activeLocation);
                const matchesExp = (activeExperience === 'all' || cardExp === activeExperience);

                if (matchesLoc && matchesExp) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            const sortedCards = [...cards].sort((a, b) => {
                if (sortVal === 'asc' || sortVal === 'desc') {
                    const nameA = a.querySelector('h3').textContent.trim();
                    const nameB = b.querySelector('h3').textContent.trim();
                    const comp = nameA.localeCompare(nameB);
                    return sortVal === 'asc' ? comp : -comp;
                }
                const indexA = parseInt(a.getAttribute('data-index'), 10);
                const indexB = parseInt(b.getAttribute('data-index'), 10);
                return indexA - indexB;
            });

            sortedCards.forEach(card => {
                exploreGrid.appendChild(card);
            });
        }

        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const locVal = button.getAttribute('data-loc-filter');
                const expVal = button.getAttribute('data-exp-filter');

                if (locVal !== null) {
                    const siblings = button.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(sib => sib.classList.remove('active'));
                    button.classList.add('active');
                    activeLocation = locVal;
                } else if (expVal !== null) {
                    const siblings = button.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(sib => sib.classList.remove('active'));
                    button.classList.add('active');
                    activeExperience = expVal;
                }

                applyFilters();
            });
        });

        filterSort.addEventListener('change', applyFilters);
        applyFilters();

        const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
        const advancedFiltersPanel = document.getElementById('advanced-filters-panel');

        if (toggleFiltersBtn && advancedFiltersPanel) {
            toggleFiltersBtn.addEventListener('click', () => {
                const isCollapsed = advancedFiltersPanel.classList.toggle('hidden');
                if (isCollapsed) {
                    toggleFiltersBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Mostrar Filtros
                    `;
                } else {
                    toggleFiltersBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Ocultar Filtros
                    `;
                }
            });
        }
    }
});
