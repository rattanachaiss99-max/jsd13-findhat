const term = require('terminal-kit').terminal;
const { Field } = require('./field');

async function playGame() {
  const HEIGHT = 10;
  const WIDTH = 10;
  const HOLE_PCT = 0.2; // 20% of cells become holes

  // Test hook: inject a known map if provided (no-TTY automation).
  const testMap = process.env.FH_TEST_MAP
    ? JSON.parse(process.env.FH_TEST_MAP)
    : Field.generateField(HEIGHT, WIDTH, HOLE_PCT);
  const field = new Field(testMap);

  // --- Colored rendering of the field ---
  // NOTE: term.<color>() returns the terminal object (chainable), NOT a
  // string — so we call them as statements and never concat them into a
  // string (that would print "[object Function]"). We print each char
  // directly, then a newline per row.
  function render() {
    term.clear();
    term.bold.cyan('╔══════════════════════════════════════╗\n');
    term.bold.cyan('║            FIND YOUR HAT  🎩         ║\n');
    term.bold.cyan('╚══════════════════════════════════════╝\n');
    term('  ');
    term.gray('*=you  ');
    term.yellow('^=hat  ');
    term.red('O=hole\n\n');

    for (const row of field.field) {
      term('  ');
      for (const ch of row) {
        if (ch === '*') term.cyan('*');
        else if (ch === '^') term.yellow('^');
        else if (ch === 'O') term.red('O');
        else term.gray('░');
      }
      term('\n');
    }
    term('\n');
  }

  function bannerWin() {
    term.green.bold('🎉 You found the hat! You win!\n');
  }
  function bannerHole() {
    term.red.bold('💀 You fell into a hole! Game over.\n');
  }
  function bannerOob() {
    term.magenta.bold('🚫 You went out of bounds! Game over.\n');
  }
  function bannerQuit() {
    term.cyan('👋 Thanks for playing!\n');
  }

  if (!process.stdin.isTTY) {
    const moves = (process.env.FH_MOVES || '').split('');
    render();
    for (const m of moves) {
      let r;
      if (m === 'r') r = field.moveRight();
      else if (m === 'l') r = field.moveLeft();
      else if (m === 'u') r = field.moveUp();
      else if (m === 'd') r = field.moveDown();
      else continue;
      if (r.status === 'hat') { render(); bannerWin(); term.processExit(); return; }
      if (r.status === 'hole') { render(); bannerHole(); term.processExit(); return; }
      if (r.status === 'out_of_bounds') { bannerOob(); term.processExit(); return; }
    }
    render();
    bannerQuit();
    term.processExit();
    return;
  }

  render();

  async function ask() {
    term.bold('Move (u/d/l/r, q to quit): ');
    const input = await term.inputField({ cancelable: true }).promise;
    return (input || '').trim().toLowerCase();
  }

  while (true) {
    const input = await ask();

    if (input === 'q') { bannerQuit(); break; }
    if (input === '') { continue; }

    let result;
    if (input === 'r') result = field.moveRight();
    else if (input === 'l') result = field.moveLeft();
    else if (input === 'u') result = field.moveUp();
    else if (input === 'd') result = field.moveDown();
    else {
      term.yellow("❓ Use u / d / l / r (or q to quit).\n");
      continue;
    }

    render();

    if (result.status === 'hat') { bannerWin(); break; }
    if (result.status === 'hole') { bannerHole(); break; }
    if (result.status === 'out_of_bounds') { bannerOob(); break; }
  }

  term.processExit();
}

playGame();
