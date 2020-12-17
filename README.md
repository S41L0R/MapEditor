


# *This is a work in progress! Most of these features don't even exist yet!*


FEATURES:
 
 # Switch Support ~~POG~~
-------------------------
 Loads little endian map files, outputs little endian map files, is able to look for tex.sbfres instead of tex1.sbfres

 # Bulk Parameter Editing
----------------------------
 Options for editing/replacing/removing lots of entities in bulk. Will also ~~hopefully~~ support editing the prod files that stores tree and plant clusters found in the map files.

 # Rail Editing and Viewing
-------------------------------
Somehow add some 

 # Viewable navmesh
----------------------------------
Option to view the navmesh in the editor





-------------------------
How the code works:

1. Data is imported via files in Loaders.  
2. Data is then prepped for cache storage via Preppers if not gathered from cache originally.  
3. Data is then displayed or otherwise used by files in Users
4. When the user decides to save their files, files in Writers save the data to their drive in proper Wii U(or switch) file formats.

Note: All of the actual stuff is handeled by Process.py in the "Users" folder. And that's not your computer's Users folder, there is a folder called that in this repo, you would've noticed that if you actually started looking at the repo before reading these docs you stupidhead(that's not very nice...). Anyway, Process.py calls all other py files and supplies them with the information they need from previously called py files.
