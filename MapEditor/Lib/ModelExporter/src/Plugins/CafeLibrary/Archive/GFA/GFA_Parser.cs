using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class GFA_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        private uint Unknown1;
        private uint Version;

        public GFA_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(false);
                reader.ReadSignature(4, "GFAC");
                Unknown1 = reader.ReadUInt32();
                Version = reader.ReadUInt32();
                uint FileInfoOffset = reader.ReadUInt32();
                uint FileInfoSize = reader.ReadUInt32();
                uint DataOffset = reader.ReadUInt32();
                uint DataSize = reader.ReadUInt32();
                byte[] Padding = reader.ReadBytes(0x10); //Not sure

                reader.SeekBegin(FileInfoOffset);
                uint FileCount = reader.ReadUInt32();
                for (int i = 0; i < FileCount; i++)
                {
                    var file = new FileEntry();
                    file.Read(reader);
                    Files.Add(file);
                }

                reader.SeekBegin(DataOffset);
                reader.ReadSignature(4, "GFCP");
                uint VersionGFCP = reader.ReadUInt32();
                uint CompressionType = reader.ReadUInt32();
                uint DecompressedSize = reader.ReadUInt32();
                uint CompressedSize = reader.ReadUInt32();
            }
        }


        public void Save(System.IO.Stream stream)
        {
            using (var writer = new FileWriter(stream))
            {
                writer.SetByteOrder(false);

                writer.WriteSignature("GFAC");
                writer.Write(Unknown1);
                writer.Write(Version);
                writer.Write(uint.MaxValue); //Info offset for later
                writer.Write(uint.MaxValue); //Info size for later
                writer.Write(uint.MaxValue); //Data offset for later
                writer.Write(uint.MaxValue); //Data size for later
                writer.Write(new byte[0x10]); //Padding

                writer.WriteUint32Offset(12); //Save info offset
                writer.Write(Files.Count);
            }
        }

        public class FileEntry : ArchiveFileInfo
        {
            public uint Hash { get; set; }

            public void Read(FileReader reader)
            {
                Hash = reader.ReadUInt32();
                FileName = GetName(reader);
                uint Size = reader.ReadUInt32();
                uint Offset = reader.ReadUInt32();
            }
        }

        private static string GetName(FileReader reader)
        {
            uint Offset = reader.ReadUInt32();
            using (reader.TemporarySeek(Offset & 0x00ffffff, System.IO.SeekOrigin.Begin)) {
                return reader.ReadZeroTerminatedString();
            }
        }
    }
}
