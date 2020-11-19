# Import general stuff

import pathlib
import oead
import json
import blwp
import webview
from flask import Flask
import sys
import json
import os

# Local libraries
import Loaders.FromSettings.LoadSettings as LoadSettings
import Writers.ToSettings.WriteSettings as WriteSettings
import Loaders.FromGame.smubin as smubinLoader
import Loaders.FromGame.actor as actor
import Writers.ToExport.smubin as smubinWriter
import Lib.Utils.Util as utils

#Set CWD

if "HTML" in os.getcwd():
    os.chdir("../")

currentSection = 'C-5'

# Load Settings
def getSettings():
    defaultSettings = {
    "GameDump": "Test/TestResources",
    "NX": False,
    "DarkMode": False
    }

    def checkSettings():
        try:
            settings = LoadSettings.LoadSettings()
            return(settings)
        except:
            WriteSettings.WriteSettings(defaultSettings)
            print("Created and poulated json file.")
            checkSettings()

    settings = checkSettings()
    if settings.get('NX') == True:
        content = '01007EF00011E000/romfs'
        aoc = '01007EF00011F001/romfs'
    else:
        content = 'content'
        aoc = 'aoc'
    return(settings, content, aoc)

# Formats settings to be shared with the js end of things
def shareSettings(setting):
    settings, content, aoc = getSettings()
    if setting == None:
        pass
    else:
        settings = settings.get(setting)
    jsonSettings = json.dumps(settings)
    print(f'!startData{jsonSettings}!endData')

# this exists so js can not be stupid
def getCurrentSection():
    print(f'!startData{json.dumps(currentSection)}!endData')
    return

# Load map file
class mapFile:
    def __init__(self):
        self.settings, self.content, self.aoc = getSettings()

        pathStrStatic = (f'{self.settings["GameDump"]}/{self.aoc}/Map/MainField/{currentSection}/{currentSection}_Static.smubin')
        pathStrDy = (f'{self.settings["GameDump"]}/{self.aoc}/Map/MainField/{currentSection}/{currentSection}_Dynamic.smubin')
        pathStrTeraTree = (f'{self.settings["GameDump"]}/{self.aoc}/Map/Mainfield/{currentSection}/{currentSection}_TeraTree.sblwp')

        self.pathStatic = pathlib.Path(pathStrStatic)
        self.pathDy = pathlib.Path(pathStrDy)
        self.pathTeraTree = pathlib.Path(pathStrTeraTree)

        smubinLoader.validateMapFile(self.pathStatic)
        smubinLoader.validateMapFile(self.pathDy)
        self.loadMapActors()
        self.formattedMapJson = self.createJSON()

    # CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD
    def loadMapActors(self):
        with open(self.pathStatic, 'rb') as dataStatic:
            readFileStatic = oead.byml.from_binary(utils.checkCompression(dataStatic.read()))
        with open(self.pathDy, 'rb') as dataDy:
            readFileDy = oead.byml.from_binary(utils.checkCompression(dataDy.read()))

        staticDictOut = utils.mapDict(readFileStatic)
        dyDictOut = utils.mapDict(readFileDy)
        self.jsonStaticOut = staticDictOut.jsonData
        self.jsonDyOut = dyDictOut.jsonData

        uniqueActors = utils.findUniqueActors(staticDictOut.extractedByml)
        fullUniqueActors = utils.findUniqueActors(dyDictOut.extractedByml, uniqueActors)
        self.jsonActors = json.dumps(fullUniqueActors, indent=2)

    # Generates formatted json data from dictionaries
    def createJSON(self):
        DataJSON = '{"Dynamic":'+self.jsonDyOut+', "Static":'+self.jsonStaticOut+'}'
        return DataJSON


# Load ActorInfo
class actorData:
    def __init__(self):
        self.settings, self.content, self.aoc = getSettings()
        self.ActorInfoText = utils.BymlDecompress(f'{self.settings["GameDump"]}/{self.content}/Actor/ActorInfo.product.sbyml')


# Send data

"""
app = Flask()

@app.route('/sendData')
def sendData():
  return jsonActors


app.run(port=8080)
"""


# Keep this at the bottom of the file! This will print out every variable to be sent to js.

#Separate previous stuff:
#sys.stdout.flush()

#Everything else:
#print(f"!startData{json.dumps(jsonDyOut)[1:-1]}!endData")


# Returns whether or not the user has darkMode enabled
def getDarkMode():
    settings = LoadSettings.LoadSettings()
    darkMode = settings.get('DarkMode')
    return(darkMode)

# Sets darkMode to enabled or disabled depending on whether or not the user has it enabled
def setDarkMode(variant):
    settings = LoadSettings.LoadSettings()
    print(variant)
    if variant == "light":
        darkMode = False
    else:
        darkMode = True
    settings.update({'DarkMode': darkMode})
    WriteSettings.WriteSettings(settings)

def save(dataToSave):
    loadedData = json.loads(dataToSave)
    updatedData = loadedData.update({'Section': currentSection})
    dataToSave = json.dumps(updatedData)
    smubinWriter.writeMapFile(dataToSave)

def main():
    mapFileData = mapFile()
    print(f"!startData{mapFileData.formattedMapJson}!endData")
    sys.stdout.flush()



"""
# Create Window


NewWindow = webview.create_window('Map Editor', "../Editor.html")
def webview_logic(window):
    JSCompatibleActorText = ActorText.replace('\n', '\\n')
    NewWindow.evaluate_js('editor.session.insert(0, "' + JSCompatibleActorText + '")')

def getStuff():
    return jsonActors, jsonStaticOut, JsonDyOut


def exposeFunctions(window):
    testDict = {
    "abc": "123",
    "adfsfasf": "2930482394"
    }
    window.expose(getStuff)
    #NewWindow.evaluate_js('UniqueActors = ' + jsonActors + '; console.log(UniqueActors)')
    #NewWindow.evaluate_js('StaticActors = ' + jsonStaticOut + '; console.log(StaticActors)')
    #NewWindow.evaluate_js('DynamicActors = ' + jsonDyOut + '; console.log(DynamicActors)')
    #NewWindow.evaluate_js('loadActors()')

webview.start(exposeFunctions, NewWindow, gui='cef', debug=True, http_server=True)
"""

#if __name__ == "__main__":
    #print('main')
    #main()
if len(sys.argv) != 2:
    exec(f"{sys.argv[1]}(\"{sys.argv[2]}\")")
else:
    exec(f"{sys.argv[1]}()")
