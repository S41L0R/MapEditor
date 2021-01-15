using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class NXARC_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        public NXARC_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.ByteOrder = Syroot.BinaryData.ByteOrder.LittleEndian;
                reader.ReadSignature(4, "RAXN");
                uint unk = reader.ReadUInt32();
                char[] Type = reader.ReadChars(4);
                uint OffsetBlock = reader.ReadUInt32();
                uint HeaderSize = reader.ReadUInt32();
                uint FileCount = reader.ReadUInt32();
                uint BlockSize = reader.ReadUInt32();

                List<string> FileNames = new List<string>();
                reader.Seek(OffsetBlock, System.IO.SeekOrigin.Begin);
                for (int i = 0; i < FileCount; i++)
                {
                    FileNames.Add(reader.ReadZeroTerminatedString());
                }

                reader.Seek(HeaderSize, System.IO.SeekOrigin.Begin);
                for (int i = 0; i < FileCount; i++)
                {
                    if (i == 0)
                    {
                        //Skip string table
                        reader.Seek(32);
                    }
                    else
                    {
                        var file = new FileEntry();
                        file.FileName = FileNames[i];
                        file.Read(reader);
                        Files.Add(file);
                    }
                }
            }
        }


        public void Save(System.IO.Stream stream)
        {
        }

        public class FileEntry : ArchiveFileInfo
        {
            public ulong Flags { get; set; }
            public ulong Unknown { get; set; }

            public FileEntry() { }

            public void Read(FileReader reader)
            {
                ulong Size = reader.ReadUInt64();
                ulong Offset = reader.ReadUInt64();
                Flags = reader.ReadUInt64();
                Unknown = reader.ReadUInt64();

                using (reader.TemporarySeek((long)Offset, System.IO.SeekOrigin.Begin))
                {
                    byte[] data = reader.ReadBytes((int)Size);
                    if (Flags == 1)
                        data = STLibraryCompression.ZLIB.Decompress(data);
                    SetData(data);
                }
            }
        }
    }
}
