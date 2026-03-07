// ── Tooltip ──
const tooltip = document.createElement('div');
tooltip.id = 'ft-tooltip';
document.body.appendChild(tooltip);

let tooltipTimeout = null;

function attachTooltip(el, text) {
    if (!text) return;

    el.addEventListener('mouseenter', () => {
        // Only show if the text is actually truncated (scrollWidth > clientWidth)
        if (el.scrollWidth <= el.clientWidth) return;

        clearTimeout(tooltipTimeout);
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        positionTooltip(el);
    });

    el.addEventListener('mousemove', () => {
        positionTooltip(el);
    });

    el.addEventListener('mouseleave', () => {
        tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 80);
    });
}

function positionTooltip(el) {
    const rect   = el.getBoundingClientRect();
    const ttW    = Math.min(tooltip.offsetWidth, window.innerWidth - 16);
    const ttH    = tooltip.offsetHeight;
    const margin = 8;

    // Center horizontally on the element, then clamp inside viewport
    let left = rect.left + rect.width / 2 - ttW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - ttW - margin));

    // Prefer above, flip below if not enough room
    let top;
    if (rect.top - ttH - margin >= 0) {
        top = rect.top - ttH - margin + window.scrollY;
    } else {
        top = rect.bottom + margin + window.scrollY;
    }

    // Clamp max-width to viewport on small screens
    tooltip.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
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

// ── Cards ──
const meshDiv = document.getElementById('meshDiv');

fetch('../data/devicemeshs.json')
    .then(r => r.json())
    .then(data => {
        Object.entries(data)
            .sort(([a], [b]) => {
                const aL = /^[a-zA-Z]/.test(a);
                const bL = /^[a-zA-Z]/.test(b);
                if (aL && !bL) return -1;
                if (!aL && bL) return 1;
                return a.localeCompare(b, undefined, { sensitivity: 'base' });
            })
            .forEach(([deviceName, deviceData]) => {
                // if (deviceData.dispo === false) return;
                const isHidden = deviceData.dispo === false;

                const card = document.createElement('div');
                card.className = 'device-card';
                card.dataset.deviceName = deviceName.toLowerCase();

                // ── Header ──
                const header = document.createElement('div');
                header.className = 'card-header';

                if (deviceData.image) {
                    const img = document.createElement('img');
                    img.className = 'card-img';
                    img.src = deviceData.image;
                    img.alt = deviceName;
                    header.appendChild(img);
                } else {
                    const ph = document.createElement('div');
                    ph.className = 'card-img-placeholder';
                    ph.innerHTML = '📦';
                    header.appendChild(ph);
                }

                const headerText = document.createElement('div');
                headerText.className = 'card-header-text';

                const nameEl = document.createElement('div');
                nameEl.className = 'card-device-name';
                nameEl.textContent = deviceName;
                attachTooltip(nameEl, deviceName);

                const playsetEl = document.createElement('div');
                playsetEl.className = 'card-playset';
                if (deviceData.playset) {
                    playsetEl.innerHTML = `<span class="card-playset-label">Playset: </span>${deviceData.playset}`;
                    attachTooltip(playsetEl, 'Playset: ' + deviceData.playset);
                }

                headerText.appendChild(nameEl);
                headerText.appendChild(playsetEl);
                header.appendChild(headerText);
                card.appendChild(header);

                // ── Important ──
                if (deviceData.important) {
                    const imp = document.createElement('div');
                    imp.className = 'card-important';
                    imp.textContent = `⚠️ ${deviceData.important}`;
                    card.appendChild(imp);
                }

                // ── Path ──
                if (deviceData.path) {
                    const pathRow = document.createElement('div');
                    pathRow.className = 'card-path';

                    const label = document.createElement('span');
                    label.className = 'card-path-label';
                    label.textContent = 'Path';

                    const val = document.createElement('span');
                    val.className = 'card-path-value';
                    val.textContent = deviceData.path;
                    attachTooltip(val, deviceData.path);

                    pathRow.appendChild(label);
                    pathRow.appendChild(val);
                    pathRow.appendChild(makeCopyBtn(deviceData.path));
                    card.appendChild(pathRow);
                }

                // ── Settings ──
                const settings = Object.entries(deviceData.settings || {});
                if (settings.length > 0) {
                    const settingsDiv = document.createElement('div');
                    settingsDiv.className = 'card-settings';

                    settings.forEach(([settingName, settingData]) => {
                        const row = document.createElement('div');
                        row.className = 'setting-row';

                        const nameCell = document.createElement('div');
                        nameCell.className = 'setting-name';
                        nameCell.textContent = settingName;
                        attachTooltip(nameCell, settingName);

                        const fieldsCell = document.createElement('div');
                        fieldsCell.className = 'setting-fields';

                        // Key line
                        const keyLine = document.createElement('div');
                        keyLine.className = 'setting-field-line';

                        const keyTag = document.createElement('span');
                        keyTag.className = 'field-tag';
                        keyTag.textContent = 'Key';

                        const keyText = document.createElement('span');
                        keyText.className = 'field-text';
                        keyText.textContent = settingData['option key'] || '';
                        attachTooltip(keyText, settingData['option key'] || '');

                        keyLine.appendChild(keyTag);
                        keyLine.appendChild(keyText);
                        keyLine.appendChild(makeCopyBtn(settingData['option key'] || ''));

                        // Value line
                        const valLine = document.createElement('div');
                        valLine.className = 'setting-field-line';

                        const valTag = document.createElement('span');
                        valTag.className = 'field-tag';
                        valTag.textContent = 'Val';

                        const valText = document.createElement('span');
                        valText.className = 'field-text';
                        valText.textContent = settingData.value || '';
                        attachTooltip(valText, settingData.value || '');

                        valLine.appendChild(valTag);
                        valLine.appendChild(valText);
                        valLine.appendChild(makeCopyBtn(settingData.value || ''));

                        fieldsCell.appendChild(keyLine);
                        fieldsCell.appendChild(valLine);
                        row.appendChild(nameCell);
                        row.appendChild(fieldsCell);
                        settingsDiv.appendChild(row);
                    });

                    card.appendChild(settingsDiv);
                }
                
                if (isHidden) card.dataset.dispoHidden = 'true';
                card.style.display = isHidden ? 'none' : '';
                meshDiv.appendChild(card);
                // meshDiv.appendChild(card);
            });
    })
    .catch(err => console.error('Error loading JSON:', err));

// ── Search ──
const searchToggle = document.getElementById('searchToggle');
const searchInput  = document.getElementById('searchInput');

searchToggle.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    if (searchInput.classList.contains('active')) searchInput.focus();
});

searchInput.addEventListener('input', function () {
    const filter = this.value.trim().toLowerCase();
    document.querySelectorAll('.device-card').forEach(card => {
        const match = !filter || card.dataset.deviceName.startsWith(filter);
        card.style.display = match ? '' : 'none';
    });
});










// ── Show All Toggle ──
let showingAll = false;

document.getElementById('showAllToggle').addEventListener('click', function () {
    showingAll = !showingAll;

    document.querySelectorAll('.device-card[data-dispo-hidden="true"]').forEach(card => {
        card.style.display = showingAll ? '' : 'none';
    });

    this.textContent = showingAll ? '🙈 Hide Unavailable' : '👁 Show All';
});