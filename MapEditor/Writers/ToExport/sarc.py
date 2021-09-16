import pathlib
import oead
import Lib.Utils.Util as util
import Loaders.FromSettings.LoadSettings as loadSettings

def findBigEndian():
    settings = loadSettings.LoadSettings()
    platform = settings.get('NX')
    if platform == True:
        return False
    else:
        return True

def dirToSarc(dirPath, sarcPath=None):
    endianness = findBigEndian()
    if isinstance(dirPath, pathlib.Path):
        pass
    else:
        dirPath = pathlib.Path(str(dirPath))

    pathList = util.getNestedFilePaths(dirPath)
    sarcFiles = {}

    for path in pathList:
        with open(path, 'rb') as readData:
            sarcName = str(path).replace(str(dirPath.absolute()) + '\\', '')
            print(sarcName)
            sarcFiles[sarcName] = readData.read()

    if sarcPath != None:
        sarcWriter = oead.SarcWriter.from_sarc(sarcPath)
    else:
        sarcWriter = oead.SarcWriter()

    if endianness:
        sarcWriter.set_endianness(oead.Endianness(1))

    sarcWriter.files = sarcFiles
    sarcData = sarcWriter.write()

    return sarcData
