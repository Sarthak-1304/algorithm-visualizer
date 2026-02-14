// ============================================================
//  js/bars.js
//  Manages the bar chart DOM elements and all movement logic.
//
//  KEY CONCEPT — how bars physically move:
//    Every .bar-item is position:absolute inside #bar-container.
//    Its `left` CSS property = its slot's pixel x-coordinate.
//    CSS `transition: left 0.25s` does the smooth animation.
//
//    To SWAP bars at positions i and j:
//      1. Set barEls[i].el.style.left = slotX(j)   ← they slide
//         Set barEls[j].el.style.left = slotX(i)     toward each other
//      2. Wait for the animation to finish (~260ms)
//      3. Swap heights + labels in-place (values are now correct)
//      4. Snap left coords back to home — they're already there
// ============================================================

const CHART_H = 300;   // total height of the bar area in px

let barEls = [];       // barEls[i] = { el, rect, lbl, val }
let barWidth = 0;
let barGap   = 0;

// ── Pixel x position of slot i ───────────────────────────────
function slotX(i) {
  return i * (barWidth + barGap);
}

// ── Height in px for a value given the current max ───────────
function barH(value, max) {
  return Math.max(6, Math.round((value / max) * (CHART_H - 28)));
}

// ── Build bar DOM elements from scratch ──────────────────────
function initBars(arr) {
  const container = document.getElementById('bar-container');
  container.innerHTML = '';
  barEls = [];

  if (!arr.length) return;

  const containerWidth = container.clientWidth || 900;
  const n = arr.length;

  // Calculate bar width and gap to fill the container
  barGap   = Math.max(2, Math.min(5, Math.floor(8 / n * 4)));
  barWidth = Math.max(8, Math.floor((containerWidth - (n - 1) * barGap) / n));

  const maxVal = Math.max(...arr);

  arr.forEach((value, i) => {
    // Wrapper div — this is what slides left/right
    const el = document.createElement('div');
    el.className = 'bar-item';
    el.style.cssText = `width:${barWidth}px; left:${slotX(i)}px; height:${CHART_H}px;`;

    // The coloured rectangle
    const rect = document.createElement('div');
    rect.className   = 'bar-rect';
    rect.style.height = barH(value, maxVal) + 'px';
    rect.style.width  = '100%';

    // Value label underneath (hidden for large arrays)
    const lbl = document.createElement('div');
    lbl.className   = 'bar-val';
    lbl.textContent = n <= 32 ? value : '';

    el.appendChild(rect);
    el.appendChild(lbl);
    container.appendChild(el);

    barEls.push({ el, rect, lbl, val: value });
  });

  document.getElementById('m-size').textContent = n;
}

// ── Apply a CSS class to a bar (sets its colour state) ───────
function setBarClass(index, className) {
  if (barEls[index]) {
    barEls[index].el.className = 'bar-item' + (className ? ' ' + className : '');
  }
}

// ── Update a bar's height and label to match arr[i] ──────────
//    Used by merge/counting/radix which write values directly.
function writeBar(arr, i) {
  if (!barEls[i]) return;
  const maxVal = Math.max(...arr) || 1;
  barEls[i].rect.style.height = barH(arr[i], maxVal) + 'px';
  barEls[i].lbl.textContent   = arr.length <= 32 ? arr[i] : '';
  barEls[i].el.style.left     = slotX(i) + 'px';

  sortSwaps++;   // defined in sort.js
  document.getElementById('m-swaps').textContent = sortSwaps;
}

// ── THE PHYSICAL SWAP ────────────────────────────────────────
//    Animates bars at positions i and j crossing each other.
async function animateSwap(arr, i, j, durationMs) {
  if (i === j) return;

  setBarClass(i, 'swapping');
  setBarClass(j, 'swapping');

  // Step 1 — slide them to each other's position
  barEls[i].el.style.left = slotX(j) + 'px';
  barEls[j].el.style.left = slotX(i) + 'px';

  // Step 2 — wait for CSS transition (0.25s) to finish
  await delay(Math.max(260, durationMs));

  // Step 3 — swap the array values
  [arr[i], arr[j]] = [arr[j], arr[i]];

  // Step 4 — update heights + labels in-place
  //          (bars are already visually at each other's slot)
  const maxVal = Math.max(...arr) || 1;
  barEls[i].rect.style.height = barH(arr[i], maxVal) + 'px';
  barEls[i].lbl.textContent   = arr.length <= 32 ? arr[i] : '';
  barEls[j].rect.style.height = barH(arr[j], maxVal) + 'px';
  barEls[j].lbl.textContent   = arr.length <= 32 ? arr[j] : '';

  // Step 5 — snap back to home slots (already there, no visual jump)
  barEls[i].el.style.left = slotX(i) + 'px';
  barEls[j].el.style.left = slotX(j) + 'px';

  await delay(60);   // tiny pause so the snap doesn't look jarring
  setBarClass(i, '');
  setBarClass(j, '');

  sortSwaps++;
  document.getElementById('m-swaps').textContent = sortSwaps;
}
