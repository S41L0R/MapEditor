using OpenTK;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Toolbox.Core;
using Toolbox.Core.IO;

namespace CafeLibrary
{
    public class GMX_Parser
    {
        public uint HeaderSize = 8;

        public List<MESH> Meshes = new List<MESH>();

        public GMX_Parser() { }

        public GMX_Parser(Stream stream) {
            Read(new FileReader(stream));
        }

        public void Save(Stream steam) {
            Write(new FileWriter(steam));
        }

        void Read(FileReader reader)
        {
            reader.ReadSignature(4, "GMX2");
            reader.SetByteOrder(true);
            HeaderSize = reader.ReadUInt32();

            while (reader.Position < reader.BaseStream.Length)
            {
                long pos = reader.Position;

                string Magic = reader.ReadString(4);
                uint SectionSize = reader.ReadUInt32();

                reader.SeekBegin(pos);
                switch (Magic)
                {
                    case "PADX":
                        PADX padding = new PADX();
                        padding.Read(reader);
                        break;
                    case "INDX":
                        INDX indexGrp = new INDX();
                        indexGrp.Read(reader, GetLastMesh());
                        GetLastMesh().IndexGroup = indexGrp;
                        break;
                    case "VMAP":
                        VMAP vmap = new VMAP();
                        vmap.Read(reader);
                        GetLastMesh().VMapGroup = vmap;
                        break;
                    case "MESH":
                        MESH mesh = new MESH();
                        mesh.Read(reader);
                        Meshes.Add(mesh);

                        Console.WriteLine($"MESH {mesh.VertexCount} {mesh.FaceCount} {mesh.SkinningFlags} {mesh.VertexSize}");
                        break;
                    case "VERT":
                        VERT vert = new VERT();
                        vert.Read(reader, GetLastMesh());
                        GetLastMesh().VertexGroup = vert;
                        break;
                    case "ENDX":
                        reader.ReadSignature(4, "ENDX");
                        uint EndSectionSize = reader.ReadUInt32();
                        break;
                    default:
                        throw new Exception("Unknown section! " + Magic);
                }

                reader.SeekBegin(pos + SectionSize);
            }
            Console.WriteLine("MESHES " + Meshes.Count);
        }

        public MESH GetLastMesh()
        {
            return Meshes[Meshes.Count - 1];
        }

        public void Write(FileWriter writer)
        {
            writer.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;

            PADX padding = new PADX();

            Console.WriteLine("Saving GMX");
            writer.WriteSignature("GMX2");
            writer.Write(HeaderSize);
            for (int i = 0; i < Meshes.Count; i++)
            {
                //Write mesh header
                padding.Write(writer, 32);
                Meshes[i].Write(writer);

                if (Meshes[i].VertexGroup != null)
                {
                    //Write Vertices
                    padding.Write(writer, 64);
                    Meshes[i].VertexGroup.Write(writer, Meshes[i]);
                }

                if (Meshes[i].IndexGroup != null)
                {
                    //Write Faces
                    padding.Write(writer, 64);
                    Meshes[i].IndexGroup.Write(writer);
                }

                if (Meshes[i].VMapGroup != null)
                {
                    //Write VMAPS
                    padding.Write(writer, 32);
                    Meshes[i].VMapGroup.Write(writer);
                }
            }
            writer.WriteSignature("ENDX");
            writer.Write(8); //Last section size
            writer.Close();
            writer.Dispose();
        }

        public class VERT
        {
            public List<Vertex> Vertices = new List<Vertex>();

