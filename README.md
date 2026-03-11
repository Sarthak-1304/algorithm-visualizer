# ⚡ AlgoViz

Interactive algorithm visualizer built with vanilla JavaScript and Bootstrap 5.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?logo=bootstrap&logoColor=white)

---

## Features

- **9 Sorting Algorithms** — Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix
- **2 Search Algorithms** — Linear, Binary
- **3 Tree Traversals** — Inorder, Preorder, Postorder (BST)
- **Physical bar animations** — bars actually slide during swaps, not just color changes
- **Live metrics** — comparisons, swaps, time/space complexity
- **Adjustable speed** — 1 (slow) to 10 (fast)
- **Dark theme** — purple/pink/cyan gradients
- **Responsive** — works on desktop, tablet, mobile

---

## Quick Start

```bash
# Extract and open
unzip visualizer.zip
cd visualizer/

# VS Code Live Server (recommended)
code .
# Right-click index.html → "Open with Live Server"
```

No installation needed. Runs entirely in browser.

---

## File Structure

```
visualizer/
├── index.html        (355 lines) — UI structure
├── style.css         (341 lines) — Custom styles
└── js/
    ├── utils.js      (195 lines) — Helpers, metadata
    ├── bars.js       (134 lines) — Bar animation engine
    ├── sort.js       (463 lines) — 9 sorting algorithms
    ├── search.js     (181 lines) — 2 search algorithms
    ├── tree.js       (284 lines) — BST + 3 traversals
    └── main.js        (73 lines) — App initialization
```

**Total:** ~2,026 lines

---

## How It Works

### Animation System

Bars are `position: absolute` with CSS `left` property. During a swap:

```javascript
// js/bars.js - animateSwap()

// 1. Move bars to each other's positions
barEls[i].el.style.left = slotX(j) + 'px';  
barEls[j].el.style.left = slotX(i) + 'px';

// 2. CSS transition animates the slide (0.25s)
await delay(260);

// 3. Swap array values and heights
[arr[i], arr[j]] = [arr[j], arr[i]];
updateHeights(i, j);
```

This creates physical movement, not just color swaps.

---

## Customization

### Change Colors

Edit `style.css`:

```css
:root {
  --accent:  #6c63ff;  /* purple → change to any color */
  --accent2: #ff6b9d;  /* pink */
  --accent3: #63ffda;  /* teal */
}
```

### Add a New Algorithm

**1. Write the algorithm** in `js/sort.js`:

```javascript
async function mySort(arr) {
  for (let i = 0; i < arr.length && !sortStop; i++) {
    setBarClass(i, 'comparing');
    await delay(D());
    // ... your logic ...
    await animateSwap(arr, i, j, D());
  }
}
```

**2. Add metadata** to `js/utils.js`:

```javascript
const ALGO_META = {
  mysort: { time: 'O(n log n)', space: 'O(1)', desc: 'Description here' },
};
```

**3. Add dropdown option** in `index.html`:

```html
<select id="sort-algo">
  <option value="mysort">My Sort</option>
</select>
```

**4. Wire it up** in `js/sort.js`:

```javascript
switch (algo) {
  case 'mysort': await mySort(a); break;
}
```

---

## Tech Stack

- **HTML5** — structure
- **CSS3** — styling + animations
- **Vanilla JavaScript (ES6+)** — logic
- **Bootstrap 5** — responsive grid
- **Google Fonts** — JetBrains Mono, Syne

No frameworks. No build tools. Just clean code.

---

## Browser Support

| Browser       | Version | Status |
|---------------|---------|--------|
| Chrome / Edge | 90+     | ✅      |
| Firefox       | 88+     | ✅      |
| Safari        | 14+     | ✅      |

Not supported: Internet Explorer

---

## License

MIT — free to use, modify, distribute.
