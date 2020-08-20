import open3d
import os


mesh = open3d.io.read_triangle_mesh("MapEditor/Test/untitled.ply")

mesh.compute_vertex_normals()
#mesh.textures
print(mesh.has_textures())

open3d.visualization.draw_geometries([mesh])