            public void Read(FileReader reader, MESH mesh)
            {
                reader.ReadSignature(4, "VERT");
                uint SectionSize = reader.ReadUInt32();

                if (mesh.VertexSize == 32)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        vert.Position = reader.ReadVec3();
                        vert.Normal = reader.ReadVec3();
                        vert.TexCoord0 = reader.ReadVec2();
                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 12)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        vert.Position = reader.ReadVec3();
                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 20)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        vert.Position = reader.ReadVec3();
                        vert.TexCoord0 = reader.ReadVec2();
                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 24)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        vert.Position = reader.ReadVec3();
                        vert.Normal = reader.ReadVec3();
                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 36)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        if (mesh.SkinningFlags != 0)
                        {
                            vert.MatrixID = reader.ReadUInt32();
                            vert.Position = reader.ReadVec3();
                            vert.Normal = reader.ReadVec3();
                            vert.TexCoord0 = reader.ReadVec2();
                        }
                        else
                        {
                            vert.Position = reader.ReadVec3();
                            vert.Normal = reader.ReadVec3();
                            vert.Color = ColorUtility.ToVector4(reader.ReadBytes(4));
                            vert.TexCoord0 = reader.ReadVec2();
                        }

                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 40)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        if (mesh.SkinningFlags != 0)
                        {
                            vert.MatrixID = reader.ReadUInt32(); //Bone index?
                            vert.Position = reader.ReadVec3();
                            vert.Normal = reader.ReadVec3();
                            vert.Color = ColorUtility.ToVector4(reader.ReadBytes(4));
                            vert.TexCoord0 = reader.ReadVec2();
                        }
                        else
                            throw new Exception($"Unsupported Vertex Size {mesh.VertexSize}");


                        Vertices.Add(vert);
                    }
                }
                else if (mesh.VertexSize == 44)
                {
                    for (int v = 0; v < mesh.VertexCount; v++)
                    {
                        Vertex vert = new Vertex();
                        vert.Position = reader.ReadVec3();
                        vert.Normal = reader.ReadVec3();
                        vert.Color = ColorUtility.ToVector4(reader.ReadBytes(4));
                        vert.TexCoord0 = reader.ReadVec2();
                        vert.TexCoord1 = reader.ReadVec2();

                        Vertices.Add(vert);
                    }
                }
                else
                    throw new Exception($"Unsupported Vertex Size {mesh.VertexSize}");
            }

            public void Write(FileWriter writer, MESH mesh)
            {
                writer.WriteSignature("VERT");
                writer.Write(Vertices.Count * mesh.VertexSize + 8);
                for (int v = 0; v < mesh.VertexCount; v++)
                {
                    if (mesh.VertexSize == 32)
                    {
                        writer.Write(Vertices[v].Position);
                        writer.Write(Vertices[v].Normal);
                        writer.Write(Vertices[v].TexCoord0);
                    }
                    else if (mesh.VertexSize == 36 && mesh.SkinningFlags != 0)
                    {
                        writer.Write(Vertices[v].MatrixID);
                        writer.Write(Vertices[v].Position);
                        writer.Write(Vertices[v].Normal);
                        writer.Write(Vertices[v].TexCoord0);
                    }
                    else if (mesh.SkinningFlags != 0 && mesh.SkinningFlags != 0)
                    {
                        writer.Write(Vertices[v].MatrixID);
                        writer.Write(Vertices[v].Position);
                        writer.Write(Vertices[v].Normal);
                        writer.Write((byte)Vertices[v].Color.X);
                        writer.Write((byte)Vertices[v].Color.Y);
                        writer.Write((byte)Vertices[v].Color.Z);
                        writer.Write((byte)Vertices[v].Color.W);
                        writer.Write(Vertices[v].TexCoord0);
                    }
                    else
                        throw new Exception($"Unsupported Vertex Size {mesh.VertexSize}");
                }
            }
        }

        public struct Vertex
        {
            public uint MatrixID { get; set; }
            public Vector3 Position { get; set; }
            public Vector3 Normal { get; set; }
            public Vector4 Color { get; set; }
            public Vector2 TexCoord0 { get; set; }
            public Vector2 TexCoord1 { get; set; }
        }

        public class MESH
        {
            public INDX IndexGroup { get; set; }
            public VERT VertexGroup { get; set; }
            public VMAP VMapGroup { get; set; }

            public ushort VertexSize { get; set; } = 36;
            public ushort VertexCount { get; set; }
            public uint FaceCount { get; set; }

            public ushort Unknown { get; set; }
            public ushort SkinningFlags { get; set; } = 0;
            public uint Unknown2 { get; set; }
            public uint Unknown3 { get; set; }

            public void Read(FileReader reader)
            {
                reader.ReadSignature(4, "MESH");
                uint SectionSize = reader.ReadUInt32();
                uint Padding = reader.ReadUInt32();
                VertexSize = reader.ReadUInt16();
                VertexCount = reader.ReadUInt16();
                uint Padding2 = reader.ReadUInt32();
                FaceCount = reader.ReadUInt32();
                reader.ReadUInt32(); //padding
                SkinningFlags = reader.ReadUInt16();
                Unknown = reader.ReadUInt16();
                Unknown2 = reader.ReadUInt32();
                Unknown3 = reader.ReadUInt32();
            }

            public void Write(FileWriter writer)
            {
                writer.WriteSignature("MESH");
                writer.Write(40);
                writer.Write(0);
                writer.Write(VertexSize);
                writer.Write(VertexCount);
                writer.Write(0);
                writer.Write(FaceCount);
                writer.Write(0);
                writer.Write(SkinningFlags);
                writer.Write(Unknown);
                writer.Write(Unknown2);
                writer.Write(Unknown3);
            }
        }

        public class INDX
        {
            public ushort[] Indices;

            public void Read(FileReader reader, MESH mesh)
            {
                reader.ReadSignature(4, "INDX");
                uint SectionSize = reader.ReadUInt32();

                Indices = new ushort[mesh.FaceCount];
                for (int i = 0; i < mesh.FaceCount; i++)
                {
                    Indices[i] = reader.ReadUInt16();
                }
            }

            public void Write(FileWriter writer)
            {
                writer.WriteSignature("INDX");
                writer.Write(Indices.Length * sizeof(ushort) + 8);
                for (int i = 0; i < Indices.Length; i++)
                    writer.Write(Indices[i]);
            }
        }

        public class VMAP
        {
            public ushort[] Indices;

            public void Read(FileReader reader)
            {
                reader.ReadSignature(4, "VMAP");
                uint SectionSize = reader.ReadUInt32();
                uint FaceCount = (SectionSize - 8) / sizeof(ushort);

                Indices = new ushort[FaceCount];
                for (int i = 0; i < FaceCount; i++)
                {
                    Indices[i] = reader.ReadUInt16();
                }
            }

            public void Write(FileWriter writer)
            {
                writer.WriteSignature("VMAP");
                writer.Write(Indices.Length * sizeof(ushort) + 8);
                for (int i = 0; i < Indices.Length; i++)
                    writer.Write(Indices[i]);
            }
        }

        public class PADX
        {
            public void Read(FileReader reader)
            {
                reader.ReadSignature(4, "PADX");
                uint SectionSize = reader.ReadUInt32();
            }

            public void Write(FileWriter writer, uint Alignment)
            {
                long pos = writer.Position;

                //Check if alignment is needed first!
                using (writer.TemporarySeek(pos + 8, System.IO.SeekOrigin.Begin))
                {
                    var startPos = writer.Position;
                    long position = writer.Seek((-writer.Position % Alignment + Alignment) % Alignment, System.IO.SeekOrigin.Current);

                    if (startPos == position)
                        return;
                }

                writer.WriteSignature("PADX");
                writer.Write(uint.MaxValue);
                Align(writer, (int)Alignment);

                long endPos = writer.Position;
                using (writer.TemporarySeek(pos + 4, System.IO.SeekOrigin.Begin))
                {
                    writer.Write((uint)(endPos - pos));
                }
            }

            private void Align(FileWriter writer, int alignment)
            {
                var startPos = writer.Position;
                long position = writer.Seek((-writer.Position % alignment + alignment) % alignment, System.IO.SeekOrigin.Current);

                writer.Seek(startPos, System.IO.SeekOrigin.Begin);
                while (writer.Position != position)
                {
                    writer.Write(byte.MaxValue);
                }
            }
        }
    }
}