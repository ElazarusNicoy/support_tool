// home-page
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Read name from query
// const user = new URLSearchParams(window.location.search).get('name');
// if (user) document.getElementById('name').textContent = user;

// Display the user's name beside the avatar
const params = new URLSearchParams(window.location.search);
const displayName = params.get('name');
if (displayName) document.getElementById('displayAvatarName').textContent = displayName;

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.getElementById('userDropdown').classList.remove('show');
});

// Expand or collapse sidebar categories
function toggleCategory(btn) {
    const category = btn.parentElement;

    category.classList.toggle('open');

    // if sidebar is collapsed, expand it so the submenu is visible
    document.getElementById('sidebar').classList.remove('collapsed');
}

// Window tab system
// open or focus a tab named after the clicked submenu item
function openTab(e, tabName) {
    e.preventDefault();

    const tabBar = document.getElementById('tabBar');
    const content = document.getElementById('mainContent');
    const slug = tabName.toLowerCase().replace(/\s+/g, '-');   // <-- define slug
    const tabId = 'tab-' + slug;

    //if the tab already exists, focus it
    const existingTab = document.getElementById(tabId);
    if (existingTab) {
        activateTab(tabId);
        return;
    }

    // Create the tab button
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = tabId;
    tab.innerHTML = `
        <span class="tab-title">${tabName}</span>
        <button class="tab-close" title="Close">X</button>`;

    tab.addEventListener('click', () => activateTab(tabId));
    tab.querySelector('.tab-close').addEventListener('click', (ev) => {
        ev.stopPropagation();
        closeTab(tabId);
    });
    tabBar.appendChild(tab);

    // Create the matching content panel
    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.id = tabId + '-panel';
    content.appendChild(panel);
    activateTab(tabId);

    // Load the panel's content from its HTML file
    fetch(`supports/${slug}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            panel.innerHTML = html;

            if (tabName === 'PDA Ticket') {
            initPdaTicketPanel(panel);
        }
        })
        .catch(() => {
            panel.innerHTML = `<h2>${tabName}</h2><p>Could not load content for this form.</p>`;
        });

        // Initialize the PDA Ticket panel if this is the PDA Ticket tab
        function initPdaTicketPanel(panel) {
        const requestorInput = panel.querySelector('#requestorName');
        const checkBtn = panel.querySelector('#checkRequestorBtn');
        const downloadTemplateBtn = panel.querySelector('#downloadTemplateBtn');
        const uploadBtn = panel.querySelector('#uploadMatrixBtn');
        const uploadInput = panel.querySelector('#uploadMatrixInput');
        const downloadDisplayedBtn = panel.querySelector('#downloadDisplayedBtn');
        const tableBody = panel.querySelector('#approverMatrixTable tbody');

        if (!requestorInput || !checkBtn || !downloadTemplateBtn || !uploadBtn || !uploadInput || !downloadDisplayedBtn || !tableBody) return;

        checkBtn.addEventListener('click', () => {
            const name = requestorInput.value.trim();
            if (!name) {
                alert('Please enter Requestor / Prepared By.');
                return;
            }
            alert(`Checked: ${name}`);
        });

        downloadTemplateBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('docs/assets/approver_matrix_format/PDA_Ticket_Approver_Matrix_Format.xlsx');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'PDA_Ticket_Approver_Matrix_Format.xlsx';
                link.click();
                URL.revokeObjectURL(link.href);
            } catch {
                alert('Template file not found. Please contact the administrator.');
            }
        });

        uploadBtn.addEventListener('click', () => uploadInput.click());

        uploadInput.addEventListener('change', async () => {
            const file = uploadInput.files?.[0];
            if (!file) return;

            let rows;
            if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            } else {
                const text = await file.text();
                rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(','));
            }

            tableBody.innerHTML = '';
            rows.slice(1).forEach(cols => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${String(cols[0] ?? '').trim()}</td>
                    <td>${String(cols[1] ?? '').trim()}</td>
                    <td>${String(cols[2] ?? '').trim()}</td>
                    <td>${String(cols[3] ?? '').trim()}</td>
                `;
                tableBody.appendChild(tr);
            });

            if (!tableBody.children.length) {
                tableBody.innerHTML = '<tr><td colspan="4">No valid rows found.</td></tr>';
            }
        });

        downloadDisplayedBtn.addEventListener('click', () => {
            const rows = [['Level', 'Approver Name', 'Department', 'Email']];

            panel.querySelectorAll('#approverMatrixTable tbody tr').forEach(tr => {
                const cells = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
                if (cells.length === 4) rows.push(cells);
            });

            if (rows.length === 1) {
                alert('No data to download.');
                return;
            }

            const worksheet = XLSX.utils.aoa_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Approver Matrix');
            XLSX.writeFile(workbook, 'displayed-approver-matrix.xlsx'); // saves as .xlsx by default
        });
    }

    function downloadCsv(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Show one tab's panel, hide the rest
    // OR UNFOCUS THE OTHERS
    function activateTab(tabId) {
        document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        document.getElementById(tabId + '-panel').classList.add('active');

        //Hide the welcome view while tabs are open
        document.getElementById('welcomeView').classList.add('hidden');
    }


    // close a tab and its panel
    function closeTab(tabId) {
        const wasActive = document.getElementById(tabId).classList.contains('active');
        document.getElementById(tabId).remove();
        document.getElementById(tabId + '-panel').remove();

        const remainingTabs = document.querySelectorAll('.tab');
        if (remainingTabs.length === 0) {
            // Show welcome view if no tabs are open
            document.getElementById('welcomeView').classList.remove('hidden');
        } else if (wasActive) {
            // focus the last remaining tab
            activateTab(remainingTabs[remainingTabs.length - 1].id);
    }

} 
}