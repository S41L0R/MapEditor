import os
import yaml
import pathlib

def WriteSettings(settings):
    with open(pathlib.Path('MapEditor/Config/Config.yml'), 'w+') as config:
        yaml.dump(settings, config)
