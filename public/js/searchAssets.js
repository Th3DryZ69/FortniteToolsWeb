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

    const top = rect.top - ttH - margin >= 0
        ? rect.top - ttH - margin + window.scrollY
        : rect.bottom + margin + window.scrollY;

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top + 'px';
}

// ── Clipboard ──
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '✔️';
        setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
    }).catch(err => console.error('Failed to copy:', err));
}

// ── JSON Viewer ──
function openJsonViewer(jsonPath, filePath) {
    const newWindow = window.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>JSON Viewer</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; background: #27272f; color: #929295; margin: 0; padding: 20px; }
                h2 { color: #ec7519; margin: 0 0 6px; font-size: 15px; }
                .filepath { font-size: 11px; color: #555; margin-bottom: 16px; word-break: break-all; }
                pre { background: #32333d; border: 1px solid #3e3f4a; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.6; }
                .loading { color: #929295; font-size: 13px; display: flex; align-items: center; gap: 8px; }
                .spinner { width: 14px; height: 14px; border: 2px solid #3e3f4a; border-top-color: #ec7519; border-radius: 50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h2>JSON Viewer</h2>
            <div class="filepath">${filePath}</div>
            <div class="loading" id="loading"><div class="spinner"></div> Loading JSON data...</div>
            <pre id="json-content"></pre>
            <script>
                async function fetchJsonData(url) {
                    try {
                        const r = await fetch(url);
                        if (!r.ok) throw new Error('Network response was not ok');
                        const data = await r.json();
                        document.getElementById('loading').style.display = 'none';
                        document.getElementById('json-content').textContent = JSON.stringify(data, null, 4);
                    } catch (err) {
                        document.getElementById('loading').textContent = 'Error: ' + err.message;
                    }
                }
                fetchJsonData('${jsonPath}');
            <\/script>
        </body>
        </html>
    `);
    newWindow.document.close();
}

// ── Format path ──
function formatAssetPath(assetPath) {
    const addCCheckbox = document.getElementById('addC');
    if (assetPath.startsWith('FortniteGame/Content')) {
        assetPath = assetPath.replace('FortniteGame/Content', '/Game').replace('.uasset', '');
    } else {
        const match = assetPath.match(/\/([^/]+)\/Content\/(.+)/);
        if (match) {
            assetPath = `/${match[1]}/${match[2].replace('.uasset', '')}`;
        }
    }
    const lastPart = assetPath.substring(assetPath.lastIndexOf('/') + 1);
    assetPath += `.${lastPart}`;
    if (addCCheckbox.checked) assetPath += '_C';
    return assetPath;
}

// // ── Search ──
// async function searchAssets() {
//     const keywordsInput = document.getElementById('keywords').value.trim();
//     const formatted     = document.getElementById('formatted').checked;
//     const resultsBody   = document.getElementById('results');
//     const loading       = document.getElementById('loading');
//     const countEl       = document.getElementById('results-count');

//     resultsBody.innerHTML = '';
//     countEl.innerHTML = '';

//     if (!keywordsInput) {
//         alert('Please enter at least one keyword.');
//         return;
//     }

//     const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
//     loading.style.display = 'flex';

//     try {
//         const response = await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets');
//         const assets   = await response.json();

//         const matchingPaths = assets.filter(p =>
//             keywords.every(kw => p.toLowerCase().includes(kw))
//         );
//         const finalPaths = formatted ? matchingPaths.map(formatAssetPath) : matchingPaths;

//         countEl.innerHTML = `<span>${finalPaths.length}</span> result${finalPaths.length !== 1 ? 's' : ''} found`;

//         finalPaths.forEach((path, index) => {
//             const row = document.createElement('tr');

//             // Index cell
//             const tdIdx = document.createElement('td');
//             tdIdx.textContent = index + 1;
//             row.appendChild(tdIdx);

//             // Path cell
//             const tdPath = document.createElement('td');
//             const pathCell = document.createElement('div');
//             pathCell.className = 'path-cell';

//             const pathText = document.createElement('span');
//             pathText.className = 'path-text';
//             pathText.textContent = path;
//             attachTooltip(pathText, path);

//             const actions = document.createElement('div');
//             actions.className = 'path-actions';

//             const viewBtn = document.createElement('button');
//             viewBtn.className = 'view-btn';
//             viewBtn.innerHTML = '👁️';
//             viewBtn.title = 'View JSON';
//             viewBtn.addEventListener('click', () => {
//                 const jsonPath = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`;
//                 openJsonViewer(jsonPath, path);
//             });

//             const copyBtn = document.createElement('button');
//             copyBtn.className = 'copy-btn';
//             copyBtn.innerHTML = '📋';
//             copyBtn.title = 'Copy Path';
//             copyBtn.addEventListener('click', () => copyToClipboard(path, copyBtn));

//             actions.appendChild(viewBtn);
//             actions.appendChild(copyBtn);
//             pathCell.appendChild(pathText);
//             pathCell.appendChild(actions);
//             tdPath.appendChild(pathCell);
//             row.appendChild(tdPath);

//             resultsBody.appendChild(row);
//         });

//     } catch (err) {
//         console.error('Error fetching assets:', err);
//         alert('An error occurred while fetching the assets.');
//     } finally {
//         loading.style.display = 'none';
//     }
// }

// // ── Search ──
// async function searchAssets() {
//     const keywordsInput = document.getElementById('keywords').value.trim();
//     const formatted     = document.getElementById('formatted').checked;
//     const resultsBody   = document.getElementById('results');
//     const loading       = document.getElementById('loading');
//     const countEl       = document.getElementById('results-count');
//     resultsBody.innerHTML = '';
//     countEl.innerHTML = '';
//     if (!keywordsInput) {
//         alert('Please enter at least one keyword.');
//         return;
//     }
//     const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
//     loading.style.display = 'flex';
//     try {
//         // JSON local
//         const response = await fetch('../data/fortnite_assets.json');
//         const data     = await response.json();
//         const assets   = data.assets;
//         const matchingPaths = assets.filter(p =>
//             keywords.every(kw => p.toLowerCase().includes(kw))
//         );
//         const finalPaths = formatted ? matchingPaths.map(formatAssetPath) : matchingPaths;
//         countEl.innerHTML = `<span>${finalPaths.length}</span> result${finalPaths.length !== 1 ? 's' : ''} found`;
//         finalPaths.forEach((path, index) => {
//             const row = document.createElement('tr');
//             const tdIdx = document.createElement('td');
//             tdIdx.textContent = index + 1;
//             row.appendChild(tdIdx);
//             const tdPath = document.createElement('td');
//             const pathCell = document.createElement('div');
//             pathCell.className = 'path-cell';
//             const pathText = document.createElement('span');
//             pathText.className = 'path-text';
//             pathText.textContent = path;
//             attachTooltip(pathText, path);
//             const actions = document.createElement('div');
//             actions.className = 'path-actions';
//             // 👁️ View JSON (API)
//             const viewBtn = document.createElement('button');
//             viewBtn.className = 'view-btn';
//             viewBtn.innerHTML = '👁️';
//             viewBtn.title = 'View JSON';
//             viewBtn.addEventListener('click', () => {
//                 let apiPath = path.endsWith('_C') ? path.slice(0, -2) : path;
//                 const jsonPath = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(apiPath)}&raw=true`;
//                 openJsonViewer(jsonPath, path);
//             });
//             // 📋 Copy
//             const copyBtn = document.createElement('button');
//             copyBtn.className = 'copy-btn';
//             copyBtn.innerHTML = '📋';
//             copyBtn.title = 'Copy Path';
//             copyBtn.addEventListener('click', () => copyToClipboard(path, copyBtn));
//             actions.appendChild(viewBtn);
//             actions.appendChild(copyBtn);
//             pathCell.appendChild(pathText);
//             pathCell.appendChild(actions);
//             tdPath.appendChild(pathCell);
//             row.appendChild(tdPath);
//             resultsBody.appendChild(row);
//         });
//     } catch (err) {
//         console.error('Error fetching assets:', err);
//         alert('An error occurred while fetching the assets.');
//     } finally {
//         loading.style.display = 'none';
//     }
// }

let ALL_ASSETS = [];
let ASSETS_LOADED = false;

async function loadAssets() {
    if (ASSETS_LOADED) return;
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';
    try {
        const response = await fetch('../data/fortnite_assets.gz');
        const buffer = await response.arrayBuffer();
        const ds = new DecompressionStream("gzip");
        const decompressedStream = new Blob([buffer]).stream().pipeThrough(ds);
        const text = await new Response(decompressedStream).text();
        ALL_ASSETS = text.split("\n");
        ASSETS_LOADED = true;
        console.log("Assets loaded:", ALL_ASSETS.length);
    } catch (err) {
        console.error("Asset loading failed:", err);
    } finally {
        loading.style.display = 'none';
    }
}

window.addEventListener("DOMContentLoaded", loadAssets);

async function searchAssets() {
    if (!ASSETS_LOADED) {
        alert("Assets are still loading...");
        return;
    }
    const keywordsInput = document.getElementById('keywords').value.trim();
    const formatted     = document.getElementById('formatted').checked;
    const resultsBody   = document.getElementById('results');
    const countEl       = document.getElementById('results-count');
    resultsBody.innerHTML = '';
    countEl.innerHTML = '';
    if (!keywordsInput) {
        alert('Please enter at least one keyword.');
        return;
    }
    const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const matchingPaths = ALL_ASSETS.filter(p =>
        keywords.every(kw => p.toLowerCase().includes(kw))
    );
    const finalPaths = formatted ? matchingPaths.map(formatAssetPath) : matchingPaths;
    countEl.innerHTML = `<span>${finalPaths.length}</span> result${finalPaths.length !== 1 ? 's' : ''} found`;
    finalPaths.forEach((path, index) => {
        const row = document.createElement('tr');
        const tdIdx = document.createElement('td');
        tdIdx.textContent = index + 1;
        row.appendChild(tdIdx);
        const tdPath = document.createElement('td');
        const pathCell = document.createElement('div');
        pathCell.className = 'path-cell';
        const pathText = document.createElement('span');
        pathText.className = 'path-text';
        pathText.textContent = path;
        attachTooltip(pathText, path);
        const actions = document.createElement('div');
        actions.className = 'path-actions';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-btn';
        viewBtn.innerHTML = '👁️';
        viewBtn.title = 'View JSON';
        viewBtn.addEventListener('click', () => {
            let apiPath = path.endsWith('_C') ? path.slice(0, -2) : path;
            const jsonPath =
                `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(apiPath)}&raw=true`;
            openJsonViewer(jsonPath, path);
        });
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy Path';
        copyBtn.addEventListener('click', () => copyToClipboard(path, copyBtn));
        actions.appendChild(viewBtn);
        actions.appendChild(copyBtn);
        pathCell.appendChild(pathText);
        pathCell.appendChild(actions);
        tdPath.appendChild(pathCell);
        row.appendChild(tdPath);
        resultsBody.appendChild(row);
    });
}




// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.search-btn').addEventListener('click', searchAssets);
    document.getElementById('keywords').addEventListener('keydown', e => {
        if (e.key === 'Enter') searchAssets();
    });
});
