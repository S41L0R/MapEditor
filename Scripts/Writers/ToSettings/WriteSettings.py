import os
import yaml

def WriteSettings(settings):
    with open(r'..\..\..\MapEditor\Config\Config.yml', 'w+') as config:
        yaml.dump(settings, config)
