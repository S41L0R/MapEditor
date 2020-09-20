# Import general stuff
import Lib.Utils.Util as utils
import pathlib
import oead
import json
import blwp
import Loaders.FromGame.smubin as smubin
import Loaders.FromGame.actor as actor
import webview

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
    print("Created and poulated yml file.")

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
    dataStatic.close()
with open(pathDy, 'rb') as dataDy:
    readFileDy = oead.byml.from_binary(utils.checkCompression(dataDy.read()))
    dataDy.close()

staticDictOut = utils.mapDict(readFileStatic)
dyDictOut = utils.mapDict(readFileDy)
jsonStaticOut = json.dumps(staticDictOut.extractedByml, indent=2)
jsonDyOut = json.dumps(dyDictOut.extractedByml, indent=2)


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

# Create Window


NewWindow = webview.create_window('Map Editor', "../Editor.html")
def webview_logic(window):
    JSCompatibleActorText = ActorText.replace('\n', '\\n')
    NewWindow.evaluate_js('editor.session.insert(0, "' + JSCompatibleActorText + '")')

def send_stuff(window):
    testDict = {
    "abc": "123",
    "adfsfasf": "2930482394"
    }

    NewWindow.evaluate_js('FullData = ' + jsonActors + '; console.log(FullData)')

webview.start(send_stuff, NewWindow, gui='cef', debug=True, http_server=True)
