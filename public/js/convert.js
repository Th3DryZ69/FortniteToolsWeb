// let ALL_ASSETS = [];
// let ASSETS_READY = false;

// async function loadAssets() {
//     if (ASSETS_READY) return;
//     const res = await fetch('../data/fortnite_assets.gz');
//     const buffer = await res.arrayBuffer();
//     const ds = new DecompressionStream("gzip");
//     const stream = new Blob([buffer]).stream().pipeThrough(ds);
//     const text = await new Response(stream).text();
//     ALL_ASSETS = text.split("\n");
//     ASSETS_READY = true;
//     console.log("Assets loaded:", ALL_ASSETS.length);
// }

// window.addEventListener("DOMContentLoaded", loadAssets);

// async function findAssetById(id) {
//     if (!ASSETS_READY) await loadAssets();
//     return ALL_ASSETS.find(a => a.includes(`/${id}.uasset`));
// }

// // ── Helpers ──
// function setResult(el, html, state = 'success') {
//     el.className = `result-box ${state}`;
//     el.innerHTML = html;
// }

// function setLoading(el, msg = 'Loading...') {
//     el.className = 'result-box loading';
//     el.innerHTML = `<span class="result-spinner"></span>${msg}`;
// }

// function convertExportPath(path) {
//     if (!path) return null;
//     if (path.startsWith('/')) path = path.slice(1);
//     const [left] = path.split('.');
//     if (left.startsWith('Game/')) {
//         return `FortniteGame/Content/${left.slice(5)}.uasset`;
//     } else if (left.startsWith('SparksCosmetics/')) {
//         const [plugin, ...rest] = left.split('/');
//         return `FortniteGame/Plugins/GameFeatures/FM/${plugin}/Content/${rest.join('/')}.uasset`;
//     } else if (left.startsWith('FigureCosmetics/')) {
//         const [plugin, ...rest] = left.split('/');
//         return `FortniteGame/Plugins/GameFeatures/Juno/${plugin}/Content/${rest.join('/')}.uasset`;
//     } else {
//         const [plugin, ...rest] = left.split('/');
//         return `FortniteGame/Plugins/GameFeatures/${plugin}/Content/${rest.join('/')}.uasset`;
//     }
// }

// async function fetchExportData(path) {
//     if (!path) return null;
//     try {
//         const res = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`);
//         const data = await res.json();
//         if (!data.errored || data.note !== 'Unable to find package') return data;
//     } catch {}
//     try {
//         const res2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${encodeURIComponent(path)}`);
//         return await res2.json();
//     } catch { return null; }
// }

// const replaceLastSegment = (path) => {
//     if (!path.includes('.')) return path;
//     const [base] = path.split('.');
//     return `${base}.${base.split('/').pop()}`;
// };

// const findAllSoundWavePaths = (data) => {
//     const results = [];
//     const search = (obj) => {
//         if (Array.isArray(obj)) obj.forEach(search);
//         else if (typeof obj === 'object' && obj !== null) {
//             if (obj.ObjectName?.includes('SoundWave')) results.push(obj.ObjectPath);
//             Object.values(obj).forEach(search);
//         }
//     };
//     search(data);
//     return results;
// };

// // ── Emote → Animation ──
// window.addEventListener('DOMContentLoaded', () => {
//     async function emoteToAnimation() {
//         const input  = document.getElementById('emoteId').value.trim();
//         const output = document.getElementById('animationPath');
//         if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
//         setLoading(output, 'Fetching animation...');
//         try {
//             const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
//                 headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
//             });
//             const json = await res.json();
//             const assetId = json?.item?.definitionPath || json?.item?.path;
//             let assetPath = convertExportPath(assetId);

//             if (!assetId) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
//                 assetPath = found;
//             }

//             let exportData = await fetchExportData(assetPath);
//             let animations = exportData?.jsonOutput;

//             if (!animations?.[0]) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
//                 exportData = await fetchExportData(found);
//                 animations = exportData?.jsonOutput;
//                 if (!animations?.[0]) { setResult(output, '❌ No animation data found.', 'error'); return; }
//             }

