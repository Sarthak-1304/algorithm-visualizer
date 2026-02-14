// ============================================================
//  js/tree.js
//  Tree panel: BST data structure, SVG rendering,
//  and Inorder / Preorder / Postorder traversal animations.
//  Depends on: utils.js
// ============================================================


// ============================================================
//  BST DATA STRUCTURE
// ============================================================

class BSTNode {
  constructor(value) {
    this.val   = value;
    this.left  = null;
    this.right = null;
    // Set during drawTree():
    this._x  = 0;    // pixel x for SVG
    this._y  = 0;    // pixel y for SVG
    this._el = null; // SVG <g> element
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = new BSTNode(value);
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (value <= current.val) {
        if (!current.left)  { current.left  = node; return; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      }
    }
  }
}


// ── Module state ─────────────────────────────────────────────
let bst          = new BST();
let treeAnimStop = false;


// ── Stop traversal mid-animation ─────────────────────────────
function stopTree() {
  treeAnimStop = true;
  document.getElementById('tree-status').children[0].textContent = '⏹ Stopped.';
}

// ── Update the algo info box ──────────────────────────────────
function updateTreeInfo() {
  const key = document.getElementById('tree-algo').value;
  showAlgoInfo(key, 'tree-algo-info', null, null);
}

// ── Build the BST from the input and draw it ─────────────────
function buildTree() {
  const arr = parseArray('tree-input');
  if (!arr.length) {
    showToast('⚠ Enter valid values!');
    return;
  }

  bst = new BST();
  arr.forEach(v => bst.insert(v));

  drawTree();
  updateTreeInfo();

  document.getElementById('traversal-output').innerHTML =
    '<span style="color:var(--text-dim); font-size:0.82rem;">Click ▶ Traverse...</span>';
  document.getElementById('tree-status').children[0].textContent =
    'BST built! Click Traverse ▶';
}

// ── Build + start traversal ───────────────────────────────────
async function buildAndTraverse() {
  buildTree();
  await delay(300);   // let the SVG render first

  treeAnimStop = false;
  document.getElementById('traversal-output').innerHTML = '';

  const algo = document.getElementById('tree-algo').value;
  document.getElementById('tree-status').children[0].textContent =
    `Running ${algo} traversal…`;

  if      (algo === 'inorder')   await inorder(bst.root);
  else if (algo === 'preorder')  await preorder(bst.root);
  else                           await postorder(bst.root);

  if (!treeAnimStop) {
    document.getElementById('tree-status').children[0].innerHTML =
      '<span class="highlight">✅ Traversal complete!</span>';
  }
}


// ============================================================
//  SVG TREE RENDERING
// ============================================================

