

const initListeners = async function(document, editorControls, transformControl) {
  initCameraSpeedControls(document, editorControls)
  initTransformModeButtons(document, transformControl)
}

async function initCameraSpeedControls(document, editorControls) {
  // Changes the camera speed when the slider's value changes
  const cameraSpeedSlider = document.getElementById("cameraSlider");
  const cameraSpeedSliderValue = document.getElementById("sliderValue");
  cameraSpeedSlider.oninput = function () {
  	cameraSpeedSliderValue.innerHTML = this.value;
  	editorControls.movementSpeed = this.value;
  };
}


async function initTransformModeButtons(document, transformControl) {
  document.getElementById("Translate").addEventListener("click", () => {
    transformControl.mode = "translate";
  })
  document.getElementById("Rotate").addEventListener("click", () => {
    transformControl.mode = "rotate";
  })
  document.getElementById("Scale").addEventListener("click", () => {
    transformControl.mode = "scale";
  })
}



module.exports = {
  initListeners: initListeners
}
