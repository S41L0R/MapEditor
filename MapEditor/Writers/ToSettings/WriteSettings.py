import os
import yaml
import pathlib
from Lib.Utils import Util

def WriteSettings(settings):
    data_dir = Util.get_data_dir()
    configPath = pathlib.Path(f'{data_dir}/Config')
    if not configPath.exists():
        try:
            configPath.mkdir()
        except:
            print('shrug')
    with open(configPath / 'Config.yml', 'wt') as config:
        yaml.dump(settings, config)
