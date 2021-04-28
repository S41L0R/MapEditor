const {BrowserWindow} = require("electron").remote


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
  initDataEditorButton: initDataEditorButton
}
