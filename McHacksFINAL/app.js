const normCam = document.getElementsByClassName('Normal_cam')[0];
const coolCam = document.getElementsByClassName('Cool_cam')[0];
const everything1 = document.getElementsByClassName('everything')[0];
const canvasCtx3 = coolCam.getContext('2d');
const fpsControl = new FPS();

let isWaving = false;

function updateOutputText(fingersUp) {
  const outputText = document.getElementById('outputText');
  const updateImage = document.getElementById('updateImage');

  if (!fingersUp.index && !fingersUp.middle && !fingersUp.ring && !fingersUp.pinky) {
    outputText.value = 'rock'; // All fingers down
    updateImage.src = 'Saymon.png';
   // All fingers down
  } else if (fingersUp.index && fingersUp.middle && fingersUp.ring && fingersUp.pinky) {
    outputText.value = 'paper'; // All fingers up
    updateImage.src = 'huzaifa.png'; // Set the src to saymon.png
  } else if (fingersUp.index && fingersUp.middle && !fingersUp.ring && !fingersUp.pinky) {
    outputText.value = 'scissors'; // Index and middle fingers up
    updateImage.src = 'Derek.png'
  }
}

function onResultsHands(results) {
  fpsControl.tick();

  let fingersUp = {
    index: false,
    middle: false,
    ring: false,
    pinky: false
  };

  canvasCtx3.save();
  canvasCtx3.drawImage(results.image, 0, 0, coolCam.width, coolCam.height);

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];

      // Detect fingers up
      fingersUp.index = landmarks[8].y < landmarks[7].y;
      fingersUp.middle = landmarks[12].y < landmarks[11].y;
      fingersUp.ring = landmarks[16].y < landmarks[15].y;
      fingersUp.pinky = landmarks[20].y < landmarks[19].y;

      drawConnectors(
        canvasCtx3, landmarks, HAND_CONNECTIONS,
        {color: isRightHand ? '#000000' : '#000000'});
      drawLandmarks(canvasCtx3, landmarks, {
        color: isRightHand ? '#000000' : '#000000',
        fillColor: isRightHand ? '#000000' : '#000000',
        radius: (x) => {
          return lerp(x.from.z, -0.15, .1, 5, 1);
        }
      });
    }

    // Update the output text based on fingers position
    updateOutputText(fingersUp);
  }

  canvasCtx3.restore();
}

// script.js

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});
hands.onResults(onResultsHands);

const camera = new Camera(normCam, {
  onFrame: async () => {
    await hands.send({image: normCam});
  },
  width: 240,
  height: 240
});
camera.start();

new ControlPanel(everything1)
    .add([
      new StaticText({title: 'MediaPipe Hands'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
    ]);
