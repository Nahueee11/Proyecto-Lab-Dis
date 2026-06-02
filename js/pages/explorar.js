document.addEventListener('DOMContentLoaded', () => {
    // --- Explorar Page Logic: Minimal Chip Filters & Sorting ---
    const exploreGrid = document.getElementById('explore-grid');
    const filterSort = document.getElementById('filter-sort');

    if (exploreGrid && filterSort) {
        // Cargar experiencias dinámicas creadas por las bodegas
        const dynamicExps = JSON.parse(localStorage.getItem('entreCopasExperiencias') || '[]');
        dynamicExps.forEach(exp => {
            // Mapear imagen aproximada según el tipo de experiencia
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

        // Intercept cart addition clicks (Event Delegation)
        exploreGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-add-cart');
            if (!btn) return;

            const id = btn.getAttribute('data-id');
            const bodega = btn.getAttribute('data-bodega');
            const titulo = btn.getAttribute('data-titulo');
            const precio = parseFloat(btn.getAttribute('data-precio'));
            const tipo = btn.getAttribute('data-tipo');
            const regionKey = btn.getAttribute('data-region-key');
            const regionName = btn.getAttribute('data-region-name');
            const horariosRaw = btn.getAttribute('data-horarios') || '12:00';
            const horarios = horariosRaw.split(',');

            let cart = JSON.parse(localStorage.getItem('entreCopasCart') || '[]');
            
            // Check if already in cart
            const existingItemIndex = cart.findIndex(item => item.id === id);
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].cantidad += 1;
            } else {
                // Default date: tomorrow
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                cart.push({
                    id: id,
                    bodega: bodega,
                    titulo: titulo,
                    precio: precio,
                    tipo: tipo,
                    regionKey: regionKey,
                    regionName: regionName,
                    horarios: horarios,
                    cantidad: 1,
                    fecha: tomorrow,
                    hora: horarios[0] || '12:00'
                });
            }

            localStorage.setItem('entreCopasCart', JSON.stringify(cart));
            
            // Dispatch dynamic update for navbar
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            // Optimistic UX feedback (micro-animation / text switch)
            const origText = btn.textContent;
            btn.textContent = '¡Añadido! ✓';
            btn.style.backgroundColor = 'var(--primary)';
            btn.style.color = 'var(--on-primary)';
            btn.style.borderColor = 'var(--primary)';
            
            setTimeout(() => {
                btn.textContent = origText;
                btn.style.backgroundColor = 'transparent';
                btn.style.color = 'var(--black)';
                btn.style.borderColor = 'var(--black)';
            }, 1200);
        });

        const cards = Array.from(exploreGrid.querySelectorAll('.winery-card'));
        
        // Save original index for default relevance sorting
        cards.forEach((card, index) => {
            card.setAttribute('data-index', index);
        });

        // Current active filter states
        let activeLocation = 'all';
        let activeExperience = 'all';

        function applyFilters() {
            const sortVal = filterSort.value;

            // 1. Filter elements based on activeLocation and activeExperience states
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

            // 2. Sort elements in-memory
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

            // 3. Re-append in sorted order
            sortedCards.forEach(card => {
                exploreGrid.appendChild(card);
            });
        }

        // Add click listener for filter chips
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const locVal = button.getAttribute('data-loc-filter');
                const expVal = button.getAttribute('data-exp-filter');

                // Determine filter group type
                if (locVal !== null) {
                    // Location group: remove active from other location chips
                    const siblings = button.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(sib => sib.classList.remove('active'));
                    button.classList.add('active');
                    activeLocation = locVal;
                } else if (expVal !== null) {
                    // Experience group: remove active from other experience chips
                    const siblings = button.parentElement.querySelectorAll('.filter-chip');
                    siblings.forEach(sib => sib.classList.remove('active'));
                    button.classList.add('active');
                    activeExperience = expVal;
                }

                // Apply changes instantly
                applyFilters();
            });
        });

        // Add change listener for compact sort dropdown
        filterSort.addEventListener('change', applyFilters);

        // Run initially
        applyFilters();

        // Toggle filters panel visibility
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
