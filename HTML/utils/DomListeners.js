
const initListeners = async function(document, editorControls, transformControl) {
	initCameraSpeedControls(document, editorControls)
	initExposureControls(document)
	initTransformModeButtons(document, transformControl)
	initDeleteActorEvent(document)
	initAddActorButton(document)
	initAddActorOfTypeDialog(document)
	initAddRailButton(document)
	initAddRailDialog(document)
	initRailPointSlider(document)
	initCtrlListener(document)
	initCopyPasteActorEvent(document)
	initShowVisibilityDisplay(document)
	initVisibilityDisplayControls(document)
	initShowSideMenu(document)
	initSideMenuControls(document)
	initTransformSnappingControls(document)
	initLODThresholdControls(document)
	initLODToggleControls(document)
}


let ctrlDown = false

async function initCameraSpeedControls(document, editorControls) {
	// Changes the camera speed when the slider's value changes
	const cameraSpeedSlider = document.getElementById("cameraSpeedSlider")
	const cameraSpeedSliderValue = document.getElementById("cameraSpeedSliderValue")
	cameraSpeedSlider.oninput = function () {
		if (this.value >= 300) {
			cameraSpeedSliderValue.innerHTML = "Ludicrous Speeeeeed"
		}
		else {
			cameraSpeedSliderValue.innerHTML = this.value
		}
  	editorControls.movementSpeed = this.value
	}

	// Changes the camera look speed when the slider's value changes
	const cameraLookSpeedSlider = document.getElementById("cameraLookSpeedSlider")
	const cameraLookSpeedSliderValue = document.getElementById("cameraLookSpeedSliderValue")
	cameraLookSpeedSlider.oninput = function () {
		if (this.value >= 300) {
			cameraLookSpeedSliderValue.innerHTML = "Ludicrous Speeeeeed"
		}
		else {
			cameraLookSpeedSliderValue.innerHTML = this.value
		}
  	editorControls.lookSpeed = this.value
	}
}

async function initExposureControls(document) {
	// Changes the tone mapping exposure when the slider's value changes
	const exposureSlider = document.getElementById("exposureSlider")
	const exposureSliderValue = document.getElementById("exposureSliderValue")
	exposureSlider.oninput = function () {
		exposureSliderValue.innerHTML = this.value
  	global.renderer.toneMappingExposure = this.value
	}
}

