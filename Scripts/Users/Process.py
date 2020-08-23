# Add directory to sys.path
import sys
sys.path.append('../../../')


# Import general stuff
import MapEditor.Scripts.Utils.Utils as utils


# Load Settings

import MapEditor.Scripts.Loaders.FromSettings.LoadSettings as LoadSettings
import MapEditor.Scripts.Writers.ToSettings.WriteSettings as WriteSettings

settings = {
"Game Dump Path": "oranges",
"Setting2": "2"
}

try:
    settings = LoadSettings.LoadSettings()
except:
    WriteSettings.WriteSettings(settings)
    print("Created and poulated yml file.")



# CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD

# Load Actor

import MapEditor.Scripts.Loaders.FromGame.actor as actor

ActorInfoText = utils.BymlDecompress(settings["Game Dump Path"] + "/content/Actor/ActorInfo.product.sbyml")
print(actor.FindActorModel(ActorInfoText, "TwnObj_Village_HatenoHouseSet_A_M_01"))

# Create Window

import webview
webview.create_window('Map Editor', "../../HTML/UI.html")
webview.start()
