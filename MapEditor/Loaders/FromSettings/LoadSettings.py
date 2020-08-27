import os
import yaml
import pathlib
from Lib.Utils import Util

def LoadSettings():
    data_dir = Util.get_data_dir()
    with open(pathlib.Path(f'{data_dir}/Config/Config.yml'), 'rt') as config:
        settings = yaml.load(config, Loader=yaml.FullLoader)
        print(settings)
        return(settings)
