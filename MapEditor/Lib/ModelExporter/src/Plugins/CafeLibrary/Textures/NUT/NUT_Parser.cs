using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core.WiiU;
using Toolbox.Core;
using System.Runtime.InteropServices;
using System.IO;

namespace CafeLibrary
{
    public class NUT_Parser
    {
        public string Magic;
        public ushort ByteOrderMark;
        public ushort Version;
        public List<NutImage> Images = new List<NutImage>();
        byte[] Reserved;

        public bool IsNTP3 => Magic == "NTP3";

        public NUT_Parser(Stream stream) {
            Read(new FileReader(stream));
        }

        public void Save(Stream stream) {
            Write(new FileWriter(stream));
        }

        void Read(FileReader reader)
        {
            reader.SetByteOrder(true);

            Magic = reader.ReadString(4, Encoding.ASCII);
            Version = reader.ReadUInt16();

            if (Magic == "NTWD")
                reader.SetByteOrder(false);

            ushort ImageCount = reader.ReadUInt16();
            Reserved = reader.ReadBytes(8);

            for (int i = 0; i < ImageCount; i++)
            {
                NutImage image = new NutImage();
                image.Read(reader, this);
                Images.Add(image);
            }
        }

        void Write(FileWriter writer)
        {
            writer.WriteSignature(Magic);
            writer.Write(Version);
            writer.Write((ushort)Images.Count);
            writer.Write(Reserved);

            for (int i = 0; i < Images.Count; i++) {
                Images[i].Write(writer, IsNTP3);
            }
        }

        public class GIDX
        {
            public uint HeaderSize;
            public uint HashID;
            public uint Padding;

            public void Read(FileReader reader, bool IsNTP3)
            {
                var Magic = reader.ReadSignature(4, "GIDX");
                HeaderSize = reader.ReadUInt32();
                HashID = reader.ReadUInt32();
                Padding = reader.ReadUInt32();
            }

            public void Write(FileWriter writer, bool IsNTP3)
            {
                writer.WriteSignature("GIDX");
                writer.Write(HeaderSize);
                writer.Write(HashID);
                writer.Write(Padding);
            }
        }


        public class NutImage
        {
            public uint TotalTextureSize;
            public uint PaletteSize;
            public uint ImageSize;
            public uint HeaderSize;
            public ushort PaletteCount;
            public byte NutFormat;
            public byte OldFormat;
            public byte PaletteFormat;

            public byte MipCount;
            public byte ArrayCount;
            public uint Width;
            public uint Height;
            public TexFormat Format;

            public bool IsCubeMap = false;

            public EXT ExternalData;
            public GIDX GIDXHeaderData;
            public NutGX2Surface Gx2HeaderData;

            public byte[] Data;
            public byte[] MipData;

            public uint[] ImageSizes;

            public void Read(FileReader reader, NUT_Parser header)
            {
                long pos = reader.Position;

                Console.WriteLine("pos " + pos);

                TotalTextureSize = reader.ReadUInt32(); //Including header
                PaletteSize = reader.ReadUInt32(); //Used in older versions
                ImageSize = reader.ReadUInt32();
                HeaderSize = reader.ReadUInt16();
                PaletteCount = reader.ReadUInt16(); //Used in older versions
                OldFormat = reader.ReadByte(); //Used in older versions
                MipCount = reader.ReadByte();
                PaletteFormat = reader.ReadByte(); //Used in older versions
                NutFormat = reader.ReadByte();
                Format = SetFormat(NutFormat);

                Width = reader.ReadUInt16();
                Height = reader.ReadUInt16();
                uint Unknown = reader.ReadUInt32(); //Maybe related to 3D depth size
                uint Flags = reader.ReadUInt32();  //Determine when to use cube maps


                uint dataOffset = 0;

                if (header.IsNTP3)
                {
                    if (header.Version < 0x0200)
                    {
                        dataOffset = HeaderSize;
                        uint padding2 = reader.ReadUInt32();
                    }
                    else if (header.Version >= 0x0200)
                        dataOffset = reader.ReadUInt32();
                }
                else
                    dataOffset = reader.ReadUInt32();


                uint mipOffset = reader.ReadUInt32();
                uint gtxHeaderOffset = reader.ReadUInt32();
                uint padding = reader.ReadUInt32(); //Could be an offset to an unused section?

                uint cubeMapSize1 = 0;
                uint cubeMapSize2 = 0;

                if ((Flags & (uint)DDS.DDSCAPS2.CUBEMAP) == (uint)DDS.DDSCAPS2.CUBEMAP)
                {
                    //Only supporting all six faces
                    if ((Flags & (uint)DDS.DDSCAPS2.CUBEMAP_ALLFACES) == (uint)DDS.DDSCAPS2.CUBEMAP_ALLFACES)
                    {
                        IsCubeMap = true;
                        ArrayCount = 6;
                    }
                    else
                    {
                        throw new NotImplementedException($"Unsupported cubemap face amount for texture.");
                    }
                }

                if (IsCubeMap)
                {
                    cubeMapSize1 = reader.ReadUInt32();
                    cubeMapSize2 = reader.ReadUInt32();
                    uint unk = reader.ReadUInt32();
                    uint unk2 = reader.ReadUInt32();
                }

                ImageSizes = new uint[MipCount];

                uint MipBlockSize = 0;

                if (MipCount == 1)
                {
                    if (IsCubeMap)
                        ImageSizes[0] = cubeMapSize1;
                    else
                        ImageSizes[0] = ImageSize;
                }
                else
                {
                    if (header.IsNTP3)
                        ImageSizes = reader.ReadUInt32s((int)MipCount);
                    else
                    {
                        ImageSizes[0] = reader.ReadUInt32();
                        MipBlockSize = reader.ReadUInt32();

                        reader.ReadUInt32s((int)MipCount - 2); //Padding / Unused
                    }

                    reader.Align(16);
                }

                ExternalData = new EXT();
                ExternalData.Read(reader, header.IsNTP3);

                GIDXHeaderData = new GIDX();
                GIDXHeaderData.Read(reader, header.IsNTP3);

                if (dataOffset != 0)
                {
                    using (reader.TemporarySeek(dataOffset + pos, System.IO.SeekOrigin.Begin))
                    {
                        if (header.IsNTP3)
                            Data = reader.ReadBytes((int)ImageSize);
                        else
                            Data = reader.ReadBytes((int)ImageSizes[0]); //Mip maps are seperate for GX2
                    }
                }

                if (mipOffset != 0)
                {
                    using (reader.TemporarySeek(mipOffset + pos, System.IO.SeekOrigin.Begin))
                    {
                        MipData = reader.ReadBytes((int)MipBlockSize);
                    }
                }

                if (gtxHeaderOffset != 0)
                {
                    using (reader.TemporarySeek(gtxHeaderOffset + pos, System.IO.SeekOrigin.Begin))
                    {
                        //Now here is where the GX2 header starts
                        Gx2HeaderData = new NutGX2Surface();
                        Gx2HeaderData.Read(reader);
                        Gx2HeaderData.data = Data;
                        Gx2HeaderData.mipData = MipData;
                    }
                }

                //Seek back for next image
                reader.Seek(pos + HeaderSize, System.IO.SeekOrigin.Begin);
            }

