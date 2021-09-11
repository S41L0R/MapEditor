const fs = require("fs")
const ipc = require("electron").ipcRenderer
const path = require("path")


let settings

document.getElementById("MapEditorButton").addEventListener("click", function() {
	console.log("hi")


	document.getElementById("SettingsButton").style["flex-grow"] = "0.0001"
	//document.getElementsByClassName("LauncherButtonIcon").remove()
	//document.getElementByClassName("LauncherButtonText").remove();


	//document.getElementById("SettingsButton").innerHTML.style.visibility = "hidden";

	for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
		document.getElementById("SettingsButton").childNodes[i].style["animation-play-state"] = "running"
	}

	for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
		if (document.getElementById("MapEditorButton").childNodes[i].nodeName.toLowerCase() == "p") {
			document.getElementById("MapEditorButton").childNodes[i].style["animation-play-state"] = "running"
			setTimeout(() => {

				for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
					if (document.getElementById("MapEditorButton").childNodes[i].nodeName.toLowerCase() == "p") {
						document.getElementById("MapEditorButton").childNodes[i].parentNode.removeChild(document.getElementById("MapEditorButton").childNodes[i])
					}
				}

				setTimeout(() => {ipc.send("loadHTML", "../Editor.html")}, 3500)

			}, 500)
		}

	}


	setTimeout(() => {document.getElementById("SettingsButton").innerHTML = ""}, 500)

})



document.getElementById("SettingsButton").addEventListener("click", function() {
	console.log("hi")


	document.getElementById("MapEditorButton").style["flex-grow"] = "0.0001"
	//document.getElementsByClassName("LauncherButtonIcon").remove()
	//document.getElementByClassName("LauncherButtonText").remove();


	//document.getElementById("MapEditorButton").innerHTML.style.visibility = "hidden";

	for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
		document.getElementById("MapEditorButton").childNodes[i].style["animation-play-state"] = "running"
	}

	for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
		if (document.getElementById("SettingsButton").childNodes[i].nodeName.toLowerCase() == "p") {
			document.getElementById("SettingsButton").childNodes[i].style["animation-play-state"] = "running"
			setTimeout(() => {

				for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
					if (document.getElementById("SettingsButton").childNodes[i].nodeName.toLowerCase() == "p") {
						document.getElementById("SettingsButton").childNodes[i].parentNode.removeChild(document.getElementById("SettingsButton").childNodes[i])
					}
				}



			}, 500)
		}

	}


	setTimeout(() => {document.getElementById("MapEditorButton").innerHTML = ""}, 500)

})



const { spawn } = require("child_process")
const childPython = spawn("python", [path.join(__dirname, "../../../MapEditor/Process.py"), "shareSettings", "All"], {cwd:path.join(__dirname, "../../../")})

childPython.stdio[1].on("data", (dataBuffer) => {
	settings = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")))
	console.error(settings)


	for (const key in settings.SettingsMenuOrganization) {
		document.getElementById("tabContainer").innerHTML = document.getElementById("tabContainer").innerHTML + `
      <div class="tabButton" id="${key}">${key}</div>
    `
	}
	Array.from(document.getElementById("tabContainer").children).forEach((element) => {
		element.addEventListener("click", () => {openTab(event.target.id)})
	})



})

function toggleBooleanSetting(key) {
	if (settings[key] == true) {
		settings[key] = false
		document.getElementById(key).style["background-color"] = "darkgrey"
	}
	else {
		settings[key] = true
		document.getElementById(key).style["background-color"] = "powderblue"
	}
}

function updateTextSetting(key) {
	settings[key] = document.getElementById(key).children[1].value
	console.error(settings)
}


function openTab(tabName) {
	console.error(settings)
	console.error(tabName)
	document.getElementById("settingsContainer").innerHTML = null
	for (const key in settings) {
		if (!settings.SettingsMenuOrganization[tabName].includes(key) || key == "SettingsMenuOrganization") {
			continue
		}
		let value = settings[key]
		if (typeof value === "boolean") {
			document.getElementById("settingsContainer").innerHTML = document.getElementById("settingsContainer").innerHTML + `
        <div class="settingsModuleBoolean" id="${key}"><p>${key}</p></div>
      `
			// Easy way to update the color:
			toggleBooleanSetting(key)
			toggleBooleanSetting(key)
		}
		else if (typeof value === "string") {
			document.getElementById("settingsContainer").innerHTML = document.getElementById("settingsContainer").innerHTML + `
        <div class="settingsModuleString" id="${key}"><p>${key}</p><input value = "${value}"></input></div>
      `
		}
		else if (typeof value === "number") {
			if (value % 1 === 0) {
				document.getElementById("settingsContainer").innerHTML = document.getElementById("settingsContainer").innerHTML + `
          <div type="number" step="1" class="settingsModuleInt" id="${key}"><p>${key}</p><input value = "${value}"></input></div>
        `
			}
			else {
				document.getElementById("settingsContainer").innerHTML = document.getElementById("settingsContainer").innerHTML + `
          <div type="number" class="settingsModuleFloat" id="${key}"><p>${key}</p><input value = "${value}"></input></div>
        `
			}
		}
	}
	Array.from(document.getElementById("settingsContainer").children).forEach((element) => {
		if (element.className == "settingsModuleBoolean") {
			element.addEventListener("click", () => {toggleBooleanSetting(event.target.parentElement.id)})
		}
		else if (element.className == "settingsModuleString") {
			element.addEventListener("keyup", () => {updateTextSetting(event.target.parentElement.id)})
			console.warn("hi2")
		}
		else if (element.className == "settingsModuleInt") {
			element.addEventListener("keyup", () => {updateTextSetting(event.target.id)})
		}
		else if (element.className == "settingsModuleFloat") {
			element.addEventListener("keyup", () => {updateTextSetting(event.target.parentElement.id)})
		}
	})
}

document.getElementById("saveButton").addEventListener("click", () => {
	console.warn(JSON.stringify(settings))
	const settingsChildPython = spawn("python", [path.join(__dirname, "../../../MapEditor/Process.py"), "setSettings", JSON.stringify(settings).replace(/"/g, "'")], {cwd:path.join(__dirname, "../../../")})
	settingsChildPython.stdio[1].on("data", (dataBuffer) => {
		console.error(dataBuffer.toString())
		console.warn("hello?")
		ipc.send("loadHTML", ["./HTML/UI/Launcher/Launcher.html", null])
	})
	settingsChildPython.stdio[2].on("data", (dataBuffer) => {
		console.error(dataBuffer.toString())
	})
	//setTimeout(() => {ipc.send("loadHTML", ["./HTML/UI/SectionSelection/SectionSelection.html", null])}, 3500);
})
