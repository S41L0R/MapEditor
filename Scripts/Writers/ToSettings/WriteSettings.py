import os
import yaml
import pathlib

def WriteSettings(settings):
    with open(r'..\..\..\MapEditor\Config\Config.yml', 'w+') as config:
        yaml.dump(settings, config)
