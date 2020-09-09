# Import general stuff
import Lib.Utils.Util as utils
import pathlib
import oead


# Load Settings

import Loaders.FromSettings.LoadSettings as LoadSettings
import Writers.ToSettings.WriteSettings as WriteSettings

settings = {
"Game Dump Path": "Test/TestResources",
"TestingMapSection": "C-5"
}

try:
    settings = LoadSettings.LoadSettings()
except:
    WriteSettings.WriteSettings(settings)
    print("Created and poulated yml file.")





# Load map file

import Loaders.FromGame.smubin as smubin
pathStrStatic = (f'{settings["Game Dump Path"]}/content/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Static.smubin')
pathStatic = pathlib.Path(pathStrStatic)
pathStrDy = (f'{settings["Game Dump Path"]}/content/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Dynamic.smubin')
pathDy = pathlib.Path(pathStrDy)

smubin.validateMapFile(pathStatic)
smubin.validateMapFile(pathDy)

MapSectionStaticText = utils.dict_To_Text(utils.BymlDecompress(pathStatic))
MapSectionDynamicText = utils.dict_To_Text(utils.BymlDecompress(pathDy))

# CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD
actorList = oead.byml.to_text((smubin.getActors(pathStatic)).get('Objs'))
binActorList = (smubin.getActors(pathStatic)).get('Objs')
railList = oead.byml.to_text((smubin.getActors(pathStatic)).get('Rails'))
binRailList = (smubin.getActors(pathStatic)).get('Rails')



# Load ActorInfo

import Loaders.FromGame.actor as actor

ActorInfoText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Actor/ActorInfo.product.sbyml")





#print(actor.FindActorModel(ActorInfoText, "TwnObj_Village_HatenoHouseSet_A_M_01"))


# Find Actor text from map file

ActorText = utils.dict_To_Text(smubin.FindActorText(binActorList, "453856506"))

# Create Window







import webview
NewWindow = webview.create_window('Map Editor', "../Editor.html")
def webview_logic(window):
    JSCompatibleActorText = ActorText.replace('\n', '\\n')
    NewWindow.evaluate_js('editor.session.insert(0, "' + JSCompatibleActorText + '")')

def send_stuff(window):
    testDict = {
    "abc": "123",
    "adfsfasf": "2930482394"
    }

    NewWindow.evaluate_js('testDict = ' + testDict + '; console.log(testDict)')

webview.start("send_stuff", NewWindow, gui='edge')
