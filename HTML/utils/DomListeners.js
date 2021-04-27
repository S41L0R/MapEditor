const {BrowserWindow} = require("electron").remote

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
			SelectionTools.deselectAll()
			DataEditorTools.removeAllActorsFromSelectedActorsList(document)
			let selectedDummys = SelectionTools.selectedDummys
			for (const dummy of selectedDummys) {
				ActorTools.removeObjectActorByDummy(dummy)
			}
		}
	})
}

const initDataEditorButton = async function (document, actor) {
	editDataButton = document.getElementById("ActorEditButton")

	editDataButton.addEventListener("click", () => {
		const editorWin = new BrowserWindow({width: 600, height: 400, webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}})
		editorWin.loadURL(`${__dirname}/../UI/SelectedActor/SelectedActor.html`)

		editorWin.once("ready-to-show", () => {
			editorWin.show()
		})
		actor = actor
		editingRail = false
		type = null

		editorWin.webContents.on("did-finish-load", () => {
			editorWin.webContents.send("toActorEditor", {
				data: actor,
				type: type,
				HashID: actor.HashId.value,
				editingRail: editingRail,
				windowID: 1
			})
		})

	})
}


module.exports = {
  initListeners: initListeners,
  initSaveButton: initSaveButton,
  initDataEditorButton: initDataEditorButton
}
