// const tooltip = document.createElement('div');
// tooltip.id = 'ft-tooltip';
// document.body.appendChild(tooltip);

// let tooltipTimeout = null;

// function attachTooltip(el, text) {
//     if (!text) return;
//     el.addEventListener('mouseenter', () => {
//         if (el.scrollWidth <= el.clientWidth) return;
//         clearTimeout(tooltipTimeout);
//         tooltip.textContent = text;
//         tooltip.classList.add('visible');
//         positionTooltip(el);
//     });
//     el.addEventListener('mousemove', () => positionTooltip(el));
//     el.addEventListener('mouseleave', () => {
//         tooltipTimeout = setTimeout(() => tooltip.classList.remove('visible'), 80);
//     });
// }

// function positionTooltip(el) {
//     const rect   = el.getBoundingClientRect();
//     const margin = 8;
//     tooltip.style.maxWidth = (window.innerWidth - margin * 2) + 'px';
//     const ttW = Math.min(tooltip.offsetWidth, window.innerWidth - margin * 2);
//     const ttH = tooltip.offsetHeight;
//     let left = rect.left + rect.width / 2 - ttW / 2;
//     left = Math.max(margin, Math.min(left, window.innerWidth - ttW - margin));
//     const top = rect.top - ttH - margin >= 0
//         ? rect.top - ttH - margin + window.scrollY
//         : rect.bottom + margin + window.scrollY;

//     tooltip.style.left = left + 'px';
//     tooltip.style.top  = top + 'px';
// }

// function copyToClipboard(text, btn) {
//     navigator.clipboard.writeText(text).then(() => {
//         btn.innerHTML = '✔️';
//         setTimeout(() => { btn.innerHTML = '📋'; }, 2000);
//     }).catch(err => console.error('Failed to copy:', err));
// }

// function openJsonViewer(jsonPath, filePath) {
//     const newWindow = window.open();
//     newWindow.document.write(`
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>JSON Viewer</title>
//             <style>
//                 * { box-sizing: border-box; }
//                 body { font-family: 'Courier New', monospace; background: #27272f; color: #929295; margin: 0; padding: 20px; }
//                 h2 { color: #ec7519; margin: 0 0 6px; font-size: 15px; }
//                 .filepath { font-size: 11px; color: #555; margin-bottom: 16px; word-break: break-all; }
//                 pre { background: #32333d; border: 1px solid #3e3f4a; padding: 14px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.6; }
//                 .loading { color: #929295; font-size: 13px; display: flex; align-items: center; gap: 8px; }
//                 .spinner { width: 14px; height: 14px; border: 2px solid #3e3f4a; border-top-color: #ec7519; border-radius: 50%; animation: spin 0.7s linear infinite; }
//                 @keyframes spin { to { transform: rotate(360deg); } }
//             </style>
//         </head>
//         <body>
//             <h2>JSON Viewer</h2>
//             <div class="filepath">${filePath}</div>
//             <div class="loading" id="loading"><div class="spinner"></div> Loading JSON data...</div>
//             <pre id="json-content"></pre>
//             <script>
//                 async function fetchJsonData(url) {
//                     try {
//                         const r = await fetch(url);
//                         if (!r.ok) throw new Error('Network response was not ok');
//                         const data = await r.json();
//                         document.getElementById('loading').style.display = 'none';
//                         document.getElementById('json-content').textContent = JSON.stringify(data, null, 4);
//                     } catch (err) {
//                         document.getElementById('loading').textContent = 'Error: ' + err.message;
//                     }
//                 }
//                 fetchJsonData('${jsonPath}');
//             <\/script>
//         </body>
//         </html>
//     `);
//     newWindow.document.close();
// }

// function formatAssetPath(assetPath) {
//     const addCCheckbox = document.getElementById('addC');
//     if (assetPath.startsWith('FortniteGame/Content')) {
//         assetPath = assetPath.replace('FortniteGame/Content', '/Game').replace('.uasset', '');
//     } else {
//         const match = assetPath.match(/\/([^/]+)\/Content\/(.+)/);
//         if (match) {
//             assetPath = `/${match[1]}/${match[2].replace('.uasset', '')}`;
//         }
//     }
//     const lastPart = assetPath.substring(assetPath.lastIndexOf('/') + 1);
//     assetPath += `.${lastPart}`;
//     if (addCCheckbox.checked) assetPath += '_C';
//     return assetPath;
// }