async function initSaveButton(document, saveFunction, sectionData, sectionName) {
  document.getElementById('saveButton').addEventListener('click', () => {
    saveFunction(sectionData, sectionName)
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

async function initAddRailButton(document) {
	document.getElementById("addRailButton").addEventListener("click", () => {
		let staticOrDynamicPrompt = document.getElementById("AddRailPrompt")

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
		const actor = global.ActorTools.addStaticActor("ExampleActor", global.camera.position, global.scene, global.sectionData, global.RayCastTools.intersectables)
		// A reminder that only static actors can be linked.
		global.LinkTools.storeLink(actor)
		global.LinkTools.addRelevantLinkObjectsByIncludedActor(actor)
	})

	dynamicButton.addEventListener("click", () => {
		global.ActorTools.addDynamicActor("ExampleActor", global.camera.position, global.scene, global.sectionData, global.RayCastTools.intersectables)
	})
}

async function initAddRailDialog(document) {
	let ignoreClick
	let addRailPrompt = document.getElementById("AddRailPrompt")
	let addRailPrompt_Label = document.getElementById("AddRailPrompt_Label")
	let addRailPrompt_OptionContainer = document.getElementById("AddRailPrompt_OptionContainer")
	let addRailPrompt_Description = document.getElementById("AddRailPrompt_Description")
	let addRailPrompt_PointSlider = document.getElementById("AddRailPrompt_PointSlider")
	let addRailPrompt_PointSlider_Value = document.getElementById("AddRailPrompt_PointSlider_Value")

	document.addEventListener("mousedown", () => {

		addRailPrompt_Label.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		addRailPrompt_OptionContainer.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		addRailPrompt_Description.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		addRailPrompt_PointSlider.addEventListener("mousedown", () => {
			ignoreClick = true
		})
		addRailPrompt_PointSlider_Value.addEventListener("mousedown", () => {
			ignoreClick = true
		})

		if (ignoreClick === false) {
			addRailPrompt.style.opacity = "0%"
			addRailPrompt.style["pointer-events"] = "none"
		}

	})

	document.addEventListener("mouseup", () => {
		ignoreClick = false
	})






	let linearButton = document.getElementById("AddRailPrompt_LinearButton")
	let bezierButton = document.getElementById("AddRailPrompt_BezierButton")

	linearButton.addEventListener("click", () => {
		global.RailTools.createNewLinearRail(global.camera.position, document.getElementById("AddRailPrompt_PointSlider").value, 15)
	})

	bezierButton.addEventListener("click", () => {
		global.RailTools.createNewBezierRail(global.camera.position, document.getElementById("AddRailPrompt_PointSlider").value, 15)
	})
}

async function initRailPointSlider(document) {
	const pointSlider = document.getElementById("AddRailPrompt_PointSlider")
	const pointSliderValue = document.getElementById("AddRailPrompt_PointSlider_Value")
	pointSlider.oninput = function () {
		if (this.value >= 50 && this.value < 100) {
			pointSliderValue.innerHTML = `No, your computer is not a potato. You made it one. (${this.value} Points)`
		}
		else if (this.value >= 100) {
			pointSliderValue.innerHTML = `DEATH. (${this.value} Points)`
		}
		else {
			pointSliderValue.innerHTML = `${this.value} Points`
		}
	}
}

async function initDeleteActorEvent(document) {
	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 46 || e.keyCode === 8) {
			//let selectedDummys = global.SelectionTools.getSelectedDummys()
			let selectedDummys = [ ...global.SelectionTools.selectedDummys ]
			global.SelectionTools.deselectAll()
			global.DataEditorTools.removeAllActorsFromSelectedActorsList(document)
			for (const dummy of selectedDummys) {
				if (dummy.relevantType === "RailPoint") {
					let rail = global.RailTools.getRailFromHashID(dummy.CorrespondingRailHashID)
					rail.RailPoints.splice(dummy.railPointIndex, 1)

					global.SelectionTools.deselectAll(global.transformControl, global.THREE)
					global.RailTools.reloadRail(dummy.CorrespondingRailHashID, global.sectionData, global.scene)
					if (rail.RailType.value === "Bezier") {
						global.RailHelperTools.removeUnusedControlPointHelpers(rail, global.scene, global.RayCastTools.intersectables).then(() => {
							global.RailHelperTools.reloadControlPointHelpersByRailHashID(dummy.CorrespondingRailHashID, global.scene, global.sectionData, global.RayCastTools.intersectables)
						})
					}
					global.RailHelperTools.reloadRailPointHelpersByRailHashID(dummy.CorrespondingRailHashID, global.scene, global.sectionData, global.RayCastTools.intersectables)
				}
				else {
					global.ActorTools.removeObjectActorByDummy(dummy)
					global.ActorTools.removeDataActorByDummy(dummy)
					global.LinkTools.removeLinkObjectsFromSceneByIncludedActor(dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index])
				}
			}
		}
	})
}

function initCtrlListener(document) {
	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 17 || e.keyCode === 91) {
			ctrlDown = true
		}
	})
	document.addEventListener("keyup", (e) => {
		if (e.keyCode === 17 || e.keyCode === 91) {
			ctrlDown = false
		}
	})
}
async function initCopyPasteActorEvent(document) {


	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 67) {
			if (ctrlDown) {
				// Copy the actors
				let actorDict = {"Static": [], "Dynamic": []}
				for (const dummy of global.SelectionTools.selectedDummys) {
					if (dummy.relevantType !== "ControlPoint" && dummy.relevantType !== "RailPoint") {
						// We know that this dummy refers to an actor.
						const actor = dummy.userData.instancedMeshes[0].userData.actorList[dummy.userData.index]

						// Okay, lets build up the data to copy
						// For that, we'll need to know if this actor is a static or dynamic actor.
						// I don't store that data anywhere, so.............................
						// Whatever, optimization is just a side effect of good code and I don't write that anyway.

						// Plus, this isn't much slower anyway.
						if (global.sectionData.Static.Objs.indexOf(actor) !== -1) {
							actorDict.Static.push(actor)
						}
						else if (global.sectionData.Dynamic.Objs.indexOf(actor) !== -1) {
							actorDict.Dynamic.push(actor)
						}

					}
				}
				global.ClipboardTools.copyActors(actorDict)
			}
		}
	})
	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 86) {
			if (ctrlDown) {
				// Paste the actors
				global.ClipboardTools.pasteActors()
			}
		}
	})
}

async function initShowVisibilityDisplay(document) {
	let opened = false;
	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 86 ) {
			if (!ctrlDown) {
				let visibilityDisplay = document.getElementById("VisibilityDisplay")
				let pushDummyObj = document.getElementById("BottomMenu_FlexBox_PushDummyObj")
				if (opened) {
					visibilityDisplay.style["flex-grow"] = 0.00001
					pushDummyObj.style["flex-grow"] = 1
					opened = false
				}
				else {
					visibilityDisplay.style["flex-grow"] = 1
					pushDummyObj.style["flex-grow"] = 0.00001
					opened = true
				}
			}
		}
	})
}

