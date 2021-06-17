/*

To do in this file:
===================
* Move progress bar updating to a seperate file


*/



// Requires
// -----------------------------------------------------------------------------
const path = require("path")



async function loadPython (func, arg) {

	const { spawn } = require("child_process")



	if (arg == null) {


		// Create the process:
		const childPython = spawn("python", [path.join(__dirname, "../../MapEditor/Process.py"), `${func}`], {cwd:path.join(__dirname, "../../")})


		// See what we get:
		return new Promise((resolve) => {
  		childPython.stdio[1].on("data", (dataBuffer) => {


  			if (dataBuffer.toString().includes("!startData")) {

  				const data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")))

  				resolve(data)
  				//return(data);
  				// return(data);
  				if (func == "main") {
  					var sectionData = data
  				}
  			} else if (dataBuffer.toString().includes("!startProgressDataTotal")) {
  				modelsToCacheTotal = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressDataTotal") + 23, dataBuffer.toString().lastIndexOf("!endProgressDataTotal"))
  			} else if (dataBuffer.toString().includes("!startProgressData")) {
  				if (modelsToCacheDone/modelsToCacheTotal < 1) {
  					document.getElementById("progressBar").style.visibility="visible"
  					document.getElementById("ProgressContainerDiv").style.visibility="visible"
  					document.getElementById("loadStatus").style.visibility="visible"
  					document.getElementById("progressBar").style.width=`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`

  				}
				} else if (dataBuffer.toString().includes("!startModelCachedData")) {
					
  			} else {
  				console.warn(`Could not find valid data markers in data from Python-side! Func: ${func} Arg: ${arg}`)
				alert(dataBuffer.toString())
  			}

  		})
			// Oh no! Python came across an error:
			childPython.stdio[2].on("data", (dataBuffer) => {
				console.error(dataBuffer.toString())
			})
		})
	} else {


		// Create the process:
		const childPython = spawn("python", [path.join(__dirname, "../../MapEditor/Process.py"), `${func}`, `${arg}`], {cwd:path.join(__dirname, "../../")})



		// See what we get:

		return new Promise((resolve) => {
  		childPython.stdio[1].on("data", (dataBuffer) => {


  			if (dataBuffer.toString().includes("!startData")) {
  				const data = JSON.parse(dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startData") + 10, dataBuffer.toString().lastIndexOf("!endData")))

  				resolve(data)
  				//return(data);
  				// return(data);

  				if (func == "main") {
  					var sectionData = data
  				}
  			} else if (dataBuffer.toString().includes("!startProgressDataTotal")) {
  				modelsToCacheTotal = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressDataTotal") + 23, dataBuffer.toString().lastIndexOf("!endProgressDataTotal"))
  			} else if (dataBuffer.toString().includes("!startProgressData")) {
  				modelsToCacheDone = dataBuffer.toString().substring(dataBuffer.toString().lastIndexOf("!startProgressData") + 18, dataBuffer.toString().lastIndexOf("!endProgressData"))
  				if (modelsToCacheDone/modelsToCacheTotal < 1) {
  					document.getElementById("progressBar").style.visibility="visible"
  					document.getElementById("ProgressContainerDiv").style.visibility="visible"
  					document.getElementById("loadStatus").style.visibility="visible"
  					document.getElementById("progressBar").style.width=`${100 * (modelsToCacheDone/modelsToCacheTotal)}%`

  				}
  				else {
  					document.getElementById("progressBar").style.visibility="hidden"
  					document.getElementById("ProgressContainerDiv").style.visibility="hidden"
  					document.getElementById("loadStatus").style.visibility="hidden"
  				}

  			} else {
					console.log(dataBuffer.toString())
  				console.warn(`Could not find valid data markers in data from Python-side! Func: ${func}, Arg: ${arg}`)
  			}
  		})
			// Oh no! Python came across an error:
			childPython.stdio[2].on("data", (dataBuffer) => {
				console.error(dataBuffer.toString())
			})
		})

	}
}




module.exports = {
	loadPython: loadPython
}
