

let selectedObj

async function displayActor(actor, document) {
	document.getElementById("DataEditorTextWindow").innerHTML = `
    <p id="SelectedActorName"><strong>${actor.UnitConfigName.value}</strong></p>
    <p>${actor.HashId.value}</p>
    <button class="button" id="ActorEditButton">Edit BYML</button>
  `

	global.VariableDomListeners.initDataEditorButton(document, selectedObj)
}

async function displayRail(rail, document) {
	document.getElementById("DataEditorTextWindow").innerHTML = `
    <p id="SelectedActorName"><strong>${rail.UnitConfigName.value}</strong></p>
    <p>${rail.HashId.value}</p>
    <button class="button" id="ActorEditButton">Edit BYML</button>
  `

	global.VariableDomListeners.initDataEditorButton(document, selectedObj)
}

const addActorToSelectedActorsList = async function(actor, document) {
	let selectedActorsList = document.getElementById("selectedActorsList")
	for (const element of selectedActorsList.childNodes) {
		if (element.id == `selectedActor_${actor.HashId.value}`) {
			// We already added this.
			// We can just return and move on.
			return
		}
	}
	let newElement = document.createElement("div")
	newElement.innerHTML = `
    <strong>${actor.UnitConfigName.value}</strong><br>${actor.HashId.value}
  `
	newElement.className = "selectionListItem"
	newElement.id = `selectedActor_${actor.HashId.value}`
	if (selectedActorsList.childNodes.length > 0) {
		selectedActorsList.insertBefore(newElement, selectedActorsList.childNodes[0])
	}
	else {
		selectedActorsList.appendChild(newElement)
	}



	newElement.addEventListener("click", () => {
		selectedObj = actor
		displayActor(actor, document)
	})

	
}

const addRailBitToSelectedRailsList = async function(railBit, document) {
	let rail = global.RailHelperTools.getRailFromRailBit(railBit)
	let selectedRailsList = document.getElementById("selectedRailsList")
	for (const element of selectedActorsList.childNodes) {
		if (element.id === `selectedRail_${rail.HashId.value}`) {
			return
		}
	}

	let newElement = document.createElement("div")
	newElement.innerHTML = `
		${rail.RailType.value} <strong>${rail.UnitConfigName.value}</strong>
		<br>
		${rail.HashId.value}
	`
	newElement.className = "selectionListItem"
	newElement.id = `selectedRail_${rail.HashId.value}`
	if (selectedRailsList.childNodes.length > 0) {
		selectedRailsList.insertBefore(newElement, selectedRailsList.childNodes[0])
	}
	else {
		selectedRailsList.appendChild(newElement)
	}

	newElement.addEventListener("click", () => {
		selectedObj = rail
		displayRail(rail, document)
	})
}


const removeActorFromSelectedActorsList = async function(actor, document) {
	let selectedActorsList = document.getElementById("selectedActorsList")
	for (const element of selectedActorsList.childNodes) {
		if (element.id == `selectedActor_${actor.HashId.value}`) {
			element.remove()
		}
	}


	/*
	newElement.addEventListener("click", () => {
		selectedActor = actor
		displayActor(actor, document)
	})
	*/
}


const removeAllActorsFromSelectedActorsList = async function(document) {
	let selectedActorsList = document.getElementById("selectedActorsList")
	while (selectedActorsList.firstChild) {
		selectedActorsList.removeChild(selectedActorsList.firstChild)
	}
}

const removeAllRailsFromSelectedRailsList = async function() {
	let selectedRailsList = document.getElementById("selectedRailsList")
	while (selectedRailsList.firstChild) {
		selectedRailsList.removeChild(selectedRailsList.firstChild)
	}
}


module.exports = {
	addActorToSelectedActorsList: addActorToSelectedActorsList,
	addRailBitToSelectedRailsList: addRailBitToSelectedRailsList,
	removeActorFromSelectedActorsList: removeActorFromSelectedActorsList,
	removeAllActorsFromSelectedActorsList: removeAllActorsFromSelectedActorsList,
	removeAllRailsFromSelectedRailsList, removeAllRailsFromSelectedRailsList,

	selectedActor: selectedObj
}