function drawTree() {
  const svg = document.getElementById('tree-svg');
  svg.innerHTML = '';
  if (!bst.root) return;

  const W        = svg.parentElement.clientWidth || 800;
  const NODE_R   = 22;   // circle radius
  const LEVEL_H  = 80;   // vertical gap between levels

  // ── Assign x,y positions via in-order walk ──────────────────
  //    Left subtree fills [l, mid], right fills [mid, r]
  function assignPositions(node, depth, l, r) {
    if (!node) return;
    const mid = (l + r) / 2;
    assignPositions(node.left,  depth + 1, l,   mid);
    node._x = mid * W;
    node._y = depth * LEVEL_H + 50;
    assignPositions(node.right, depth + 1, mid, r);
  }
  assignPositions(bst.root, 0, 0, 1);

  // ── Collect all nodes + find max depth ──────────────────────
  let maxY = 50;
  const allNodes = [];
  function collectNodes(node) {
    if (!node) return;
    allNodes.push(node);
    maxY = Math.max(maxY, node._y);
    collectNodes(node.left);
    collectNodes(node.right);
  }
  collectNodes(bst.root);

  svg.setAttribute('viewBox', `0 0 ${W} ${maxY + 60}`);
  svg.setAttribute('height', maxY + 60);

  // ── Draw edges first (so they appear behind nodes) ──────────
  allNodes.forEach(node => {
    if (node.left)  drawEdge(svg, node, node.left);
    if (node.right) drawEdge(svg, node, node.right);
  });

  // ── Draw nodes on top ────────────────────────────────────────
  allNodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('node');
    g.setAttribute('transform', `translate(${node._x}, ${node._y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_R);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor',       'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.textContent = node.val;

    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);

    // Save reference so traversal functions can change colour
    node._el = g;
  });
}

function drawEdge(svg, parent, child) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.classList.add('tree-edge');
  line.setAttribute('x1', parent._x);
  line.setAttribute('y1', parent._y);
  line.setAttribute('x2', child._x);
  line.setAttribute('y2', child._y);
  svg.insertBefore(line, svg.firstChild);   // behind all nodes
}

// ── Change a node's visual state ─────────────────────────────
//    states: ''  (default)  |  'current'  |  'visiting'  |  'done'
function setNodeState(node, state) {
  if (node && node._el) {
    node._el.setAttribute('class', 'node ' + (state || ''));
  }
}

// ── Append a value chip to the traversal output strip ────────
function addTraversalNode(value) {
  const output = document.getElementById('traversal-output');

  // Add separator arrow between chips (not before the first one)
  if (output.children.length > 0) {
    output.appendChild(document.createTextNode(' → '));
  }

  const chip = document.createElement('span');
  chip.className   = 'tnode';
  chip.textContent = value;
  output.appendChild(chip);
}


// ============================================================
//  TRAVERSAL ALGORITHMS
//  Each calls setNodeState() to colour nodes and
//  addTraversalNode() to append to the output strip.
// ============================================================

// ── INORDER: Left → Root → Right ─────────────────────────────
//    Result: ascending order for a valid BST
async function inorder(node) {
  if (!node || treeAnimStop) return;

  // Mark as "we're about to go left"
  setNodeState(node, 'current');
  document.getElementById('tree-status').children[0].innerHTML =
    `Going left from <span class="highlight">${node.val}</span>`;
  await delay(getDelay('tree-speed') * 0.5);

  await inorder(node.left);
  if (treeAnimStop) return;

  // Visit this node
  setNodeState(node, 'visiting');
  document.getElementById('tree-status').children[0].innerHTML =
    `Visiting <span class="highlight">${node.val}</span>`;
  addTraversalNode(node.val);
  await delay(getDelay('tree-speed'));

  setNodeState(node, 'done');
  await inorder(node.right);
}

// ── PREORDER: Root → Left → Right ────────────────────────────
//    Root is processed before its children
async function preorder(node) {
  if (!node || treeAnimStop) return;

  // Visit this node first
  setNodeState(node, 'visiting');
  document.getElementById('tree-status').children[0].innerHTML =
    `Visiting <span class="highlight">${node.val}</span> (root first)`;
  addTraversalNode(node.val);
  await delay(getDelay('tree-speed'));

  setNodeState(node, 'done');
  await preorder(node.left);
  await preorder(node.right);
}

// ── POSTORDER: Left → Right → Root ───────────────────────────
//    Both children are processed before the parent
async function postorder(node) {
  if (!node || treeAnimStop) return;

  setNodeState(node, 'current');
  document.getElementById('tree-status').children[0].innerHTML =
    `Exploring children of <span class="highlight">${node.val}</span>`;
  await delay(getDelay('tree-speed') * 0.4);

  await postorder(node.left);
  await postorder(node.right);

  if (treeAnimStop) return;

  // Visit this node last (after both subtrees)
  setNodeState(node, 'visiting');
  document.getElementById('tree-status').children[0].innerHTML =
    `Visiting <span class="highlight">${node.val}</span>`;
  addTraversalNode(node.val);
  await delay(getDelay('tree-speed'));

  setNodeState(node, 'done');
}
