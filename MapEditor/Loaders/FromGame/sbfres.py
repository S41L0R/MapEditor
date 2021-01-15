import os

def cacheModels(modelList):
    for i in modelList:
        os.system(f"cd")
        #os.system(f"Lib\\ModelExporter\\ModelExporter.exe '{i}' '../../../Cache/Models/'")
        os.system(f"Lib\\ModelExporter\\ModelExporter.exe \"{i}\" ../Cache/")
        print(f"Lib\\ModelExporter\\ModelExporter.exe \"{i}\" ../Cache/")
