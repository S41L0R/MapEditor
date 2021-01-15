import pathlib
import clr
exporterPath = pathlib.Path('../ModelExporter/ModelExporter.exe')
print(exporterPath.resolve())
clr.AddReference(str(exporterPath.resolve()))
from ModelExporter import ModelExporter

def main():
    testVar = ModelExporter.Program.Main()