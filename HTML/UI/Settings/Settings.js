const fs = require("fs");
const ipc = require('electron').ipcRenderer;

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

        setTimeout(() => {ipc.send("loadHTML", "../Editor.html")}, 3500);

      }, 500);
    }

  }


  setTimeout(() => {document.getElementById("SettingsButton").innerHTML = ""}, 500);

});



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



      }, 500);
    }

  }


  setTimeout(() => {document.getElementById("MapEditorButton").innerHTML = ""}, 500);

});
