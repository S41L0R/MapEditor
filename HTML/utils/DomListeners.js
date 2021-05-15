const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")
const DataEditorTools = require("./DataEditorTools.js")
const RayCastTools = require("./RayCastTools.js")

const initListeners = async function(document, editorControls, transformControl) {
	initCameraSpeedControls(document, editorControls)
	initTransformModeButtons(document, transformControl)
	initDeleteActorEvent(document)
	initAddActorButton(document)
	initAddActorOfTypeDialog(document)
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

async function initAddActorButton(document) {
	document.getElementById("addActorButton").addEventListener("click", () => {
		let staticOrDynamicPrompt = document.getElementById("StaticOrDynamicPrompt")

		staticOrDynamicPrompt.style.opacity = "100%"
		staticOrDynamicPrompt.style["pointer-events"] = "auto"
	})
}


async function initAddActorOfTypeDialog(document) {
	let ignoreClick
	let staticOrDynamicPrompt = document.getElementById("StaticOrDynamicPrompt")
	let staticOrDynamicPrompt_Label = document.getElementById("StaticOrDynamicPrompt_Label")
	let staticOrDynamicPrompt_OptionContainer = document.getElementById("StaticOrDynamicPrompt_OptionContainer")
	let staticOrDynamicPrompt_Description = document.getElementById("StaticOrDynamicPrompt_Description")

	document.addEventListener("mousedown", () => {

		staticOrDynamicPrompt_Label.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		staticOrDynamicPrompt_OptionContainer.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		staticOrDynamicPrompt_Description.addEventListener("mousedown", () => {
			ignoreClick = true
		})

		if (ignoreClick === false) {
			staticOrDynamicPrompt.style.opacity = "0%"
			staticOrDynamicPrompt.style["pointer-events"] = "none"
		}

	})

	document.addEventListener("mouseup", () => {
		ignoreClick = false
	})






	let staticButton = document.getElementById("StaticOrDynamicPrompt_StaticButton")
	let dynamicButton = document.getElementById("StaticOrDynamicPrompt_DynamicButton")

	staticButton.addEventListener("click", () => {
		ActorTools.addStaticActor("ExampleActor", global.camera.position, global.scene, global.sectionData, RayCastTools.intersectables)
	})

	dynamicButton.addEventListener("click", () => {
		ActorTools.addDynamicActor("Obj_TreeBroadleaf_A_LL_02", global.camera.position, global.scene, global.sectionData, RayCastTools.intersectables)
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
