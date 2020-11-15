# Import general stuff
import Lib.Utils.Util as utils
import pathlib
import oead
import json
import blwp
import Loaders.FromGame.smubin as smubin
import Loaders.FromGame.actor as actor
import webview
from flask import Flask
import sys
import json
import os




#Set CWD

if "HTML" in os.getcwd():
    os.chdir("../")



# Load Settings

import Loaders.FromSettings.LoadSettings as LoadSettings
import Writers.ToSettings.WriteSettings as WriteSettings

settings = {
"GameDump": "Test/TestResources",
"TestingMapSection": "C-5",
"NX": False,
"DarkMode": False
}

try:
    settings = LoadSettings.LoadSettings()
except:
    WriteSettings.WriteSettings(settings)
    print("Created and poulated json file.")

if settings.get('NX') == True:
    content = '01007EF00011E000/romfs'
    aoc = '01007EF00011F001/romfs'
else:
    content = 'content'
    aoc = 'aoc'

# Load map file


pathStrStatic = (f'{settings["GameDump"]}/{aoc}/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Static.smubin')
pathStatic = pathlib.Path(pathStrStatic)
pathStrDy = (f'{settings["GameDump"]}/{aoc}/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Dynamic.smubin')
pathDy = pathlib.Path(pathStrDy)
pathStrTeraTree = (f'{settings["GameDump"]}/{aoc}/Map/Mainfield/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_TeraTree.sblwp')
pathTeraTree = pathlib.Path(pathStrTeraTree)

smubin.validateMapFile(pathStatic)
smubin.validateMapFile(pathDy)


# CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD
with open(pathStatic, 'rb') as dataStatic:
    readFileStatic = oead.byml.from_binary(utils.checkCompression(dataStatic.read()))
with open(pathDy, 'rb') as dataDy:
    readFileDy = oead.byml.from_binary(utils.checkCompression(dataDy.read()))

staticDictOut = utils.mapDict(readFileStatic)
dyDictOut = utils.mapDict(readFileDy)
jsonStaticOut = staticDictOut.jsonData
jsonDyOut = dyDictOut.jsonData


uniqueActors = utils.findUniqueActors(staticDictOut.extractedByml)
fullUniqueActors = utils.findUniqueActors(dyDictOut.extractedByml, uniqueActors)
jsonActors = json.dumps(fullUniqueActors, indent=2)
#print(fullUniqueActors)
#print(utils.loadProd(pathTeraTree))
print('\n\n\n\n\n\n')
print(jsonActors)
binActorList = (smubin.getActors(pathStatic)).get('Objs')



# Load ActorInfo

ActorInfoText = utils.BymlDecompress(f'{settings["GameDump"]}/{content}/Actor/ActorInfo.product.sbyml')



# Find Actor text from map file

ActorText = utils.dict_To_Text(smubin.FindActorText(binActorList, "453856506"))



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

def createJSON():
    DataJSON = '{"Dynamic":'+jsonDyOut+', "Static":'+jsonStaticOut+'}'
    return DataJSON





print(f"!startData{createJSON()}!endData")

#print(json.dumps(jsonDyOut)[1:-1])


#print("!startData" + json.dumps(jsonActors) + "!endData")
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
