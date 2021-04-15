const fs = require("fs");
const ipc = require('electron').ipcRenderer;
const path = require('path');
const owoify = require('owoify-js').default
const process = require('process')
const PythonTools = require("../../utils/PythonTools")


var setup = await PythonTools.loadPython('checkSetupPy')
console.log(setup)
if (setup['NeedsRestart'] == true) {
  ipc.send('runSetup')
}

document.getElementById("MapEditorButton").addEventListener("click", function() {
  console.log("hi")


  document.getElementById("SettingsButton").style["flex-grow"] = "0.0001";
  //document.getElementsByClassName("LauncherButtonIcon").remove()
  //document.getElementByClassName("LauncherButtonText").remove();


  //document.getElementById("SettingsButton").innerHTML.style.visibility = "hidden";

  for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
    document.getElementById("SettingsButton").childNodes[i].style["animation-play-state"] = "running"
  }

  for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
    if (document.getElementById("MapEditorButton").childNodes[i].nodeName.toLowerCase() == "p") {
      document.getElementById("MapEditorButton").childNodes[i].style["animation-play-state"] = "running";
      setTimeout(() => {

        for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
          if (document.getElementById("MapEditorButton").childNodes[i].nodeName.toLowerCase() == "p") {
            document.getElementById("MapEditorButton").childNodes[i].parentNode.removeChild(document.getElementById("MapEditorButton").childNodes[i])
          }
        }

        setTimeout(() => {ipc.send("loadHTML", ["./HTML/UI/SectionSelection/SectionSelection.html", null])}, 3500);

      }, 500);
    }

  }


  setTimeout(() => {document.getElementById("SettingsButton").innerHTML = ""}, 500);

});

var settingsTxtElement = document.getElementById('settings')
var mapEditTxtElement = document.getElementById('mapEditor')
var settingsInitTxt = settingsTxtElement.innerText
var mapEditInitTxt = mapEditTxtElement.innerText

settingsTxtElement.innerText = owoify(settingsInitTxt, 'uvu')
mapEditTxtElement.innerText = owoify(mapEditInitTxt, 'uvu')

document.getElementById("SettingsButton").addEventListener("click", function() {
  console.log("hi")


  document.getElementById("MapEditorButton").style["flex-grow"] = "0.0001";
  //document.getElementsByClassName("LauncherButtonIcon").remove()
  //document.getElementByClassName("LauncherButtonText").remove();


  //document.getElementById("MapEditorButton").innerHTML.style.visibility = "hidden";

  for(var i=0; i<document.getElementById("MapEditorButton").childNodes.length; i++) {
    document.getElementById("MapEditorButton").childNodes[i].style["animation-play-state"] = "running"
  }

  for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
    if (document.getElementById("SettingsButton").childNodes[i].nodeName.toLowerCase() == "p") {
      document.getElementById("SettingsButton").childNodes[i].style["animation-play-state"] = "running";
      setTimeout(() => {

        for(var i=0; i<document.getElementById("SettingsButton").childNodes.length; i++) {
          if (document.getElementById("SettingsButton").childNodes[i].nodeName.toLowerCase() == "p") {
            document.getElementById("SettingsButton").childNodes[i].parentNode.removeChild(document.getElementById("SettingsButton").childNodes[i])
          }
        }
        setTimeout(() => {ipc.send("loadHTML", ["./HTML/UI/Settings/Settings.html", null])}, 3500);


      }, 500);
    }

  }


  setTimeout(() => {document.getElementById("MapEditorButton").innerHTML = ""}, 500);

});


//console.error(__dirname)
//console.error(path.join(__dirname, "../../../MapEditor/Process.py"))
const { spawn } = require("child_process");

const childPython = spawn("python", [path.join(__dirname, "../../../MapEditor/Process.py"), "cacheMapTex"], {cwd:path.join(__dirname, "../../../")})
childPython.stdio[1].on("data", (dataBuffer) => {
  console.error(dataBuffer.toString())
});

console.warn(process.pid)