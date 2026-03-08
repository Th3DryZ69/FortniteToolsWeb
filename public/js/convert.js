// ── Helpers ──
function setResult(el, html, state = 'success') {
    el.className = `result-box ${state}`;
    el.innerHTML = html;
}

function setLoading(el, msg = 'Loading...') {
    el.className = 'result-box loading';
    el.innerHTML = `<span class="result-spinner"></span>${msg}`;
}

function convertExportPath(path) {
    if (!path) return null;
    if (path.startsWith('/')) path = path.slice(1);
    const [left] = path.split('.');
    if (left.startsWith('Game/')) {
        return `FortniteGame/Content/${left.slice(5)}.uasset`;
    } else if (left.startsWith('SparksCosmetics/')) {
        const [plugin, ...rest] = left.split('/');
        return `FortniteGame/Plugins/GameFeatures/FM/${plugin}/Content/${rest.join('/')}.uasset`;
    } else if (left.startsWith('FigureCosmetics/')) {
        const [plugin, ...rest] = left.split('/');
        return `FortniteGame/Plugins/GameFeatures/Juno/${plugin}/Content/${rest.join('/')}.uasset`;
    } else {
        const [plugin, ...rest] = left.split('/');
        return `FortniteGame/Plugins/GameFeatures/${plugin}/Content/${rest.join('/')}.uasset`;
    }
}

async function fetchExportData(path) {
    if (!path) return null;
    try {
        const res = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`);
        const data = await res.json();
        if (!data.errored || data.note !== 'Unable to find package') return data;
    } catch {}
    try {
        const res2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${encodeURIComponent(path)}`);
        return await res2.json();
    } catch { return null; }
}

const replaceLastSegment = (path) => {
    if (!path.includes('.')) return path;
    const [base] = path.split('.');
    return `${base}.${base.split('/').pop()}`;
};

const findAllSoundWavePaths = (data) => {
    const results = [];
    const search = (obj) => {
        if (Array.isArray(obj)) obj.forEach(search);
        else if (typeof obj === 'object' && obj !== null) {
            if (obj.ObjectName?.includes('SoundWave')) results.push(obj.ObjectPath);
            Object.values(obj).forEach(search);
        }
    };
    search(data);
    return results;
};

// ── Emote → Animation ──
window.addEventListener('DOMContentLoaded', () => {
    async function emoteToAnimation() {
        const input  = document.getElementById('emoteId').value.trim();
        const output = document.getElementById('animationPath');
        if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
        setLoading(output, 'Fetching animation...');
        try {
            const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
                headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
            });
            const json = await res.json();
            const assetId = json?.item?.definitionPath || json?.item?.path;
            let assetPath = convertExportPath(assetId);

            if (!assetId) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
                assetPath = found;
            }

            let exportData = await fetchExportData(assetPath);
            let animations = exportData?.jsonOutput;

            if (!animations?.[0]) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
                exportData = await fetchExportData(found);
                animations = exportData?.jsonOutput;
                if (!animations?.[0]) { setResult(output, '❌ No animation data found.', 'error'); return; }
            }

            const male   = animations[0]?.Properties?.Animation?.AssetPathName || 'None';
            const female = animations[0]?.Properties?.AnimationFemaleOverride?.AssetPathName || 'None';
            setResult(output, `<b>Male:</b> ${male}<br><b>Female:</b> ${female}`);
        } catch (err) {
            setResult(output, `❌ Error: ${err.message}`, 'error');
        }
    }
    document.getElementById('convertEmoteToAnimation').addEventListener('click', emoteToAnimation);
    document.getElementById('emoteId').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToAnimation(); });
});

