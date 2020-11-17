import oead
import pathlib
import json
import Lib.Utils.Util as util
import Loaders.FromSettings.LoadSettings as loadSettings
import yaml

saveDir = util.get_data_dir() / 'savedEdits'

def findBigEndian():
    settings = loadSettings.LoadSettings()
    platform = settings.get('NX')
    if platform == True:
        return False
    else:
        return True

validMapFileExts = ['smubin', 'mubin']

# Opens and reads a map file; returns a dict containing the map file data.
def writeMapFile(jsonData):
    jsonData = json.loads(jsonData)
    sectionName = jsonData.get('Section')
    staticMapData = jsonData.get('StaticMap')
    dynamicMapData = jsonData.get('DynamicMap')
    filePath = saveDir / sectionName
    with open(pathlib.Path(f'{filePath}/{sectionName}_Static.smubin'), 'wb') as writeStatic:
        writeStatic.write(oead.yaz0.compress(oead.byml.to_binary(staticMapData)))
    with open(pathlib.Path(f'{filePath}/{sectionName}_Dynamic.smubin'), 'wb') as writeDynamic:
        writeDynamic.write(oead.yaz0.compress(oead.byml.to_binary(dynamicMapData)))
    return

