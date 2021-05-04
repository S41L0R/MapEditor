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
        if ("." in pathlib.PurePath(checkDir).name):
            checkFile = checkDir
            checkDir = checkDir.parents[0]
            checkDir.mkdir(parents=True, exist_ok=True)
            checkFile.touch()
            return checkFile
        checkDir.mkdir(parents=True, exist_ok=True)
        return checkDir

def checkBymlDataType_and_Type(valIn):
    # Unsigned Integers
    if isinstance(valIn, oead.U8):
        return({"type": 100, "value": oead.byml.get_uint(valIn)})
    elif isinstance(valIn, oead.U16):
        return({"type": 101, "value": oead.byml.get_uint(valIn)})
    elif isinstance(valIn, oead.U32):
        return({"type": 102, "value": oead.byml.get_uint(valIn)})
    elif isinstance(valIn, oead.U64):
        return({"type": 103, "value": oead.byml.get_uint64(valIn)})

    # Signed Integers
    elif isinstance(valIn, oead.S8):
        return({"type": 200, "value": oead.byml.get_int(valIn)})
    elif isinstance(valIn, oead.S16):
        return({"type": 201, "value": oead.byml.get_int(valIn)})
    elif isinstance(valIn, oead.S32):
        return({"type": 202, "value": oead.byml.get_int(valIn)})
    elif isinstance(valIn, oead.S64):
        return({"type": 203, "value": oead.byml.get_int64(valIn)})

    # Floats
    elif isinstance(valIn, oead.F32):
        return({"type": 300, "value": oead.byml.get_float(valIn)})
    elif isinstance(valIn, oead.F64):
        return({"type": 301, "value": oead.byml.get_double(valIn)})

    # Other (Strings and Booleans)
    else:
        try:
            valOut = oead.byml.get_string(valIn)
            return({"type": 400, "value": valOut})
        except:
            try:
                valOut = oead.byml.get_bool(valIn)
                return({"type": 500, "value": valOut})
            except:
                # This is only if the data type cannot be asserted; type 600 maps to unknown
                return({"type": 600, "value": valIn})

def checkBymlDataType(valIn):
    # Unsigned Integers
    if isinstance(valIn, oead.U8):
        return(oead.byml.get_uint(valIn))
    elif isinstance(valIn, oead.U16):
        return(oead.byml.get_uint(valIn))
    elif isinstance(valIn, oead.U32):
        return(oead.byml.get_uint(valIn))
    elif isinstance(valIn, oead.U64):
        return(oead.byml.get_uint64(valIn))

    # Signed Integers
    elif isinstance(valIn, oead.S8):
        return(oead.byml.get_int(valIn))
    elif isinstance(valIn, oead.S16):
        return(oead.byml.get_int(valIn))
    elif isinstance(valIn, oead.S32):
        return(oead.byml.get_int(valIn))
    elif isinstance(valIn, oead.S64):
        return(oead.byml.get_int64(valIn))

    # Floats
    elif isinstance(valIn, oead.F32):
        return(oead.byml.get_float(valIn))
    elif isinstance(valIn, oead.F64):
        return(oead.byml.get_double(valIn))

    # Other (Strings and Booleans)
    else:
        try:
            valOut = oead.byml.get_string(valIn)
            return(valOut)
        except:
            try:
                valOut = oead.byml.get_bool(valIn)
                return(valOut)
            except:
                # This is only if the data type cannot be asserted; type 600 maps to unknown
                return(valIn)

# Completely expands a byml files data returned by oead to a dict
class expandByml:

    def __init__(self, bymlDataIn, unTypedData=False):
        self.dataIn = bymlDataIn
        self.unTypedData = unTypedData
        self.extractedByml = self.updateFullDict(dict(self.dataIn))
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
            if self.unTypedData == True:
                return checkBymlDataType(dictIn)
            else:
                return(checkBymlDataType_and_Type(dictIn))

class compressByml:
    def __init__(self, mapDictIn):
        self.compressedData = self.compressAll(mapDictIn)

    def compressAll(self, dictIn):
        subList = []
        subDict = {}
        dictOut = {}
        if isinstance(dictIn, dict):
            if 'type' in dictIn.keys() and 'value' in dictIn.keys():
                #print('type conversion')
                return(self.convertDataType(dictIn))
            else:

                for key in dictIn.keys():
                    #print(f'dictType {key}')
                    if key == 'Rails':
                        subDict = subDict
                        dictOut.update({key: subDict})
                    else:
                        subDict = self.compressAll(dictIn.get(key))
                        #print(subDict)
                        dictOut.update({key: subDict})
                        #print(dictOut)

                return((dictOut))

        elif isinstance(dictIn, list):
            for item in dictIn:
                #print(f'listType {dictIn}')
                newItem = self.compressAll(item)
                subList.append(newItem)
                #print(f'subList {subList}')

            return((subList))
        else:
            print('Was not a list or dict', dictIn)
            return(dictIn)

    def convertDataType(self, dataIn: dict):
        dataType = dataIn['type']
        dataVal = dataIn['value']
        mainType = int(str(dataType)[0])
        subType = int(str(dataType)[-1])
        if mainType == 1:
            dataVal = int(dataVal)
            if subType == 0:
                # Handle U8
                valOut = oead.U8(dataVal)
            elif subType == 1:
                # Handle U16
                valOut = oead.U16(dataVal)
            elif subType == 2:
                # Handle U32
                valOut = oead.U32(dataVal)
            elif subType == 3:
                # Handle U64
                valOut = oead.U64(dataVal)
            else:
                # Raise error about invalid subType
                print('Error')
                return
        elif mainType == 2:
            dataVal = int(dataVal)
            if subType == 0:
                # Handle S8
                valOut = oead.S8(dataVal)
            elif subType == 1:
                # Handle S16
                valOut = oead.S16(dataVal)
            elif subType == 2:
                # Handle S32
                valOut = oead.S32(dataVal)
            elif subType == 3:
                # Handle S64
                valOut = oead.S64(dataVal)
            else:
                # Raise error about invalid subType
                print('Error')
                return
        elif mainType == 3:
            dataVal = float(dataVal)
            if subType == 0:
                # Handle F32
                valOut = oead.F32(dataVal)
            elif subType == 1:
                # Handle F64
                valOut = oead.F64(dataVal)
            else:
                print('Error')
        elif mainType == 4:
            dataVal = str(dataVal)
            if subType == 0:
                # Handle Strings
                valOut = str(dataVal)
            else:
                print('Error')
        elif mainType == 5:
            dataVal = bool(dataVal)
            if subType == 0:
                # Handle Bools
                valOut = bool(dataVal)
            else:
                print('Error')
        elif mainType == 6:
            if subType == 0:
                # Handle Unkown data types
                valOut = dataVal
            else:
                print('Error')
        else:
            # Throw Error about unassociated data-type or invalid arg
            print('Error...')
        return(dataVal)
        return(dataVal)

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
