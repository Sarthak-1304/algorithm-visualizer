// ============================================================
//  js/utils.js
//  Shared helpers used by every other JS file.
//  Load this FIRST in index.html.
// ============================================================


// ── Async sleep ──────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Read the speed slider and convert to a millisecond delay ─
//    speed 1 = 1000ms (slow),  speed 10 = 100ms (fast)
function getDelay(sliderId) {
  const value = parseInt(document.getElementById(sliderId).value);
  return Math.round(1100 - value * 100);
}

// ── Parse a comma/space-separated string into a number array ─
function parseArray(inputId) {
  return document.getElementById(inputId)
    .value
    .replace(/[^0-9,.\s-]/g, '')   // strip anything weird
    .split(/[\s,]+/)
    .map(n => parseFloat(n))
    .filter(n => !isNaN(n));
}

// ── Brief toast message in bottom-right corner ───────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Wire up every speed slider to show its value live ────────
['sort', 'search', 'tree'].forEach(prefix => {
  const slider = document.getElementById(prefix + '-speed');
  const label  = document.getElementById(prefix + '-speed-val');
  if (slider) slider.oninput = () => label.textContent = slider.value;
});


// ============================================================
//  ALGO METADATA
//  Used by all three panels to show description + complexity.
// ============================================================
const ALGO_META = {
  // Sorting
  bubble:    { time: 'O(n²)',          space: 'O(1)',      desc: 'Repeatedly swaps adjacent elements if they are in the wrong order.' },
  selection: { time: 'O(n²)',          space: 'O(1)',      desc: 'Finds the minimum in the unsorted region and places it at the front each pass.' },
  insertion: { time: 'O(n²)',          space: 'O(1)',      desc: 'Slides each element leftward into its correct position in the growing sorted region.' },
  merge:     { time: 'O(n log n)',     space: 'O(n)',      desc: 'Divides recursively then merges sorted halves. Stable and consistent.' },
  quick:     { time: 'O(n log n) avg', space: 'O(log n)', desc: 'Picks a pivot, partitions, and recursively sorts both sides.' },
  heap:      { time: 'O(n log n)',     space: 'O(1)',      desc: 'Builds a max-heap then repeatedly extracts the maximum.' },
  shell:     { time: 'O(n log n)',     space: 'O(1)',      desc: 'Insertion sort with decreasing gap sizes so elements travel shorter distances.' },
  counting:  { time: 'O(n + k)',       space: 'O(k)',      desc: 'Counts occurrences then reconstructs. Works on integers only.' },
  radix:     { time: 'O(nk)',          space: 'O(n + k)',  desc: 'Sorts digit-by-digit (LSD→MSD) using counting sort as a subroutine.' },
  // Searching
  linear:    { time: 'O(n)',           space: 'O(1)',      desc: 'Scans every element until the target is found. Works on any array.' },
  binary:    { time: 'O(log n)',       space: 'O(1)',      desc: 'Halves the search space each step. Requires a sorted array.' },
  // Tree traversals
  inorder:   { time: 'O(n)',           space: 'O(h)',      desc: 'Left → Root → Right. Visits BST nodes in ascending order.' },
  preorder:  { time: 'O(n)',           space: 'O(h)',      desc: 'Root → Left → Right. Useful for copying the tree structure.' },
  postorder: { time: 'O(n)',           space: 'O(h)',      desc: 'Left → Right → Root. Children processed before their parent.' },
};


