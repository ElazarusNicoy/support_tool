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

// Toggle dropdown when avatar is clicked
document.getElementById('userAvatar').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown').classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.getElementById('userDropdown').classList.remove('show');
});

// Show confirmation modal when logout button is clicked
document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('logOutModal').classList.add('show');
});

// Yes → go back to login page
document.getElementById('confirmLogout').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// No → close the modal
document.getElementById('cancelLogout').addEventListener('click', () => {
    document.getElementById('logOutModal').classList.remove('show');
});

// Close confirmation modal when clicking outside
document.getElementById('logOutModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('logOutModal').classList.remove('show');
    }
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
    const tabId = 'tab-' + tabName.toLowerCase().replace(/\s+/g, '-');

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
    fetch(`${tabName.toLowerCase().replace(/\s+/g, '-')}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            panel.innerHTML = html;

            //wire up the form if this panel contains one
            const form = panel.querySelector('form');
            if (form) {
                form.addEventListener('submit', (ev) => {
                    ev.preventDefault();
                    // send to FastAPI with fetch()
                    alert('Form submitted!');
                });
            }
        })
        .catch(() => {
            panel.innerHTML = `<h2>${tabName}</h2><p>Could not load content for this form.</p>`;
        });
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