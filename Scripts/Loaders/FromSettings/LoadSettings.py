import os
import yaml
import pathlib

def LoadSettings():
    with open(r'..\..\..\MapEditor\Config\Config.yml', 'r') as config:
        settings = yaml.load(config, Loader=yaml.FullLoader)
        print(settings)
        return(settings)