//             const male   = animations[0]?.Properties?.Animation?.AssetPathName || 'None';
//             const female = animations[0]?.Properties?.AnimationFemaleOverride?.AssetPathName || 'None';
//             setResult(output, `<b>Male:</b> ${male}<br><b>Female:</b> ${female}`);
//         } catch (err) {
//             setResult(output, `❌ Error: ${err.message}`, 'error');
//         }
//     }
//     document.getElementById('convertEmoteToAnimation').addEventListener('click', emoteToAnimation);
//     document.getElementById('emoteId').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToAnimation(); });
// });

// // ── Emote → Sequence Animation ──
// window.addEventListener('DOMContentLoaded', () => {
//     async function emoteToSequenceAnimation() {
//         const input  = document.getElementById('emoteIdSequenceAnimation').value.trim();
//         const output = document.getElementById('sequenceAnimationPath');
//         if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
//         setLoading(output, 'Fetching sequence animation...');
//         try {
//             const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
//                 headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
//             });
//             const json = await res.json();
//             const assetId = json?.item?.definitionPath || json?.item?.path;
//             let assetPath = convertExportPath(assetId);
//             if (!assetId) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
//                 assetPath = found;
//             }
//             let exportData = await fetchExportData(assetPath);
//             let animations = exportData?.jsonOutput;
//             if (!animations?.[0]) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
//                 exportData = await fetchExportData(found);
//                 animations = exportData?.jsonOutput;
//                 if (!animations?.[0]) { setResult(output, '❌ No animation data found.', 'error'); return; }
//             }
//             const male   = animations[0]?.Properties?.Animation?.AssetPathName || 'None';
//             // const female = animations[0]?.Properties?.AnimationFemaleOverride?.AssetPathName || 'None';
//             exportData = await fetchExportData(male);
//             const sequenceAnimation = exportData?.jsonOutput[0]?.Properties?.CompositeSections?.[0]?.LinkedSequence?.ObjectPath;
//             setResult(output, `${replaceLastSegment(sequenceAnimation)}`);
//         } catch (err) {
//             setResult(output, `❌ Error: ${err.message}`, 'error');
//         }
//     }
//     document.getElementById('convertEmoteToSequenceAnimation').addEventListener('click', emoteToSequenceAnimation);
//     document.getElementById('emoteIdSequenceAnimation').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToSequenceAnimation(); });
// });

// // ── Emote → Audio ──
// window.addEventListener('DOMContentLoaded', () => {
//     const findAllEmoteSoundPaths = (data) => {
//         const results = [];
//         const search = (node) => {
//             if (Array.isArray(node)) return node.forEach(search);
//             if (typeof node === 'object' && node !== null) {
//                 if (node.Type === 'FortAnimNotifyState_EmoteSound') {
//                     const sound1P = node.Properties?.EmoteSound1P?.ObjectPath;
//                     if (sound1P) results.push([sound1P, 'sound', node.Properties?.SoundName || '']);
//                 }
//                 Object.values(node).forEach(search);
//             }
//         };
//         search(data);
//         return results;
//     };

//     async function emoteToAudio() {
//         const input  = document.getElementById('emoteIdAudio').value.trim();
//         const output = document.getElementById('audioPath');
//         if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
//         setLoading(output, 'Fetching audio...');
//         try {
//             const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
//                 headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
//             });
//             const json = await res.json();
//             const assetId = json?.item?.path;
//             let assetPath = convertExportPath(assetId);

//             if (!assetId) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No audio data found.', 'error'); return; }
//                 assetPath = found;
//             }

//             const animationExport = await fetchExportData(assetPath);
//             let animationPath = animationExport?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;

//             if (!animationPath) {
//                 // const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
//                 // const found = all.find(a => a.includes(`/${input}.uasset`));
//                 const found = await findAssetById(input);
//                 if (!found) { setResult(output, '❌ No audio data found.', 'error'); return; }
//                 const exportData = await fetchExportData(found);
//                 animationPath = exportData?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;
//                 if (!animationPath) { setResult(output, '❌ No audio data found.', 'error'); return; }
//             }

//             const currentPath  = convertExportPath(animationPath);
//             const exportData   = await fetchExportData(currentPath);
//             const soundEntries = findAllEmoteSoundPaths(exportData?.jsonOutput || []);

