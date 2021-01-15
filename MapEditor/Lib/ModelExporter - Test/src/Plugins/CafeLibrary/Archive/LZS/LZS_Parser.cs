using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class LZS_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        public LZS_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(false);
                //First get the first file offset
                reader.SeekBegin(4);
                uint sectionSize = reader.ReadUInt32();

                reader.SeekBegin(0);

                //Now go through each file
                while (reader.Position < sectionSize)
                {
                    var file = new FileEntry();
                    Files.Add(file);

                    long pos = reader.Position;

                    ushort unk = reader.ReadUInt16(); //4 or 0
                    ushort unk2 = reader.ReadUInt16(); //40
                    uint dataOffset = reader.ReadUInt32();
                    uint dataSize = reader.ReadUInt32();
                    reader.ReadUInt32(); //padding
                    file.FileName = reader.ReadZeroTerminatedString();
                    //Aligned with 0xFF bytes. The size is always 64 bytes

                    reader.SeekBegin(pos + 64);

                    using (reader.TemporarySeek(dataOffset, System.IO.SeekOrigin.Begin)) {
                        file.SetData(reader.ReadBytes((int)dataSize));
                    }
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
