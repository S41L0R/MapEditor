using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class ME01_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        private uint Alignment;
        private bool IsSA01 = false;

        public ME01_Parser(System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                IsSA01 = reader.CheckSignature(4, "SA01");
                uint Signature = reader.ReadUInt32();


                if (IsSA01)
                    reader.SetByteOrder(true);
                else
                    reader.SetByteOrder(false);

                uint FileCount = reader.ReadUInt32();
                Alignment = reader.ReadUInt32();
                uint[] DataOffsets = reader.ReadUInt32s((int)FileCount);
                uint[] Sizes = reader.ReadUInt32s((int)FileCount);

                string[] FileNames = new string[FileCount];
                for (int i = 0; i < FileCount; i++)
                {
                    FileNames[i] = reader.ReadZeroTerminatedString();
                    while (true)
                    {
                        if (reader.ReadByte() != 0x30)
                        {
                            reader.Seek(-1);
                            break;
                        }
                    }
                }

                long DataPosition = reader.Position;
                for (int i = 0; i < FileCount; i++)
                {
                    //reader.SeekBegin(DataPosition + DataOffsets[i]);
                    var file = new FileEntry();
                    file.FileName = FileNames[i];
                    file.SetData(reader.ReadBytes((int)Sizes[i]));
                    Files.Add(file);

                    while (true)
                    {
                        if (reader.EndOfStream)
                            break;

                        if (reader.ReadByte() != 0x30)
                        {
                            reader.Seek(-1);
                            break;
                        }
                    }
                }
            }
        }


        public void Save(System.IO.Stream stream)
        {
            using (var writer = new FileWriter(stream, true))
            {
                if (IsSA01)
                    writer.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;
                else
                    writer.ByteOrder = Syroot.BinaryData.ByteOrder.LittleEndian;

                if (IsSA01)
                    writer.WriteSignature("SA01");
                else
                    writer.WriteSignature("ME01");
                writer.Write(Files.Count);
                writer.Write(Alignment);
                writer.Write(new uint[Files.Count]); //Save space for offsets
                for (int i = 0; i < Files.Count; i++)
                {
                    Files[i].SaveFileFormat();
                    writer.Write((uint)Files[i].FileData.Length);
                }

                for (int i = 0; i < Files.Count; i++) {
                    writer.WriteString(Files[i].FileName);

                    //Fixed 128 string length
                    if (i != Files.Count - 1)
                    {
                        int PaddingCount = 128 - Files[i].FileName.Length - 1;
                        for (int p = 0; p < PaddingCount; p++)
                            writer.Write((byte)0x30);
                    }
                    else //Else align normally
                    {
                        writer.AlignBytes((int)Alignment, 0x30);
                    }
                }

                uint[] Offsets = new uint[Files.Count];

                long DataStart = writer.Position;
                for (int i = 0; i < Files.Count; i++)
                {
                    Offsets[i] = (uint)(writer.Position - DataStart);

                    writer.Write(Files[i].AsBytes());
                    writer.AlignBytes((int)Alignment, 0x30);
                }

                writer.Seek(12, System.IO.SeekOrigin.Begin);
                writer.Write(Offsets);
            }
        }

        public class FileEntry : ArchiveFileInfo
        {

        }
    }
}
