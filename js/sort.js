// ============================================================
//  js/sort.js
//  Sorting panel: state, controls, and all 9 algorithms.
//  Depends on: utils.js, bars.js
// ============================================================


// ── Sort state ───────────────────────────────────────────────
let sortStop        = false;
let sortSteps       = 0;
let sortComparisons = 0;
let sortSwaps       = 0;    // also used by bars.js → writeBar()


// ── Convenience: current delay from speed slider ─────────────
function D() {
  return getDelay('sort-speed');
}

// ── Update comparison counter ─────────────────────────────────
function incrComp() {
  sortComparisons++;
  document.getElementById('m-comparisons').textContent = sortComparisons;
}

// ── Update step counter + status message ─────────────────────
function setSortStatus(htmlMsg) {
  document.getElementById('sort-status').children[0].innerHTML = htmlMsg;
  document.getElementById('sort-step-count').textContent = `Step: ${sortSteps}`;
}

// ── Enable / disable the Run button ──────────────────────────
function setSortBtn(disabled) {
  document.getElementById('sort-run').disabled = disabled;
}

// ── Update the algo info box + complexity metrics ─────────────
function updateSortInfo() {
  const key = document.getElementById('sort-algo').value;
  showAlgoInfo(key, 'sort-algo-info', 'm-time', 'm-space');
}

// ── Reset everything to initial state ────────────────────────
function resetSort() {
  sortStop        = true;
  sortSteps       = 0;
  sortComparisons = 0;
  sortSwaps       = 0;

  document.getElementById('m-comparisons').textContent  = '0';
  document.getElementById('m-swaps').textContent         = '0';
  document.getElementById('sort-step-count').textContent = '';
  setSortStatus('Enter your array and click Visualize ▶');

  initBars(parseArray('sort-input'));
  setSortBtn(false);
}

// ── Stop mid-animation ───────────────────────────────────────
function stopSort() {
  sortStop = true;
  setSortStatus('⏹ Stopped.');
  setSortBtn(false);
}

// ── Fill with a random array ──────────────────────────────────
function randomArray() {
  const n = 12 + Math.floor(Math.random() * 10);
  const values = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
  document.getElementById('sort-input').value = values.join(', ');
  resetSort();
}

// ── Main entry point ─────────────────────────────────────────
async function runSort() {
  // Reset counters
  sortStop        = false;
  sortSteps       = 0;
  sortComparisons = 0;
  sortSwaps       = 0;
  document.getElementById('m-comparisons').textContent = '0';
  document.getElementById('m-swaps').textContent       = '0';

  const arr = parseArray('sort-input');
  if (!arr.length) {
    showToast('⚠ Enter a valid array!');
    return;
  }
  if (arr.length > 50) {
    showToast('⚠ Max 50 elements for clear animation');
    return;
  }

  setSortBtn(true);
  updateSortInfo();
  initBars(arr);
  await delay(200);   // let DOM settle before animation starts

  // Working copy — we sort `a`, arr stays as the original reference
  const a = [...arr];

  switch (document.getElementById('sort-algo').value) {
    case 'bubble':    await bubbleSort(a);    break;
    case 'selection': await selectionSort(a); break;
    case 'insertion': await insertionSort(a); break;
    case 'merge':     await mergeSort(a, 0, a.length - 1); break;
    case 'quick':     await quickSort(a, 0, a.length - 1); break;
    case 'heap':      await heapSort(a);      break;
    case 'shell':     await shellSort(a);     break;
    case 'counting':  await countingSort(a);  break;
    case 'radix':     await radixSort(a);     break;
  }

  if (!sortStop) {
    // Colour all bars green
    a.forEach((_, i) => setBarClass(i, 'sorted'));
    setSortStatus(
      `<span class="highlight">✅ Sorted!</span> ` +
      `${sortSteps} steps · ${sortComparisons} comparisons · ${sortSwaps} swaps`
    );
  }

  setSortBtn(false);
}


// ============================================================
//  SORTING ALGORITHMS
//  Each uses:
//    animateSwap(arr, i, j, ms)  — physical bar movement
//    writeBar(arr, i)             — update height in-place
//    setBarClass(i, 'state')      — colour the bar
//    incrComp()                   — increment comparisons
//    setSortStatus(html)          — update status message
//    D()                          — current delay ms
//    sortStop                     — checked to abort
// ============================================================


// ── BUBBLE SORT ───────────────────────────────────────────────
async function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1 && !sortStop; i++) {
    for (let j = 0; j < n - i - 1 && !sortStop; j++) {
      incrComp();
      sortSteps++;

      setBarClass(j,     'comparing');
      setBarClass(j + 1, 'comparing');
      setSortStatus(`Comparing <span class="highlight">${arr[j]}</span> vs <span class="highlight">${arr[j + 1]}</span>`);
      await delay(D() * 0.7);

      if (arr[j] > arr[j + 1]) {
        setSortStatus(`⇄ Swapping <span class="highlight">${arr[j]}</span> ↔ <span class="highlight">${arr[j + 1]}</span>`);
        await animateSwap(arr, j, j + 1, D());
      } else {
        setBarClass(j,     '');
        setBarClass(j + 1, '');
      }
    }
    // The largest unsorted element has bubbled to its final position
    setBarClass(n - 1 - i, 'sorted');
  }
  setBarClass(0, 'sorted');
}


