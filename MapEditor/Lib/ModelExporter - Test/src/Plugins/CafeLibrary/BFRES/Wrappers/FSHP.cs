using System;
using System.Collections.Generic;
using System.Linq;
using Toolbox.Core;
using BfresLibrary;
using BfresLibrary.GX2;
using BfresLibrary.Helpers;
using OpenTK;

namespace CafeLibrary
{
    public class FSHP : STGenericMesh
    {
        /// <summary>
        /// The shape section storing face indices and bounding data.
        /// </summary>
        public Shape Shape { get; set; }

        /// <summary>
        /// The vertex buffer storing vertex data and attributes.
        /// </summary>
        public VertexBuffer VertexBuffer { get; set; }

        /// <summary>
        /// The model in which the data in this section is parented to.
        /// </summary>
        public Model ParentModel { get; set; }

        /// <summary>
        /// The material data mapped to the mesh.
        /// </summary>
        public FMAT Material { get; set; }

        /// <summary>
        /// The skeleton used in the parent model.
        /// </summary>
        public FSKL ParentSkeleton { get; set; }

        /// <summary>
        /// The file in which the data in this section is parented to.
        /// </summary>
        public ResFile ParentFile { get; set; }

        public FSHP(ResFile resFile, FSKL skeleton, Model model, Shape shape) {
            ParentFile = resFile;
            ParentModel = model;
            Shape = shape;
            ParentSkeleton = skeleton;
            BoneIndex = shape.BoneIndex;
            VertexBuffer = model.VertexBuffers[shape.VertexBufferIndex];
            Material = new FMAT(resFile, model, model.Materials[(int)shape.MaterialIndex]);
            VertexSkinCount = shape.VertexSkinCount;

            Name = shape.Name;

            UpdateVertexBuffer();
            UpdatePolygonGroups();
        }

        public  void UpdateTransform()
        {
            int boneIndex = Shape.BoneIndex;
            var bone = ParentSkeleton.Bones[boneIndex];
            this.Transform = new ModelTransform()
            {
                Position = bone.AnimationController.Position,
                Rotation = bone.AnimationController.Rotation,
                Scale = bone.AnimationController.Scale,
            };
            this.Transform.Update();
        }

        /// <summary>
        /// Updates the current buffer from the shapes vertex buffer data.
        /// </summary>
        public void UpdateVertexBuffer()
        {
            //Load the vertex buffer into the helper to easily access the data.
            VertexBufferHelper helper = new VertexBufferHelper(VertexBuffer, ParentFile.ByteOrder);

            //Loop through all the vertex data and load it into our vertex data
            Vertices = new List<STVertex>();

            //Get all the necessary attributes
            var positions = TryGetValues(helper, "_p0");
            var normals = TryGetValues(helper, "_n0");
            var texCoords = TryGetChannelValues(helper, "_u");
            var colors = TryGetChannelValues(helper, "_c");
            var tangents = TryGetValues(helper, "_t0");
            var bitangents = TryGetValues(helper, "_b0");
            var weights0 = TryGetValues(helper, "_w0");
            var indices0 = TryGetValues(helper, "_i0");

            var boneIndexList = ParentSkeleton.Skeleton.MatrixToBoneList;

            if (VertexSkinCount == 0)
                UpdateTransform();

            //Get the position attribute and use the length for the vertex count
            for (int v = 0; v < positions.Length; v++)
            {
                STVertex vertex = new STVertex();
                Vertices.Add(vertex);

                vertex.Position = new Vector3(positions[v].X,positions[v].Y,positions[v].Z);
                if (normals.Length > 0)
                    vertex.Normal = new Vector3(normals[v].X,normals[v].Y,normals[v].Z);

             

                if (texCoords.Length > 0)
                {
                    vertex.TexCoords = new Vector2[texCoords.Length];
                    for (int i = 0; i < texCoords.Length; i++)
                        vertex.TexCoords[i] = new Vector2(texCoords[i][v].X, texCoords[i][v].Y);
                }
                if (colors.Length > 0)
                {
                    vertex.Colors = new Vector4[colors.Length];
                    for (int i = 0; i < colors.Length; i++)
                        vertex.Colors[i] = new Vector4(
                            colors[i][v].X, colors[i][v].Y,
                            colors[i][v].Z, colors[i][v].W);
                }

                if (tangents.Length > 0)
                    vertex.Tangent = new Vector4(tangents[v].X, tangents[v].Y, tangents[v].Z, tangents[v].W);
                if (bitangents.Length > 0)
                    vertex.Bitangent = new Vector4(bitangents[v].X, bitangents[v].Y, bitangents[v].Z, bitangents[v].W);

                for (int i = 0; i < VertexBuffer.VertexSkinCount; i++)
                {
                    if (i > 3)
                        break;

                    int index = boneIndexList[(int)indices0[v][i]];
                    vertex.BoneIndices.Add(index);
                    if (weights0.Length > 0)
                        vertex.BoneWeights.Add(weights0[v][i]);
                    else
                        vertex.BoneWeights.Add(1.0f);

                    if (VertexSkinCount == 1)
                    {
                        var bone = ParentSkeleton.Bones[index];
                        vertex.Position = Vector3.TransformPosition(vertex.Position, bone.Transform);
                        vertex.Normal = Vector3.TransformNormal(vertex.Normal, bone.Transform);
                    }
                }
            }
        }

