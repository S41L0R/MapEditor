import os
import yaml
import json
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
    with open(configPath / 'Config.json', 'wt') as config:
        config.write(json.dumps(settings, indent=2))
        config.flush()
        config.close()
