import os
import yaml
import json
import pathlib
from Lib.Utils import Util

def LoadSettings():
    data_dir = Util.get_data_dir()
    print(data_dir)
    settingDir = Util.findMKDir(pathlib.Path(f'{data_dir}/Config/Config.json'))
    with open(settingDir, 'rt') as config:
        settings = json.loads(config.read())
        return(settings)