// ── SELECTION SORT ────────────────────────────────────────────
async function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1 && !sortStop; i++) {
    let minIdx = i;
    setBarClass(i, 'pivot');   // mark current position

    for (let j = i + 1; j < n && !sortStop; j++) {
      incrComp();
      sortSteps++;
      setBarClass(j, 'comparing');
      setSortStatus(
        `Finding min from [${i}]… ` +
        `<span class="highlight">${arr[j]}</span> vs current min <span class="highlight">${arr[minIdx]}</span>`
      );
      await delay(D() * 0.6);

      if (arr[j] < arr[minIdx]) {
        if (minIdx !== i) setBarClass(minIdx, '');
        minIdx = j;
        setBarClass(minIdx, 'pivot');
      } else {
        setBarClass(j, '');
      }
    }

    if (minIdx !== i) {
      setSortStatus(`⇄ Moving min <span class="highlight">${arr[minIdx]}</span> to index ${i}`);
      await animateSwap(arr, i, minIdx, D());
    }

    setBarClass(i,      'sorted');
    if (minIdx !== i) setBarClass(minIdx, '');
  }
  setBarClass(arr.length - 1, 'sorted');
}


// ── INSERTION SORT ────────────────────────────────────────────
async function insertionSort(arr) {
  setBarClass(0, 'sorted');

  for (let i = 1; i < arr.length && !sortStop; i++) {
    let j = i;
    setBarClass(j, 'pivot');
    setSortStatus(`Inserting <span class="highlight">${arr[i]}</span> into sorted region`);
    await delay(D() * 0.5);

    while (j > 0 && arr[j - 1] > arr[j] && !sortStop) {
      incrComp();
      sortSteps++;
      setSortStatus(`Sliding <span class="highlight">${arr[j]}</span> left past <span class="highlight">${arr[j - 1]}</span>`);
      await animateSwap(arr, j - 1, j, D());
      setBarClass(j, 'sorted');
      j--;
      setBarClass(j, 'pivot');
    }
    setBarClass(j, 'sorted');
  }
}


// ── MERGE SORT ────────────────────────────────────────────────
async function mergeSort(arr, l, r) {
  if (l >= r || sortStop) return;

  const mid = Math.floor((l + r) / 2);

  // Highlight the region being divided
  for (let x = l; x <= r; x++) setBarClass(x, 'comparing');
  setSortStatus(`Divide [${l}..${r}] → [${l}..${mid}] [${mid + 1}..${r}]`);
  await delay(D() * 0.4);

  await mergeSort(arr, l, mid);
  await mergeSort(arr, mid + 1, r);
  await mergeParts(arr, l, mid, r);
}

async function mergeParts(arr, l, mid, r) {
  // Copy both halves into temporary arrays
  const leftHalf  = arr.slice(l, mid + 1);
  const rightHalf = arr.slice(mid + 1, r + 1);

  let i = 0, j = 0, k = l;

  while (i < leftHalf.length && j < rightHalf.length && !sortStop) {
    incrComp();
    // Pick the smaller of the two current elements
    arr[k] = leftHalf[i] <= rightHalf[j] ? leftHalf[i++] : rightHalf[j++];
    writeBar(arr, k);
    setBarClass(k, 'swapping');
    setSortStatus(`Merge [${l}..${r}]: writing <span class="highlight">${arr[k]}</span>`);
    await delay(D() * 0.7);
    setBarClass(k, 'sorted');
    k++;
    sortSteps++;
  }

  // Drain remaining elements
  while (i < leftHalf.length && !sortStop) {
    arr[k] = leftHalf[i++];
    writeBar(arr, k);
    setBarClass(k, 'sorted');
    await delay(D() * 0.3);
    k++;
  }
  while (j < rightHalf.length && !sortStop) {
    arr[k] = rightHalf[j++];
    writeBar(arr, k);
    setBarClass(k, 'sorted');
    await delay(D() * 0.3);
    k++;
  }
}


// ── QUICK SORT ────────────────────────────────────────────────
async function quickSort(arr, low, high) {
  if (low < high && !sortStop) {
    const pivotIndex = await qPartition(arr, low, high);
    await quickSort(arr, low, pivotIndex - 1);
    await quickSort(arr, pivotIndex + 1, high);
  }
  if (!sortStop && low <= high) {
    setBarClass(low, 'sorted');
  }
}

