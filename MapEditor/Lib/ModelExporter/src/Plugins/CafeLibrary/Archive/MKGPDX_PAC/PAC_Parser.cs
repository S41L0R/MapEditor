using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class PAC_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        public PAC_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(false);
                reader.ReadSignature(4, "pack");
                uint FileCount = reader.ReadUInt32();
                uint OffsetStringPool = reader.ReadUInt32();
                uint Alignment = reader.ReadUInt32();
                uint FileType = reader.ReadUInt32();

                for (int i = 0; i < FileCount; i++)
                {
                    var file = new FileEntry();
                    file.Read(reader);
                    Files.Add(file);
                }

                //Use the header alignment and set the block data
                reader.Align((int)Alignment);
                var DataBlockPosition = reader.Position;
                for (int i = 0; i < Files.Count; i++)
                {
                    reader.Seek(DataBlockPosition + Files[i].Offset, System.IO.SeekOrigin.Begin);
                    Files[i].SetData(reader.ReadBytes((int)Files[i].Size));

                    //Get the string data
                    reader.Seek(DataBlockPosition + OffsetStringPool + Files[i].NameOffset, System.IO.SeekOrigin.Begin);
                    Files[i].FileName = reader.ReadZeroTerminatedString();
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

            internal uint Size;
            internal uint Offset;
            internal uint NameOffset;

            public void Read(FileReader reader)
            {
                uint Unknown = reader.ReadUInt32();
                NameOffset = reader.ReadUInt32();
                Offset = reader.ReadUInt32();
                Size = reader.ReadUInt32();
            }
        }
    }
}
