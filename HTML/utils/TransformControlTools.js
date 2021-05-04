const SelectionTools = require("./SelectionTools.js")
const ActorTools = require("./ActorTools.js")


const initTransformControlListeners = async function (transformControl) {
	initDraggingChanged(transformControl)
}


async function initDraggingChanged(transformControl) {
	transformControl.addEventListener("dragging-changed", async function(event) {
		console.warn("HI")
	})
}

const onTransformControlDrag = async function (transformControl) {
	SelectionTools.updateSelectedObjs()

	let groupSelector = transformControl.object
	for (dummy of groupSelector.children) {
		ActorTools.updateDataActor(dummy)
	}
}

module.exports = {
	initTransformControlListeners: initTransformControlListeners,

	onTransformControlDrag: onTransformControlDrag
}
