window.addEventListener('DOMContentLoaded', () => {
    async function emoteToAnimation() {
        const emoteInput = document.getElementById("emoteId").value.trim();
        const animationPath = document.getElementById("animationPath");
        if (!emoteInput) {
            animationPath.textContent = "Animation: (Please enter an Emote ID)";
            return;
        }
        animationPath.textContent = "Animation: Loading...";
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
            try {
                const res = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`);
                const data = await res.json();
                if (!data.errored || data.note !== "Unable to find package") {
                    return data;
                }
            } catch {}
            try {
                const fallbackRes = await fetch(`https://export-service.dillyapis.com/v1/export?path=${encodeURIComponent(path)}`);
                return await fallbackRes.json();
            } catch {
                return null;
            }
        }
        try {
            const apiUrl = `https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(emoteInput)}`;
            const res = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": "5d8b45aa-b9bd55f8-1f355ec5-fb6b123a",
                    "Content-Type": "application/json"
                }
            });
            const json = await res.json();
            const item = json?.item;
            const assetId = item?.definitionPath || item?.path;
            let assetPath = convertExportPath(assetId);
            if (!assetId) {
                const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
                const json = await response.json();
                const foundAssets = json.filter(a =>
                    a.includes(`/${emoteInput}.uasset`)
                );
                if (!foundAssets || !foundAssets[0]) {
                    animationPath.textContent = "Animation: ❌ No animation data found.";
                    return;
                }
                assetPath = foundAssets[0];
            }
            let exportData = await fetchExportData(assetPath)
            let animations = exportData?.jsonOutput;
            if (!animations || !animations[0]) {
                const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
                const json = await response.json();
                const foundAssets = json.filter(a =>
                    a.includes(`/${emoteInput}.uasset`)
                );
                if (!foundAssets || !foundAssets[0]) {
                    animationPath.textContent = "Animation: ❌ No animation data found.";
                    return;
                }
                assetPath = foundAssets[0];
                exportData = await fetchExportData(assetPath);
                animations = exportData?.jsonOutput;
                if (!animations || !animations[0]) {
                    animationPath.textContent = "Animation: ❌ No animation data found.";
                    return;
                }
            }
            const male = animations[0]?.Properties?.Animation?.AssetPathName || "None";
            const female = animations[0]?.Properties?.AnimationFemaleOverride?.AssetPathName || "None";
            animationPath.innerHTML = `Animation:<br>Male: ${male}<br>Female: ${female}`;
        } catch (error) {
            animationPath.textContent = `Animation: ❌ Error: ${error.message}`;
            console.error(error);
        }
    }
    document.getElementById("convertEmoteToAnimation")
        .addEventListener("click", emoteToAnimation);
});

