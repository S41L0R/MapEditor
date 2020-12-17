using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;
using System.Runtime.InteropServices;
using Toolbox.Core.WiiU;
using Toolbox.Core.Imaging;

namespace PluginSample
{
    //Ported from https://github.com/IcySon55/Kuriimu/blob/master/src/image/image_nintendo/BXLIM.cs
    public class BXLIM_Parser
    {
        public static Dictionary<byte, CTR_3DS.PICASurfaceFormat> CTRFormats = new Dictionary<byte, CTR_3DS.PICASurfaceFormat>
        {
            [0] = CTR_3DS.PICASurfaceFormat.L8,
            [1] = CTR_3DS.PICASurfaceFormat.A8,
            [2] = CTR_3DS.PICASurfaceFormat.LA4,
            [3] = CTR_3DS.PICASurfaceFormat.LA8,
            [4] = CTR_3DS.PICASurfaceFormat.HiLo8,
            [5] = CTR_3DS.PICASurfaceFormat.RGB565,
            [6] = CTR_3DS.PICASurfaceFormat.RGBA8,
            [7] = CTR_3DS.PICASurfaceFormat.RGBA5551,
            [8] = CTR_3DS.PICASurfaceFormat.RGBA4,
            [9] = CTR_3DS.PICASurfaceFormat.RGBA8,
            [10] = CTR_3DS.PICASurfaceFormat.ETC1,
            [11] = CTR_3DS.PICASurfaceFormat.ETC1A4,
            [18] = CTR_3DS.PICASurfaceFormat.L4,
            [19] = CTR_3DS.PICASurfaceFormat.A4,
        };

        public static Dictionary<byte, TexFormat> CafeFormatsWiiU = new Dictionary<byte, TexFormat>()
        {
            [5] = TexFormat.RGB565_UNORM,
            [6] = TexFormat.RGBA8_UNORM,
            [7] = TexFormat.RGB5A1_UNORM,
            [8] = TexFormat.RGBA4_UNORM,
            [9] = TexFormat.RGBA8_SRGB,


            [12] = TexFormat.BC1_UNORM,
            [13] = TexFormat.BC2_UNORM,
            [14] = TexFormat.BC3_UNORM,
            [15] = TexFormat.BC4_UNORM,
            [16] = TexFormat.BC4_UNORM, //Alpha
            [17] = TexFormat.BC5_UNORM,


            [20] = TexFormat.RGBA8_SRGB,
            [21] = TexFormat.BC1_SRGB,
            [22] = TexFormat.BC2_SRGB,
            [23] = TexFormat.BC3_SRGB,
            [24] = TexFormat.RGBB10A2_UNORM,
            [25] = TexFormat.RGB5_UNORM
        };

    /*    public static Dictionary<byte, TexFormat> CafeFormatsWiiU = new Dictionary<byte, TexFormat>()
        {
            [0] = TexFormat.L8,
            [1] = TexFormat.A8,
            [2] = TexFormat.LA4,
            [3] = TexFormat.LA8,
            [4] = TexFormat.RG8, //HILO8
            [5] = TexFormat.BGR5,
            [6] = TexFormat.BGRA8,
            [7] = TexFormat.BGR5A1,
            [8] = TexFormat.RGBA4,
            [9] = TexFormat.RGBA8,
            [10] = TexFormat.ETC1,
            [11] = TexFormat.ETC1_A4,
            [12] = TexFormat.BC1,
            [13] = TexFormat.BC2,
            [14] = TexFormat.BC3,
            [15] = TexFormat.BC4, //BC4L_UNORM
            [16] = TexFormat.BC4, //BC4A_UNORM
            [17] = TexFormat.BC5,
            [18] = TexFormat.L4,
            [19] = TexFormat.A4,
            [20] = TexFormat.RGBA8, //SRGB
            [21] = TexFormat.BC1, //SRGB
            [22] = TexFormat.BC2, //SRGB
            [23] = TexFormat.BC3, //SRGB
            [24] = TexFormat.RGB10A2,
            [25] = TexFormat.RGB5,
        };*/

