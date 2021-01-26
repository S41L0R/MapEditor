from Lib.Utils import Util as utils
import Loaders.FromGame.actorinfo as LoadActorInfo
import json
import pathlib

def cacheActorInfo(pathToActorInfo):
    cacheExists, cachePath = check_exists_cache()
    actorModel_Dict = {}
    if cacheExists == True:
        pass
    else:
        actorinfo = LoadActorInfo.actorData(pathToActorInfo)
        for actor in actorinfo.actors:
            if 'bfres' in actor.keys() and 'mainModel' in actor.keys():
                actorModel_Dict.update({actor['name']: {'bfres': actor['bfres'], 'mainmodel': actor['mainModel']}})
            elif 'bfres' in actor.keys():
                actorModel_Dict.update({actor['name']: {'bfres': actor['bfres'], 'MainModel': None}})
            else:
                actorModel_Dict.update({actor['name']: {'bfres': None, 'MainModel': None}})
                continue
        with open(cachePath, 'wt') as writeCacheData:
            writeCacheData.write(json.dumps(actorModel_Dict, indent=2))
    return cachePath


def check_exists_cache():
    dataDir = utils.get_data_dir()
    cacheDir = utils.findMKDir(f'{dataDir}/Cache')
    actorInfoCacheDir = utils.findMKDir(f'{cacheDir}/ActorInfo')
    actorinfoCache = pathlib.Path(f'{actorInfoCacheDir}/ActorInfo.cache.json')
    if actorinfoCache.exists():
        return True, actorinfoCache
    else:
        return False, actorinfoCache