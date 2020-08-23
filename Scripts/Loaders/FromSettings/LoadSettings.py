import os
import yaml
import pathlib

def LoadSettings():
    with open(pathlib.Path('MapEditor/Config/Config.yml'), 'r') as config:
        settings = yaml.load(config, Loader=yaml.FullLoader)
        print(settings)
        return(settings)
