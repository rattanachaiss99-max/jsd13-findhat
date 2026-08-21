const { Field, hat, hole, fieldCharacter, pathCharacter } = require('./field');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

console.log('─── 1. Class & required methods exist ───');
assert('Field is a class', typeof Field === 'function');
const proto = Field.prototype;
['constructor', 'moveRight', 'moveLeft', 'moveUp', 'moveDown', 'print']
  .forEach((m) => assert(`has method ${m}()`, typeof proto[m] === 'function'));

console.log('\n─── 2. Print Map ───');
const tiny = [
  ['*', '░'],
  ['░', '^'],
];
const f = new Field(tiny);
const printed = f.field.map((r) => r.join('')).join('');
assert('print shows row0 (*░)', printed.includes('*░'));
assert('print shows row1 (░^)', printed.includes('░^'));
assert('width=2, height=2 tracked', f.width === 2 && f.height === 2);

console.log('\n─── 3. Movement & Update Map ───');
const m = new Field([
  ['*', '░', '░'],
  ['░', '░', '░'],
  ['░', '░', '░'],
]);
const r1 = m.moveRight();
assert('moveRight status ok', r1.status === 'ok');
assert('old cell left as trail *', m.field[0][0] === pathCharacter);
assert('new cell is player *', m.field[0][1] === pathCharacter);
assert('player x updated to 1', m.player.x === 1 && m.player.y === 0);

const r2 = m.moveDown();
assert('moveDown status ok', r2.status === 'ok');
assert('map updated at (1,1)', m.field[1][1] === pathCharacter);

console.log('\n─── 4. Game Logic ───');
const w = new Field([['*', '^']]);
assert('land on hat => win', w.moveRight().status === 'hat');

const lh = new Field([['*', 'O']]);
assert('land on hole => hole', lh.moveRight().status === 'hole');

const ob = new Field([['*', '░']]);
assert('step off left edge => out_of_bounds', ob.moveLeft().status === 'out_of_bounds');
assert('player NOT moved out of bounds', ob.player.x === 0);

console.log('\n─── 5. Random spawn (holes, hat, actor all unique) ───');
let allUnique = true, hasHat = true, hasActor = true, hasHole = true;
for (let t = 0; t < 50; t++) {
  const g = Field.generateField(10, 10, 0.2);
  let hats = 0, actors = 0, holes = 0;
  for (const row of g) for (const ch of row) {
    if (ch === hat) hats++;
    if (ch === pathCharacter) actors++;
    if (ch === hole) holes++;
  }
  if (hats !== 1 || actors !== 1 || holes < 5) allUnique = false;
  if (hats !== 1) hasHat = false;
  if (actors !== 1) hasActor = false;
  if (holes < 1) hasHole = false;
}
assert('exactly 1 hat spawned', hasHat);
assert('exactly 1 actor spawned', hasActor);
assert('holes spawned', hasHole);
assert('50/50 random maps valid (no overlap)', allUnique);

console.log('\n─── 6. main.js (terminal-kit UI) end-to-end via non-TTY hook ───');
const { execFileSync } = require('child_process');
function runMain(env) {
  return execFileSync('node', ['main.js'], { env: { ...process.env, ...env }, encoding: 'utf8' });
}
// WIN
let out = runMain({ FH_TEST_MAP: '[["*","^"]]', FH_MOVES: 'r' });
assert('main.js WIN shows hat message', out.includes('You found the hat'));
// HOLE
out = runMain({ FH_TEST_MAP: '[["*","O"]]', FH_MOVES: 'r' });
assert('main.js HOLE shows hole message', out.includes('fell into a hole'));
// OUT OF BOUNDS
out = runMain({ FH_TEST_MAP: '[["*","░"]]', FH_MOVES: 'l' });
assert('main.js OOB shows bounds message', out.includes('out of bounds'));

console.log(`\n═══════════ RESULT: ${passed} passed, ${failed} failed ═══════════`);
process.exit(failed === 0 ? 0 : 1);