async function qPartition(arr, low, high) {
  setBarClass(high, 'pivot');   // pivot is always the last element
  let i = low - 1;

  for (let j = low; j < high && !sortStop; j++) {
    incrComp();
    sortSteps++;
    setBarClass(j, 'comparing');
    setSortStatus(`Pivot=<span class="highlight">${arr[high]}</span>  arr[${j}]=<span class="highlight">${arr[j]}</span>`);
    await delay(D() * 0.6);

    if (arr[j] <= arr[high]) {
      i++;
      if (i !== j) {
        setSortStatus(`⇄ Swapping <span class="highlight">${arr[i]}</span> ↔ <span class="highlight">${arr[j]}</span>`);
        await animateSwap(arr, i, j, D());
      }
    }
    if (j !== i) setBarClass(j, '');
  }

  // Place pivot in its final sorted position
  setSortStatus(`Pivot <span class="highlight">${arr[high]}</span> → final pos ${i + 1}`);
  if (i + 1 !== high) await animateSwap(arr, i + 1, high, D());
  setBarClass(i + 1, 'sorted');
  if (high !== i + 1) setBarClass(high, '');

  return i + 1;
}


// ── HEAP SORT ─────────────────────────────────────────────────
async function heapSort(arr) {
  const n = arr.length;

  // Phase 1: build max-heap
  setSortStatus('Building max-heap…');
  for (let i = Math.floor(n / 2) - 1; i >= 0 && !sortStop; i--) {
    await heapify(arr, n, i);
  }

  // Phase 2: extract max one by one
  for (let i = n - 1; i > 0 && !sortStop; i--) {
    setSortStatus(`Extract max <span class="highlight">${arr[0]}</span> → slot ${i}`);
    await animateSwap(arr, 0, i, D());
    setBarClass(i, 'sorted');
    await heapify(arr, i, 0);
  }
  setBarClass(0, 'sorted');
}

async function heapify(arr, heapSize, root) {
  let largest = root;
  const left  = 2 * root + 1;
  const right = 2 * root + 2;

  incrComp();
  if (left  < heapSize && arr[left]  > arr[largest]) largest = left;
  if (right < heapSize && arr[right] > arr[largest]) largest = right;

  if (largest !== root && !sortStop) {
    setBarClass(root,    'heap-act');
    setBarClass(largest, 'heap-act');
    setSortStatus(`Heapify: <span class="highlight">${arr[root]}</span> ↔ <span class="highlight">${arr[largest]}</span>`);
    await animateSwap(arr, root, largest, D());
    await heapify(arr, heapSize, largest);
  }
}


// ── SHELL SORT ────────────────────────────────────────────────
async function shellSort(arr) {
  const n = arr.length;

  for (let gap = Math.floor(n / 2); gap > 0 && !sortStop; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n && !sortStop; i++) {
      let j = i;
      setBarClass(j, 'pivot');
      await delay(D() * 0.4);

      while (j >= gap && arr[j - gap] > arr[j] && !sortStop) {
        incrComp();
        sortSteps++;
        setBarClass(j - gap, 'shell-gap');
        setSortStatus(`Shell gap=${gap}: sliding <span class="highlight">${arr[j]}</span> left`);
        await animateSwap(arr, j - gap, j, D());
        setBarClass(j, '');
        j -= gap;
        if (j >= gap) setBarClass(j - gap, '');
        setBarClass(j, 'pivot');
      }
      setBarClass(j, '');
    }
  }
}


// ── COUNTING SORT ─────────────────────────────────────────────
async function countingSort(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const count = new Array(max - min + 1).fill(0);

  // Phase 1: count occurrences
  for (let i = 0; i < arr.length && !sortStop; i++) {
    count[arr[i] - min]++;
    setBarClass(i, 'counting');
    setSortStatus(`Counting arr[${i}] = ${arr[i]}`);
    await delay(D() * 0.4);
    sortSteps++;
  }

  // Phase 2: write back in order
  let idx = 0;
  for (let v = 0; v < count.length && !sortStop; v++) {
    while (count[v] > 0 && !sortStop) {
      arr[idx] = v + min;
      writeBar(arr, idx);
      setBarClass(idx, 'sorted');
      setSortStatus(`Write <span class="highlight">${arr[idx]}</span> at [${idx}]`);
      await delay(D() * 0.8);
      idx++;
      count[v]--;
      sortSteps++;
    }
  }
}


// ── RADIX SORT ───────────────────────────────────────────────
async function radixSort(arr) {
  const max = Math.max(...arr);

  // Repeat for each digit place (1, 10, 100, …)
  for (let exp = 1; Math.floor(max / exp) > 0 && !sortStop; exp *= 10) {
    setSortStatus(`Radix: sorting by digit place <span class="highlight">${exp}</span>`);
    await radixPass(arr, exp);
  }
}

async function radixPass(arr, exp) {
  const n      = arr.length;
  const output = new Array(n).fill(0);
  const count  = new Array(10).fill(0);

  // Count digit frequencies
  for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;

  // Prefix sums → output positions
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];

  // Build output array (right-to-left for stability)
  for (let i = n - 1; i >= 0; i--) {
    output[--count[Math.floor(arr[i] / exp) % 10]] = arr[i];
  }

  // Copy output back and animate
  for (let i = 0; i < n && !sortStop; i++) {
    arr[i] = output[i];
    writeBar(arr, i);
    setBarClass(i, 'counting');
    setSortStatus(`Radix exp=${exp}: placing <span class="highlight">${arr[i]}</span>`);
    await delay(D() * 0.7);
    sortSteps++;
  }
}
