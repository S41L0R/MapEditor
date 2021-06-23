import pathlib
import os
import Lib.Utils.Util as util
import json

class Project:
    def __init__(self, projectName):
        self.projects, self.projectDB = getProjects_and_DB()
        self.projectName = projectName
        self.projectsDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
        self.existence = self.checkProject_Exists()

    def checkProject_Exists(self):
        if self.projectName in self.projects:
            return True
        else:
            return False

    def create(self):
        if self.projectName in self.projects:
            return
        else:
            projectDir = util.findMKDir(self.projectsDir / self.projectName)
            self.projectDB[self.projectName] = str(projectDir.absolute())
            updateProjectDB(self.projectsDir / 'projectDB.json', self.projectDB)
            self.projects, self.projectDB = getProjects_and_DB()

    def getProject(self):
        if (self.checkProject_Exists()) == True:
            return(self.projectDB[self.projectName])
        else:
            print('Project did not exist, please create it first.')
            return

    def deleteProject(self):
        with open(self.projectsDir / 'projectDB.json', 'wt') as writeDB:
            self.projectDB.pop(self.projectName)
            writeDB.write(json.dumps(self.projectDB, indent=2))
        os.system(f'rm -rf {self.projectsDir / self.projectName}')
        self.projects, self.projectDB = getProjects_and_DB()
        return

# Returns JUST a list of the project names
def getProjects():
    projects = []
    projectsDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    with open(f'{projectsDir}/projectDB.json', 'rt') as readDB:
        projectDB = json.loads(readDB.read())
    for project in projectDB.keys():
        projects.append(project)
    return(projects)

# Returns the entire database along with the project list
def getProjects_and_DB():
    projects = []
    projectsDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    with open(f'{projectsDir}/projectDB.json', 'rt') as readDB:
        projectDB = json.loads(readDB.read())
    for project in projectDB.keys():
        projects.append(project)
    return(projects, projectDB)

def initProjectsDir():
    projectsDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    projectDB = pathlib.Path(projectsDir / 'projectDB.json')
    if projectDB.exists():
        pass
    else:
        with open(projectDB, 'wt') as writeDB:
            writeDB.write(json.dumps({}, indent=2))
    return

def updateProjectDB(DBPath: pathlib.Path, projectDB):
    with open(DBPath, 'wt') as writeDB:
        writeDB.write(json.dumps(projectDB, indent=2))

def clearDB_and_projectDir():
    projectsDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    os.system(f'rm -rf {projectsDir}')

def getCurrentProject() -> str:
    projectDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    with open(projectDir / 'CurrentProject.txt', 'rt') as readProjectName:
        projectName = str(readProjectName.read())
    return(projectName)

def setCurrentProject(projectName: str):
    projectDir = util.findMKDir(pathlib.Path(f'{util.get_data_dir()}/Projects'))
    with open(projectDir / 'CurrentProject.txt', 'wt') as writeProjectName:
        writeProjectName.write(str(projectName))
    return


initProjectsDir()