import oead
import pathlib
import Scripts.Utils.Utils as Utils

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