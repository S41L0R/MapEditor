const fs = require("fs");
const ipc = require('electron').ipcRenderer;
const path = require('path');
const owoify = require('owoify-js').default
const process = require('process')
const PythonTools = require("../../utils/PythonTools")


var setup = await PythonTools.loadPython('checkSetupPy')
var projectPath;
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

var createProject = document.getElementById('create');
var openProject = document.getElementById('open');

async function openProjectDialogue(windowType) {
  let popup = document.getElementById('PopupContainer');

  if (windowType == 'open') {

    popup.innerHTML = `
      <form id='openProject'>
        <select id="projectSelection"></select>
        <button id="submit" type="button" class="projectPopupButton">Open Project</button>
        <button id="cancel" type="button" class="projectPopupButton">Cancel</button>
      </form>
    `
    let form = document.forms['openProject'];
    let selectBox = document.getElementById('projectSelection')
    let submitButton = document.getElementById('submit');
    let cancelButton = document.getElementById('cancel');
    let projects = await PythonTools.loadPython('getProjects');
    console.log(projects);
    for (var project in projects) {
      let option = document.createElement('option');
      option.text = projects[project];
      selectBox.add(option);
      console.log(selectBox)
    }
    submitButton.addEventListener('click', async function() {
      let projectName = document.getElementById('projectSelection').value;
      console.log(projectName)
      if (projectName.length != 0) {
        projectPath = await PythonTools.loadPython('openProject', projectName)
        ipc.send('setCurrentProject', projectName)
        popup.style.display = 'none'
      }
      else {
        alert("Please select a project")
      }
    })
    cancelButton.addEventListener('click', function() {
      popup.style.display = 'none'
      popup.innerHTML = ''
    })
    popup.style.display = 'block';
  }

  else if (windowType == 'create'){
    popup.innerHTML = `
      <form id='createProject'>
        <input type="text" id="projectName" name="projectName" placeholder="Project Name">
        <button id="submit" type="button" class="projectPopupButton">Create Project</button>
        <button id="cancel" type="button" class="projectPopupButton">Cancel</button>
      </form>
    `
    let form = document.forms['createProject'];
    let submitButton = document.getElementById('submit');
    let cancelButton = document.getElementById('cancel')
    submitButton.addEventListener('click', async function() {
      let projectName = form.projectName.value;
      if (projectName.length != 0) {
        projectPath = await PythonTools.loadPython('createProject', projectName)
        ipc.send('setCurrentProject', projectName)
        popup.style.display = 'none'
      }
      else {
        alert("Project name can NOT be blank!")
      }
    })
    cancelButton.addEventListener('click', function() {
      popup.style.display = 'none'
      popup.innerHTML = ''
    })
    popup.style.display = 'block';
  }

  else {
    projectPath = null
  }
}

createProject.addEventListener('click', async function() {
  // Do stuff here to spawn a window for project creation
  await openProjectDialogue('create')
})

openProject.addEventListener('click', async function() {
  await openProjectDialogue('open')
  // Add code to spawn new window for project selection
})

//console.error(__dirname)
//console.error(path.join(__dirname, "../../../MapEditor/Process.py"))
const { spawn } = require("child_process");

const childPython = spawn("python", [path.join(__dirname, "../../../MapEditor/Process.py"), "cacheMapTex"], {cwd:path.join(__dirname, "../../../")})
childPython.stdio[1].on("data", (dataBuffer) => {
  console.error(dataBuffer.toString())
});
