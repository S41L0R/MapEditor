import os

def cacheModels(modelList, modelPath):
    for i in modelList:
        os.system(f"cd")
        #os.system(f"Lib\\ModelExporter\\ModelExporter.exe '{i}' '../../../Cache/Models/'")
        if (i['bfres'] != None):
            try:
                os.mkdir(f"Cache/{str(i['bfres'])}/")
            except:
                print("Dir already exists, moving on.")
            os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/{str(i['bfres'])}/")
            print(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/{str(i['bfres'])}/")
            print(os.getcwd())
            print(i["bfres"])
