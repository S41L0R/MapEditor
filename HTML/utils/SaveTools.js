const fs = require('fs')

function saveData(sectionData, currentSection){
    if (global.isDungeon) {
        saveDataDungeon(sectionData, currentSection)
    }
    else {
        saveDataSection(sectionData, currentSection)
    }
}

function saveDataSection(sectionData, currentSection){
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
    console.error((currentSection.replace("/", "\\").split("\\")[currentSection.replace("/", "\\").split("\\").length - 1]).split(".")[0])
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

function saveDataDungeon(sectionData, currentSection){
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
    sectionData['Section'] = (currentSection.replace("/", "\\").split("\\")[currentSection.replace("/", "\\").split("\\").length - 1]).split(".")[0]
    console.error((currentSection.replace("/", "\\").split("\\")[currentSection.replace("/", "\\").split("\\").length - 1]).split(".")[0])
    let sectionDataStr = JSON.stringify(sectionData)
    fs.writeFileSync(sectionPath, sectionDataStr, function (err) {
        if (err){
            console.error(err)
            console.warn('Failed to save file :(')
            return
        }
    })
    global.PythonTools.loadPython('saveDungeon', sectionPath)
}

module.exports = {
    saveData: saveData
}
