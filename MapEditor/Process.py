# Import general stuff

import pathlib
import oead
import json
import blwp
import webview
from flask import Flask
import sys
import json
import os

# Local libraries
import Loaders.FromSettings.LoadSettings as LoadSettings
import Writers.ToSettings.WriteSettings as WriteSettings
import Loaders.FromGame.smubin as smubinLoader
import Loaders.FromGame.actor as actor
import Writers.ToExport.smubin as smubinWriter
import Lib.Utils.Util as utils
import Loaders.FromGame.sbfres as sbfres
import Loaders.FromGame.actorinfo as ActorInfo
import Loaders.FromGame.sarc as sarc
import Lib.Utils.ProjectHandler as projectHandling
from Writers.ToCache.actorinfo import cacheActorInfo

#Set CWD

if "HTML" in os.getcwd():
    os.chdir("../")

currentSection = ''

# Load Settings
def getSettings():
    defaultSettings = {
        "GameDump": "Test/TestResources",
        "NX": False,
        "DarkMode": False,
        "LoadModels": True,
        "TestingMapSection": "J-8",
        "SetupPy": {
            "HasRun": False,
            "Version": None
        },
        "SettingsMenuOrganization": {
            "Graphics": [
                "DarkMode",
                "LoadModels"
            ],
            "Operation": [
                "GameDump",
                "NX"
            ]
        }
    }

    def checkSettings():
        try:
            settings = LoadSettings.LoadSettings()
            return(settings)
        except:
            WriteSettings.WriteSettings(defaultSettings)
            print("Created and poulated json file.")
            checkSettings()

            settings = LoadSettings.LoadSettings()
            return(settings)


    settings = checkSettings()
    if settings.get('NX') == True:
        content = '01007EF00011E000/romfs'
        aoc = '01007EF00011F001/romfs'
    else:
        content = 'content'
        aoc = 'content'
    return(settings, content, aoc)

# Formats settings to be shared with the js end of things
def shareSettings(setting):
    settings, content, aoc = getSettings()
    if (setting == "All" or setting == None):
        pass
    else:
        settings = settings.get(setting)
    jsonSettings = json.dumps(settings)
    print(f'!startData{jsonSettings}!endData')

# To set settings:
def setSettings(newSettings):
    #raise NameError(newSettings)
    WriteSettings.WriteSettings(json.loads(newSettings.replace("'", '"') ))
    print("Created and poulated json file.")


# this exists so js can not be stupid
def getCurrentSection():
    print(f'!startData{json.dumps(currentSection)}!endData')
    return

# Creates a project and returns its path
def createProject(projectName):
    project = projectHandling.Project(projectName)
    project.create()
    return(project.getProject())

# returns a project path
def openProject(projectName):
    global currentProject
    project = projectHandling.Project(projectName)
    print(project.getProject())
    currentProject = project.getProject()
    return(project.getProject())

# Deletes a project and removes it from the datbase
def deleteProject(projectName):
    project = projectHandling.Project(projectName)
    project.deleteProject()
    return

# Clears all projects and empties the project database; ONLY USE IF YOU WANT TO DELETE EVERYTHING
def clearProjects():
    projectHandling.clearDB_and_projectDir()
    return