        //Gets attributes with more than one channel
        private Syroot.Maths.Vector4F[][] TryGetChannelValues(VertexBufferHelper helper, string attribute)
        {
            List<Syroot.Maths.Vector4F[]> channels = new List<Syroot.Maths.Vector4F[]>();
            for (int i = 0; i < 10; i++)
            {
                if (helper.Contains($"{attribute}{i}"))
                    channels.Add(helper[$"{attribute}{i}"].Data);
                else
                    break;
            }
            return channels.ToArray();
        }

        //Gets the attribute data given the attribute key.
        private Syroot.Maths.Vector4F[] TryGetValues(VertexBufferHelper helper, string attribute)
        {
            if (helper.Contains(attribute))
                return helper[attribute].Data;
            else
                return new Syroot.Maths.Vector4F[0];
        }

        /// <summary>
        /// Updates the current polygon groups from the shape data.
        /// </summary>
        public void UpdatePolygonGroups()
        {
            PolygonGroups = new List<STPolygonGroup>();
            foreach (var mesh in Shape.Meshes)
            {
                //Set group as a level of detail
                var group = new STPolygonGroup();
                group.Material = Material;
                group.GroupType = STPolygonGroupType.LevelOfDetail;
                //Load indices into the group
                var indices = mesh.GetIndices().ToArray();
                for (int i = 0; i < indices.Length; i++)
                    group.Faces.Add(indices[i]);

                if (!PrimitiveTypes.ContainsKey(mesh.PrimitiveType))
                    throw new Exception($"Unsupported primitive type! {mesh.PrimitiveType}");

                //Set the primitive type
                group.PrimitiveType = PrimitiveTypes[mesh.PrimitiveType];
                //Set the face offset (used for level of detail meshes)
                group.FaceOffset = (int)mesh.SubMeshes[0].Offset;
                PolygonGroups.Add(group);
                break;
            }
        }

        //Converts bfres primitive types to generic types used for rendering.
        Dictionary<GX2PrimitiveType, STPrimitiveType> PrimitiveTypes = new Dictionary<GX2PrimitiveType, STPrimitiveType>()
        {
            { GX2PrimitiveType.Triangles, STPrimitiveType.Triangles },
            { GX2PrimitiveType.LineLoop, STPrimitiveType.LineLoop },
            { GX2PrimitiveType.Lines, STPrimitiveType.Lines },
            { GX2PrimitiveType.TriangleFan, STPrimitiveType.TriangleFans },
            { GX2PrimitiveType.Quads, STPrimitiveType.Quad },
            { GX2PrimitiveType.QuadStrip, STPrimitiveType.QuadStrips },
            { GX2PrimitiveType.TriangleStrip, STPrimitiveType.TriangleStrips },
        };
    }
}
