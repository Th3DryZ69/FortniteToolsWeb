function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '✔️';
        setTimeout(() => {
            btn.innerHTML = '📋';
        }, 2000);
    });
}

async function loadJSON() {
    try {
        const response = await fetch("../data/id.json");
        const data = await response.json();
        generateTable(data);
    } catch (error) {
        console.error('Error loading JSON:', error);
    }
}

function generateTable(obj) {
    let html = "<table>";

    for (const [mainKey, mainValue] of Object.entries(obj)) {
        html += `<tr><td colspan="3" class="category">${mainKey}</td></tr>`;

        for (const [subKey, subValue] of Object.entries(mainValue)) {
            html += `<tr><td colspan="3" class="subcategory">${subKey}</td></tr>`;

            if (Object.keys(subValue).length > 0) {
                const sortedEntries = Object.entries(subValue)
                    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey));

                for (const [itemKey, itemValue] of sortedEntries) {
                    html += `
                    <tr>
                        <td>${itemKey}</td>
                        <td class="img"><img src="${itemValue.image}" alt="${itemKey}"></td>
                        <td class="path" style="position:relative;">
                            ${itemValue.path}
                            <button class="copy-btn" title="Copy"
                                style="position:absolute; top:4px; right:4px;"
                                onclick="copyToClipboard('${itemValue.path.replace(/'/g, "\\'")}', this)">
                                📋
                            </button>
                        </td>
                    </tr>`;
                }
            } else {
                html += `<tr><td colspan="3" style="text-align:center;">(vide)</td></tr>`;
            }
        }
    }

    html += "</table>";
    document.getElementById("idTool").innerHTML = html;
}

loadJSON();
