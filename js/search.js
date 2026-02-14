// ============================================================
//  js/search.js
//  Search panel: linear search + binary search.
//  Depends on: utils.js
// ============================================================


// ── Render the array as coloured cells ───────────────────────
//    states = { index: 'className', … }
//    e.g.   { 3: 'searching', 7: 'found' }
function renderSearchArray(arr, states = {}) {
  const container = document.getElementById('search-array-display');
  container.innerHTML = '';

  arr.forEach((value, i) => {
    const cell = document.createElement('div');
    cell.className = 'arr-cell ' + (states[i] || '');
    cell.innerHTML = `${value}<div class="idx">[${i}]</div>`;
    container.appendChild(cell);
  });
}

// ── Called when the algorithm dropdown changes ────────────────
function onSearchAlgoChange() {
  const key = document.getElementById('search-algo').value;
  showAlgoInfo(key, 'search-algo-info', 's-time', null);

  // Show the binary search pointer panel only for binary search
  document.getElementById('binary-pointers').style.display =
    key === 'binary' ? 'block' : 'none';
}

// ── Update the info box (also called from main.js on init) ───
function updateSearchInfo() {
  onSearchAlgoChange();
}

// ── Reset the search panel to its initial state ──────────────
function resetSearch() {
  renderSearchArray(parseArray('search-input'));
  document.getElementById('search-status').children[0].textContent =
    'Enter your array and target, then click Search ▶';
  document.getElementById('s-steps').textContent  = '0';
  document.getElementById('s-result').textContent = '—';

  // Clear pointer readout
  ['bp-left', 'bp-mid', 'bp-right'].forEach(id => {
    document.getElementById(id).textContent = '—';
  });
}

// ── Main search entry point ───────────────────────────────────
async function runSearch() {
  const arr    = parseArray('search-input');
  const target = parseFloat(document.getElementById('search-target').value);

  if (!arr.length || isNaN(target)) {
    showToast('⚠ Enter a valid array and target value!');
    return;
  }

  // Reset counters
  document.getElementById('s-steps').textContent  = '0';
  document.getElementById('s-result').textContent = '—';

  const algo = document.getElementById('search-algo').value;

  if (algo === 'binary') {
    // Binary search needs a sorted array — sort it first
    const sorted = [...arr].sort((a, b) => a - b);
    document.getElementById('search-input').value = sorted.join(', ');
    document.getElementById('binary-pointers').style.display = 'block';
    await binarySearch(sorted, target);
  } else {
    document.getElementById('binary-pointers').style.display = 'none';
    await linearSearch(arr, target);
  }
}


// ============================================================
//  LINEAR SEARCH
//  Checks every element from left to right.
//  Time: O(n)   Space: O(1)
// ============================================================
async function linearSearch(arr, target) {
  let steps = 0;

  for (let i = 0; i < arr.length; i++) {
    steps++;
    document.getElementById('s-steps').textContent = steps;

    // Highlight the current cell being checked
    renderSearchArray(arr, { [i]: 'searching' });
    document.getElementById('search-status').children[0].innerHTML =
      `Checking index <span class="highlight">[${i}]</span> = ${arr[i]}…`;

    await delay(getDelay('search-speed'));

    if (arr[i] === target) {
      renderSearchArray(arr, { [i]: 'found' });
      document.getElementById('search-status').children[0].innerHTML =
        `<span class="highlight">✅ Found ${target} at index [${i}]!</span>`;
      document.getElementById('s-result').textContent = `Index ${i}`;
      return;
    }
  }

  // Target was not found
  renderSearchArray(arr, {});
  document.getElementById('search-status').children[0].innerHTML =
    `<span style="color:var(--accent2)">❌ ${target} not found in array.</span>`;
  document.getElementById('s-result').textContent = 'Not found';
}


// ============================================================
//  BINARY SEARCH
//  Requires a sorted array.
//  Halves the search space each step.
//  Time: O(log n)   Space: O(1)
// ============================================================
async function binarySearch(arr, target) {
  let left  = 0;
  let right = arr.length - 1;
  let steps = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps++;
    document.getElementById('s-steps').textContent = steps;

    // Update the pointer readout
    document.getElementById('bp-left').textContent  = `${left} (${arr[left]})`;
    document.getElementById('bp-mid').textContent   = `${mid} (${arr[mid]})`;
    document.getElementById('bp-right').textContent = `${right} (${arr[right]})`;

    // Colour: boundary = yellow, mid = purple
    const states = {};
    for (let i = left; i <= right; i++) states[i] = 'boundary';
    states[mid] = 'mid';
    renderSearchArray(arr, states);

    document.getElementById('search-status').children[0].innerHTML =
      `L=${left}  R=${right} → Mid=<span class="highlight">[${mid}]=${arr[mid]}</span> vs target <span class="highlight">${target}</span>`;

    await delay(getDelay('search-speed'));

    if (arr[mid] === target) {
      // Found!
      renderSearchArray(arr, { [mid]: 'found' });
      document.getElementById('search-status').children[0].innerHTML =
        `<span class="highlight">✅ Found ${target} at index [${mid}]!</span>`;
      document.getElementById('s-result').textContent = `Index ${mid}`;
      return;

    } else if (arr[mid] < target) {
      // Target is in the right half
      document.getElementById('search-status').children[0].innerHTML +=
        `  → going <span class="highlight">right</span>`;
      await delay(getDelay('search-speed') * 0.4);
      left = mid + 1;

    } else {
      // Target is in the left half
      document.getElementById('search-status').children[0].innerHTML +=
        `  → going <span class="highlight">left</span>`;
      await delay(getDelay('search-speed') * 0.4);
      right = mid - 1;
    }
  }

  // Target was not found
  document.getElementById('search-status').children[0].innerHTML =
    `<span style="color:var(--accent2)">❌ ${target} not found.</span>`;
  document.getElementById('s-result').textContent = 'Not found';
}
