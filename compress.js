// const fs = require("fs");
// const zlib = require("zlib");

// console.log("Loading JSON...");

// const data = JSON.parse(fs.readFileSync("public/data/fortnite_assets.json", "utf8"));
// const assets = data.assets;

// console.log("Assets:", assets.length);

// // transformer en texte simple
// const text = assets.join("\n");

// // compression gzip
// const compressed = zlib.gzipSync(text, { level: 9 });

// fs.writeFileSync("public/data/fortnite_assets.gz", compressed);

// console.log("Compressed size:", (compressed.length / 1024 / 1024).toFixed(2), "MB");

const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

// Récupère le fichier droppé sur le .bat
const inputFile = process.argv[2];

if (!inputFile) {
    console.error("Usage: glisse n'importe quel fichier sur ce script !");
    process.exit(1);
}

console.log("Loading file:", inputFile);

const fileBuffer = fs.readFileSync(inputFile);

console.log("Original size:", (fileBuffer.length / 1024 / 1024).toFixed(2), "MB");

// compression gzip
const compressed = zlib.gzipSync(fileBuffer, { level: 9 });

// Output dans le même dossier que le fichier input
const outputFile = path.join(path.dirname(inputFile), path.basename(inputFile) + ".gz");

fs.writeFileSync(outputFile, compressed);

console.log("Output:", outputFile);
console.log("Compressed size:", (compressed.length / 1024 / 1024).toFixed(2), "MB");
console.log("Ratio:", ((1 - compressed.length / fileBuffer.length) * 100).toFixed(1) + "% gagné");

// Pause pour voir le résultat
console.log("\nAppuie sur une touche pour fermer...");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", () => process.exit(0));