//             if (!soundEntries.length) { setResult(output, '❌ No EmoteSound found.', 'error'); return; }

//             let lines = [];
//             for (const [foundPath] of soundEntries) {
//                 const soundPath    = convertExportPath(foundPath);
//                 const audioData    = await fetchExportData(soundPath);
//                 const soundWaves   = findAllSoundWavePaths(audioData?.jsonOutput || []);
//                 if (soundWaves.length) lines.push(...soundWaves.map(replaceLastSegment));
//             }
//             setResult(output, lines.join('<br>') || '❌ No SoundWave paths found.');
//         } catch (err) {
//             setResult(output, `❌ Error: ${err.message}`, 'error');
//         }
//     }
//     document.getElementById('convertEmoteToAudio').addEventListener('click', emoteToAudio);
//     document.getElementById('emoteIdAudio').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToAudio(); });
// });

// // ── Aura → VFX ──
// window.addEventListener('DOMContentLoaded', () => {
//     async function auraToVFX() {
//         const input  = document.getElementById('auraId').value.trim();
//         const output = document.getElementById('vfxPath');
//         if (!input) { setResult(output, 'Please enter an Aura ID.', 'error'); return; }
//         setLoading(output, 'Fetching VFX...');
//         try {
//             const isId = input.toLowerCase().startsWith('sparksaura');
//             const url  = isId
//                 ? `https://fortnite-api.com/v2/cosmetics/br/${input}?responseFlags=7`
//                 : `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(input)}&responseFlags=7`;
//             const json    = await (await fetch(url)).json();
//             const assetId = json.data?.path;

//             const exportRes  = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`);
//             const exportJson = await exportRes.json();

//             const jsonOutput = exportJson.jsonOutput;
//             const mainPath  = jsonOutput?.[0]?.Properties?.SustainSystem?.AssetPathName || 'None';
//             const startPath = jsonOutput?.[0]?.Properties?.StartSystem?.AssetPathName  || 'None';
//             const stopPath  = jsonOutput?.[0]?.Properties?.StopSystem?.AssetPathName   || 'None';

//             setResult(output, `<b>Main:</b> ${mainPath}<br><b>Start:</b> ${startPath}<br><b>Stop:</b> ${stopPath}`);
//         } catch (err) {
//             setResult(output, `❌ Error: ${err.message}`, 'error');
//         }
//     }
//     document.getElementById('convertAuraToVFX').addEventListener('click', auraToVFX);
//     document.getElementById('auraId').addEventListener('keydown', e => { if (e.key === 'Enter') auraToVFX(); });
// });

// // ── MusicPack → Audio ──
// window.addEventListener('DOMContentLoaded', () => {
//     async function musicpackToAudio() {
//         const input  = document.getElementById('musicpackId').value.trim();
//         const output = document.getElementById('audioPath1');
//         if (!input) { setResult(output, 'Please enter a MusicPack ID.', 'error'); return; }
//         setLoading(output, 'Fetching audio...');
//         try {
//             const isId = input.toLowerCase().startsWith('musicpack');
//             const url  = isId
//                 ? `https://fortnite-api.com/v2/cosmetics/br/${input}?responseFlags=7`
//                 : `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(input)}&backendType=AthenaMusicPack&responseFlags=7`;
//             const json = await (await fetch(url)).json();
//             const data = json.data;
//             if (!data) { setResult(output, '❌ No data found.', 'error'); return; }

//             const assetId = data?.path;
//             let exportData;
//             try {
//                 const r1 = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`);
//                 exportData = await r1.json();
//                 if (exportData.errored && exportData.note === 'Unable to find package') {
//                     const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${assetId}`);
//                     exportData = await r2.json();
//                 }
//             } catch {
//                 const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${assetId}`);
//                 exportData = await r2.json();
//             }

//             const musicAssetPath = exportData?.jsonOutput?.[0]?.Properties?.FrontEndLobbyMusic?.AssetPathName;
//             if (!musicAssetPath) { setResult(output, '❌ No FrontEndLobbyMusic path found.', 'error'); return; }

