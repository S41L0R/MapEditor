const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")
const DataEditorTools = require("./DataEditorTools.js")

const initListeners = async function(document, editorControls, transformControl) {
	initCameraSpeedControls(document, editorControls)
	initTransformModeButtons(document, transformControl)
	initDeleteActorEvent(document)
}

async function initCameraSpeedControls(document, editorControls) {
	// Changes the camera speed when the slider's value changes
	const cameraSpeedSlider = document.getElementById("cameraSlider")
	const cameraSpeedSliderValue = document.getElementById("sliderValue")
	cameraSpeedSlider.oninput = function () {
  	cameraSpeedSliderValue.innerHTML = this.value
  	editorControls.movementSpeed = this.value
	}
}

async function initSaveButton(document, saveFunction, sectionData) {
  document.getElementById('saveButton').addEventListener('click', () => {
    saveFunction(sectionData)
    console.error('S A V I N G !')
  })
}

async function initTransformModeButtons(document, transformControl) {
	document.getElementById("Translate").addEventListener("click", () => {
		transformControl.mode = "translate"
	})
	document.getElementById("Rotate").addEventListener("click", () => {
		transformControl.mode = "rotate"
	})
	document.getElementById("Scale").addEventListener("click", () => {
		transformControl.mode = "scale"
	})
}



async function initDeleteActorEvent(document) {
	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 46 || e.keyCode === 8) {
			let selectedDummys = SelectionTools.getSelectedDummys()
			SelectionTools.deselectAll()
			DataEditorTools.removeAllActorsFromSelectedActorsList(document)
			for (const dummy of selectedDummys) {
				ActorTools.removeObjectActorByDummy(dummy)
				ActorTools.removeDataActorByDummy(dummy)
			}
		}
	})
}


module.exports = {
  initListeners: initListeners,
  initSaveButton: initSaveButton
}
