using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core.WiiU;
using Toolbox.Core;
using System.Runtime.InteropServices;
using System.IO;
using Toolbox.Core.Imaging;

namespace CafeLibrary
{
    public class TVOL_Parser
    {
        public List<Image> Images = new List<Image>();

        public TVOL_Parser(Stream stream) {
            Read(new FileReader(stream));
        }

        public void Save(Stream stream) {
            Write(new FileWriter(stream));
        }

        void Read(FileReader reader) {
            reader.SetByteOrder(false);
            uint numTextures = reader.ReadUInt32();
            for (int i = 0; i < numTextures; i++)
            {
                uint offset = reader.ReadUInt32();
                uint size = reader.ReadUInt32();
                if (size == 0)
                    continue;

                reader.SeekBegin(offset + 48);
                ulong unk = reader.ReadUInt64(); //Varies. Shifts like a offset or size
                ulong headerOffset = reader.ReadUInt64();
                ulong sectionSize = reader.ReadUInt64();
                ulong unk3 = reader.ReadUInt64(); //16
                ulong unk4 = reader.ReadUInt64(); //4

                reader.SeekBegin(offset + 48 + headerOffset);
                reader.ReadUInt32(); //padding
                uint unk5 = reader.ReadUInt32(); //C03F
                ulong unk6 = reader.ReadUInt64(); //32

                Image entry = new Image();

                if (unk6 != 32)
                {
                    //Platform PC
                    reader.Seek(-8);
                    uint unk7 = reader.ReadUInt32();
                    uint unk8 = reader.ReadUInt32();
                    uint unk9 = reader.ReadUInt32();
                    uint unk10 = reader.ReadUInt32();
                    entry.Width = reader.ReadUInt32();
                    entry.Height = reader.ReadUInt32();
                    entry.Depth = reader.ReadUInt32();
                    entry.ArrayCount = reader.ReadUInt32();
                    reader.Seek(44);
                    uint imageSize = reader.ReadUInt32();
                    reader.Seek(16);

                    entry.Parameters.DontSwapRG = true;
                    entry.ImageData = reader.ReadBytes((int)imageSize);

                    entry.Platform = new DefaultSwizzle(TexFormat.RGB8_UNORM);
                }
                else
                {
                    //Platform switch
                    ulong unk7 = reader.ReadUInt64(); //24
                    ulong unk8 = reader.ReadUInt64(); //40

                    //Matches XTX info header
                    uint imageSize = reader.ReadUInt32();
                    uint Alignment = reader.ReadUInt32();
                    entry.Width = reader.ReadUInt32();
                    entry.Height = reader.ReadUInt32();
                    entry.Depth = reader.ReadUInt32();
                    uint target = reader.ReadUInt32();
                    uint Format = reader.ReadUInt32();
                    uint unk10 = reader.ReadUInt32(); //1
                    entry.ImageData = reader.ReadBytes((int)imageSize);

                    entry.Platform = new SwitchSwizzle(
                        XTX_Parser.FormatList[(XTX_Parser.XTXImageFormat)Format])
                    {
                        Target = (int)target,
                    };
                }
            }
        }

        void Write(FileWriter writer)
        {
  
        }

        public class Image : STGenericTexture
        {
            public byte[] ImageData { get; set; }

            public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0)
            {
               return ImageData;
            }

            public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
            {
                throw new NotImplementedException();
            }
        }
    }
}