# Load map file
class mapFile:
    def __init__(self):
        self.settings, self.content, self.aoc = getSettings()

        pathStrStatic = (f'{self.settings["GameDump"]}/{self.aoc}/Map/MainField/{currentSection}/{currentSection}_Static.smubin')
        pathStrDy = (f'{self.settings["GameDump"]}/{self.aoc}/Map/MainField/{currentSection}/{currentSection}_Dynamic.smubin')
        pathStrTeraTree = (f'{self.settings["GameDump"]}/{self.aoc}/Map/Mainfield/{currentSection}/{currentSection}_TeraTree.sblwp')

        self.pathStatic = pathlib.Path(pathStrStatic)
        self.pathDy = pathlib.Path(pathStrDy)
        self.pathTeraTree = pathlib.Path(pathStrTeraTree)

        smubinLoader.validateMapFile(self.pathStatic)
        smubinLoader.validateMapFile(self.pathDy)
        self.loadMapActors()
        self.formattedMapJson = self.createJSON()

    # CREATE CODE HERE: FROM MAP FILES FIND ACTORS TO LOAD
    def loadMapActors(self):
        with open(self.pathStatic, 'rb') as dataStatic:
            readFileStatic = oead.byml.from_binary(utils.checkCompression(dataStatic.read()))
        with open(self.pathDy, 'rb') as dataDy:
            readFileDy = oead.byml.from_binary(utils.checkCompression(dataDy.read()))

        self.staticDictOut = utils.expandByml(readFileStatic)
        self.dyDictOut = utils.expandByml(readFileDy)
        staticDictOut = self.staticDictOut
        dyDictOut = self.dyDictOut
        self.jsonStaticOut = staticDictOut.jsonData
        self.jsonDyOut = dyDictOut.jsonData
        uniqueActors = utils.findUniqueActors(staticDictOut.extractedByml)
        self.fullUniqueActors = utils.findUniqueActors(dyDictOut.extractedByml, uniqueActors)
        self.jsonActors = json.dumps(self.fullUniqueActors, indent=2)

    # Generates formatted json data from dictionaries
    def createJSON(self):
        DataJSON = {}
        DataJSON.update({"Dynamic": self.dyDictOut.extractedByml, "Static": self.staticDictOut.extractedByml})
        jsonData = json.dumps(DataJSON)
        return jsonData





def oldCacheModels(modelList, cachedModels):

    #modelList = list(set(modelList)^set(cachedModels))
    #print(modelList)

    #sbfresTex1.cacheTextures(modelList)

    actorinfo = ActorInfo.actorData()

    for i in modelList[:]:
      if i in cachedModels:
          modelList.remove(i)
    #sbfres.cacheModels(modelList)




def cacheModels(sectionData):
    try:
        open("Cache/CachedModels.json", "x")
    except:
        #File already exists.
        #Just some useless code so something happens:
        print()
    with open("Cache/CachedModels.json", "r") as cachedModelsJSONFile:
        try:
            cachedModels = json.load(cachedModelsJSONFile)
        except:
            #File is empty
            #Lets initialize cachedModels anyway:
            cachedModels = []
    #modelList = list(set(modelList)^set(cachedModels))
    #print(modelList)
    settings, content, aoc = getSettings()

    sarc.sarc_extract(f'{settings["GameDump"]}/{content}/Pack/TitleBG.pack', 'Cache/TitleBG')


    actorinfoPath = f'{settings["GameDump"]}/{content}/Actor/ActorInfo.product.sbyml'
    #sbfresTex1.cacheTextures(modelList)
    actorinfoCache = cacheActorInfo(actorinfoPath)
    with open(actorinfoCache, 'rt') as readActorCache:
        actorModelData = json.loads(readActorCache.read())
    modelList = []
    for i in sectionData.fullUniqueActors:
      if (i['value'] == "Animal_Cow_A"):
          print(i['value'])
      if actorModelData.get(i['value']) not in cachedModels:
          modelList.append(actorModelData[i['value']])
          print(actorModelData[i['value']])
      else:
          continue
    print("!startProgressDataTotal"+str(len(modelList))+"!endProgressDataTotal")
    cachedModels = cachedModels + sbfres.cacheModels(modelList, f'{settings["GameDump"]}/{content}/Model')

    cachedModelsJSON = json.dumps(cachedModels, indent=2)

    with open("Cache/CachedModels.json", "w") as cachedModelsJSONFile:
        cachedModelsJSONFile.write(cachedModelsJSON)

    print(modelList)


