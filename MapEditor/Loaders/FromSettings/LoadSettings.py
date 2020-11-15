import os
import yaml
import json
import pathlib
from Lib.Utils import Util

def LoadSettings():
    data_dir = Util.get_data_dir()
    with open(pathlib.Path(f'{data_dir}/Config/Config.json'), 'rt') as config:
        settings = json.loads(config.read())
        print(settings)
        return(settings)
