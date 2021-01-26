import os

def cacheModels(modelList, modelPath):
    for i in modelList:
        os.system(f"cd")
        #os.system(f"Lib\\ModelExporter\\ModelExporter.exe '{i}' '../../../Cache/Models/'")
        os.system(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/")
        print(f"MapEditor\\Lib\\ModelExporter\\ModelExporter.exe \"{os.path.join(modelPath, str(i['bfres'])+'.sbfres')}\" Cache/")
        print(os.getcwd())