window.addEventListener('DOMContentLoaded', () => {
    async function emoteToAudio() {
        const input = document.getElementById('emoteIdAudio').value.trim();
        const display = document.getElementById('audioPath');
        display.textContent = "Audio: Converting...";
        if (!input) {
            display.textContent = "Audio: (Please enter an Emote ID)";
            return;
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
        const findAllEmoteSoundPaths = (data) => {
            const results = [];
            const search = (node) => {
                if (Array.isArray(node)) return node.forEach(search);
                if (typeof node === 'object' && node !== null) {
                    if (node.Type === 'FortAnimNotifyState_EmoteSound') {
                        const sound1P = node.Properties?.EmoteSound1P?.ObjectPath;
                        // const sound3P = node.Properties?.EmoteSound3P?.ObjectPath;
                        if (sound1P) results.push([sound1P, "sound", node.Properties?.SoundName || ""]);
                        // if (sound3P) results.push([sound3P, "sound", node.Properties?.SoundName || ""]);
                    }
                    Object.values(node).forEach(search);
                }
            };
            search(data);
            return results;
        };
        const findAllSoundWavePaths = (data) => {
            const results = [];
            const search = (obj) => {
                if (Array.isArray(obj)) obj.forEach(search);
                else if (typeof obj === 'object' && obj !== null) {
                    if (obj.ObjectName?.includes("SoundWave")) {
                        results.push(obj.ObjectPath);
                    }
                    Object.values(obj).forEach(search);
                }
            };
            search(data);
            return results;
        };
        const replaceLastSegment = (path) => {
            if (!path.includes(".")) return path;
            const [base] = path.split(".");
            const last = base.split("/").pop();
            return `${base}.${last}`;
        };
        const fetchExportData = async (path) => {
            if (!path) return null;
            try {
                const res1 = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`);
                const json1 = await res1.json();
                if (!json1.errored || json1.note !== "Unable to find package") return json1;
            } catch (err) {
                console.warn("Primary source failed:", err);
            }
            try {
                const res2 = await fetch(`https://export-service.dillyapis.com/v1/export?path=${encodeURIComponent(path)}`);
                return await res2.json();
            } catch (err) {
                console.warn("Fallback source failed:", err);
                return null;
            }
        };
        try {
            const url = `https://fortniteapi.io/v2/items/get?id=${encodeURIComponent(input)}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": "5d8b45aa-b9bd55f8-1f355ec5-fb6b123a",
                    "Content-Type": "application/json"
                }
            });
            const json = await res.json();
            const assetId = json?.item?.path;
            let assetPath = convertExportPath(assetId);
            if (!assetId) {
                const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
                const json = await response.json();
                const foundAssets = json.filter(a =>
                    a.includes(`/${input}.uasset`)
                );
                if (!foundAssets || !foundAssets[0]) {
                    display.textContent = "Audio: ❌ No audio data found.";
                    return;
                }
                assetPath = foundAssets[0];
            }
            const animationExport = await fetchExportData(assetPath);
            let animationPath = animationExport?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;
            if (!animationPath) {
                const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
                const json = await response.json();
                const foundAssets = json.filter(a =>
                    a.includes(`/${input}.uasset`)
                );
                if (!foundAssets || !foundAssets[0]) {
                    display.textContent = "Audio: ❌ No audio data found.";
                    return;
                }
                assetPath = foundAssets[0];
                const exportData = await fetchExportData(assetPath);
                animationPath = exportData?.jsonOutput?.[0]?.Properties?.Animation?.AssetPathName;
                if (!animationPath) {
                    display.textContent = "Audio: ❌ No audio data found.";
                    return;
                }
            }
            const currentPath = convertExportPath(animationPath);
            const exportData = await fetchExportData(currentPath);
            const soundEntries = findAllEmoteSoundPaths(exportData?.jsonOutput || []);
            if (!soundEntries.length) {
                display.textContent = "Audio: ❌ No EmoteSound found.";
                return;
            }
            let html = "Audio Paths:<br>";
            for (const [foundPath, type, name] of soundEntries) {
                const soundPath = convertExportPath(foundPath);
                const audioData = await fetchExportData(soundPath);
                const soundWavePaths = findAllSoundWavePaths(audioData?.jsonOutput || []);
                if (soundWavePaths.length) {
                    const formatted = soundWavePaths.map(replaceLastSegment);
                    html += `${formatted.join("<br>")}<br>`;
                }
            }
            display.innerHTML = html;
        } catch (err) {
            console.error(err);
            display.textContent = `Audio: ❌ Error: ${err.message}`;
        }
    }
    document.getElementById("convertEmoteToAudio")
        .addEventListener("click", emoteToAudio);
});


window.addEventListener('DOMContentLoaded', () => {
    async function auraToVFX() {
        const auraInput = document.getElementById('auraId').value.trim();
        const vfxDisplay = document.getElementById('vfxPath');
        vfxDisplay.textContent = "Converting...";
        if (!auraInput) {
            vfxDisplay.textContent = "VFX: (Please enter an Aura ID)";
            return;
        }
        try {
            const idTypes = ["sparksaura"];
            let url;
            if (idTypes.includes(auraInput.toLowerCase().split("_")[0])) {
                url = `https://fortnite-api.com/v2/cosmetics/br/${auraInput}?responseFlags=7`;
            } else {
                url = `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(auraInput)}&responseFlags=7`;
            }
            const response = await fetch(url);
            const json = await response.json();
            const data = json.data;
            const assetId = data?.path;
            let exportRes = await fetch(`https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`);
            vfxDisplay.textContent = exportRes;
            let exportJson = await exportRes.json();
            if (exportJson.errored) {
                if (exportJson.note === "Unable to find package") {
                    exportRes = await fetch(`https://export-service.dillyapis.com/v1/export?path=${assetPath}`);
                    exportJson = await exportRes.json();
                    if (exportJson.code === 400 || exportJson.code === 404 || exportJson.error) {
                        vfxDisplay.textContent = `Error: ${exportJson.error_description || "Failed to fetch from alternative API."}`;
                        return;
                    }
                } else {
                    vfxDisplay.textContent = `Error: ${exportJson.note}`;
                    return;
                }
            }
            const jsonOutput = exportJson.jsonOutput;
            const mainPath = jsonOutput[0]?.Properties?.SustainSystem?.AssetPathName || "None";
            const startPath = jsonOutput[0]?.Properties?.StartSystem?.AssetPathName || "None";
            const stopPath = jsonOutput[0]?.Properties?.StopSystem?.AssetPathName || "None";
            vfxDisplay.innerHTML = `VFX:<br>Main Path: ${mainPath}<br>Start Path: ${startPath}<br>Stop Path: ${stopPath}`;
        } catch (error) {
            console.error(error);
            vfxDisplay.textContent = `Error: ${error.message}`;
        }
    }
    document.getElementById("convertAuraToVFX")
        .addEventListener("click", auraToVFX);
});

