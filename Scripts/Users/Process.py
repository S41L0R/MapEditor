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
    WriteSettings(settings)
    print("Created and poulated yml file.")



# CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD

# Load Actor
import MapEditor.Scripts.Loaders.FromGame.actor as actor

utils.BymlDecompress(settings["Game Dump Path"] + "/content/Actor/ActorInfo.product.sbyml")
actor.FindActorModel("TwnObj_Village_Hateno_A")