def cacheMapTex():
    settings, content, aoc = getSettings()
    optionalMapTexList = ["MapTex_A-0", "MapTex_A-9", "MapTex_B-0", "MapTex_B-9", "MapTex_C-0", "MapTex_C-9", "MapTex_D-0", "MapTex_D-9", "MapTex_E-0", "MapTex_E-9", "MapTex_F-0", "MapTex_F-9", "MapTex_G-0", "MapTex_G-9", "MapTex_H-0", "MapTex_H-9", "MapTex_I-0", "MapTex_I-9", "MapTex_J-0", "MapTex_J-9", "MapTex_K-0", "MapTex_K-1", "MapTex_K-2", "MapTex_K-3", "MapTex_K-4", "MapTex_K-5", "MapTex_K-6", "MapTex_K-7", "MapTex_K-8", "MapTex_K-9", "MapTex_Z-0", "MapTex_Z-1", "MapTex_Z-2", "MapTex_Z-3", "MapTex_Z-4", "MapTex_Z-5", "MapTex_Z-6", "MapTex_Z-7", "MapTex_Z-8", "MapTex_Z-9"]
    mapTexList = ["MapTex_A-1", "MapTex_A-2", "MapTex_A-3", "MapTex_A-4", "MapTex_A-5", "MapTex_A-6", "MapTex_A-7", "MapTex_A-8", "MapTex_B-1", "MapTex_B-2", "MapTex_B-3", "MapTex_B-4", "MapTex_B-5", "MapTex_B-6", "MapTex_B-7", "MapTex_B-8", "MapTex_C-1", "MapTex_C-2", "MapTex_C-3", "MapTex_C-4", "MapTex_C-5", "MapTex_C-6", "MapTex_C-7", "MapTex_C-8", "MapTex_D-1", "MapTex_D-2", "MapTex_D-3", "MapTex_D-4", "MapTex_D-5", "MapTex_D-6", "MapTex_D-7", "MapTex_D-8", "MapTex_E-1", "MapTex_E-2", "MapTex_E-3", "MapTex_E-4", "MapTex_E-5", "MapTex_E-6", "MapTex_E-7", "MapTex_E-8", "MapTex_F-1", "MapTex_F-2", "MapTex_F-3", "MapTex_F-4", "MapTex_F-5", "MapTex_F-6", "MapTex_F-7", "MapTex_F-8", "MapTex_G-1", "MapTex_G-2", "MapTex_G-3", "MapTex_G-4", "MapTex_G-5", "MapTex_G-6", "MapTex_G-7", "MapTex_G-8", "MapTex_H-1", "MapTex_H-2", "MapTex_H-3", "MapTex_H-4", "MapTex_H-5", "MapTex_H-6", "MapTex_H-7", "MapTex_H-8", "MapTex_I-1", "MapTex_I-2", "MapTex_I-3", "MapTex_I-4", "MapTex_I-5", "MapTex_I-6", "MapTex_I-7", "MapTex_I-8", "MapTex_J-1", "MapTex_J-2", "MapTex_J-3", "MapTex_J-4", "MapTex_J-5", "MapTex_J-6", "MapTex_J-7", "MapTex_J-8"]
    mapTexList.extend(optionalMapTexList)
    sbfres.cacheMapTex(mapTexList, f'{settings["GameDump"]}/{content}/UI/MapTex/MainField')


def getActorModelPaths(sectionName):
    global currentSection
    currentSection = sectionName

    mapFileData = mapFile()
    fullUniqueActors = mapFileData.fullUniqueActors

    settings, content, aoc = getSettings()
    actorinfoPath = f'{settings["GameDump"]}/{content}/Actor/ActorInfo.product.sbyml'
    actorinfoCache = cacheActorInfo(actorinfoPath)
    with open(actorinfoCache, 'rt') as readActorCache:
        actorModelData = json.loads(readActorCache.read())

    outputDict = {}
    #print(actorModelData)

    for i in fullUniqueActors:
        print(i)
        print(actorModelData[i['value']])
        if actorModelData[i['value']]['bfres'] != None:
            outputDict[i["value"]] = f'Cache/Model/{actorModelData[i["value"]]["bfres"]}/{actorModelData[i["value"]]["mainmodel"]}.dae'
        else:
            continue




    #for i in actorModelData:
        #print(i)
        #outputDict[i] = f'Cache/Model/{actorModelData[i]["bfres"]}/{actorModelData[i]["mainmodel"]}.dae'
    print("!startData"+json.dumps(outputDict)+"!endData")
    sys.stdout.flush()


def newGetActorModelPaths(sectionName):
    global currentSection
    currentSection = sectionName

    mapFileData = mapFile()
    fullUniqueActors = mapFileData.fullUniqueActors

    settings, content, aoc = getSettings()
    actorinfoPath = f'{settings["GameDump"]}/{content}/Actor/ActorInfo.product.sbyml'
    actorinfoCache = cacheActorInfo(actorinfoPath)
    with open(actorinfoCache, 'rt') as readActorCache:
        actorModelData = json.loads(readActorCache.read())

    outputDict = {}
    print(actorModelData)

    for i in fullUniqueActors:
        print(i)
        print(actorModelData[i['value']])
        outputDict[i["value"]] = f'Cache/Model/{actorModelData[i["value"]]["bfres"]}/{actorModelData[i["value"]]["mainmodel"]}.dae'
        #
        #    "path": f'Cache/Model/{actorModelData[i["value"]]["bfres"]}/{actorModelData[i["value"]]["mainmodel"]}.dae',
        #    "name": i["value"]
        #}



    #for i in actorModelData:
        #print(i)
        #outputDict[i] = f'Cache/Model/{actorModelData[i]["bfres"]}/{actorModelData[i]["mainmodel"]}.dae'
    print("!startData"+json.dumps(outputDict)+"!endData")
    sys.stdout.flush()



