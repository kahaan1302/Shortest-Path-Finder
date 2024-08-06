const gridElement = document.getElementById("grid");
const clearButton = document.getElementById("clear");
const ROWS = 50;
const COLS = 50;
let grid = [];
let start = null;
let end = null;
let isDragging = false;

// Initialize grid
function initGrid() {
  gridElement.innerHTML = "";
  grid = [];
  for (let row = 0; row < ROWS; row++) {
    const rowArray = [];
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("mousedown", onMouseDown);
      cell.addEventListener("mouseover", onMouseOver);
      cell.addEventListener("mouseup", onMouseUp);
      gridElement.appendChild(cell);
      rowArray.push(cell);
    }
    grid.push(rowArray);
  }
}

// Handle mouse events for setting start, end, and barriers
function onMouseDown(event) {
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  // Set start cell
  if (!start && cell !== end) {
    start = cell;
    cell.classList.add("start");
    // Set end cell
  } else if (!end && cell !== start) {
    end = cell;
    cell.classList.add("end");
    // Set barrier
  } else if (cell !== start && cell !== end) {
    cell.classList.toggle("barrier");
  }

  isDragging = true;
}

function onMouseOver(event) {
  if (!isDragging) return;
  const cell = event.target;
  if (cell !== start && cell !== end) {
    cell.classList.toggle("barrier");
  }
}

function onMouseUp() {
  isDragging = false;
}

// Clear grid function
clearButton.addEventListener("click", () => {
  start = null;
  end = null;
  initGrid();
});

// A* Pathfinding Algorithm with visualization
function aStar(startCell, endCell) {
  const openSet = new Set();
  const closedSet = new Set();
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();

  // Initialize scores
  for (let row of grid) {
    for (let cell of row) {
      gScore.set(cell, Infinity);
      fScore.set(cell, Infinity);
    }
  }

  gScore.set(startCell, 0);
  fScore.set(startCell, heuristic(startCell, endCell));

  openSet.add(startCell);

  // Heuristic function (Manhattan distance)
  function heuristic(cellA, cellB) {
    const rowA = parseInt(cellA.dataset.row);
    const colA = parseInt(cellA.dataset.col);
    const rowB = parseInt(cellB.dataset.row);
    const colB = parseInt(cellB.dataset.col);
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
  }

  // Reconstruct path function with delay
  function reconstructPath(current) {
    const pathCells = [];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      if (current !== startCell) {
        pathCells.push(current);
      }
    }
    animatePath(pathCells);
  }

  // Animate path with a delay
  function animatePath(pathCells) {
    let index = 0;

    function step() {
      if (index < pathCells.length) {
        pathCells[index].classList.add("path");
        index++;
        setTimeout(step, 50); // 50ms delay between each step
      }
    }

    step();
  }

  // Get valid neighbors for a cell
  function getNeighbors(cell) {
    const neighbors = [];
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (row > 0) neighbors.push(grid[row - 1][col]); // Up
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]); // Left
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]); // Right

    return neighbors.filter(
      (neighbor) => !neighbor.classList.contains("barrier")
    );
  }

  // Main algorithm loop
  function step() {
    if (openSet.size > 0) {
      let current = Array.from(openSet).reduce((a, b) =>
        fScore.get(a) < fScore.get(b) ? a : b
      );

      // Path found
      if (current === endCell) {
        reconstructPath(current);
        endCell.classList.add("end");
        return true;
      }

      openSet.delete(current);
      closedSet.add(current);

      for (let neighbor of getNeighbors(current)) {
        if (closedSet.has(neighbor)) continue;

        const tentativeGScore = gScore.get(current) + 1;

        if (!openSet.has(neighbor)) openSet.add(neighbor);
        else if (tentativeGScore >= gScore.get(neighbor)) continue;

        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, endCell));

        if (!neighbor.classList.contains("open") && neighbor !== endCell) {
          neighbor.classList.add("open");
        }
      }

      if (current !== startCell) {
        current.classList.add("closed");
      }

      // Use requestAnimationFrame to step through the algorithm
      requestAnimationFrame(step);
    }
  }

  step();
}

// Run the algorithm on space key press
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && start && end) {
    // Reset previous path visualizations
    grid.forEach((row) =>
      row.forEach((cell) => cell.classList.remove("path", "open", "closed"))
    );
    aStar(start, end);
  }
});

// Initialize grid on page load
initGrid();