async function initVisibilityDisplayControls(document) {
	const invisActorsToggle = document.getElementById("VisibilityDisplay_InvActorsToggle")
	invisActorsToggle.addEventListener("change", (e) => {
		if (invisActorsToggle.checked) {
			// Okay, we'll make all in-game invis actors visible
			global.VisibilityTools.changeActorGroupVisibility("invis", true)

			// Also, we know that this has child checkbox elements, so we'll make sure those aren't greyed out.
			const parentContainer = document.getElementById("VisibilityDisplay_InvActorsCollectionToggleContainer")
			unGreyOutChildrenVisibilityCheckboxesByContainer(parentContainer)
		}
		else {
			// Okay, we'll make all in-game invis actors actually invisible
			global.VisibilityTools.changeActorGroupVisibility("invis", false)

			// Also, we know that this has child checkbox elements, so we'll grey those out.
			const parentContainer = document.getElementById("VisibilityDisplay_InvActorsCollectionToggleContainer")
			greyOutChildrenVisibilityCheckboxesByContainer(parentContainer)
		}
	})

	const areaActorsToggle = document.getElementById("VisibilityDisplay_AreaActorsToggle")
	areaActorsToggle.addEventListener("change", (e) => {
		if (areaActorsToggle.checked) {
			// Okay, we'll make all in-game invis actors visible
			global.VisibilityTools.changeActorGroupVisibility("areas", true)
		}
		else {
			// Okay, we'll make all in-game invis actors actually invisible
			global.VisibilityTools.changeActorGroupVisibility("areas", false)
		}
	})

	const linkTagActorsToggle = document.getElementById("VisibilityDisplay_LinkTagActorsToggle")
	linkTagActorsToggle.addEventListener("change", (e) => {
		if (linkTagActorsToggle.checked) {
			// Okay, we'll make all in-game invis actors visible
			global.VisibilityTools.changeActorGroupVisibility("linktags", true)
		}
		else {
			// Okay, we'll make all in-game invis actors actually invisible
			global.VisibilityTools.changeActorGroupVisibility("linktags", false)
		}
	})

	const otherInvActorsToggle = document.getElementById("VisibilityDisplay_OtherInvActorsToggle")
	otherInvActorsToggle.addEventListener("change", (e) => {
		if (otherInvActorsToggle.checked) {
			// Okay, we'll make all in-game invis actors visible
			global.VisibilityTools.changeActorGroupVisibility("otherInvis", true)
		}
		else {
			// Okay, we'll make all in-game invis actors actually invisible
			global.VisibilityTools.changeActorGroupVisibility("otherInvis", false)
		}
	})

	const staticActorsToggle = document.getElementById("VisibilityDisplay_StaticActorsToggle")
	staticActorsToggle.addEventListener("change", (e) => {
		if (staticActorsToggle.checked) {
			// Okay, we'll make all in-game invis actors visible
			global.VisibilityTools.changeActorGroupVisibility("static", true)
		}
		else {
			// Okay, we'll make all in-game invis actors actually invisible
			global.VisibilityTools.changeActorGroupVisibility("static", false)
		}
	})

	const dynamicActorsToggle = document.getElementById("VisibilityDisplay_DynamicActorsToggle")
	dynamicActorsToggle.addEventListener("change", (e) => {
		// Okay, we'll set the visibility
		global.VisibilityTools.changeActorGroupVisibility("dynamic", dynamicActorsToggle.checked)
	})

	const linkObjectsToggle = document.getElementById("VisibilityDisplay_LinkObjectsToggle")
	linkObjectsToggle.addEventListener("change", (e) => {
		// Okay, we'll make all in-game invis actors visible

		// I really need to rename this function
		global.VisibilityTools.changeActorGroupVisibility("links", linkObjectsToggle.checked)
	})

	const railObjectsToggle = document.getElementById("VisibilityDisplay_RailObjectsToggle")
	railObjectsToggle.addEventListener("change", (e) => {
		// Okay, we'll make all in-game invis actors visible

		// I really need to rename this function
		global.VisibilityTools.changeActorGroupVisibility("rails", railObjectsToggle.checked)
	})
}

async function greyOutChildrenVisibilityCheckboxesByContainer(container) {
	for (const element of container.children) {
		if (element.classList.contains("VisibilityDisplay_Toggle")) {
			greyOutVisibilityCheckboxesAndChildrenByContainer(element)
		}
	}
}

async function greyOutVisibilityCheckboxesAndChildrenByContainer(container) {
	for (const element of container.children) {
		if (element.classList.contains("VisibilityDisplay_Toggle")) {
			// Ah.. I love recursion. It makes things so much easier sometimes.
			greyOutVisibilityCheckboxesAndChildrenByContainer(element)
		}
		if (element.type === "checkbox") {
			element.disabled = true;
		}
	}
}

