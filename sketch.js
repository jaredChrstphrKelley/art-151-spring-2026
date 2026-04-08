// ============================================================
// STAGE 3 — ACCELEROMETER → POSITION + MULTIPLE SHAPES
// ============================================================
// NEW in this stage:
//   • Using accel data to move (translate) rather than rotate
//   • push()/pop() to isolate transformations per shape
//   • Multiple primitives responding differently to the
//     same sensor input
//   • Simple physics: velocity accumulates from tilt
// ============================================================

let accelX = 0, accelY = 0, accelZ = 0;

// Position and velocity for the "rolling ball" effect.
// Instead of directly mapping accel → position, we treat
// the tilt as a FORCE that changes velocity. This gives
// a much more natural, physical feeling.
let posX = 0, posY = 0;
let velX = 0, velY = 0;

let infoText, btn;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  btn = createButton('Tap to Enable Motion');
  btn.style('font-size', '20px');
  btn.style('padding', '20px 30px');
  btn.position(width / 2 - 140, height / 2);
  btn.mousePressed(requestMotion);

  infoText = createP('Waiting…');
  infoText.style('color', 'white');
  infoText.style('font-family', 'monospace');
  infoText.style('font-size', '14px');
  infoText.style('background', 'rgba(0,0,0,0.6)');
  infoText.style('padding', '10px');
  infoText.style('border-radius', '6px');
  infoText.position(10, 10);
}

// ---------- PERMISSION (same as Stage 2) ----------
async function requestMotion() {
  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    let perm = await DeviceMotionEvent.requestPermission();
    if (perm === 'granted') startListening();
  } else {
    startListening();
  }
  btn.hide();
}

function startListening() {
  window.addEventListener('devicemotion', (e) => {
    let a = e.accelerationIncludingGravity;
    if (a) {
      accelX = a.x || 0;
      accelY = a.y || 0;
      accelZ = a.z || 0;
    }
  });
}

function draw() {
  background(20);
  ambientLight(80);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);

  // ---------- SIMPLE PHYSICS ----------
  // accelX tilts left/right → we use it as a horizontal force
  // accelY tilts fwd/back  → we use it as a vertical force
  // The 0.5 multiplier controls sensitivity. Tune to taste.
  // Friction (0.98) prevents infinite acceleration.
  velX += accelX * 0.5;
  velY += -accelY * 0.5; // negative because screen Y is flipped
  velX *= 0.98; // friction / damping
  velY *= 0.98;

  posX += velX;
  posY += velY;

  // ---------- BOUNDARY BOUNCE ----------
  // Keep the ball roughly on screen
  let bound = min(width, height) * 0.4;
  if (posX > bound)  { posX = bound;  velX *= -0.5; }
  if (posX < -bound) { posX = -bound; velX *= -0.5; }
  if (posY > bound)  { posY = bound;  velY *= -0.5; }
  if (posY < -bound) { posY = -bound; velY *= -0.5; }

  // ---------- SHAPE 1: ROLLING SPHERE ----------
  // push() saves the current transformation state.
  // Everything between push/pop is isolated — the translate
  // here won't affect other shapes.
  push();
    translate(posX, posY, 0);
    // Spin the sphere based on its velocity — looks like rolling
    rotateX(posY * 0.02);
    rotateY(posX * 0.02);
    normalMaterial();
    sphere(60);
  pop();

  // ---------- SHAPE 2: STATIONARY TORUS ----------
  // This shape stays at center but rotates with the tilt,
  // reusing the technique from Stage 2.
  push();
    rotateX(map(accelY, -10, 10, -HALF_PI, HALF_PI));
    rotateY(map(accelX, -10, 10, -HALF_PI, HALF_PI));
    ambientMaterial(100, 200, 255); // colored material
    torus(120, 20);
  pop();

  // ---------- SHAPE 3: SMALL TRAILING BOXES ----------
  // These follow the sphere but lag behind (weaker position).
  // Creates a trailing/echo effect.
  for (let i = 1; i <= 4; i++) {
    push();
      // Each box gets a weaker version of the position
      let factor = 1 - i * 0.2;
      translate(posX * factor, posY * factor, -i * 40);
      rotateX(frameCount * 0.02 * i);
      rotateY(frameCount * 0.03 * i);
      ambientMaterial(255, 100 + i * 30, 50);
      box(30 - i * 4);
    pop();
  }

  infoText.html(
    `<strong>Stage 3:</strong> Accel → Position<br>` +
    `accel x:${accelX.toFixed(1)} y:${accelY.toFixed(1)} | ` +
    `pos x:${posX.toFixed(0)} y:${posY.toFixed(0)}`
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
