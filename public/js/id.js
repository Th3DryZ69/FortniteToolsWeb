// ── Tooltip ──
const tooltip = document.createElement('div');
tooltip.id = 'ft-tooltip';
document.body.appendChild(tooltip);

let tooltipTimeout = null;

function attachTooltip(el, text) {
    if (!text) return;
    el.addEventListener('mouseenter', () => {
        if (el.scrollWidth <= el.clientWidth) return;
        clearTimeout(tooltipTimeout);
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        positionTooltip(el);
    });
    el.addEventListener('mousemove', () => positionTooltip(el));
    el.addEventListener('mouseleave', () => {
        tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 80);
    });
}

function positionTooltip(el) {
    const rect   = el.getBoundingClientRect();
    const margin = 8;
    tooltip.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
    const ttW = Math.min(tooltip.offsetWidth, window.innerWidth - margin * 2);
    const ttH = tooltip.offsetHeight;

    let left = rect.left + rect.width / 2 - ttW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - ttW - margin));

    let top;
    if (rect.top - ttH - margin >= 0) {
        top = rect.top - ttH - margin + window.scrollY;
    } else {
        top = rect.bottom + margin + window.scrollY;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top + 'px';
}

// ── Clipboard ──
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '✔️';
        setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
    });
}

function makeCopyBtn(text) {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.title = 'Copy';
    btn.innerHTML = '📋';
    btn.onclick = () => copyToClipboard(text, btn);
    return btn;
}

// ── Build cards ──
async function loadJSON() {
    try {
        const response = await fetch('../data/id.json');
        const data = await response.json();
        generateCards(data);
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

function makeCard(itemKey, itemValue) {
    const card = document.createElement('div');
    card.className = 'id-card';

    // Header: image + name (same as deviceMeshs .card-header)
    const header = document.createElement('div');
    header.className = 'id-card-header';

    if (itemValue.image) {
        const img = document.createElement('img');
        img.className = 'id-card-img';
        img.src = itemValue.image;
        img.alt = itemKey;
        header.appendChild(img);
    } else {
        const ph = document.createElement('div');
        ph.className = 'id-card-img-placeholder';
        ph.innerHTML = '📦';
        header.appendChild(ph);
    }

    const name = document.createElement('div');
    name.className = 'id-card-name';
    name.textContent = itemKey;
    attachTooltip(name, itemKey);
    header.appendChild(name);
    card.appendChild(header);

    // Path row (same as deviceMeshs .card-path)
    if (itemValue.playset) {
        const playsetRow = document.createElement('div');
        playsetRow.className = 'id-card-path';

        const label = document.createElement('span');
        label.className = 'id-card-path-label';
        label.textContent = 'Playset';

        const label1 = document.createElement('span');
        label1.className = 'id-card-path-label';
        label1.textContent = 'Plot';

        const val = document.createElement('span');
        val.className = 'id-card-path-value';
        val.textContent = itemValue.playset;
        attachTooltip(val, itemValue.playset);

        playsetRow.appendChild(label);
        playsetRow.appendChild(val);
        playsetRow.appendChild(makeCopyBtn(itemValue.playset));
        card.appendChild(playsetRow);
    }

    if (itemValue.plot) {
        const plotRow = document.createElement('div');
        plotRow.className = 'id-card-path';

        const label = document.createElement('span');
        label.className = 'id-card-path-label';
        label.textContent = 'Plot';

        const val = document.createElement('span');
        val.className = 'id-card-path-value';
        val.textContent = itemValue.plot;
        attachTooltip(val, itemValue.plot);

        plotRow.appendChild(label);
        plotRow.appendChild(val);
        plotRow.appendChild(makeCopyBtn(itemValue.plot));
        card.appendChild(plotRow);
    }

    return card;
}

function generateCards(obj) {
    const container = document.getElementById('idTool');

    for (const [mainKey, mainValue] of Object.entries(obj)) {

        // Category label with divider line
        const catLabel = document.createElement('div');
        catLabel.className = 'id-category-label';
        catLabel.textContent = mainKey;
        container.appendChild(catLabel);

        for (const [subKey, subValue] of Object.entries(mainValue)) {

            // Subcategory label
            const subLabel = document.createElement('div');
            subLabel.className = 'id-subcategory-label';
            subLabel.textContent = subKey;
            container.appendChild(subLabel);

            const entries = Object.entries(subValue);

            if (entries.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'id-empty';
                empty.textContent = '(vide)';
                container.appendChild(empty);
                continue;
            }

            // Cards grid
            const grid = document.createElement('div');
            grid.className = 'id-cards-grid';

            entries
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([itemKey, itemValue]) => {
                    grid.appendChild(makeCard(itemKey, itemValue));
                });

            container.appendChild(grid);
        }
    }
}

loadJSON();
