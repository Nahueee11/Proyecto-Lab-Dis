document.addEventListener('DOMContentLoaded', () => {
    // --- Explorar Page Logic: Minimal Chip Filters & Sorting ---
    const exploreGrid = document.getElementById('explore-grid');
    const filterSort = document.getElementById('filter-sort');

    if (exploreGrid && filterSort) {
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
