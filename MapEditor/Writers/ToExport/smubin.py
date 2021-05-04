import oead
import pathlib
import json
import Lib.Utils.Util as util
import Loaders.FromSettings.LoadSettings as loadSettings
import yaml

dataDir = util.get_data_dir()
saveDir = util.findMKDir(f'{dataDir}/savedEdits')

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
    #sectionName = jsonData.get('Section')
    sectionName = 'J-8'
    staticMapData = util.compressByml(dict(jsonData.get('Static'))).compressedData
    dynamicMapData = util.compressByml(dict(jsonData.get('Dynamic'))).compressedData
    bigEndian = findBigEndian()
    filePath = util.findMKDir(f'{saveDir}/{sectionName}')
    #print(staticMapData)
    #print(type(staticMapData))
    with open(pathlib.Path(f'{filePath}/{sectionName}_Static.smubin'), 'wb') as writeStatic:
        writeStatic.write(oead.yaz0.compress(oead.byml.to_binary(oead.byml.from_text(str(staticMapData)), big_endian=False)))
        print('saved Static')
    with open(pathlib.Path(f'{filePath}/{sectionName}_Dynamic.smubin'), 'wb') as writeDynamic:
        #print(oead.byml.from_text(dynamicMapData))
        writeDynamic.write(oead.yaz0.compress(oead.byml.to_binary(oead.byml.from_text(str(dynamicMapData)), big_endian=False)))
        print('saved Dynamic')
    #return
