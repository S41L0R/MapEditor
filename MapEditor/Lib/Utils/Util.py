# Import stuff
import oead
import json
import pathlib
import os
from platform import system
import yaml
import blwp
import clr
"""
exporterPath = pathlib.Path('../ModelExporters')
clr.AddReference('..ModelExporter.ModelExporter')
from ModelExporter import ModelExporter
"""

# Decompress bymls.
def BymlDecompress(Path):
    with open(Path, 'rb') as InputFile:
        ReadInputFile = InputFile.read()
        DeYaz0 = checkCompression(ReadInputFile)
        DeBYML = oead.byml.from_binary(DeYaz0)
        output = oead.byml.to_text(DeBYML)
        return(output)

# convert oead dict objects to text
def dict_To_Text(dictIn):
    oead.byml.to_text(dictIn)

# A function for checking if a file is yaz0 compressed and then determining whether or not to decompress it based off of that
def checkCompression(fileCheck):
    fileInRead = fileCheck
    if (oead.yaz0.get_header(fileInRead) is not None):
        uncompressedFile = oead.yaz0.decompress(fileInRead)
    else:
        uncompressedFile = fileInRead
    return(uncompressedFile)

# Compares a file extension with a list of valid file extensions to make sure inputted file is the correct file type; Returns a bool
def extCheck(fileName, extList):
    fileExt = str(fileName).split('.')[-1]
    if fileExt in extList:
        return(True)
    else:
        return(False)


def navToObj():
    with open(fileToOpen, "r") as f:
        d = json.load(f)

    vertices = d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["vertices"]
    edges = [
        (edge["a"] + 1, edge["b"] + 1)
        for edge in d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["edges"]
    ]
    faces = d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["faces"]

    data = []
    for vtx in vertices:
        data.append(f'v {" ".join([str(f) for f in vtx])}')

    for face in faces:
        idxs = list(
            dict.fromkeys(
                [
                    x
                    for y in edges[
                        face["startEdgeIndex"] : face["startEdgeIndex"]
                        + face["numEdges"]
                    ]
                    for x in y
                ]
            )
        )
        data.append(f'f {" ".join([str(i) for i in idxs])}')

    with open(fileToOpen + ".obj", "w") as f:
        f.write("\n".join(data))

# Obtain the system's local directory to determine where data should be stored
def get_data_dir():
    if system() == "Windows":
        data_dir = pathlib.Path(os.path.expandvars("%LOCALAPPDATA%")) / "MapEditor"
    else:
        data_dir = pathlib.Path.home() / ".config" / "MapEditor"
    if not data_dir.exists():
        data_dir.mkdir(parents=True, exist_ok=True)
    return(data_dir)

# Checks if a directory exists and makes it if not
def findMKDir(checkDir):
    if isinstance(checkDir, pathlib.Path):
        checkDir = checkDir
    else:
        try:
            checkDir = pathlib.Path(checkDir)
        except:
            print('Failed to make the pathlib instance :(')
            return
    if checkDir.exists():
        return checkDir
    else:
        checkDir.mkdir(parents=True, exist_ok=True)
        return checkDir

def checkBymlDataType(valIn):
    if isinstance(valIn, oead.U8) or isinstance(valIn, oead.U16) or isinstance(valIn, oead.U32):
        return(oead.byml.get_uint(valIn))
    elif isinstance(valIn, oead.U64):
        return(oead.byml.get_uint64(valIn))
    elif isinstance(valIn, oead.S8) or isinstance(valIn, oead.S16) or isinstance(valIn, oead.S32):
        return(oead.byml.get_int(valIn))
    elif isinstance(valIn, oead.S64):
        return(oead.byml.get_int64(valIn))
    elif isinstance(valIn, oead.F32):
        return(oead.byml.get_float(valIn))
    elif isinstance(valIn, oead.F64):
        return(oead.byml.get_double(valIn))
    else:
        try:
            valOut = oead.byml.get_string(valIn)
            return(valOut)
        except:
            try:
                valOut = oead.byml.get_bool(valIn)
                return(valOut)
            except:
                return(valIn)
    
# Completely expands a byml files data returned by oead to a dict
class mapDict:

    def __init__(self, mapIn):
        self.mapIn = mapIn
        self.extractedByml = self.updateFullDict(dict(self.mapIn))
        self.jsonData = json.dumps(self.extractedByml, indent=2)
    
    def updateFullDict(self, dictIn):
        subList = []
        subDict = {}
        dictOut = {}
        if isinstance(dictIn, oead.byml.Hash) or isinstance(dictIn, dict):
            for key in dict(dictIn).keys():
                subDict = self.updateFullDict(dict(dictIn).get(key))
                dictOut.update({key: subDict})
            return(dict(dictOut))

        elif isinstance(dictIn, oead.byml.Array) or isinstance(dictIn, list):
            for item in list(dictIn):
                newItem = self.updateFullDict(item)
                subList.append(newItem)
            return(list(subList))
        else:
            return(checkBymlDataType(dictIn))

class compressMap:
    def __init__(self, mapDictIn):
        self.compressedData = self.compressAll(mapDictIn)

    def compressAll(self, dictIn):
        subList = []
        subDict = {}
        dictOut = {}
        if isinstance(dictIn, dict):
            for key in dict(dictIn).keys():
                subDict = self.compressAll(dict(dictIn).get(key))
                dictOut.update({key: subDict})
            return(oead.byml.Hash(dictOut))

        elif isinstance(dictIn, list):
            for item in list(dictIn):
                newItem = self.compressAll(item)
                subList.append(newItem)
            return(oead.byml.Array(subList))
        else:
            return(dictIn)

def findUniqueActors(mapDataIn, listIn=list([])):
    for actor in mapDataIn.get('Objs'):
        actorName = actor.get('UnitConfigName')
        if actorName in listIn:
            continue
        else:
            listIn.append(actorName)
            continue
    return(listIn)

def loadProd(filePathIn):
    if str(filePathIn).split('.')[-1] == 'sblwp' or str(filePathIn).split('.')[-1] == '.blwp':
        dataOut = blwp.prod.decoder(filePathIn)
        return(dataOut)
    else:
        return
"""    
def bfresToDAE(bfresName):
    #ModelExporter('e')
    print('bfres To DAE called')
"""