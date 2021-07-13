const fs = require('fs')

function saveData(sectionData, currentSection){
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
    sectionData['Section'] = currentSection
    let sectionDataStr = JSON.stringify(sectionData)
    fs.writeFileSync(sectionPath, sectionDataStr, function (err) {
        if (err){
            console.error(err)
            console.warn('Failed to save file :(')
            return
        }
    })
    global.PythonTools.loadPython('save', sectionPath)
}

module.exports = {
    saveData: saveData
}
