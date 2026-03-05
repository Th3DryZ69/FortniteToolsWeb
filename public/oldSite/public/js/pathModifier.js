const inputPath = document.getElementById("inputPath");
const modifiedPath = document.getElementById("modifiedPath");
const clearBtn = document.getElementById("clearBtn");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const addCCheckbox = document.getElementById("addC");
inputPath.addEventListener("focus", () => {
    if (inputPath.value === "FortniteGame/Content/Items/Traps/Blueprints/Trap_Floor_Player_Jump_Pad") {
        inputPath.value = "";
    }
});
inputPath.addEventListener("blur", () => {
    if (inputPath.value.trim() === "") {
        inputPath.value = "FortniteGame/Content/Items/Traps/Blueprints/Trap_Floor_Player_Jump_Pad";
    }
});
clearBtn.addEventListener("click", () => {
    inputPath.value = "";
});
generateBtn.addEventListener("click", () => {
    let chemin = inputPath.value;
    const positionContent = chemin.indexOf("/Content");
    if (positionContent !== -1) {
        const partieAvantContent = chemin.substring(0, positionContent);
        const dernierSlash = partieAvantContent.lastIndexOf("/");
        const premierMot = partieAvantContent.substring(dernierSlash + 1);
        if (!chemin.startsWith("/FortniteGame/Content") && !chemin.startsWith("/fortnitegame/Content")) {
            chemin = "/" + premierMot + chemin.substring(positionContent);
            chemin = chemin.replace("FortniteGame/Content", "Game");
            chemin = chemin.replace("fortnitegame/Content", "Game");
        }
    }
    chemin = chemin.replace("/Content", "");
    chemin = chemin.replace(".uasset", "");
    const dernierSlash = chemin.lastIndexOf("/");
    const dernierMot = chemin.substring(dernierSlash + 1);
    chemin = chemin.substring(0, dernierSlash + 1) + dernierMot + "." + dernierMot;
    if (addCCheckbox.checked) {
        chemin += "_C";
    }
    modifiedPath.value = chemin;
});
copyBtn.addEventListener("click", () => {
    modifiedPath.select();
    document.execCommand("copy");
    //alert("Copied to clipboard!");
});