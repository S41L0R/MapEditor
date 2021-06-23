import os
import Lib.Utils.Util as util
import threading
import pathlib

def cacheModels(modelList, modelPath):
    cachedModels = [];
    cachedModelsNum = 0
    for i in modelList:
        os.system(f"cd")
        #os.system(f"Lib\\ModelExporter\\ModelExporter.exe '{i}' '../../../Cache/Models/'")
        if (i['bfres'] != None):
            try:
                os.mkdir(f"Cache/Model/")

            except:
                print("Dir already exists, moving on.")

            try:
                os.mkdir(f"Cache/Model/{str(i['bfres'])}/")
            except:
                print("Dir already exists, moving on.")


            if (os.path.exists(os.path.join(modelPath, str(i['bfres'])+'.sbfres'))):
                os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/Model/{str(i['bfres'])}/")
            elif (os.path.exists(os.path.join(f'Cache\\TitleBG\\Model', str(i['bfres'])+'.sbfres'))):
                os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(f'Cache/TitleBG/Model', str(i['bfres'])+'.sbfres')}\" Cache/Model/{str(i['bfres'])}/")
            else:
                print("The following path does not exist:\n"+os.path.join(f'{modelPath}\\..\\TitleBG\\Model', str(i['bfres'])+'.sbfres'))
                if (os.path.exists(os.path.join(modelPath, str(i['bfres'])+'-00'+'.sbfres'))):
                    print("Trying in case of -00 support...")
                    os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/Model/{str(i['bfres'])}/")

            print(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/Model/{str(i['bfres'])}/")
            print(os.getcwd())
            print(i["bfres"])
            print("!startModelCachedData"+f"Cache/Model/{str(i['bfres'])}/"+"!endModelCachedData", flush=True)
        cachedModels.append(i)
        cachedModelsNum = cachedModelsNum + 1
        print("!startProgressData"+str(cachedModelsNum)+"!endProgressData", flush=True)

    return(cachedModels)



def cacheMapTex(mapTexList, mapTexPath):
    util.findMKDir('Cache/MapTex')
    threadList = []
    def cache(sectionName):
        texPath = pathlib.Path(f'{mapTexPath}/{sectionName}.sbmaptex')
        cachePath = pathlib.Path(f'Cache/MapTex/{sectionName}')
        if (cachePath / f'{sectionName}.png').exists():
            return
        else:
            if (texPath.exists()):
                util.findMKDir(cachePath)
                os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{texPath}\" {cachePath}/")
            else:
                print(f"The following path does not exist:\n{texPath}")
            return

    for i in mapTexList:
        if (i != None):
            texThread = threading.Thread(target=cache, kwargs={'sectionName': i})
            threadList.append(texThread)
    for thread in threadList:
        thread.start()
