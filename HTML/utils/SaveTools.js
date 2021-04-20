const pythonTools = require('./PythonTools.js')
const fs = require('fs')

function saveData(sectionData){
    console.log(sectionData)
    let sectionDataStr = JSON.stringify(sectionData)
    pythonTools.loadPython('save', sectionDataStr)
}

module.exports = {
    saveData: saveData
}