            public void Write(FileWriter writer, bool IsNTP3)
            {

            }
        }

        static TexFormat SetFormat(byte format)
        {
            switch (format)
            {
                case 0x0: return TexFormat.BC1_UNORM;
                case 0x1: return TexFormat.BC2_UNORM;
                case 0x2: return TexFormat.BC3_UNORM;
                case 8: return TexFormat.BGR5A1_UNORM;
                case 12: return TexFormat.RGBA16_UNORM;
                case 14: return TexFormat.RGBA8_UNORM;
                case 16: return TexFormat.RGBA8_UNORM;
                case 17: return TexFormat.RGBA8_UNORM;
                case 21: return TexFormat.BC4_UNORM;
                case 22: return TexFormat.BC5_UNORM;
                default:
                    throw new NotImplementedException($"Unsupported Nut Format {format}");
            }
        }

        public class EXT
        {
            public uint Unknown = 32;
            public uint HeaderSize = 16;
            public uint Padding;

            public void Read(FileReader reader, bool IsNTP3)
            {
                var Magic = reader.ReadSignature(3, "eXt");
                byte padding = reader.ReadByte();
                Unknown = reader.ReadUInt32();
                HeaderSize = reader.ReadUInt32();
                Padding = reader.ReadUInt32();
            }

            public void Write(FileWriter writer, bool IsNTP3)
            {
                writer.WriteSignature("Ext");
                writer.Write((byte)0);
                writer.Write(Unknown);
                writer.Write(HeaderSize);
                writer.Write(Padding);
            }
        }

        public class NutGX2Surface : GX2.GX2Surface
        {
            public NutGX2Surface()
            {
                compSel = new byte[4] { 0, 1, 2, 3, };
            }

            public void Read(FileReader reader)
            {
                reader.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;

                dim = reader.ReadUInt32();
                width = reader.ReadUInt32();
                height = reader.ReadUInt32();
                depth = reader.ReadUInt32();
                numMips = reader.ReadUInt32();
                format = reader.ReadUInt32();
                aa = reader.ReadUInt32();
                use = reader.ReadUInt32();
                imageSize = reader.ReadUInt32();
                imagePtr = reader.ReadUInt32();
                mipSize = reader.ReadUInt32();
                mipPtr = reader.ReadUInt32();
                tileMode = reader.ReadUInt32();
                swizzle = reader.ReadUInt32();
                alignment = reader.ReadUInt32();
                pitch = reader.ReadUInt32();
                mipOffset = reader.ReadUInt32s(13);
                firstMip = reader.ReadUInt32();
                imageCount = reader.ReadUInt32();
                firstSlice = reader.ReadUInt32();
            }
            public void Write(FileWriter writer)
            {
                writer.Write(dim);
                writer.Write(width);
                writer.Write(height);
                writer.Write(depth);
                writer.Write(numMips);
                writer.Write(format);
                writer.Write(aa);
                writer.Write(use);
                writer.Write(imageSize);
                writer.Write(imagePtr);
                writer.Write(mipSize);
                writer.Write(mipPtr);
                writer.Write(tileMode);
                writer.Write(swizzle);
                writer.Write(alignment);
                writer.Write(pitch);
                writer.Write(mipOffset);
                writer.Write(firstMip);
                writer.Write(imageCount);
                writer.Write(firstSlice);
            }
        }
    }
}