// ── Emote → Animation ──
window.addEventListener('DOMContentLoaded', () => {
    async function emoteToSequenceAnimation() {
        const input  = document.getElementById('emoteIdSequenceAnimation').value.trim();
        const output = document.getElementById('sequenceAnimationPath');
        if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
        setLoading(output, 'Fetching sequence animation...');
        try {
            const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
                headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
            });
            const json = await res.json();
            const assetId = json?.item?.definitionPath || json?.item?.path;
            let assetPath = convertExportPath(assetId);
            if (!assetId) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
                assetPath = found;
            }
            let exportData = await fetchExportData(assetPath);
            let animations = exportData?.jsonOutput;
            if (!animations?.[0]) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No animation data found.', 'error'); return; }
                exportData = await fetchExportData(found);
                animations = exportData?.jsonOutput;
                if (!animations?.[0]) { setResult(output, '❌ No animation data found.', 'error'); return; }
            }
            const male   = animations[0]?.Properties?.Animation?.AssetPathName || 'None';
            // const female = animations[0]?.Properties?.AnimationFemaleOverride?.AssetPathName || 'None';
            exportData = await fetchExportData(male);
            const sequenceAnimation = exportData?.jsonOutput[0]?.Properties?.CompositeSections?.[0]?.LinkedSequence?.ObjectPath;
            setResult(output, `Sequence Animation: ${replaceLastSegment(sequenceAnimation)}`);
        } catch (err) {
            setResult(output, `❌ Error: ${err.message}`, 'error');
        }
    }
    document.getElementById('convertEmoteToSequenceAnimation').addEventListener('click', emoteToSequenceAnimation);
    document.getElementById('emoteIdSequenceAnimation').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToSequenceAnimation(); });
});

// ── Emote → Audio ──
window.addEventListener('DOMContentLoaded', () => {
    const findAllEmoteSoundPaths = (data) => {
        const results = [];
        const search = (node) => {
            if (Array.isArray(node)) return node.forEach(search);
            if (typeof node === 'object' && node !== null) {
                if (node.Type === 'FortAnimNotifyState_EmoteSound') {
                    const sound1P = node.Properties?.EmoteSound1P?.ObjectPath;
                    if (sound1P) results.push([sound1P, 'sound', node.Properties?.SoundName || '']);
                }
                Object.values(node).forEach(search);
            }
        };
        search(data);
        return results;
    };

    async function emoteToAudio() {
        const input  = document.getElementById('emoteIdAudio').value.trim();
        const output = document.getElementById('audioPath');
        if (!input) { setResult(output, 'Please enter an Emote ID.', 'error'); return; }
        setLoading(output, 'Fetching audio...');
        try {
            const res  = await fetch(`https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`, {
                headers: { 'Authorization': '5d8b45aa-b9bd55f8-1f355ec5-fb6b123a' }
            });
            const json = await res.json();
            const assetId = json?.item?.path;
            let assetPath = convertExportPath(assetId);

            if (!assetId) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No audio data found.', 'error'); return; }
                assetPath = found;
            }

            const animationExport = await fetchExportData(assetPath);
            let animationPath = animationExport?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;

            if (!animationPath) {
                const all = await (await fetch('https://fortnitecentral.genxgames.gg/api/v1/assets')).json();
                const found = all.find(a => a.includes(`/${input}.uasset`));
                if (!found) { setResult(output, '❌ No audio data found.', 'error'); return; }
                const exportData = await fetchExportData(found);
                animationPath = exportData?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;
                if (!animationPath) { setResult(output, '❌ No audio data found.', 'error'); return; }
            }

            const currentPath  = convertExportPath(animationPath);
            const exportData   = await fetchExportData(currentPath);
            const soundEntries = findAllEmoteSoundPaths(exportData?.jsonOutput || []);

            if (!soundEntries.length) { setResult(output, '❌ No EmoteSound found.', 'error'); return; }

            let lines = [];
            for (const [foundPath] of soundEntries) {
                const soundPath    = convertExportPath(foundPath);
                const audioData    = await fetchExportData(soundPath);
                const soundWaves   = findAllSoundWavePaths(audioData?.jsonOutput || []);
                if (soundWaves.length) lines.push(...soundWaves.map(replaceLastSegment));
            }
            setResult(output, lines.join('<br>') || '❌ No SoundWave paths found.');
        } catch (err) {
            setResult(output, `❌ Error: ${err.message}`, 'error');
        }
    }
    document.getElementById('convertEmoteToAudio').addEventListener('click', emoteToAudio);
    document.getElementById('emoteIdAudio').addEventListener('keydown', e => { if (e.key === 'Enter') emoteToAudio(); });
});

