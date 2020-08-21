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
