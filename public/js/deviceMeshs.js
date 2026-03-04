function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = '✔️';
        setTimeout(() => {
            btn.innerHTML = '📋';
        }, 2000);
    });
}
const meshDiv = document.getElementById('meshDiv');
fetch('./public/data/devicemeshs.json')
    .then(response => response.json())
    .then(data => {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        thead.innerHTML = `
            <tr>
                <th>Device / Image</th>
                <th>Setting</th>
                <th>Device Assets Path</th>
                <th>Custom Option Key</th>
                <th>Custom Option Value Example (1.000000 = 1)</th>
            </tr>
        `;
        Object.entries(data)
            .sort(([a], [b]) => {
                const aStartsWithLetter = /^[a-zA-Z]/.test(a);
                const bStartsWithLetter = /^[a-zA-Z]/.test(b);
                // Si A est lettre et B non → A avant
                if (aStartsWithLetter && !bStartsWithLetter) return -1;
                // Si B est lettre et A non → B avant
                if (!aStartsWithLetter && bStartsWithLetter) return 1;
                // Sinon tri normal
                return a.localeCompare(b, undefined, { sensitivity: 'base' });
            })
            .forEach(([deviceName, deviceData]) => {
            if (deviceData.dispo === false) return;
            const settings = Object.entries(deviceData.settings);
            const rowSpan = settings.length;
            const trTitle = document.createElement('tr');
            const tdTitle = document.createElement('td');
            tdTitle.colSpan = 5;
            tdTitle.className = "device-title";
            let titleHtml = `<strong>${deviceName}</strong>`;
            titleHtml += ` | <span class="playset"> Playset: ${deviceData.playset}</span>`;
            if (deviceData.important) {
                titleHtml += `<br><span class="important">!!!Important!!! ==> ${deviceData.important}</span>`;
            }
            tdTitle.innerHTML = titleHtml;
            trTitle.appendChild(tdTitle);
            tbody.appendChild(trTitle);
            settings.forEach(([settingName, settingData], index) => {
                const tr = document.createElement('tr');
                if (index === 0) {
                    const tdImg = document.createElement('td');
                    tdImg.rowSpan = rowSpan;
                    tdImg.innerHTML = deviceData.image ? `<img src="${deviceData.image}" alt="${deviceName}">` : '';
                    tr.appendChild(tdImg);
                }
                const tdSetting = document.createElement('td');
                tdSetting.textContent = settingName;
                tr.appendChild(tdSetting);
                if (index === 0) {
                    const tdPath = document.createElement('td');
                    tdPath.rowSpan = rowSpan;
                    tdPath.style.position = "relative";
                    tdPath.textContent = deviceData.path || '';
                    const btn = document.createElement('button');
                    btn.className = "copy-btn";
                    btn.title = "Copy";
                    btn.innerHTML = '📋';
                    btn.style.position = "absolute";
                    btn.style.top = "4px";
                    btn.style.right = "4px";
                    btn.onclick = function() {
                        copyToClipboard(deviceData.path || '', btn);
                    };
                    tdPath.appendChild(btn);
                    tr.appendChild(tdPath);
                }
                const tdKey = document.createElement('td');
                tdKey.style.position = "relative";
                tdKey.textContent = settingData["option key"];
                const btnKey = document.createElement('button');
                btnKey.className = "copy-btn";
                btnKey.title = "Copy";
                btnKey.innerHTML = '📋';
                btnKey.style.position = "absolute";
                btnKey.style.top = "4px";
                btnKey.style.right = "4px";
                btnKey.onclick = function() {
                    copyToClipboard(settingData["option key"], btnKey);
                };
                tdKey.appendChild(btnKey);
                tr.appendChild(tdKey);
                const tdValue = document.createElement('td');
                tdValue.style.position = "relative";
                tdValue.textContent = settingData.value;
                const btnValue = document.createElement('button');
                btnValue.className = "copy-btn";
                btnValue.title = "Copy";
                btnValue.innerHTML = '📋';
                btnValue.style.position = "absolute";
                btnValue.style.top = "4px";
                btnValue.style.right = "4px";
                btnValue.onclick = function() {
                    copyToClipboard(settingData.value, btnValue);
                };
                tdValue.appendChild(btnValue);
                tr.appendChild(tdValue);
                tbody.appendChild(tr);
            });
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        meshDiv.appendChild(table);
    })
.catch(error => {
    console.error('Error loading JSON:', error);
});

const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
searchToggle.addEventListener("click", () => {
    searchInput.classList.toggle("active");
    searchInput.focus();
});
searchInput.addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const titles = document.querySelectorAll(".device-title");
    titles.forEach(title => {
        const deviceName = title.textContent.toLowerCase();
        const tableRows = [];
        let next = title.parentElement.nextElementSibling;
        while (next && !next.querySelector(".device-title")) {
            tableRows.push(next);
            next = next.nextElementSibling;
        }

        if (deviceName.includes(filter)) {
            title.parentElement.style.display = "";
            tableRows.forEach(row => row.style.display = "");
        } else {
            title.parentElement.style.display = "none";
            tableRows.forEach(row => row.style.display = "none");
        }
    });
});