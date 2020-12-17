import oead
import yaml

# Stuff I need because there are unknown tags
class SafeLoaderIgnoreUnknown(yaml.SafeLoader):
    def ignore_unknown(self, node):
        return None




def FindActorModel(InputText, ActorName):
    # Stuff I need because there are unknown tags
    SafeLoaderIgnoreUnknown.add_constructor(None, SafeLoaderIgnoreUnknown.ignore_unknown)

    # Parse then print for debugging
    InputDict = yaml.load(InputText, Loader = SafeLoaderIgnoreUnknown)
    #print(InputDict)
    #print(InputDict["Actors"][0])
    SearchingActorInfo = True
    i = 0
    while SearchingActorInfo == True:
        try:
            #print(InputDict["Actors"][i]["name"])
            if InputDict["Actors"][i]["name"] == ActorName:
                SearchingActorInfo = False
            else:
                i = i + 1
        except:
            print("Did not find the actor name in actorInfo.")
            return("Did not find the actor name in map file.")
            SearchingActorInfo = False
    return(InputDict["Actors"][i]["bfres"], InputDict["Actors"][i]["mainModel"])


def FindActorText(InputText, ActorName):
    # Stuff I need because there are unknown tags
    SafeLoaderIgnoreUnknown.add_constructor(None, SafeLoaderIgnoreUnknown.ignore_unknown)

    # Parse then print for debugging
    InputDict = yaml.load(InputText, Loader = SafeLoaderIgnoreUnknown)
    #print(InputDict)
    #print(InputDict["Actors"][0])
    SearchingActorInfo = True
    i = 0
    while SearchingActorInfo == True:
        try:
            #print(InputDict["Actors"][i]["name"])
            if InputDict["Objs"][i]["UnitConfigName"] == ActorName:
                print("yay")
                SearchingActorInfo = False
            else:
                i = i + 1
        except:
            print("Did not find the actor name in map file.")
            return("Did not find the actor name in map file.")
            SearchingActorInfo = False
    print(yaml.dump(InputDict["Objs"][i]))
    return(yaml.dump(InputDict["Objs"][i]))
