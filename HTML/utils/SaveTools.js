const pythonTools = require('./PythonTools.js')
const fs = require('fs')

function saveData(sectionData){
    console.log('Called "saveData!"')
    var sectionPath = './temp/SectionData.json'
    try {
        if (!fs.existsSync('./temp')){
            fs.mkdirSync('./temp')
        }
        else {}
    }
    catch (err) {
        console.error(err)
        console.warn('Failed to save file :(')
        return
    }
    let sectionDataStr = JSON.stringify(sectionData)
    fs.writeFileSync(sectionPath, sectionDataStr, function (err) {
        if (err){
            console.error(err)
            console.warn('Failed to save file :(')
            return
        }
    })
    pythonTools.loadPython('save', sectionPath)
}

module.exports = {
    saveData: saveData
}