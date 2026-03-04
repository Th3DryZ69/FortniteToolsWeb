// window.addEventListener('DOMContentLoaded', (event) => {
//     async function searchAssets() {
//         const keywordsInput = document.getElementById('keywords').value.trim();
//         const formatted = document.getElementById('formatted').checked;
//         const resultsTable = document.getElementById('results');
//         const loadingIndicator = document.getElementById('loading');
//         resultsTable.innerHTML = '';
//         if (!keywordsInput) {
//             alert("Please enter at least one keyword.");
//             return;
//         }
//         const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
//         loadingIndicator.style.display = 'block';
//         try {
//             const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
//             const assets = await response.json();
//             const matchingPaths = assets.filter(assetPath =>
//                 keywords.every(keyword => assetPath.toLowerCase().includes(keyword))
//             );
//             const finalPaths = formatted ? matchingPaths.map(formatAssetPath) : matchingPaths;
//             finalPaths.forEach((path, index) => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${path}</td>
//                     <td>
//                         <button class="view-btn" data-path="${path}">View</button>
//                         <button class="copy-btn" data-path="${path}">Copy</button>
//                     </td>
//                 `;
//                 resultsTable.appendChild(row);
//                 const viewBtn = row.querySelector('.view-btn');
//                 viewBtn.addEventListener('click', () => {
//                     const jsonPath = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`;
//                     openJsonViewer(jsonPath);
//                 });
//                 const copyBtn = row.querySelector('.copy-btn');
//                 copyBtn.addEventListener('click', () => {
//                     navigator.clipboard.writeText(path).then(() => {
//                         alert(`${path} copy successfully !`);
//                     }).catch(err => {
//                         console.error('Failed to copy text: ', err);
//                     });
//                 });
//             });
//             function openJsonViewer(jsonPath) {
//                 const newWindow = window.open();
//                 newWindow.document.write(`
//                     <!DOCTYPE html>
//                     <html lang='en'>
//                     <head>
//                         <meta charset='UTF-8'>
//                         <meta name='viewport' content='width=device-width, initial-scale=1.0'>
//                         <title>JSON Viewer</title>
//                         <style>
//                             body { 
//                                 font-family: Arial, sans-serif; 
//                                 background-color: #27272f; 
//                                 color: #929295; 
//                                 margin: 0; 
//                                 padding: 20px; 
//                                 box-sizing: border-box; 
//                             } 
//                             pre { 
//                                 background-color: #32333d; 
//                                 padding: 10px; 
//                                 border-radius: 5px; 
//                                 overflow-x: auto; 
//                             } 
//                             h1 { 
//                                 color: #ec7519; 
//                             } 
//                             .loading { 
//                                 color: #929295; 
//                                 font-size: 14px; 
//                             }
//                         </style>
//                     </head>
//                     <body>
//                         <h1>JSON Viewer</h1>
//                         <div class='loading'>Loading JSON data...</div>
//                         <pre id='json-content'></pre>
//                         <script>
//                             async function fetchJsonData(url) { 
//                                 try { 
//                                     const response = await fetch(url); 
//                                     if (!response.ok) { 
//                                         throw new Error('Network response was not ok'); 
//                                     } 
//                                     const jsonData = await response.json(); 
//                                     document.querySelector('.loading').style.display = 'none'; 
//                                     document.getElementById('json-content').textContent = JSON.stringify(jsonData, null, 4); 
//                                 } catch (error) { 
//                                     document.querySelector('.loading').textContent = 'Error loading JSON data: ' + error.message;
//                                 } 
//                             }
//                             fetchJsonData('${jsonPath}');
//                         </script>
//                     </body>
//                     </html>
//                     `);
//                 newWindow.document.close();
//             }
//         } catch (error) {
//             console.error("Error fetching assets:", error);
//             alert("An error occurred while fetching the assets.");
//         } finally {
//             loadingIndicator.style.display = 'none';
//         }
//     }
//     function formatAssetPath(assetPath) {
//         const addCCheckbox = document.getElementById("addC");
//         if (assetPath.startsWith('FortniteGame/Content')) {
//             assetPath = assetPath.replace('FortniteGame/Content', '/Game').replace('.uasset', '');
//         } else {
//             const regex = /\/([^/]+)\/Content\/(.+)/;
//             const match = assetPath.match(regex);
//             if (match && match[1] && match[2]) {
//                 const prefix = match[1];
//                 const remainingPath = match[2].replace('.uasset', '');
//                 assetPath = `/${prefix}/${remainingPath}`;
//             }
//         }
//         const lastPart = assetPath.substring(assetPath.lastIndexOf('/') + 1);
//         assetPath += `.${lastPart}`;
//         if (addCCheckbox.checked) {
//             assetPath += "_C";
//         }
//         return assetPath;
//     }
//     const button = document.querySelector("button");
//     button.addEventListener("click", searchAssets);
// });



