const DomListeners = require("./DomListeners.js")


let selectedActor;

async function displayActor(actor, document) {
  document.getElementById("DataEditorTextWindow").innerHTML = `
    <p id="SelectedActorName"><strong>${actor.UnitConfigName.value}</strong></p>
    <p>${actor.HashId.value}</p>
    <button class="button" id="ActorEditButton">Edit BYML</button>
  `

  DomListeners.initDataEditorButton(document, selectedActor)
}

const addActorToSelectedActorsList = async function(actor, document) {
  let selectedActorsList = document.getElementById("selectedActorsList");
  for (const element of selectedActorsList.childNodes) {
    if (element.id == `selectedActor_${actor.HashId.value}`) {
      // We already added this.
      // We can just return and move on.
      return;
    }
  }
  let newElement = document.createElement("div");
  newElement.innerHTML = `
    <strong>${actor.UnitConfigName.value}</strong> ${actor.HashId.value}
  `
  newElement.className = "selectedActorListItem";
  newElement.id = `selectedActor_${actor.HashId.value}`
  if (selectedActorsList.childNodes.length > 0) {
    selectedActorsList.insertBefore(newElement, selectedActorsList.childNodes[0]);
  }
  else {
    selectedActorsList.appendChild(newElement);;
  }



  newElement.addEventListener("click", () => {
    selectedActor = actor;
    displayActor(actor, document)
  })
}


const removeActorFromSelectedActorsList = async function(actor, document) {
  let selectedActorsList = document.getElementById("selectedActorsList");
  for (const element of selectedActorsList.childNodes) {
    if (element.id == `selectedActor_${actor.HashId.value}`) {
      element.remove();
    }
  }



  newElement.addEventListener("click", () => {
    selectedActor = actor;
    displayActor(actor, document)
  })
}


const removeAllActorsFromSelectedActorsList = async function(document) {
  let selectedActorsList = document.getElementById("selectedActorsList");
  while (selectedActorsList.firstChild) {
    selectedActorsList.removeChild(selectedActorsList.firstChild)
  }
}


module.exports = {
  addActorToSelectedActorsList: addActorToSelectedActorsList,
  removeActorFromSelectedActorsList: removeActorFromSelectedActorsList,
  removeAllActorsFromSelectedActorsList: removeAllActorsFromSelectedActorsList,

  selectedActor: selectedActor
}
