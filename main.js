const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(field = Field.generateField()) {
    this.field = field; // 2D array of characters
    this.height = field.length;
    this.width = field[0].length;
    this.player = this._findPlayer(); // {x, y} of the '*'
  }

  static generateField(height = 10, width = 10, holePercentage = 0.2) {
    // 1. grid
    const grid = Array.from({ length: height }, () =>
      Array(width).fill(fieldCharacter),
    );

    // 2.

    const cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) cells.push({ x, y });
    }
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // 3.
    let idx = 0;
    const numHoles = Math.floor(height * width * holePercentage);
    for (let i = 0; i < numHoles; i++) {
      const c = cells[idx++];
      grid[c.y][c.x] = hole;
    }
    const hatCell = cells[idx++];
    grid[hatCell.y][hatCell.x] = hat;

    const actorCell = cells[idx++];
    grid[actorCell.y][actorCell.x] = pathCharacter; // player starts here

    return grid;
  }

  print() {
    console.log("\n" + this.field.map((row) => row.join("")).join("\n") + "\n");
  }

  moveRight() {
    return this._move(1, 0);
  }
  moveLeft() {
    return this._move(-1, 0);
  }
  moveUp() {
    return this._move(0, -1);
  }
  moveDown() {
    return this._move(0, 1);
  }

  _isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  _findPlayer() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.field[y][x] === pathCharacter) return { x, y };
      }
    }
    return { x: 0, y: 0 }; // safe default
  }

  _move(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    //oob
    if (!this._isInBounds(newX, newY)) {
      return { status: "out_of_bounds" };
    }

    const target = this.field[newY][newX];

    // trail '*'
    this.field[this.player.y][this.player.x] = pathCharacter;
    this.player = { x: newX, y: newY };

    // lose
    if (target === hole) {
      return { status: "hole" };
    }

    //win
    if (target === hat) {
      return { status: "hat" };
    }

    // new position as the player ---
    this.field[newY][newX] = pathCharacter;
    return { status: "ok" };
  }
}

module.exports = { Field, hat, hole, fieldCharacter, pathCharacter };