window.addEventListener('DOMContentLoaded', () => {
    async function musicpackToAudio() {
        const musicInput = document.getElementById('musicpackId').value.trim();
        const audioDisplay = document.getElementById('audioPath1');
        audioDisplay.textContent = "Converting...";
        if (!musicInput) {
            audioDisplay.textContent = "Audio: (Please enter an MusicPack ID)";
            return;
        }
        const convertExportPath = (path) => {
            if (path.startsWith("/")) path = path.slice(1);
            const [left] = path.includes(".") ? path.split(".", 1) : [path];
            if (left.startsWith("Game/")) {
                return "FortniteGame/Content/" + left.slice(5) + ".uasset";
            } else {
                const [plugin, ...rest] = left.split("/");
                return `FortniteGame/Plugins/GameFeatures/${plugin}/Content/${rest.join("/")}.uasset`;
            }
        };
        const findAllSoundWavePaths = (data) => {
            const results = [];
            const search = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(search);
                } else if (typeof obj === 'object' && obj !== null) {
                    if (obj.ObjectName?.includes("SoundWave")) {
                        results.push(obj.ObjectPath);
                    }
                    Object.values(obj).forEach(search);
                }
            };
            search(data);
            return results;
        };
        const replaceLastSegment = (path) => {
            if (path.includes(".")) {
                const [base] = path.split(".");
                const lastWord = base.split("/").pop();
                return `${base}.${lastWord}`;
            }
            return path;
        };
        try {
            let url;
            const idPrefix = musicInput.toLowerCase().split("_")[0];
            if (idPrefix === "musicpack") {
                url = `https://fortnite-api.com/v2/cosmetics/br/${musicInput}?responseFlags=7`;
            } else {
                url = `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURIComponent(musicInput)}&backendType=AthenaMusicPack&responseFlags=7`;
            }
            const res = await fetch(url);
            const json = await res.json();
            const data = json.data;
            if (!data) {
                audioDisplay.textContent = "No data found for this cosmetic.";
                return;
            }
            const assetId = data?.path;
            const primaryExportUrl = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${assetId}&raw=true`;
            const fallbackExportUrl = `https://export-service.dillyapis.com/v1/export?path=${assetId}`;
            let exportData;
            try {
                const res1 = await fetch(primaryExportUrl);
                exportData = await res1.json();
                if (exportData.errored && exportData.note === "Unable to find package") {
                    const res2 = await fetch(fallbackExportUrl);
                    exportData = await res2.json();
                }
            } catch {
                const res2 = await fetch(fallbackExportUrl);
                exportData = await res2.json();
            }
            const musicAssetPath = exportData?.jsonOutput?.[0]?.Properties?.FrontEndLobbyMusic?.AssetPathName;
            if (!musicAssetPath) {
                audioDisplay.textContent = "No FrontEndLobbyMusic path found.";
                return;
            }
            const convertedPath = convertExportPath(musicAssetPath);
            const audioPrimaryUrl = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${convertedPath}&raw=true`;
            const audioFallbackUrl = `https://export-service.dillyapis.com/v1/export?path=${convertedPath}`;
            let audioData;
            try {
                const audioRes1 = await fetch(audioPrimaryUrl);
                audioData = await audioRes1.json();
                if (audioData.errored && audioData.note === "Unable to find package") {
                    const audioRes2 = await fetch(audioFallbackUrl);
                    audioData = await audioRes2.json();
                }
            } catch {
                const audioRes2 = await fetch(audioFallbackUrl);
                audioData = await audioRes2.json();
            }
            const soundWavePaths = findAllSoundWavePaths(audioData.jsonOutput || []);
            if (!soundWavePaths.length) {
                audioDisplay.textContent = "No SoundWave paths found in this music pack.";
                return;
            }
            const finalPaths = soundWavePaths.map(replaceLastSegment);
            audioDisplay.innerHTML = `Audio Paths:<br>${finalPaths.map(p => p).join("<br>")}`;
        } catch (err) {
            console.error(err);
            audioDisplay.textContent = `Error: ${err.message}`;
        }
    }
    document.getElementById("convertMusicPackToAudio")
        .addEventListener("click", musicpackToAudio);
});