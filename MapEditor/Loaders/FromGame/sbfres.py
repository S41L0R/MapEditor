import os

def cacheModels(modelList, modelPath):
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
