using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.OpenGL;
using Toolbox.Core;
using Toolbox.Core.ModelView;
using Toolbox.Core.IO;
using BfresLibrary;

namespace CafeLibrary
{
    public class GMX : IFileFormat, IModelFormat
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "GMX" };
        public string[] Extension { get; set; } = new string[] { "*.gmx" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "GMX2");
            }
        }

        public ModelRenderer Renderer => new ModelRenderer(ToGeneric()) { DisplayVertexColors = false };

        public GMX_Parser Header;

        public void Load(Stream stream) {
            Header = new GMX_Parser(stream);
        }

        private STGenericModel Model;
        public STGenericModel ToGeneric()
        {
            if (Model != null) return Model;

            var model = new STGenericModel(FileInfo.FileName);
            foreach (var mesh in Header.Meshes)
            {
                if (mesh.VertexGroup == null)
                    continue;

                var genericMesh = new STGenericMesh();
                genericMesh.Name = $"Mesh{model.Meshes.Count}";
                model.Meshes.Add(genericMesh);

                for (int v = 0; v < mesh.VertexGroup.Vertices.Count; v++) {
                    var vertex = mesh.VertexGroup.Vertices[v];

                    genericMesh.Vertices.Add(new STVertex()
                    {
                        Position = vertex.Position,
                        Normal = vertex.Normal,
                        Colors = new OpenTK.Vector4[1] { vertex.Color },
                        TexCoords = new OpenTK.Vector2[1] { vertex.TexCoord0 },
                    });
                }

                var poly = new STPolygonGroup();
                poly.PrimitiveType = STPrimitiveType.TriangleStrips;
                genericMesh.PolygonGroups.Add(poly);

                for (int i = 0; i < mesh.IndexGroup.Indices.Length; i++)
                    poly.Faces.Add(mesh.IndexGroup.Indices[i]);
            }

            Model = model;
            return model;
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }
    }
}
