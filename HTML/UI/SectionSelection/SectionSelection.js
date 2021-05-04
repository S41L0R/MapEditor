var ipc = require("electron").ipcRenderer

var scene = document.getElementById("scene")
window.pz = panzoom(scene, {autocenter: true, bounds: true, transformOrigin: {x: 0.5, y: 0.5}, minZoom: 1})

var selectedSection = ""
var safeToSelect = true
var lastMouseX = 0
var lastMouseY = 0
var startPosX
var startPosY
var timeout = setTimeout(function(){}, 500)




function selectSection(sectionName) {
	if (safeToSelect) {
		//document.getElementById(sectionName).style["box-shadow"] = "inset 0 0 100px black";
		//console.log("hi")
		document.getElementById(sectionName + "-Box").style["visibility"] = "visible"


		if (selectedSection != "") {
			document.getElementById(selectedSection + "-Box").style["visibility"] = "hidden"
		}
		selectedSection = sectionName
		console.log(selectedSection)
	}


	/*
   top = document.getElementById(sectionName).style["top"]
   left = document.getElementById(sectionName).style["left"]


   console.log(left)


   rect = document.getElementById(sectionName).getBoundingClientRect();

   scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
   scrollTop = window.pageYOffset || document.documentElement.scrollTop;
   scrollRight = window.pageXOffset || document.documentElement.scrollRight,
   scrollBottom = window.pageYOffset || document.documentElement.scrollBottom;

   top = rect.top + scrollTop;
   left = rect.left + scrollLeft;
   right = rect.right + scrollRight;
   bottom = rect.bottom + scrollBottom;
   document.getElementById(sectionName + "-Box").style["top"] = top.toString() + "px";
   document.getElementById(sectionName + "-Box").style["left"] = left.toString() + "px";
   document.getElementById(sectionName + "-Box").style["right"] = right.toString() + "px";
   document.getElementById(sectionName + "-Box").style["bottom"] = bottom.toString() + "px";
   */

}

function openSection() {
	ipc.send("loadHTML", ["./Editor.html", selectedSection])
	console.log("loading")
}

/*
document.onmousemove = function(e){
  console.log("hi")
  if (Math.abs(e.pageX - lastMouseX) > 100 && Math.abs(e.pageY - lastMouseY) > 100) {
    safeToSelect = false;

    clearTimeout(timeout);
    timeout = setTimeout(function(){safeToSelect = true}, 50);
  }

  lastMouseX = e.pageX;
  lastMouseX = e.pageY;
}
*/

document.onmousedown = function(e){
	startPosX = e.pageX
	startPosY = e.pageY
}

document.onmouseup = function(e){
	console.log("hi")
	if (Math.abs(e.pageX - startPosX) > 0.25 && (Math.abs(e.pageY - startPosY) > 0.25)) {
		safeToSelect = false
	}
	else {
		safeToSelect = true
	}

}
