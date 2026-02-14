// ============================================================
//  js/main.js
//  App entry point — tab switching, initialisation,
//  and live-update listeners on the input fields.
//  Load this LAST in index.html (after all other JS files).
// ============================================================


// ── Tab switching ─────────────────────────────────────────────
function switchTab(tab) {
  // Update tab button styles
  const tabs = document.querySelectorAll('.tab');
  ['sort', 'search', 'tree'].forEach((name, i) => {
    tabs[i].classList.toggle('active', name === tab);
  });

  // Show/hide panels
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById('panel-' + tab).classList.add('active');

  // Re-initialise the newly visible panel so it looks correct
  if (tab === 'sort') {
    initBars(parseArray('sort-input'));
    updateSortInfo();
  }
  if (tab === 'search') {
    renderSearchArray(parseArray('search-input'));
    updateSearchInfo();
  }
  if (tab === 'tree') {
    buildTree();
    updateTreeInfo();
  }
}


// ── Initialise everything on page load ───────────────────────
function init() {
  // Sorting tab
  updateSortInfo();
  initBars(parseArray('sort-input'));

  // Search tab
  updateSearchInfo();
  renderSearchArray(parseArray('search-input'));

  // Tree tab
  updateTreeInfo();
  buildTree();

  // Wire up algo dropdowns → update info box immediately on change
  document.getElementById('sort-algo').addEventListener('change', updateSortInfo);
  document.getElementById('tree-algo').addEventListener('change', updateTreeInfo);
  // search-algo already has onchange="onSearchAlgoChange()" in HTML

  // ── Live preview: re-render while the user types ─────────────
  document.getElementById('sort-input').addEventListener('input', () => {
    const arr = parseArray('sort-input');
    if (arr.length && arr.length <= 50) initBars(arr);
  });

  document.getElementById('search-input').addEventListener('input', () => {
    const arr = parseArray('search-input');
    if (arr.length) renderSearchArray(arr);
  });

  document.getElementById('tree-input').addEventListener('input', () => {
    buildTree();
  });
}


// Run init once the page is fully loaded
window.addEventListener('DOMContentLoaded', init);
