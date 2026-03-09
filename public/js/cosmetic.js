let ALL_ASSETS = [];
let CHARACTER_ASSETS = [];

let currentIndex = 0;
const LOAD_COUNT = 100;

async function loadAssets(){
    const res = await fetch('../data/fortnite_assets.gz');
    const buffer = await res.arrayBuffer();
    const ds = new DecompressionStream("gzip");
    const stream = new Blob([buffer]).stream().pipeThrough(ds);
    const text = await new Response(stream).text();
    ALL_ASSETS = text.split("\n");
    console.log("Assets loaded:", ALL_ASSETS.length);
}

const CHARACTER_PATHS = [
"FortniteGame/Content/Athena/Items/Cosmetics/Characters/",
"FortniteGame/Plugins/GameFeatures/BRCosmetics/Content/Athena/Items/Cosmetics/Characters/",
"FortniteGame/Plugins/GameFeatures/SaveTheWorld/Content/Heroes/Commando/CosmeticCharacterItemDefinitions/",
"FortniteGame/Plugins/GameFeatures/SaveTheWorld/Content/Heroes/Constructor/CosmeticCharacterItemDefinitions/",
"FortniteGame/Plugins/GameFeatures/SaveTheWorld/Content/Heroes/Ninja/CosmeticCharacterItemDefinitions/",
"FortniteGame/Plugins/GameFeatures/SaveTheWorld/Content/Heroes/Outlander/CosmeticCharacterItemDefinitions/",
"FortniteGame/Plugins/GameFeatures/FNE/Beanstalk/BeanstalkCosmetics/Content/Cosmetics/Def/CID/"
];

function findCharacterAssets(){

    CHARACTER_ASSETS = ALL_ASSETS.filter(path =>
        CHARACTER_PATHS.some(prefix => path.startsWith(prefix))
    );

    console.log("Characters found:", CHARACTER_ASSETS.length);

}

async function fetchExport(path){

    const url = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`;

    const res = await fetch(url);
    const json = await res.json();

    return json?.jsonOutput || [];

}

function findIcon(data){

    const search = (obj) => {

        if(Array.isArray(obj)){
            for(const i of obj){
                const r = search(i);
                if(r) return r;
            }
        }

        if(typeof obj === "object" && obj !== null){

            if(obj.LargeIcon?.AssetPathName) return obj.LargeIcon.AssetPathName;
            if(obj.Icon?.AssetPathName) return obj.Icon.AssetPathName;

            for(const v of Object.values(obj)){
                const r = search(v);
                if(r) return r;
            }

        }

    };

    return search(data);

}

function iconToImage(iconPath){

    if(!iconPath) return null;

    const clean = iconPath.split(".")[0];

    return `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(clean)}&raw=false`;

}

function createCard(path, imgUrl, container){

    const card = document.createElement("div");
    card.className = "device-card";

    const header = document.createElement("div");
    header.className = "card-header";

    if(imgUrl){

        const img = document.createElement("img");
        img.src = imgUrl;
        img.className = "card-img";
        img.loading = "lazy";

        header.appendChild(img);

    }

    const textDiv = document.createElement("div");
    textDiv.className = "card-header-text";

    const name = document.createElement("div");
    name.className = "card-device-name";
    name.textContent = path.split("/").pop();

    const playset = document.createElement("div");
    playset.className = "card-playset";
    playset.textContent = path;

    textDiv.appendChild(name);
    textDiv.appendChild(playset);

    header.appendChild(textDiv);
    card.appendChild(header);

    container.appendChild(card);

}

async function loadMore(){

    const meshDiv = document.getElementById("meshDiv");

    const nextAssets = CHARACTER_ASSETS.slice(currentIndex, currentIndex + LOAD_COUNT);

    for(const path of nextAssets){

        try{

            const exportData = await fetchExport(path);

            const iconPath = findIcon(exportData);

            const imgUrl = iconToImage(iconPath);

            createCard(path, imgUrl, meshDiv);

        }catch(err){

            console.warn("Export failed:", path);

        }

    }

    currentIndex += LOAD_COUNT;

}

window.addEventListener("DOMContentLoaded", async () => {

    await loadAssets();

    findCharacterAssets();

    await loadMore();

    const button = document.createElement("button");
    button.textContent = "Load More";
    button.id = "loadMoreBtn";

    button.onclick = loadMore;

    document.querySelector("main").appendChild(button);

});