def getActorModelPath(actorName, sectionName):
    global currentSection
    currentSection = sectionName

    mapFileData = mapFile()

    fullUniqueActors = mapFileData.fullUniqueActors

    settings, content, aoc = getSettings()
    actorinfoPath = f'{settings["GameDump"]}/{content}/Actor/ActorInfo.product.sbyml'
    actorinfoCache = cacheActorInfo(actorinfoPath)
    with open(actorinfoCache, 'rt') as readActorCache:
        actorModelData = json.loads(readActorCache.read())

    print("!startData"+f'Cache/Model/{actorModelData[actorName]["bfres"]}/{actorModelData[actorName]["mainmodel"]}.dae'+"!endData")


    sys.stdout.flush()



def getFullUniqueActors(sectionName):
    global currentSection
    currentSection = sectionName

    mapFileData = mapFile()
    fullUniqueActors = mapFileData.fullUniqueActors

    print(f"!startData{json.dumps(fullUniqueActors)}!endData")

def TESTRunCacheModels():
    cacheModels(["C:/Cemu/GamesMAPEDITING/[USA] The Legend of Zelda Breath of the Wild/content/Model/Animal_Bass.sbfres"])


def showActorInfo():
    actorinfo = ActorInfo.actorData()
    with open('./actorinfo.json', 'wt') as writeActorInfo_Test:
        writeActorInfo_Test.write(utils.expandByml(actorinfo.ActorInfo).jsonData)

# Returns whether or not the user has darkMode enabled
def getDarkMode():
    settings = LoadSettings.LoadSettings()
    darkMode = settings.get('DarkMode')
    print("!startData"+str(json.dumps(darkMode))+"!endData")
    return(darkMode)

# Sets darkMode to enabled or disabled depending on whether or not the user has it enabled
def setDarkMode(variant):
    settings = LoadSettings.LoadSettings()
    print(variant)
    if variant == "light":
        darkMode = False
    else:
        darkMode = True
    settings.update({'DarkMode': darkMode})
    WriteSettings.WriteSettings(settings)

def save(sectionPath):
    currentProject = 'TestA'
    with open(sectionPath, 'rt') as readSectionJSON:
        dataToSave = readSectionJSON.read()
        #print(dataToSave)
    loadedData = json.loads(dataToSave)
    print(f'currentSection: {currentSection}')
    loadedData.update({'Section': currentSection})
    smubinWriter.writeMapFile(loadedData, currentProject)
    print('File saved successfully! :)')
    return

def checkSetupPy():
    with open('./version.txt', 'rt') as readVer:
        version = readVer.read()
    settings, content, aoc = getSettings()
    status = {}
    if settings.get('SetupPy') != None:
        if settings['SetupPy']['HasRun'] == True and str(settings['SetupPy']['Version']) == str(version):
            print('Version Match')
            status.update({'NeedsRestart': False})
        else:
            status.update({'NeedsRestart': True})
            settings.update({'SetupPy': {'HasRun': True, 'Version': version}})
            setSettings(json.dumps(settings))
    else:
        status.update({'NeedsRestart': True})
        settings.update({'SetupPy': {'HasRun': True, 'Version': version}})
        setSettings(json.dumps(settings))
    print(f"!startData{json.dumps(status)}!endData")

def main(sectionName):
    global currentSection
    utils.findMKDir('./Cache')
    currentSection = sectionName
    mapFileData = mapFile()
    print(f"!startData{mapFileData.formattedMapJson}!endData")
    #save(mapFileData.formattedMapJson)
    sys.stdout.flush()
    cacheModels(mapFileData)
    cacheMapTex()

if len(sys.argv) != 2:
    exec(f"{sys.argv[1]}(\"{sys.argv[2]}\")")
else:
    exec(f"{sys.argv[1]}()")
