# Import general stuff
import Lib.Utils.Util as utils
import pathlib


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



# CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD

# Load map file

import Loaders.FromGame.smubin as smubin
pathStr = (f'{settings["Game Dump Path"]}/content/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Static.smubin')
smubin.validateMapFile(pathlib.Path(f'{settings["Game Dump Path"]}/content/Map/MainField/{settings["TestingMapSection"]}/{settings["TestingMapSection"]}_Static.smubin'))

smubin.validateMapFile(settings["Game Dump Path"] + "/content/Map/MainField/" + settings["TestingMapSection"] + "/" + settings["TestingMapSection"] + "_Dynamic.smubin")

MapSectionStaticText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Map/MainField/" + settings["TestingMapSection"] + "/" + settings["TestingMapSection"] + "_Static.smubin")

MapSectionDynamicText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Map/MainField/" + settings["TestingMapSection"] + "/" + settings["TestingMapSection"] + "_Dynamic.smubin")





# Load ActorInfo

import Loaders.FromGame.actor as actor

ActorInfoText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Actor/ActorInfo.product.sbyml")






#print(actor.FindActorModel(ActorInfoText, "TwnObj_Village_HatenoHouseSet_A_M_01"))


# Find Actor text from map file

useless, MapSectionStaticText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Map/MainField/" + settings["TestingMapSection"] + "/" + settings["TestingMapSection"] + "_Static.smubin")
ActorText = smubin.FindActorText(MapSectionStaticText, "0x1bc97cff")

# Create Window

import webview
NewWindow = webview.create_window('Map Editor', "../../HTML/SelectedActor.html")
def webview_logic(window):
    JSCompatibleActorText = ActorText.replace('\n', '\\n')
    NewWindow.evaluate_js('editor.session.insert(0, "' + JSCompatibleActorText + '")')

webview.start(webview_logic, NewWindow)