// let ALL_ASSETS = [];
// let ASSETS_LOADED = false;

// async function loadAssets() {
//     if (ASSETS_LOADED) return;
//     const loading = document.getElementById('loading');
//     loading.style.display = 'flex';
//     try {
//         const response = await fetch('../data/fortnite_assets.gz');
//         const buffer = await response.arrayBuffer();
//         const ds = new DecompressionStream("gzip");
//         const decompressedStream = new Blob([buffer]).stream().pipeThrough(ds);
//         const text = await new Response(decompressedStream).text();
//         ALL_ASSETS = text.split("\n");
//         ASSETS_LOADED = true;
//         console.log("Assets loaded:", ALL_ASSETS.length);
//     } catch (err) {
//         console.error("Asset loading failed:", err);
//     } finally {
//         loading.style.display = 'none';
//     }
// }

// window.addEventListener("DOMContentLoaded", loadAssets);

// async function searchAssets() {
//     if (!ASSETS_LOADED) {
//         alert("Assets are still loading...");
//         return;
//     }
//     const keywordsInput = document.getElementById('keywords').value.trim();
//     const formatted     = document.getElementById('formatted').checked;
//     const resultsBody   = document.getElementById('results');
//     const countEl       = document.getElementById('results-count');
//     resultsBody.innerHTML = '';
//     countEl.innerHTML = '';
//     if (!keywordsInput) {
//         alert('Please enter at least one keyword.');
//         return;
//     }
//     const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
//     const matchingPaths = ALL_ASSETS.filter(p =>
//         keywords.every(kw => p.toLowerCase().includes(kw))
//     );
//     const finalPaths = matchingPaths.map(p => ({
//         display: formatted ? formatAssetPath(p) : p,
//         raw: p
//     }));
//     countEl.innerHTML = `<span>${finalPaths.length}</span> result${finalPaths.length !== 1 ? 's' : ''} found`;
//     finalPaths.forEach(({ display, raw }, index) => {
//     const row = document.createElement('tr');
//     const tdIdx = document.createElement('td');
//     tdIdx.textContent = index + 1;
//     row.appendChild(tdIdx);
//     const tdPath = document.createElement('td');
//     const pathCell = document.createElement('div');
//     pathCell.className = 'path-cell';
//     const pathText = document.createElement('span');
//     pathText.className = 'path-text';
//     pathText.textContent = display;
//     attachTooltip(pathText, display);
//     const actions = document.createElement('div');
//     actions.className = 'path-actions';
//     const viewBtn = document.createElement('button');
//     viewBtn.className = 'view-btn';
//     viewBtn.innerHTML = '👁️';
//     viewBtn.title = 'View JSON';
//     viewBtn.addEventListener('click', () => {
//         let apiPath = raw.endsWith('_C') ? raw.slice(0, -2) : raw;
//         const jsonPath = `https://export-service-new.dillyapis.com/v1/export?path=${encodeURIComponent(apiPath)}&raw=true`;
//         // const jsonPath = `https://api.fortniteapi.com/v1/export?path=${encodeURIComponent(apiPath)}&raw=true`;
//         openJsonViewer(jsonPath, raw);
//     });
//     const copyBtn = document.createElement('button');
//     copyBtn.className = 'copy-btn';
//     copyBtn.innerHTML = '📋';
//     copyBtn.title = 'Copy Path';
//     copyBtn.addEventListener('click', () => copyToClipboard(display, copyBtn))
//     actions.appendChild(viewBtn);
//     actions.appendChild(copyBtn);
//     pathCell.appendChild(pathText);
//     pathCell.appendChild(actions);
//     tdPath.appendChild(pathCell);
//     row.appendChild(tdPath);

//     resultsBody.appendChild(row);
// });
// }

// window.addEventListener('DOMContentLoaded', () => {
//     document.querySelector('.search-btn').addEventListener('click', searchAssets);
//     document.getElementById('keywords').addEventListener('keydown', e => {
//         if (e.key === 'Enter') searchAssets();
//     });
// });

























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
        tooltipTimeout = setTimeout(() => {
            tooltip.classList.remove('visible');
        }, 80);
    });
}

