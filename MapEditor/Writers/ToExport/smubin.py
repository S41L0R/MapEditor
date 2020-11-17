import oead
import pathlib
import Lib.Utils.Util as util
import Loaders.FromSettings.LoadSettings as loadSettings
import yaml

saveDir = util.get_data_dir() / 'savedEdits'

class SafeLoaderIgnoreUnknown(yaml.SafeLoader):
    def ignore_unknown(self, node):
        return None

def findBigEndian():
    settings = loadSettings.LoadSettings()
    platform = settings.get('NX')
    if platform == True:
        return False
    else:
        return True

validMapFileExts = ['smubin', 'mubin']

# Opens and reads a map file; returns a dict containing the map file data.
def readMapFile(fileIn):
    fileName = str(fileIn)
    if util.extCheck(fileName, validMapFileExts) == True:
        readMap = open(pathlib.Path(fileIn), 'rb')
        decompMap = util.checkCompression(readMap)
        extractMap = oead.byml.from_binary(decompMap)
        print(extractMap)
    else:
        print('Invalid map file; Exiting.')
        return

def FindActorText(InputText, ActorHashId):
    # Stuff I need because there are unknown tags
    SafeLoaderIgnoreUnknown.add_constructor(None, SafeLoaderIgnoreUnknown.ignore_unknown)

    actorDict = {}
    print(InputText)
    for actorEntry in InputText:
        actorDict.update(actorEntry)
        if int(actorDict.get('HashId')) == int(ActorHashId):
            print('Found Actor with matching hashID in inputted map file.')
            print(oead.byml.to_text(actorDict))
            return(actorDict)
            actorDict.clear()
        else:
            actorDict.clear()
            continue

def getActors(mapIn):
    openFile = open(pathlib.Path(mapIn), 'rb')
    mapIn = openFile.read()
    decompressed = util.checkCompression(mapIn)
    binOut = oead.byml.from_binary(decompressed)
    return(binOut)
