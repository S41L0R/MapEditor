using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class LZARC_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        public LZARC_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(true);
                uint FileSize = reader.ReadUInt32();
                uint Unknown = reader.ReadUInt32();
                uint FileCount = reader.ReadUInt32();

                for (int i = 0; i < FileCount; i++)
                {
                    var file = new FileEntry();
                    file.Read(reader);
                    Files.Add(file);
                }
            }
        }


        public void Save(System.IO.Stream stream)
        {
            using (var writer = new FileWriter(stream))
            {
              
            }
        }

        public class FileEntry : ArchiveFileInfo
        {
            public uint Unknown { get; set; }

            public uint CompressedSize;
            public uint DecompressedSize;

            public void Read(FileReader reader)
            {
                long pos = reader.Position;
                FileName = reader.ReadZeroTerminatedString();
                reader.SeekBegin(pos + 128);

                uint Offset = reader.ReadUInt32();
                CompressedSize = reader.ReadUInt32();
                uint Unknown = reader.ReadUInt32();
                uint Unknown2 = reader.ReadUInt32();
                DecompressedSize = reader.ReadUInt32();

                using (reader.TemporarySeek((int)Offset, System.IO.SeekOrigin.Begin))
                {
                    reader.Seek(8);
                    byte[] data = reader.ReadBytes((int)CompressedSize - 8);
                    SetData(LZ77_WII.Decompress11(data, (int)DecompressedSize));
                }
            }
        }
    }
}