// ============================================================
//  PSEUDOCODE STRINGS
//  Shown when the user clicks "{ } Pseudocode".
//  HTML inside is safe — it's our own markup.
// ============================================================
const PSEUDOCODE = {
  sort: {
    bubble: `<span class="kw">for</span> i = 0 → n-1:
  <span class="kw">for</span> j = 0 → n-i-2:
    <span class="kw">if</span> arr[j] > arr[j+1]:
      <span class="hl">swap(arr[j], arr[j+1])  ← bars physically slide</span>`,

    selection: `<span class="kw">for</span> i = 0 → n-1:
  minIdx = i
  <span class="kw">for</span> j = i+1 → n:
    <span class="kw">if</span> arr[j] < arr[minIdx]: minIdx = j
  <span class="hl">swap(arr[i], arr[minIdx])  ← bars physically slide</span>`,

    insertion: `<span class="kw">for</span> i = 1 → n-1:
  key = arr[i];  j = i - 1
  <span class="kw">while</span> j >= 0 <span class="kw">and</span> arr[j] > key:
    <span class="hl">arr[j+1] = arr[j]  ← bar slides right</span>
    j--
  arr[j+1] = key`,

    merge: `<span class="kw">function</span> <span class="fn">mergeSort</span>(l, r):
  mid = (l + r) / 2
  <span class="fn">mergeSort</span>(l, mid)
  <span class="fn">mergeSort</span>(mid + 1, r)
  <span class="hl">merge(l, mid, r)  ← bars reorder</span>`,

    quick: `<span class="kw">function</span> <span class="fn">partition</span>(low, high):
  pivot = arr[high]
  <span class="kw">for</span> j = low → high-1:
    <span class="kw">if</span> arr[j] <= pivot:
      <span class="hl">swap(arr[++i], arr[j])  ← bars move</span>`,

    heap: `<span class="kw">for</span> i = n/2-1 → 0: <span class="fn">heapify</span>(n, i)
<span class="kw">for</span> i = n-1 → 0:
  <span class="hl">swap(arr[0], arr[i])  ← bars move</span>
  <span class="fn">heapify</span>(i, 0)`,

    shell: `gap = n / 2
<span class="kw">while</span> gap > 0:
  <span class="kw">for</span> i = gap → n:
    <span class="kw">while</span> j >= gap <span class="kw">and</span> arr[j-gap] > arr[j]:
      <span class="hl">swap(arr[j-gap], arr[j])  ← bar slides</span>
  gap = gap / 2`,

    counting: `count[arr[i] - min]++ <span class="kw">for each</span> i
<span class="kw">for</span> v = 0 → range:
  <span class="kw">while</span> count[v] > 0:
    <span class="hl">arr[idx++] = v + min  ← bar written</span>`,

    radix: `<span class="kw">for</span> exp = 1; max/exp > 0; exp *= 10:
  <span class="hl">countingSortByDigit(arr, exp)</span>`,
  },

  search: {
    linear: `<span class="kw">for</span> i = 0 → n-1:
  <span class="kw">if</span> arr[i] == target:
    <span class="hl">return i  // Found!</span>
<span class="kw">return</span> -1`,

    binary: `left = 0;  right = n - 1
<span class="kw">while</span> left <= right:
  mid = (left + right) / 2
  <span class="kw">if</span>   arr[mid] == target: <span class="hl">return mid</span>
  <span class="kw">elif</span> arr[mid]  < target: left  = mid + 1
  <span class="kw">else</span>:                    right = mid - 1
<span class="kw">return</span> -1`,
  },

  tree: {
    inorder: `<span class="fn">inorder</span>(node):
  <span class="kw">if</span> node == null: return
  <span class="fn">inorder</span>(node.left)
  <span class="hl">visit(node)</span>
  <span class="fn">inorder</span>(node.right)`,

    preorder: `<span class="fn">preorder</span>(node):
  <span class="kw">if</span> node == null: return
  <span class="hl">visit(node)</span>
  <span class="fn">preorder</span>(node.left)
  <span class="fn">preorder</span>(node.right)`,

    postorder: `<span class="fn">postorder</span>(node):
  <span class="kw">if</span> node == null: return
  <span class="fn">postorder</span>(node.left)
  <span class="fn">postorder</span>(node.right)
  <span class="hl">visit(node)</span>`,
  },
};


// ── Generic "show algo info" helper ─────────────────────────
function showAlgoInfo(key, infoBoxId, timeId, spaceId) {
  const meta = ALGO_META[key];
  if (!meta) return;
  document.getElementById(infoBoxId).innerHTML =
    `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}</strong> — ${meta.desc}`;
  if (timeId)  document.getElementById(timeId).textContent  = meta.time;
  if (spaceId) document.getElementById(spaceId).textContent = meta.space;
}

// ── Toggle a pseudocode block on/off ─────────────────────────
function togglePseudo(tab) {
  let key, blockId, codeMap;

  if (tab === 'sort') {
    key     = document.getElementById('sort-algo').value;
    blockId = 'pseudo-sort';
    codeMap = PSEUDOCODE.sort;
  } else if (tab === 'search') {
    key     = document.getElementById('search-algo').value;
    blockId = 'pseudo-search';
    codeMap = PSEUDOCODE.search;
  } else {
    key     = document.getElementById('tree-algo').value;
    blockId = 'pseudo-tree';
    codeMap = PSEUDOCODE.tree;
  }

  const block = document.getElementById(blockId);
  block.innerHTML = codeMap[key] || '';
  block.classList.toggle('show');
}