        public enum CTRSwizzleParams
        {
            None,
            Rotate90 = 0x4,
            Transpose = 0x8,
        }

        public string Magic { get; set; }
        public ushort ByteOrderMark { get; set; }
        public ushort HeaderSize { get; set; }
        public uint Version { get; set; }

        public bool IsCTR = false;

        public ImageBlock ImageBlock { get; set; }
        public byte[] DataBlock { get; set; }

        public BXLIM_Parser() { }

        public BXLIM_Parser(Stream stream)
        {
            using (var reader = new FileReader(stream))
            {
                reader.SetByteOrder(true);

                DataBlock = reader.ReadBytes((int)reader.BaseStream.Length - 40);
                Magic = reader.ReadString(4, Encoding.ASCII);
                ByteOrderMark = reader.ReadUInt16();
                reader.CheckByteOrderMark(ByteOrderMark);
                HeaderSize = reader.ReadUInt16();
                Version = reader.ReadUInt32();
                uint fileSize = reader.ReadUInt32();
                var blockount = reader.ReadUInt16();
                var padding = reader.ReadUInt16();
                ImageBlock = new ImageBlock(reader, Magic == "CLIM");

                if (reader.ByteOrder == Syroot.BinaryData.ByteOrder.LittleEndian)
                    IsCTR = true;
            }
        }

        public void Save(Stream stream)
        {
            using (var writer = new FileWriter(stream))
            {
                writer.CheckByteOrderMark(ByteOrderMark);

                writer.Write(DataBlock);
                writer.WriteSignature(Magic);
                writer.Write(ByteOrderMark);
                writer.Write(HeaderSize);
                writer.Write(Version);
                writer.Write(DataBlock.Length + 40);
                writer.Write((ushort)1);
                writer.Write((ushort)0);
                ImageBlock.Write(writer, Magic == "CLIM");
            }
        }
    }

    public class ImageBlock
    {
        public uint SectionSize;
        public ushort Width;
        public ushort Height;
        public ushort Alignment;
        public byte Format;
        public byte Flags;
        public uint DataSize;

        public ImageBlock() { }

        public ImageBlock(FileReader reader, bool isCLIM)
        {
            reader.ReadSignature(4, "imag");
            SectionSize = reader.ReadUInt32();
            Width = reader.ReadUInt16();
            Height = reader.ReadUInt16();
            if (isCLIM)
            {
                Format = reader.ReadByte();
                Flags = reader.ReadByte(); // not used in BCLIM
                Alignment = reader.ReadUInt16();
            }
            else
            {
                Alignment = reader.ReadUInt16();
                Format = reader.ReadByte();
                Flags = reader.ReadByte();
            }
            DataSize = reader.ReadUInt32();
        }

        public void Write(FileWriter writer, bool isCLIM)
        {
            writer.WriteSignature("imag");
            writer.Write(SectionSize);
            writer.Write(Width);
            writer.Write(Height);
            if (isCLIM)
            {
                writer.Write(Format);
                writer.Write(Flags);
                writer.Write(Alignment);
            }
            else
            {
                writer.Write(Alignment);
                writer.Write(Format);
                writer.Write(Flags);
            }
            writer.Write(DataSize);
        }

        public Toolbox.Core.WiiU.GX2.GX2TileMode TileMode
        {
            get
            {
                return (Toolbox.Core.WiiU.GX2.GX2TileMode)((int)Flags & 31);
            }
            set
            {
                Flags = (byte)((int)Flags & 224 | (int)(byte)value & 31);
            }
        }

        public uint CafeSwizzle
        {
            get
            {
                return (uint)(((int)((uint)Flags >> 5) & 7) << 8);
            }
            set
            {
                Flags = (byte)((int)Flags & 31 | (int)(byte)(value >> 8) << 5);
            }
        }
    }
}
