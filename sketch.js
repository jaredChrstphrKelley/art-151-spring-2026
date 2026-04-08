let eventCount = 0;
let lastEvent = 'none yet';
let permLog = 'Tap the button\n';
let info;

function setup() {
  createCanvas(windowWidth, windowHeight);

  let btn = createButton('Request Motion');
  btn.style('z-index', '1000');
  btn.style('font-size', '24px');
  btn.style('padding', '20px');
  btn.style('position', 'fixed');
  btn.style('top', '20px');
  btn.style('left', '20px');
  btn.mousePressed(requestMotion);

  info = createDiv(permLog);
  info.style('position', 'fixed');
  info.style('top', '100px');
  info.style('left', '20px');
  info.style('color', 'lime');
  info.style('font-family', 'monospace');
  info.style('font-size', '16px');
  info.style('white-space', 'pre');
  info.style('background', 'black');
  info.style('padding', '15px');
  info.style('border', '2px solid lime');
  info.style('z-index', '1000');
  info.style('max-width', '85vw');
}

async function requestMotion() {
  permLog = 'Button pressed!\n';
  permLog += 'DeviceMotionEvent: ' + (typeof DeviceMotionEvent) + '\n';
  permLog += 'requestPermission: ' +
    (typeof DeviceMotionEvent.requestPermission) + '\n';

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      let perm = await DeviceMotionEvent.requestPermission();
      permLog += 'Permission: ' + perm + '\n';
    } catch (e) {
      permLog += 'Error: ' + e + '\n';
    }
  }

  window.addEventListener('devicemotion', (e) => {
    eventCount++;
    let a = e.accelerationIncludingGravity;
    lastEvent = a
      ? `x:${a.x?.toFixed(2)} y:${a.y?.toFixed(2)} z:${a.z?.toFixed(2)}`
      : 'accelIncludingGravity is NULL';
  });

  permLog += 'Listener attached.\n';
}

function draw() {
  background(30);
  if (info) {
    info.html(
      permLog +
      'Events: ' + eventCount + '\n' +
      'Data: ' + lastEvent
    );
  }
}