function positionTooltip(el) {
    const rect = el.getBoundingClientRect();
    const margin = 8;

    tooltip.style.maxWidth =
        (window.innerWidth - margin * 2) + 'px';

    const ttW = Math.min(
        tooltip.offsetWidth,
        window.innerWidth - margin * 2
    );

    const ttH = tooltip.offsetHeight;

    let left =
        rect.left +
        rect.width / 2 -
        ttW / 2;

    left = Math.max(
        margin,
        Math.min(
            left,
            window.innerWidth - ttW - margin
        )
    );

    const top =
        rect.top - ttH - margin >= 0
            ? rect.top - ttH - margin + window.scrollY
            : rect.bottom + margin + window.scrollY;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text)
        .then(() => {
            btn.innerHTML = '✔️';

            setTimeout(() => {
                btn.innerHTML = '📋';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
}

function openJsonViewer(jsonPath, imgPath,filePath) {
    const newWindow = window.open();

    if (!newWindow) {
        alert('Please allow popups for this website.');
        return;
    }

    newWindow.document.write(`
        <!DOCTYPE html>

        <html lang="en">

        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>JSON Viewer</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Courier New', monospace;
                    background: #27272f;
                    color: #929295;
                    margin: 0;
                    padding: 20px;
                }

                h2 {
                    color: #ec7519;
                    margin: 0 0 6px;
                    font-size: 15px;
                }

                .filepath {
                    font-size: 11px;
                    color: #555;
                    margin-bottom: 16px;
                    word-break: break-all;
                }

                pre {
                    background: #32333d;
                    border: 1px solid #3e3f4a;
                    padding: 14px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .loading {
                    color: #929295;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid #3e3f4a;
                    border-top-color: #ec7519;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>

        </head>

        <body>

            <h2>JSON Viewer</h2>

            <div class="filepath">
                ${filePath}
            </div>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                Loading JSON data...
            </div>

            <img src="${imgPath}" alt="">
            <pre id="json-content"></pre>

            <script>
                async function fetchJsonData(url) {
                    try {
                        const r = await fetch(url);

                        if (!r.ok) {
                            throw new Error(
                                'Network response was not ok'
                            );
                        }

                        const data = await r.json();

                        document.getElementById(
                            'loading'
                        ).style.display = 'none';

                        document.getElementById(
                            'json-content'
                        ).textContent =
                            JSON.stringify(data, null, 4);

                    } catch (err) {

                        document.getElementById(
                            'loading'
                        ).textContent =
                            'Error: ' + err.message;
                    }
                }

                fetchJsonData(
                    '${jsonPath}'
                );
            <\/script>

        </body>

        </html>
    `);

    newWindow.document.close();
}

function formatAssetPath(assetPath) {

    const addCCheckbox = document.getElementById('addC');

    // Nettoyage
    assetPath = assetPath.trim();

    // Supprime ./ éventuel
    assetPath = assetPath.replace(/^\.?\//, '');

    /*
    |--------------------------------------------------------------------------
    | FORTNITE GAME
    |--------------------------------------------------------------------------
    |
    | FortniteGame/Content/Athena/...
    | -> /Game/Athena/...
    |
    */

    if (assetPath.startsWith('FortniteGame/Content/')) {

        assetPath = assetPath
            .replace(
                /^FortniteGame\/Content\//,
                '/Game/'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | GAMEFEATURES
    |--------------------------------------------------------------------------
    |
    | FortniteGame/Plugins/GameFeatures/BRCosmetics/Content/Athena/...
    |
    | ou
    |
    | /Plugins/GameFeatures/BRCosmetics/Content/Athena/...
    |
    | -> /BRCosmetics/Athena/...
    |
    */

    else if (
        assetPath.startsWith(
            'FortniteGame/Plugins/GameFeatures/'
        )
    ) {

        const match = assetPath.match(
            /^FortniteGame\/Plugins\/GameFeatures\/(.+?)\/Content\/(.+)$/
        );

        if (match) {

            assetPath =
                `/${match[1]}/${match[2]}`;
        }
    }

    else if (
        assetPath.startsWith(
            'Plugins/GameFeatures/'
        )
    ) {

        const match = assetPath.match(
            /^Plugins\/GameFeatures\/(.+?)\/Content\/(.+)$/
        );

        if (match) {

            assetPath =
                `/${match[1]}/${match[2]}`;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CAS PARTICULIER :
    | /Plugins/GameFeatures/...
    |--------------------------------------------------------------------------
    */

    else if (
        assetPath.startsWith(
            '/Plugins/GameFeatures/'
        )
    ) {

        const match = assetPath.match(
            /^\/Plugins\/GameFeatures\/(.+?)\/Content\/(.+)$/
        );

        if (match) {

            assetPath =
                `/${match[1]}/${match[2]}`;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FORTNITEGAME SANS CONTENT
    |--------------------------------------------------------------------------
    |
    | FortniteGame/Athena/...
    |
    | -> /Game/Athena/...
    |
    */

    else if (
        assetPath.startsWith(
            'FortniteGame/'
        )
    ) {

        assetPath =
            assetPath.replace(
                /^FortniteGame\//,
                '/Game/'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | PLUGIN CLASSIQUE
    |--------------------------------------------------------------------------
    |
    | BRCosmetics/Content/Athena/...
    |
    | -> /BRCosmetics/Athena/...
    |
    */

    else {

        const match = assetPath.match(
            /^([^/]+)\/Content\/(.+)$/
        );

        if (match) {

            assetPath =
                `/${match[1]}/${match[2]}`;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Nettoyage .uasset
    |--------------------------------------------------------------------------
    */

    assetPath =
        assetPath.replace(
            /\.uasset$/i,
            ''
        );

    /*
    |--------------------------------------------------------------------------
    | Nom de l'asset
    |--------------------------------------------------------------------------
    */

    const lastPart =
        assetPath.substring(
            assetPath.lastIndexOf('/') + 1
        );

    /*
    |--------------------------------------------------------------------------
    | Évite de doubler .AssetName
    |--------------------------------------------------------------------------
    */

    if (
        !assetPath.endsWith(
            `.${lastPart}`
        )
    ) {
        assetPath += `.${lastPart}`;
    }

    /*
    |--------------------------------------------------------------------------
    | _C
    |--------------------------------------------------------------------------
    */

    if (
        addCCheckbox &&
        addCCheckbox.checked
    ) {
        assetPath += '_C';
    }

    return assetPath;
}


/*
|--------------------------------------------------------------------------
| ASSETS
|--------------------------------------------------------------------------
*/

let ALL_ASSETS = [];
let NEW_ASSETS = [];

let ASSETS_LOADED = false;
let NEW_ASSETS_LOADED = false;

/*
    all = fortnite_assets.gz
    new = fortnite_assets_new.gz
*/
let CURRENT_ASSET_LIST = 'all';


/*
|--------------------------------------------------------------------------
| LOAD GZIP
|--------------------------------------------------------------------------
*/

async function loadGzipAssets(path) {

    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Failed to load ${path}: ${response.status}`
        );
    }

    const buffer =
        await response.arrayBuffer();

    const ds =
        new DecompressionStream('gzip');

    const decompressedStream =
        new Blob([buffer])
            .stream()
            .pipeThrough(ds);

    const text =
        await new Response(
            decompressedStream
        ).text();

    return text
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean);
}


/*
|--------------------------------------------------------------------------
| LOAD ORIGINAL ASSETS
|--------------------------------------------------------------------------
*/

async function loadAssets() {

    if (ASSETS_LOADED) {
        return;
    }

    const loading =
        document.getElementById('loading');

    if (loading) {
        loading.style.display = 'flex';
    }

    try {

        ALL_ASSETS =
            await loadGzipAssets(
                '../data/fortnite_assets.gz'
            );

        ASSETS_LOADED = true;

        console.log(
            'Original assets loaded:',
            ALL_ASSETS.length
        );

    } catch (err) {

        console.error(
            'Asset loading failed:',
            err
        );

        alert(
            'Failed to load fortnite_assets.gz'
        );

    } finally {

        if (loading) {
            loading.style.display = 'none';
        }
    }
}


/*
|--------------------------------------------------------------------------
| LOAD NEW ASSETS
|--------------------------------------------------------------------------
*/

async function loadNewAssets() {

    if (NEW_ASSETS_LOADED) {
        return;
    }

    const loading =
        document.getElementById('loading');

    if (loading) {
        loading.style.display = 'flex';
    }

    try {

        NEW_ASSETS =
            await loadGzipAssets(
                '../data/fortnite_assets_new.gz'
            );

        NEW_ASSETS_LOADED = true;

        console.log(
            'New assets loaded:',
            NEW_ASSETS.length
        );

    } catch (err) {

        console.error(
            'New asset loading failed:',
            err
        );

        alert(
            'Failed to load fortnite_assets_new.gz'
        );

    } finally {

        if (loading) {
            loading.style.display = 'none';
        }
    }
}


/*
|--------------------------------------------------------------------------
| CURRENT ASSET LIST
|--------------------------------------------------------------------------
*/

function getCurrentAssets() {

    if (CURRENT_ASSET_LIST === 'new') {
        return NEW_ASSETS;
    }

    return ALL_ASSETS;
}


/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

async function searchAssets() {

    /*
        Charge uniquement le fichier
        correspondant au bouton sélectionné.
    */

    if (
        CURRENT_ASSET_LIST === 'all' &&
        !ASSETS_LOADED
    ) {
        await loadAssets();
    }

    if (
        CURRENT_ASSET_LIST === 'new' &&
        !NEW_ASSETS_LOADED
    ) {
        await loadNewAssets();
    }


    const assets =
        getCurrentAssets();


    if (!assets || assets.length === 0) {

        alert(
            'No assets loaded.'
        );

        return;
    }


    const keywordsInput =
        document
            .getElementById('keywords')
            .value
            .trim();


    const formatted =
        document
            .getElementById('formatted')
            .checked;


    const resultsBody =
        document.getElementById('results');


    const countEl =
        document.getElementById(
            'results-count'
        );


    resultsBody.innerHTML = '';
    countEl.innerHTML = '';


    if (!keywordsInput) {

        alert(
            'Please enter at least one keyword.'
        );

        return;
    }


    const keywords =
        keywordsInput
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(Boolean);


    const matchingPaths =
        assets.filter(p =>
            keywords.every(kw =>
                p
                    .toLowerCase()
                    .includes(kw)
            )
        );


    const finalPaths =
        matchingPaths.map(p => ({
            display:
                formatted
                    ? formatAssetPath(p)
                    : p,

            raw: p
        }));


    countEl.innerHTML =
        `<span>${finalPaths.length}</span> result${finalPaths.length !== 1 ? 's' : ''} found`;


    /*
    |--------------------------------------------------------------------------
    | RESULTS
    |--------------------------------------------------------------------------
    */

    finalPaths.forEach(
        ({ display, raw }, index) => {

            const row =
                document.createElement('tr');


            /*
            |--------------------------------------------------------------------------
            | INDEX
            |--------------------------------------------------------------------------
            */

            const tdIdx =
                document.createElement('td');

            tdIdx.textContent =
                index + 1;

            row.appendChild(tdIdx);


            /*
            |--------------------------------------------------------------------------
            | PATH
            |--------------------------------------------------------------------------
            */

            const tdPath =
                document.createElement('td');


            const pathCell =
                document.createElement('div');

            pathCell.className =
                'path-cell';


            /*
            |--------------------------------------------------------------------------
            | PATH TEXT
            |--------------------------------------------------------------------------
            */

            const pathText =
                document.createElement('span');

            pathText.className =
                'path-text';

            pathText.textContent =
                display;


            attachTooltip(
                pathText,
                display
            );


            /*
            |--------------------------------------------------------------------------
            | ACTIONS
            |--------------------------------------------------------------------------
            */

            const actions =
                document.createElement('div');

            actions.className =
                'path-actions';


            /*
            |--------------------------------------------------------------------------
            | VIEW JSON
            |--------------------------------------------------------------------------
            */

            const viewBtn =
                document.createElement('button');

            viewBtn.className =
                'view-btn';

            viewBtn.innerHTML =
                '👁️';

            viewBtn.title =
                'View JSON';


            viewBtn.addEventListener(
                'click',
                () => {

                    let apiPath =
                        raw.endsWith('_C')
                            ? raw.slice(0, -2)
                            : raw;


                    const jsonPath =
                        `https://export-service-new.dillyapis.com/v1/export?path=${encodeURIComponent(apiPath)}&raw=true`;

                    
                    const imgPath =
                        `https://export-service-new.dillyapis.com/v1/export?path=${encodeURIComponent(apiPath)}&ForceImage=true`;
                    
                    openJsonViewer(
                        jsonPath,
                        imgPath,
                        raw
                    );
                }
            );


            /*
            |--------------------------------------------------------------------------
            | COPY
            |--------------------------------------------------------------------------
            */

            const copyBtn =
                document.createElement('button');

            copyBtn.className =
                'copy-btn';

            copyBtn.innerHTML =
                '📋';

            copyBtn.title =
                'Copy Path';


            copyBtn.addEventListener(
                'click',
                () =>
                    copyToClipboard(
                        display,
                        copyBtn
                    )
            );


            /*
            |--------------------------------------------------------------------------
            | APPEND
            |--------------------------------------------------------------------------
            */

            actions.appendChild(
                viewBtn
            );

            actions.appendChild(
                copyBtn
            );


            pathCell.appendChild(
                pathText
            );

            pathCell.appendChild(
                actions
            );


            tdPath.appendChild(
                pathCell
            );


            row.appendChild(
                tdPath
            );


            resultsBody.appendChild(
                row
            );
        }
    );
}


/*
|--------------------------------------------------------------------------
| SWITCH ASSET LIST
|--------------------------------------------------------------------------
*/

async function switchAssetList(type) {

    /*
        Sécurité : uniquement "all" ou "new"
    */

    if (
        type !== 'all' &&
        type !== 'new'
    ) {
        return;
    }


    CURRENT_ASSET_LIST = type;


    /*
    |--------------------------------------------------------------------------
    | Boutons
    |--------------------------------------------------------------------------
    */

    const allButton =
        document.getElementById(
            'all-assets-btn'
        );

    const newButton =
        document.getElementById(
            'new-assets-btn'
        );


    if (allButton) {

        allButton.classList.toggle(
            'active',
            type === 'all'
        );
    }


    if (newButton) {

        newButton.classList.toggle(
            'active',
            type === 'new'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Charger le fichier demandé
    |--------------------------------------------------------------------------
    */

    if (type === 'all') {

        await loadAssets();

    } else {

        await loadNewAssets();
    }


    /*
    |--------------------------------------------------------------------------
    | Refaire automatiquement la recherche
    |--------------------------------------------------------------------------
    */

    const keywords =
        document
            .getElementById('keywords')
            .value
            .trim();


    if (keywords) {

        await searchAssets();
    }
}


/*
|--------------------------------------------------------------------------
| DOM LOADED
|--------------------------------------------------------------------------
*/

window.addEventListener(
    'DOMContentLoaded',
    async () => {

        /*
        |--------------------------------------------------------------------------
        | Charger la liste normale au démarrage
        |--------------------------------------------------------------------------
        */

        await loadAssets();


        /*
        |--------------------------------------------------------------------------
        | SEARCH BUTTON
        |--------------------------------------------------------------------------
        */

        const searchButton =
            document.querySelector(
                '.search-btn'
            );


        if (searchButton) {

            searchButton.addEventListener(
                'click',
                searchAssets
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ENTER
        |--------------------------------------------------------------------------
        */

        const keywordsInput =
            document.getElementById(
                'keywords'
            );


        if (keywordsInput) {

            keywordsInput.addEventListener(
                'keydown',
                e => {

                    if (e.key === 'Enter') {
                        searchAssets();
                    }
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ALL BUTTON
        |--------------------------------------------------------------------------
        */

        const allButton =
            document.getElementById(
                'all-assets-btn'
            );


        if (allButton) {

            allButton.addEventListener(
                'click',
                () =>
                    switchAssetList('all')
            );
        }


        /*
        |--------------------------------------------------------------------------
        | NEW BUTTON
        |--------------------------------------------------------------------------
        */

        const newButton =
            document.getElementById(
                'new-assets-btn'
            );


        if (newButton) {

            newButton.addEventListener(
                'click',
                () =>
                    switchAssetList('new')
            );
        }


        /*
        |--------------------------------------------------------------------------
        | État initial
        |--------------------------------------------------------------------------
        */

        if (allButton) {
            allButton.classList.add('active');
        }

        if (newButton) {
            newButton.classList.remove('active');
        }
    }
);