//             const convertedPath = convertExportPath(musicAssetPath);
//             let audioData;
//             try {
//                 const r1 = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${convertedPath}&raw=true`);
//                 audioData = await r1.json();
//                 if (audioData.errored && audioData.note === 'Unable to find package') {
//                     const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${convertedPath}`);
//                     audioData = await r2.json();
//                 }
//             } catch {
//                 const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${convertedPath}`);
//                 audioData = await r2.json();
//             }

//             const soundWaves = findAllSoundWavePaths(audioData.jsonOutput || []);
//             if (!soundWaves.length) { setResult(output, '❌ No SoundWave paths found.', 'error'); return; }

//             setResult(output, soundWaves.map(replaceLastSegment).join('<br>'));
//         } catch (err) {
//             setResult(output, `❌ Error: ${err.message}`, 'error');
//         }
//     }
//     document.getElementById('convertMusicPackToAudio').addEventListener('click', musicpackToAudio);
//     document.getElementById('musicpackId').addEventListener('keydown', e => { if (e.key === 'Enter') musicpackToAudio(); });
// });


// ─────────────────────────────────────────────
//  Fortnite Asset Converters – clean version
//  Fallback: fortnite_assets.gz when API is down
// ─────────────────────────────────────────────

// ── Asset index (lazy-loaded once) ──────────────────────────────────────────

const AssetIndex = (() => {
    let _assets = [];
    let _ready   = false;
    let _loading = null;

    async function load() {
        if (_ready) return;
        if (_loading) return _loading;

        _loading = (async () => {
            const res    = await fetch('../data/fortnite_assets.gz');
            const buf    = await res.arrayBuffer();
            const ds     = new DecompressionStream('gzip');
            const stream = new Blob([buf]).stream().pipeThrough(ds);
            _assets      = (await new Response(stream).text()).split('\n');
            _ready       = true;
            console.log('[AssetIndex] loaded:', _assets.length, 'assets');
        })();
        return _loading;
    }

    async function find(id) {
        if (!_ready) await load();
        return _assets.find(a => a.includes(`/${id}.uasset`)) ?? null;
    }

    // Kick off loading early
    window.addEventListener('DOMContentLoaded', load);
    return { load, find };
})();


// ── Pure helpers ─────────────────────────────────────────────────────────────

/** Convert an in-game export path to a file-system asset path. */
function convertExportPath(path) {
    if (!path) return null;
    if (path.startsWith('/')) path = path.slice(1);
    const [left] = path.split('.');
    if (left.startsWith('Game/'))
        return `FortniteGame/Content/${left.slice(5)}.uasset`;
    if (left.startsWith('SparksCosmetics/')) {
        const [plugin, ...rest] = left.split('/');
        return `FortniteGame/Plugins/GameFeatures/FM/${plugin}/Content/${rest.join('/')}.uasset`;
    }
    if (left.startsWith('FigureCosmetics/')) {
        const [plugin, ...rest] = left.split('/');
        return `FortniteGame/Plugins/GameFeatures/Juno/${plugin}/Content/${rest.join('/')}.uasset`;
    }
    const [plugin, ...rest] = left.split('/');
    return `FortniteGame/Plugins/GameFeatures/${plugin}/Content/${rest.join('/')}.uasset`;
}

/** Replace the extension segment with the asset's own name (e.g. Foo.Bar → Foo.Foo). */
function replaceLastSegment(path) {
    if (!path?.includes('.')) return path;
    const [base] = path.split('.');
    return `${base}.${base.split('/').pop()}`;
}

/** Recursively collect every ObjectPath that references a SoundWave. */
function findAllSoundWavePaths(data) {
    const results = [];
    const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === 'object') {
            if (node.ObjectName?.includes('SoundWave')) results.push(node.ObjectPath);
            Object.values(node).forEach(walk);
        }
    };
    walk(data);
    return results;
}


// ── Network helpers ──────────────────────────────────────────────────────────

const CENTRAL_BASE = 'https://fortnitecentral.genxgames.gg/api/v1';
const DILLY_BASE   = 'https://export-service.dillyapis.com/v1';

/**
 * Export a .uasset from two endpoints, falling back automatically.
 * Returns parsed JSON or null.
 */
