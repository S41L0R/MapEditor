using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;
using System.Runtime.InteropServices;
using Toolbox.Core.WiiU;
using Toolbox.Core.Imaging;
using System.Linq;

namespace PluginSample
{
    public class NUTEXB_Parser
    {
        public byte[] ImageData { get; set; }
        public List<uint[]> MipSizes = new List<uint[]>();
        public string Name { get; set; }

        public bool IsSwitch { get; set; } = true;

        public Header ImageHeader { get; set; }

        public TexFormat GenericFormat
        {
            get { return FormatList[(NUTEXImageFormat)ImageHeader.Format]; }
            set {  ImageHeader.Format = (uint)FormatList.FirstOrDefault(x => x.Value == value).Key; }
        }

        [StructLayout(LayoutKind.Sequential, Pack = 1)]
        public class Header
        {
            public uint Padding;
            public uint Width;
            public uint Height;
            public uint Depth;
            public uint Format;
            public uint Unknown;
            public uint MipCount;
            public uint Alignment;
            public uint ArrayCount;
            public uint ImageSize;
            public Magic Magic = " XET";
            public ushort VersionMinor = 0x1;
            public ushort VersionMajor = 0x2;
        }

        public void FromGeneric(STGenericTexture texture)
        {
            ImageHeader = new Header()
            {
                Width = texture.Width,
                Height = texture.Height,
            };
        }

        public NUTEXB_Parser() { }

        public NUTEXB_Parser(Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                long footerPosition = reader.BaseStream.Length;

                //Subtract size of header
                reader.Seek(footerPosition - 48, System.IO.SeekOrigin.Begin);
                ImageHeader = reader.ReadStruct<Header>();

                //Subtract size of header and size of fixed string
                reader.Seek(footerPosition - 0x70, System.IO.SeekOrigin.Begin);
                reader.ReadUInt32(); // XNT magic
                Name = reader.ReadZeroTerminatedString();

                //Read mip sizes for each array (fixed as 0x40 bytes after image data)
                for (int i = 0; i < ImageHeader.ArrayCount; i++) {
                    reader.SeekBegin(ImageHeader.ImageSize + (i * 0x40));
                    MipSizes.Add(reader.ReadUInt32s((int)ImageHeader.MipCount));
                }

                //Read image data at the start of the file
                reader.SeekBegin(0);
                ImageData = reader.ReadBytes((int)ImageHeader.ImageSize);
            }
        }

        public void Save(Stream stream)
        {
            using (var writer = new FileWriter(stream)) {
                //Save image data
                writer.Write(ImageData);
                //Save mip sizes for each array (fixed as 0x40 bytes)
                for (int i = 0; i < MipSizes.Count; i++) {
                    writer.SeekBegin(ImageData.Length + (i * 0x40));
                    writer.Write(MipSizes[i]);
                }
                //Seek after all the image data and mip sizes
                writer.SeekBegin(ImageData.Length + (MipSizes.Count * 0x40));
                //Save strings
                writer.Write((byte)0x20);
                writer.WriteSignature("XNT");
                writer.WriteString(Name, 0x40 - 4);

                //Last save the image header
                writer.WriteStruct(ImageHeader);
            }
        }

        public static Dictionary<NUTEXImageFormat, TexFormat> FormatList = new Dictionary<NUTEXImageFormat, TexFormat>
        {
            { NUTEXImageFormat.B8G8R8A8_SRGB, TexFormat.BGRA8_SRGB },
            { NUTEXImageFormat.B8G8R8A8_UNORM, TexFormat.BGRA8_UNORM },
            { NUTEXImageFormat.R8G8B8A8_SRGB, TexFormat.RGBA8_SRGB },
            { NUTEXImageFormat.R8G8B8A8_UNORM, TexFormat.RGBA8_UNORM },
            { NUTEXImageFormat.R32G32B32A32_FLOAT, TexFormat.RGBA32_FLOAT },
            { NUTEXImageFormat.BC1_UNORM, TexFormat.BC1_UNORM },
            { NUTEXImageFormat.BC1_SRGB, TexFormat.BC1_SRGB },
            { NUTEXImageFormat.BC2_UNORM, TexFormat.BC2_UNORM },
            { NUTEXImageFormat.BC2_SRGB, TexFormat.BC2_SRGB },
            { NUTEXImageFormat.BC3_UNORM, TexFormat.BC3_UNORM },
            { NUTEXImageFormat.BC3_SRGB, TexFormat.BC3_SRGB },
            { NUTEXImageFormat.BC4_UNORM, TexFormat.BC4_UNORM },
            { NUTEXImageFormat.BC4_SNORM, TexFormat.BC4_SNORM },
            { NUTEXImageFormat.BC5_UNORM, TexFormat.BC5_UNORM },
            { NUTEXImageFormat.BC5_SNORM, TexFormat.BC5_SNORM },
            { NUTEXImageFormat.BC6_UFLOAT, TexFormat.BC6H_UF16 },
            { NUTEXImageFormat.BC7_UNORM, TexFormat.BC7_UNORM },
            { NUTEXImageFormat.BC7_SRGB, TexFormat.BC7_SRGB },
        };

        public enum NUTEXImageFormat : byte
        {
            R8G8B8A8_UNORM = 0x00,
            R8G8B8A8_SRGB = 0x05,
            R32G32B32A32_FLOAT = 0x34,
            B8G8R8A8_UNORM = 0x50,
            B8G8R8A8_SRGB = 0x55,
            BC1_UNORM = 0x80,
            BC1_SRGB = 0x85,
            BC2_UNORM = 0x90,
            BC2_SRGB = 0x95,
            BC3_UNORM = 0xa0,
            BC3_SRGB = 0xa5,
            BC4_UNORM = 0xb0,
            BC4_SNORM = 0xb5,
            BC5_UNORM = 0xc0,
            BC5_SNORM = 0xc5,
            BC6_UFLOAT = 0xd7,
            BC7_UNORM = 0xe0,
            BC7_SRGB = 0xe5,
        };
    }
}
