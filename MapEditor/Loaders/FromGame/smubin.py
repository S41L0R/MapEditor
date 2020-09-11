import oead
import pathlib
import Lib.Utils.Util as Utils
import yaml


class SafeLoaderIgnoreUnknown(yaml.SafeLoader):
    def ignore_unknown(self, node):
        return None



validMapFileExts = ['smubin', 'mubin']

# Opens and reads a map file; returns a dict containing the map file data.
def readMapFile(fileIn):
    fileName = str(fileIn)
    if Utils.extCheck(fileName, validMapFileExts) == True:
        readMap = open(pathlib.Path(fileIn), 'rb')
        decompMap = Utils.checkCompression(readMap)
        extractMap = oead.byml.from_binary(decompMap)
        print(extractMap)
    else:
        print('Invalid map file; Exiting.')
        return

def validateMapFile(fileName):
    if Utils.extCheck(fileName, validMapFileExts) == True:
        return(True)
    else:
        return(False)


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
    decompressed = Utils.checkCompression(mapIn)
    binOut = oead.byml.from_binary(decompressed)
    return(binOut)
