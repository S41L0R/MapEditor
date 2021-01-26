import pathlib
import Lib.Utils.Util as utils
import oead

# Load ActorInfo
class actorData:
    def __init__(self, actorinfoPath):
        self.path = pathlib.Path(actorinfoPath)
        self.ActorInfoText = utils.BymlDecompress(self.path)
        with open(self.path, 'rb') as readData:
            self.ActorInfo = oead.byml.from_binary(utils.checkCompression(readData.read()))
        self.data = utils.expandByml(self.ActorInfo, True).extractedByml
        self.actors = self.data['Actors']
