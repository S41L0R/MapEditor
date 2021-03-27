import os

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

            print(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/Model/{str(i['bfres'])}/")
            print(os.getcwd())
            print(i["bfres"])
            cachedModels.append(i)
            cachedModelsNum = cachedModelsNum + 1
            print("!startProgressData"+str(cachedModelsNum)+"!endProgressData")
    return(cachedModels)



def cacheMapTex(mapTexList, mapTexPath):
    for i in mapTexList:
        os.system(f"cd")
        #os.system(f"Lib\\ModelExporter\\ModelExporter.exe '{i}' '../../../Cache/MapTex/'")
        if (i != None):
            try:
                os.mkdir(f"Cache/MapTex/")

            except:
                print("Dir already exists, moving on.")

            try:
                os.mkdir(f"Cache/MapTex/{i}/")
            except:
                print("Dir already exists, moving on.")


            if (os.path.exists(os.path.join(mapTexPath, i+'.sbmaptex'))):
                os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(mapTexPath, i+'.sbmaptex')}\" Cache/MapTex/{i}/")
            else:
                print("The following path does not exist:\n"+os.path.join(mapTexPath, i+'.sbmaptex'))

            print(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(mapTexPath, i+'.sbmaptex')}\" Cache/MapTex/{i}/")
            print(os.getcwd())
            print(i)