async function fetchExportData(assetPath) {
    if (!assetPath) return null;
    const encoded = encodeURIComponent(assetPath);

    // Primary
    try {
        const res  = await fetch(`${CENTRAL_BASE}/export?path=${encoded}&raw=true`);
        const data = await res.json();
        if (!data.errored || data.note !== 'Unable to find package') return data;
    } catch { /* fall through */ }

    // Secondary
    try {
        const res = await fetch(`${DILLY_BASE}/export?path=${encoded}`);
        return await res.json();
    } catch { return null; }
}

/**
 * Resolve a cosmetic's asset path:
 *   1. Try the fortniteapi.io item endpoint (gives definitionPath / path).
 *   2. Fall back to a local search in fortnite_assets.gz.
 * Returns the .uasset file-system path, or null.
 */
async function resolveAssetPath(itemId, { preferDefinitionPath = true } = {}) {
    try {
        const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(itemId)}`, {
            headers: { Authorization: '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
        });
        const json = await res.json();
        const raw  = (preferDefinitionPath
            ? json?.item?.definitionPath ?? json?.item?.path
            : json?.item?.path) ?? null;
        if (raw) return convertExportPath(raw);
    } catch { /* fall through */ }

    // Fallback: local asset index
    return AssetIndex.find(itemId);
}

/**
 * Same as resolveAssetPath but also tries the fortnite-api.com endpoint
 * (used by Aura / MusicPack which support both ID and name lookups).
 */
async function resolveCosmetic(input, { backendType, nameField = 'path' } = {}) {
    const isId = /^[A-Za-z]+_\w+$/.test(input);   // rough heuristic
    const base = 'https://fortnite-api.com/v2/cosmetics/br';
    const url  = isId
        ? `${base}/${encodeURIComponent(input)}?responseFlags=7`
        : `${base}/search?name=${encodeURIComponent(input)}${backendType ? `&backendType=${backendType}` : ''}&responseFlags=7`;

    try {
        const res  = await fetch(url);
        const json = await res.json();
        const raw  = json?.data?.[nameField] ?? json?.data?.path ?? null;
        if (raw) return raw;
    } catch { /* fall through */ }

    // Fallback: local asset index
    return AssetIndex.find(input);
}


// ── UI helpers ───────────────────────────────────────────────────────────────

function setResult(el, html, state = 'success') {
    el.className = `result-box ${state}`;
    el.innerHTML = html;
}

function setLoading(el, msg = 'Loading…') {
    el.className = 'result-box loading';
    el.innerHTML = `<span class="result-spinner"></span>${msg}`;
}

function err(el, msg) { setResult(el, `❌ ${msg}`, 'error'); }


// ── Converters ───────────────────────────────────────────────────────────────

// ── 1. Emote → Animation ─────────────────────────────────────────────────────
async function emoteToAnimation(input) {
    let assetPath = await resolveAssetPath(input);
    if (!assetPath) return null;

    let data = await fetchExportData(assetPath);

    // If the export is empty, retry via the asset index
    if (!data?.jsonOutput?.[0]) {
        const fallback = await AssetIndex.find(input);
        data = await fetchExportData(fallback);
    }

    const anim = data?.jsonOutput?.[0];
    if (!anim) return null;
    return {
        male:   anim.Properties?.Animation?.AssetPathName              ?? 'None',
        female: anim.Properties?.AnimationFemaleOverride?.AssetPathName ?? 'None',
    };
}

// ── 2. Emote → Sequence Animation ────────────────────────────────────────────
async function emoteToSequenceAnimation(input) {
    const animResult = await emoteToAnimation(input);
    if (!animResult || animResult.male === 'None') return null;

    const seqData = await fetchExportData(convertExportPath(animResult.male));
    const raw     = seqData?.jsonOutput?.[0]?.Properties?.CompositeSections?.[0]?.LinkedSequence?.ObjectPath;
    return raw ? replaceLastSegment(raw) : null;
}

// ── 3. Emote → Audio ─────────────────────────────────────────────────────────
function collectEmoteSoundPaths(data) {
    const results = [];
    const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === 'object') {
            if (node.Type === 'FortAnimNotifyState_EmoteSound') {
                const p = node.Properties?.EmoteSound1P?.ObjectPath;
                if (p) results.push(p);
            }
            Object.values(node).forEach(walk);
        }
    };
    walk(data);
    return results;
}

async function emoteToAudio(input) {
    // Prefer item.path (not definitionPath) for audio
    let assetPath = await resolveAssetPath(input, { preferDefinitionPath: false });
    if (!assetPath) return null;

    let animExport = await fetchExportData(assetPath);
    let animPath   = animExport?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;

    if (!animPath) {
        const fallback = await AssetIndex.find(input);
        animExport     = await fetchExportData(fallback);
        animPath       = animExport?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;
    }
    if (!animPath) return null;

    const animData    = await fetchExportData(convertExportPath(animPath));
    const soundPaths  = collectEmoteSoundPaths(animData?.jsonOutput ?? []);
    if (!soundPaths.length) return null;

    const waves = [];
    for (const sp of soundPaths) {
        const audioData = await fetchExportData(convertExportPath(sp));
        findAllSoundWavePaths(audioData?.jsonOutput ?? []).forEach(w => waves.push(replaceLastSegment(w)));
    }
    return waves.length ? waves : null;
}

// ── 4. Aura → VFX ────────────────────────────────────────────────────────────
async function auraToVFX(input) {
    const assetPath = await resolveCosmetic(input);
    if (!assetPath) return null;

    const data = await fetchExportData(assetPath);
    const props = data?.jsonOutput?.[0]?.Properties;
    if (!props) return null;

    return {
        main:  props.SustainSystem?.AssetPathName ?? 'None',
        start: props.StartSystem?.AssetPathName   ?? 'None',
        stop:  props.StopSystem?.AssetPathName    ?? 'None',
    };
}

// ── 5. MusicPack → Audio ─────────────────────────────────────────────────────
async function musicpackToAudio(input) {
    const assetPath = await resolveCosmetic(input, { backendType: 'AthenaMusicPack' });
    if (!assetPath) return null;

    const packData   = await fetchExportData(assetPath);
    const musicPath  = packData?.jsonOutput?.[0]?.Properties?.FrontEndLobbyMusic?.AssetPathName;
    if (!musicPath) return null;

    const audioData = await fetchExportData(convertExportPath(musicPath));
    const waves     = findAllSoundWavePaths(audioData?.jsonOutput ?? []);
    return waves.length ? waves.map(replaceLastSegment) : null;
}


// ── DOM wiring ───────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {

    function wire(btnId, inputId, outputId, handler, loadMsg) {
        const btn    = document.getElementById(btnId);
        const input  = document.getElementById(inputId);
        const output = document.getElementById(outputId);
        if (!btn || !input || !output) return;

        const run = async () => {
            const val = input.value.trim();
            if (!val) { err(output, 'Please enter an ID.'); return; }
            setLoading(output, loadMsg);
            try {
                const result = await handler(val);
                if (!result) { err(output, 'No data found.'); return; }
                if (typeof result === 'string')
                    setResult(output, result);
                else if (Array.isArray(result))
                    setResult(output, result.join('<br>'));
                else
                    setResult(output, Object.entries(result)
                        .map(([k, v]) => `<b>${k.charAt(0).toUpperCase() + k.slice(1)}:</b> ${v}`)
                        .join('<br>'));
            } catch (e) {
                err(output, e.message);
            }
        };

        btn.addEventListener('click', run);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    }

    wire('convertEmoteToAnimation',         'emoteId',                     'animationPath',        emoteToAnimation,         'Fetching animation…');
    wire('convertEmoteToSequenceAnimation', 'emoteIdSequenceAnimation',    'sequenceAnimationPath', emoteToSequenceAnimation, 'Fetching sequence animation…');
    wire('convertEmoteToAudio',             'emoteIdAudio',                'audioPath',             emoteToAudio,             'Fetching audio…');
    wire('convertAuraToVFX',                'auraId',                      'vfxPath',               auraToVFX,                'Fetching VFX…');
    wire('convertMusicPackToAudio',         'musicpackId',                 'audioPath1',            musicpackToAudio,         'Fetching audio…');
});