async function unGreyOutChildrenVisibilityCheckboxesByContainer(container) {
	for (const element of container.children) {
		if (element.classList.contains("VisibilityDisplay_Toggle")) {
			unGreyOutVisibilityCheckboxesAndChildrenByContainer(element)
		}
	}
}

async function unGreyOutVisibilityCheckboxesAndChildrenByContainer(container) {
	for (const element of container.children) {
		if (element.classList.contains("VisibilityDisplay_Toggle")) {
			unGreyOutVisibilityCheckboxesAndChildrenByContainer(element)
		}
		if (element.type === "checkbox") {
			element.disabled = false;
		}
	}
}

async function initShowSideMenu(document) {
	let opened = false;
	document.addEventListener("keydown", (e) => {
		const sideMenu = document.getElementById("SideMenu_FlexBox")

		if (e.keyCode === 84 ) {
			if (!ctrlDown) {
				if (opened) {
					// SideMenu is open, close it
					sideMenu.style.visibility = "hidden"
					opened = false
				}
				else {
					// SideMenu is closed, open it
					sideMenu.style.visibility = "visible"
					opened = true
				}
			}
		}
	})
}

async function initSideMenuControls(document) {
	const tabs = document.getElementsByClassName("SideMenuTabs_Tab")
	for (const tab of tabs) {
		console.error(tab)
		tab.addEventListener("click", () => {
			const sideMenuPanelContainer = document.getElementById("SideMenuPanelContainer")
			for (const panel of sideMenuPanelContainer.children) {
				if (panel.id === tab.dataset.tab) {
					// If this is the panel the tab is for, make it visible.
					panel.style["flex-grow"] = 1
					panel.style["opacity"] = 1
					panel.style["pointer-events"] = "auto"
				}
				else {
					// Otherwise, make it invisible.
					panel.style["flex-grow"] = 0.00001
					panel.style["opacity"] = 0
					panel.style["pointer-events"] = "none"
				}
			}
		})
	}
}

async function initTransformSnappingControls(document) {
	const translateSnappingSlider = document.getElementById("translateSnappingSlider")
	const translateSnappingValue = document.getElementById("translateSnappingSliderValue")

	translateSnappingSlider.oninput = function () {
		if (Math.round(this.value) === 0) {
			translateSnappingSliderValue.innerHTML = "None"
			global.transformControl.translationSnap = null
		}
		else {
			translateSnappingSliderValue.innerHTML = this.value
			global.transformControl.translationSnap = this.value
		}
	}

	const rotateSnappingSlider = document.getElementById("rotateSnappingSlider")
	const rotateSnappingSliderText = document.getElementById("rotateSnappingSliderText")

	rotateSnappingSlider.oninput = function () {
		if (Math.round(this.value) === 0) {
			rotateSnappingSliderValue.innerHTML = "None"
			global.transformControl.rotationSnap = null
		}
		else if (Math.round(this.value) === 3) {
			rotateSnappingSliderValue.innerHTML = "3.14..."
			global.transformControl.rotationSnap = Math.PI
		}
		else {
			rotateSnappingSliderValue.innerHTML = this.value
			global.transformControl.rotationSnap = this.value
		}
	}

	const scaleSnappingSlider = document.getElementById("scaleSnappingSlider")
	const scaleSnappingSliderText = document.getElementById("scaleSnappingSliderText")

	scaleSnappingSlider.oninput = function () {
		if (Math.round(this.value) === 0) {
			scaleSnappingSliderValue.innerHTML = "None"
			global.transformControl.scaleSnap = null
		}
		else {
			scaleSnappingSliderValue.innerHTML = this.value
			global.transformControl.scaleSnap = this.value
		}
	}
}

function initLODThresholdControls(document) {
	const LODThresholdSlider = document.getElementById("LODThresholdSlider")
	const LODThresholdSliderValue = document.getElementById("LODThresholdSliderValue")

	LODThresholdSlider.oninput = function () {
		global.LODTools.setLOD_THRESHOLD(LODThresholdSlider.value)

		LODThresholdSliderValue.innerHTML = LODThresholdSlider.value

		// We'll force an LOD update...
		global.LODTools.applyLODs()
	}
}

function initLODToggleControls(document) {
	const computeLODsCheckbox = document.getElementById("computeLODsCheckbox")
	computeLODsCheckbox.oninput = function () {
		if (computeLODsCheckbox.checked) {
			global.LODTools.enableLODs()
		}
		else {
			global.LODTools.disableLODs()
		}
		global.computeLODs = computeLODsCheckbox.checked
	}
}


module.exports = {
  initListeners: initListeners,
  initSaveButton: initSaveButton
}
