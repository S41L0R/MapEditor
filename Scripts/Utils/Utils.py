# Import stuff
import oead
import json



# Decompress bymls.
def BymlDecompress(Path):
    with open(Path, 'rb') as InputFile:
        ReadInputFile = InputFile.read()
        DeYaz0 = oead.yaz0.decompress(ReadInputFile)
        DeBYML = oead.byml.from_binary(DeYaz0)
        output = oead.byml.to_text(DeBYML)
        return(output)

# A function for checking if a file is yaz0 compressed and then determining whether or not to decompress it based off of that
def checkCompression(fileCheck):
    fileInRead = fileCheck
    if (oead.yaz0.get_header(fileInRead) is not None):
        uncompressedFile = oead.yaz0.decompress(fileInRead)
    else:
        uncompressedFile = fileInRead
    return(uncompressedFile)

def navToObj():
    with open(fileToOpen, "r") as f:
        d = json.load(f)

    vertices = d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["vertices"]
    edges = [
        (edge["a"] + 1, edge["b"] + 1)
        for edge in d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["edges"]
    ]
    faces = d[0]["data"]["contents"][0]["namedVariants"][0]["variant"]["faces"]

    data = []
    for vtx in vertices:
        data.append(f'v {" ".join([str(f) for f in vtx])}')

    for face in faces:
        idxs = list(
            dict.fromkeys(
                [
                    x
                    for y in edges[
                        face["startEdgeIndex"] : face["startEdgeIndex"]
                        + face["numEdges"]
                    ]
                    for x in y
                ]
            )
        )
        data.append(f'f {" ".join([str(i) for i in idxs])}')

    with open(fileToOpen + ".obj", "w") as f:
        f.write("\n".join(data))