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
    print(InputDict)
    print(InputDict["Actors"][0])
    SearchingActorInfo = True
    i = 0
    while SearchingActorInfo == True:
        try:
            print(InputDict["Actors"][i]["name"])
            if InputDict["Actors"][i]["name"] == ActorName:
                print("yay")
                SearchingActorInfo = False
            else:
                i = i + 1
        except:
            print("Did not find the actor name in actorInfo.")
            SearchingActorInfo = False
    return(InputDict["Actors"][i]["bfres"])