// ── Aura → VFX ──
window.addEventListener('DOMContentLoaded', () => {
    async function auraToVFX() {
        const input  = document.getElementById('auraId').value.trim();
        const output = document.getElementById('vfxPath');
        if (!input) { setResult(output, 'Please enter an Aura ID.', 'error'); return; }
        setLoading(output, 'Fetching VFX...');
        try {
            const isId = input.toLowerCase().startsWith('sparksaura');
            const url  = isId
                ? `https://fortnite-api.com/v2/cosmetics/br/${input}?responseFlags=7`
                : `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(input)}&responseFlags=7`;
            const json    = await (await fetch(url)).json();
            const assetId = json.data?.path;

            const exportRes  = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`);
            const exportJson = await exportRes.json();

            const jsonOutput = exportJson.jsonOutput;
            const mainPath  = jsonOutput?.[0]?.Properties?.SustainSystem?.AssetPathName || 'None';
            const startPath = jsonOutput?.[0]?.Properties?.StartSystem?.AssetPathName  || 'None';
            const stopPath  = jsonOutput?.[0]?.Properties?.StopSystem?.AssetPathName   || 'None';

            setResult(output, `<b>Main:</b> ${mainPath}<br><b>Start:</b> ${startPath}<br><b>Stop:</b> ${stopPath}`);
        } catch (err) {
            setResult(output, `❌ Error: ${err.message}`, 'error');
        }
    }
    document.getElementById('convertAuraToVFX').addEventListener('click', auraToVFX);
    document.getElementById('auraId').addEventListener('keydown', e => { if (e.key === 'Enter') auraToVFX(); });
});

// ── MusicPack → Audio ──
window.addEventListener('DOMContentLoaded', () => {
    async function musicpackToAudio() {
        const input  = document.getElementById('musicpackId').value.trim();
        const output = document.getElementById('audioPath1');
        if (!input) { setResult(output, 'Please enter a MusicPack ID.', 'error'); return; }
        setLoading(output, 'Fetching audio...');
        try {
            const isId = input.toLowerCase().startsWith('musicpack');
            const url  = isId
                ? `https://fortnite-api.com/v2/cosmetics/br/${input}?responseFlags=7`
                : `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(input)}&backendType=AthenaMusicPack&responseFlags=7`;
            const json = await (await fetch(url)).json();
            const data = json.data;
            if (!data) { setResult(output, '❌ No data found.', 'error'); return; }

            const assetId = data?.path;
            let exportData;
            try {
                const r1 = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`);
                exportData = await r1.json();
                if (exportData.errored && exportData.note === 'Unable to find package') {
                    const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${assetId}`);
                    exportData = await r2.json();
                }
            } catch {
                const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${assetId}`);
                exportData = await r2.json();
            }

            const musicAssetPath = exportData?.jsonOutput?.[0]?.Properties?.FrontEndLobbyMusic?.AssetPathName;
            if (!musicAssetPath) { setResult(output, '❌ No FrontEndLobbyMusic path found.', 'error'); return; }

            const convertedPath = convertExportPath(musicAssetPath);
            let audioData;
            try {
                const r1 = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${convertedPath}&raw=true`);
                audioData = await r1.json();
                if (audioData.errored && audioData.note === 'Unable to find package') {
                    const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${convertedPath}`);
                    audioData = await r2.json();
                }
            } catch {
                const r2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${convertedPath}`);
                audioData = await r2.json();
            }

            const soundWaves = findAllSoundWavePaths(audioData.jsonOutput || []);
            if (!soundWaves.length) { setResult(output, '❌ No SoundWave paths found.', 'error'); return; }

            setResult(output, soundWaves.map(replaceLastSegment).join('<br>'));
        } catch (err) {
            setResult(output, `❌ Error: ${err.message}`, 'error');
        }
    }
    document.getElementById('convertMusicPackToAudio').addEventListener('click', musicpackToAudio);
    document.getElementById('musicpackId').addEventListener('keydown', e => { if (e.key === 'Enter') musicpackToAudio(); });
});
