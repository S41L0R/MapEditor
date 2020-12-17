using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core;
using Toolbox.Core.IO;

namespace CTRLibrary
{
    public class VIBS_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        public uint Version = 1;

        public VIBS_Parser(Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(false);
                Version = reader.ReadUInt32();
                uint numEntries = reader.ReadUInt32();

                for (int i = 0; i < numEntries; i++)
                {
                    var file = new FileEntry();
                    file.FileName = reader.ReadString(24, true);
                    file.unk = reader.ReadUInt32(); // 8
                    file.unk2 = reader.ReadUInt32(); // 12
                    uint dataLength = reader.ReadUInt32();
                    uint index = reader.ReadUInt32();
                    uint dataOffset = reader.ReadUInt32();
                    Files.Add(file);

                    using (reader.TemporarySeek(dataOffset, System.IO.SeekOrigin.Begin))
                    {
                        file.SetData(reader.ReadBytes((int)dataLength));
                    }
                }
            }
        }

        public void Save(Stream stream)
        {
            using (var writer = new FileWriter(stream))
            {
                writer.Write(Version);
                writer.Write(Files.Count);

                long pos = writer.Position;
                for (int i = 0; i < Files.Count; i++)
                {
                    writer.WriteString(Files[i].FileName, 24);
                    writer.Write(Files[i].unk);
                    writer.Write(Files[i].unk2);
                    writer.Write((uint)Files[i].FileData.Length);
                    writer.Write(i);
                    writer.Write(uint.MaxValue);
                }

                for (int i = 0; i < Files.Count; i++)
                {
                    writer.WriteUint32Offset(pos + 40 + (i * 44));
                    writer.Write(Files[i].AsBytes());
                }
            }
        }

        public class FileEntry : ArchiveFileInfo
        {
            public uint unk;
            public uint unk2;
        }
    }
}
