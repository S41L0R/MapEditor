

const initListeners = async function(document, editorControls) {
  initCameraSpeedControls(document, editorControls)
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






module.exports = {
  initListeners: initListeners
}