window.addEventListener('DOMContentLoaded', (event) => {
    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            btn.innerHTML = '✔️';
            setTimeout(() => {
                btn.innerHTML = '📋';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    async function searchAssets() {
        const keywordsInput = document.getElementById('keywords').value.trim();
        const formatted = document.getElementById('formatted').checked;
        const resultsTable = document.getElementById('results');
        const loadingIndicator = document.getElementById('loading');
        resultsTable.innerHTML = '';
        if (!keywordsInput) {
            alert("Please enter at least one keyword.");
            return;
        }
        const keywords = keywordsInput.toLowerCase().split(/[\s,]+/).filter(Boolean);
        loadingIndicator.style.display = 'block';
        try {
            const response = await fetch("https://fortnitecentral.genxgames.gg/api/v1/assets");
            const assets = await response.json();
            const matchingPaths = assets.filter(assetPath =>
                keywords.every(keyword => assetPath.toLowerCase().includes(keyword))
            );
            const finalPaths = formatted ? matchingPaths.map(formatAssetPath) : matchingPaths;
            finalPaths.forEach((path, index) => {
                const row = document.createElement('tr');

                // Numéro
                const tdIndex = document.createElement('td');
                tdIndex.textContent = index + 1;
                row.appendChild(tdIndex);

                // Cellule Path + boutons en haut à droite
                const tdPath = document.createElement('td');
                tdPath.style.position = "relative";
                tdPath.textContent = path;

                // Bouton View
                const viewBtn = document.createElement('button');
                viewBtn.className = "view-btn";
                viewBtn.innerHTML = '👁️';
                viewBtn.style.position = "absolute";
                viewBtn.style.top = "4px";
                viewBtn.style.right = "34px";
                viewBtn.title = "View JSON";

                // Bouton Copy
                const copyBtn = document.createElement('button');
                copyBtn.className = "copy-btn";
                copyBtn.innerHTML = '📋';
                copyBtn.style.position = "absolute";
                copyBtn.style.top = "4px";
                copyBtn.style.right = "4px";
                copyBtn.title = "Copy Path";

                tdPath.appendChild(viewBtn);
                tdPath.appendChild(copyBtn);
                row.appendChild(tdPath);

                resultsTable.appendChild(row);

                // Action View
                let filesUasset;
                viewBtn.addEventListener('click', () => {
                    const jsonPath = `https://fortnitecentral.genxgames.gg/api/v1/export?path=${encodeURIComponent(path)}&raw=true`;
                    filesUasset = path
                    openJsonViewer(jsonPath, filesUasset);
                });

                // Action Copy
                copyBtn.addEventListener('click', () => {
                    copyToClipboard(path, copyBtn);
                });
            });

            function openJsonViewer(jsonPath, filesUasset) {
                const newWindow = window.open();
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang='en'>
                    <head>
                        <meta charset='UTF-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <title>JSON Viewer</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                background-color: #27272f; 
                                color: #929295; 
                                margin: 0; 
                                padding: 20px; 
                                box-sizing: border-box; 
                            } 
                            pre { 
                                background-color: #32333d; 
                                padding: 10px; 
                                border-radius: 5px; 
                                overflow-x: auto; 
                            } 
                            h1 { 
                                color: #ec7519; 
                            } 
                            .loading { 
                                color: #929295; 
                                font-size: 14px; 
                            }
                        </style>
                    </head>
                    <body>
                        <h1>JSON Viewer</h1>
                        <p>Files: ${filesUasset}</p>
                        <div class='loading'>Loading JSON data...</div>
                        <pre id='json-content'></pre>
                        <script>
                            async function fetchJsonData(url) { 
                                try { 
                                    const response = await fetch(url); 
                                    if (!response.ok) { 
                                        throw new Error('Network response was not ok'); 
                                    } 
                                    const jsonData = await response.json(); 
                                    document.querySelector('.loading').style.display = 'none'; 
                                    document.getElementById('json-content').textContent = JSON.stringify(jsonData, null, 4); 
                                } catch (error) { 
                                    document.querySelector('.loading').textContent = 'Error loading JSON data: ' + error.message;
                                } 
                            }
                            fetchJsonData('${jsonPath}');
                        </script>
                    </body>
                    </html>
                    `);
                newWindow.document.close();
            }
        } catch (error) {
            console.error("Error fetching assets:", error);
            alert("An error occurred while fetching the assets.");
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function formatAssetPath(assetPath) {
        const addCCheckbox = document.getElementById("addC");
        if (assetPath.startsWith('FortniteGame/Content')) {
            assetPath = assetPath.replace('FortniteGame/Content', '/Game').replace('.uasset', '');
        } else {
            const regex = /\/([^/]+)\/Content\/(.+)/;
            const match = assetPath.match(regex);
            if (match && match[1] && match[2]) {
                const prefix = match[1];
                const remainingPath = match[2].replace('.uasset', '');
                assetPath = `/${prefix}/${remainingPath}`;
            }
        }
        const lastPart = assetPath.substring(assetPath.lastIndexOf('/') + 1);
        assetPath += `.${lastPart}`;
        if (addCCheckbox.checked) {
            assetPath += "_C";
        }
        return assetPath;
    }

    const button = document.querySelector("button");
    button.addEventListener("click", searchAssets);
});
