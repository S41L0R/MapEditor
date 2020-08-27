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


def FindActorText(InputText, ActorHashId):
    # Stuff I need because there are unknown tags
    SafeLoaderIgnoreUnknown.add_constructor(None, SafeLoaderIgnoreUnknown.ignore_unknown)

    # Parse then print for debugging
    #InputDict = yaml.load(InputText, Loader = SafeLoaderIgnoreUnknown)
    InputDict = InputText
    print(InputText)
    SearchingMapFile = True
    i = 0
    while SearchingMapFile == True:
        try:
            if InputDict["Objs"][i]["HashId"] == ActorHashId:
                print("yay")
                SearchingMapFile = False
            else:
                i += 1
        except:
            print("Did not find the actor name in map file.")
#            print(oead.byml.to_text(InputDict["Objs"][i]))
#            print(InputDict["Objs"][i]["HashId"])
            return("Did not find the actor name in map file.")
            SearchingMapFile = False
    return(oead.byml.to_text(InputDict["Objs"][i]))
    #print(yaml.dump(InputDict["Objs"][i]))
    #return(yaml.dump(InputDict["Objs"][i]))
