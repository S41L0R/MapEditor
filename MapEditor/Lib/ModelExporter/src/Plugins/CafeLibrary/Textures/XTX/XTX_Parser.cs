using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;
using System.ComponentModel;
using Toolbox.Core;
using Toolbox.Core.IO;
using System.Linq;

namespace CafeLibrary
{
    public class XTX_Parser
    {
        public uint HeaderSize { get; set; }
        public uint MajorVersion { get; set; }
        public uint MinorVersion { get; set; }
        public List<BlockHeader> Blocks { get; set; }
        public List<TextureInfo> TextureInfos { get; set; }
        public List<byte[]> TextureBlocks { get; set; }

        private const int texHeadBlkType = 2;
        private const int dataBlkType = 3;

        public XTX_Parser(Stream stream) {
            Read(new FileReader(stream));
        }

        void Read(FileReader reader)
        {
            Blocks = new List<BlockHeader>();
            TextureInfos = new List<TextureInfo>();
            TextureBlocks = new List<byte[]>();

            string Signature = reader.ReadString(4, Encoding.ASCII);
            if (Signature != "DFvN")
                throw new Exception($"Invalid signature {Signature}! Expected DFvN.");

            HeaderSize = reader.ReadUInt32();
            MajorVersion = reader.ReadUInt32();
            MinorVersion = reader.ReadUInt32();

            uint TextureBlockType = 2;
            uint DataBlockType = 3;

            reader.SeekBegin(HeaderSize);
            while (reader.Position < reader.BaseStream.Length)
            {
                BlockHeader blockHeader = new BlockHeader();
                blockHeader.Read(reader);
                Blocks.Add(blockHeader);

                if ((uint)blockHeader.BlockType == TextureBlockType) {
                    TextureInfo textureInfo = new TextureInfo();
                    textureInfo.Read(new FileReader(blockHeader.Data));
                    TextureInfos.Add(textureInfo);
                }
                if ((uint)blockHeader.BlockType == DataBlockType) {
                    TextureBlocks.Add(blockHeader.Data);
                }
            }

            for (int i = 0; i < TextureInfos.Count; i++)
                TextureInfos[i].ImageData = TextureBlocks[i];
        }

        public void Save(Stream stream) {
            Write(new FileWriter(stream));
        }

        void Write(FileWriter writer)
        {
            int Alignment = 512;
            uint TextureInfoType = 2;
            uint TextureBlockType = 3;

            SetupBlockSaving(TextureBlockType);

            writer.SetByteOrder(false);
            writer.WriteSignature("DFvN");
            writer.Write(HeaderSize);
            writer.Write(MajorVersion);
            writer.Write(MinorVersion);
            writer.Seek(HeaderSize, SeekOrigin.Begin);

            int curTexBlock = 0;
            int curTexImage = 0;

            foreach (var block in Blocks)
            {
                if (block.BlockType == TextureBlockType)
                {
                    block.WriteHeader(writer);
                    block.WriteBlock(writer, 512);
                }
                else if (block.BlockType == TextureInfoType)
                {
                    block.Data = TextureInfos[curTexImage++].CreateBlock();
                    block.WriteHeader(writer);
                    block.WriteBlock(writer);
                }
                else
                {
                    block.WriteHeader(writer);
                    block.WriteBlock(writer);
                }
            }
        }

        private void SetupBlockSaving(uint TextureBlockType)
        {
            int curTex = 0;
            foreach (var block in Blocks)
            {
                if (block.BlockType == TextureBlockType)
                {
                    block.Data = TextureInfos[curTex++].ImageData;
                }
            }
        }

        public class BlockHeader
        {
            public uint BlockSize { get; set; }
            public UInt64 DataSize { get; set; }
            public uint BlockType { get; set; }
            public uint GlobalBlockIndex { get; set; }
            public uint IncBlockTypeIndex { get; set; }
            public long DataOffset;
            public byte[] Data;

            public void Read(FileReader reader)
            {
                var pos = reader.Position;

                string Signature = reader.ReadString(4, Encoding.ASCII);
                if (Signature != "HBvN")
                    throw new Exception($"Invalid signature {Signature}! Expected HBvN.");

                BlockSize = reader.ReadUInt32();
                DataSize = reader.ReadUInt64();
                DataOffset = reader.ReadInt64();
                BlockType = reader.ReadUInt32();
                GlobalBlockIndex = reader.ReadUInt32();
                IncBlockTypeIndex = reader.ReadUInt32();

                reader.Seek((int)pos + DataOffset, SeekOrigin.Begin);
                Data = reader.ReadBytes((int)DataSize);
            }

            private long headerPos = 0;
            public void WriteHeader(FileWriter writer)
            {
                headerPos = writer.Position;

                writer.WriteSignature("HBvN");
                writer.Write(BlockSize);
                writer.Write((ulong)Data.Length);
                writer.Write((ulong)DataOffset);
                writer.Write(BlockType);
                writer.Write(GlobalBlockIndex);
                writer.Write(IncBlockTypeIndex);
            }

            public void WriteBlock(FileWriter writer, int DataAlignment = 0)
            {
                //From the block size goto where the data will start
                writer.Seek((int)(BlockSize + headerPos), SeekOrigin.Begin);

                //Add alignment if necessary
                if (DataAlignment != 0)
                    writer.Align(DataAlignment);

                var blockPos = writer.Position;

                //Satisfy the offset
                using (writer.TemporarySeek(headerPos + 16, SeekOrigin.Begin))
                {
                    //Offset starts from the block header
                    writer.Write(blockPos - headerPos);
                }

                writer.Write(Data);

                //Set the total size
                uint TotalDataSize = (uint)(writer.Position - blockPos);
                using (writer.TemporarySeek(headerPos + 8, SeekOrigin.Begin))
                {
                    writer.Write((ulong)TotalDataSize);
                }
            }
        }

        public class TextureInfo
        {
            public ulong DataSize { get; set; }
            public uint Alignment { get; set; }
            public int Target { get; set; }
            public XTXImageFormat XTXFormat { get; set; }
            public uint SliceSize { get; set; }
            public uint[] MipOffsets { get; set; }
            public byte[] ImageData;

            public uint Width { get; set; }
            public uint Height { get; set; }
            public uint Depth { get; set; }
            public uint MipCount { get; set; }

            public TexFormat GenericFormat
            {
                get { return FormatList[XTXFormat]; }
                set {
                    XTXFormat = FormatList.FirstOrDefault(x => x.Value == value).Key;
                }
            }

            private byte[] unknownData;

            public void Read(FileReader reader)
            {
                DataSize = reader.ReadUInt64();
                Alignment = reader.ReadUInt32();
                Width = reader.ReadUInt32();
                Height = reader.ReadUInt32();
                Depth = reader.ReadUInt32();
                Target = reader.ReadInt32();
                XTXFormat = reader.ReadEnum<XTXImageFormat>(true);
                MipCount = reader.ReadUInt32();
                SliceSize = reader.ReadUInt32();
                MipOffsets = reader.ReadUInt32s((int)MipCount);
                unknownData = reader.ReadBytes(0x38);
            }

            public byte[] CreateBlock()
            {
                var mem = new MemoryStream();
                using (var writer = new FileWriter(mem))
                {
                    writer.Write((ulong)DataSize);
                    writer.Write(Alignment);
                    writer.Write(Width);
                    writer.Write(Height);
                    writer.Write(Depth);
                    writer.Write(Target);
                    writer.Write(XTXFormat, true);
                    writer.Write(MipCount);
                    writer.Write(SliceSize);
                    writer.Write(MipOffsets);
                    writer.Write(unknownData);
                    return mem.ToArray();
                }
            }
        }

        public static Dictionary<XTXImageFormat, TexFormat> FormatList = new Dictionary<XTXImageFormat, TexFormat>()
        {
            { XTXImageFormat.NVN_FORMAT_R8, TexFormat.R8_UNORM },
            { XTXImageFormat.NVN_FORMAT_RGBA8, TexFormat.RGBA8_UNORM },
            { XTXImageFormat.NVN_FORMAT_RGBA8_SRGB, TexFormat.RGBA8_SRGB },
            { XTXImageFormat.NVN_FORMAT_RGB10A2, TexFormat.RGBB10A2_UNORM },
            { XTXImageFormat.NVN_FORMAT_RGB565, TexFormat.RGB565_UNORM },
            { XTXImageFormat.NVN_FORMAT_RGB5A1, TexFormat.RGB5A1_UNORM },
            { XTXImageFormat.NVN_FORMAT_RGBA4, TexFormat.RGBA4_UNORM },
            { XTXImageFormat.DXT1, TexFormat.BC1_UNORM },
            { XTXImageFormat.DXT3, TexFormat.BC2_UNORM },
            { XTXImageFormat.DXT5, TexFormat.BC3_UNORM },
            { XTXImageFormat.BC4U, TexFormat.BC4_UNORM },
            { XTXImageFormat.BC4S, TexFormat.BC4_SNORM },
            { XTXImageFormat.BC5U, TexFormat.BC5_UNORM },
            { XTXImageFormat.BC5S, TexFormat.BC5_SNORM },
            { XTXImageFormat.BC7_UNORM, TexFormat.BC7_UNORM },
            { XTXImageFormat.BC7_SRGB, TexFormat.BC7_SRGB },
            { XTXImageFormat.BC6_UFloat, TexFormat.BC6H_UF16 },
            { XTXImageFormat.BC6_SFloat, TexFormat.BC6H_SF16 },

            { XTXImageFormat.ASTC_4x4_UNORM, TexFormat.ASTC_4x4_UNORM },
            { XTXImageFormat.ASTC_5x4_UNORM, TexFormat.ASTC_5x4_UNORM },
            { XTXImageFormat.ASTC_5x5_UNORM, TexFormat.ASTC_5x5_UNORM },
            { XTXImageFormat.ASTC_6x5_UNORM, TexFormat.ASTC_6x5_UNORM },
            { XTXImageFormat.ASTC_6x6_UNORM, TexFormat.ASTC_6x6_UNORM },
            { XTXImageFormat.ASTC_8x5_UNORM, TexFormat.ASTC_8x5_UNORM },
            { XTXImageFormat.ASTC_8x6_UNORM, TexFormat.ASTC_8x6_UNORM },
            { XTXImageFormat.ASTC_8x8_UNORM, TexFormat.ASTC_8x8_UNORM },
            { XTXImageFormat.ASTC_10x5_UNORM, TexFormat.ASTC_10x5_UNORM },
            { XTXImageFormat.ASTC_10x6_UNORM, TexFormat.ASTC_10x6_UNORM },
            { XTXImageFormat.ASTC_10x8_UNORM, TexFormat.ASTC_10x8_UNORM },
            { XTXImageFormat.ASTC_10x10_UNORM, TexFormat.ASTC_10x10_UNORM },
            { XTXImageFormat.ASTC_12x10_UNORM, TexFormat.ASTC_12x10_UNORM },
            { XTXImageFormat.ASTC_12x12_UNORM, TexFormat.ASTC_12x12_UNORM },

            { XTXImageFormat.ASTC_4x4_SRGB, TexFormat.ASTC_4x4_SRGB },
            { XTXImageFormat.ASTC_5x4_SRGB, TexFormat.ASTC_5x4_SRGB },
            { XTXImageFormat.ASTC_5x5_SRGB, TexFormat.ASTC_5x5_SRGB },
            { XTXImageFormat.ASTC_6x5_SRGB, TexFormat.ASTC_6x5_SRGB },
            { XTXImageFormat.ASTC_6x6_SRGB, TexFormat.ASTC_6x6_SRGB },
            { XTXImageFormat.ASTC_8x5_SRGB, TexFormat.ASTC_8x5_SRGB },
            { XTXImageFormat.ASTC_8x6_SRGB, TexFormat.ASTC_8x6_SRGB },
            { XTXImageFormat.ASTC_8x8_SRGB, TexFormat.ASTC_8x8_SRGB },
            { XTXImageFormat.ASTC_10x5_SRGB, TexFormat.ASTC_10x5_SRGB },
            { XTXImageFormat.ASTC_10x6_SRGB, TexFormat.ASTC_10x6_SRGB },
            { XTXImageFormat.ASTC_10x8_SRGB, TexFormat.ASTC_10x8_SRGB },
            { XTXImageFormat.ASTC_10x10_SRGB, TexFormat.ASTC_10x10_SRGB },
            { XTXImageFormat.ASTC_12x10_SRGB, TexFormat.ASTC_12x10_SRGB },
            { XTXImageFormat.ASTC_12x12_SRGB, TexFormat.ASTC_12x12_SRGB },
        };

        //Full list
        //https://github.com/Ryujinx/Ryujinx/blob/484eb645ae0611f60fae845ed011ed6115352e06/Ryujinx.Graphics.GAL/Format.cs
        public enum XTXImageFormat : uint
        {
            NVN_FORMAT_RGBA8 = 0x25,
            NVN_FORMAT_RGBA8_SRGB = 0x38,
            NVN_FORMAT_RGB10A2 = 0x3d,
            NVN_FORMAT_RGB565 = 0x3c,
            NVN_FORMAT_RGB5A1 = 0x3b,
            NVN_FORMAT_RGBA4 = 0x39,
            NVN_FORMAT_R8 = 0x01,
            NVN_FORMAT_RG8 = 0x0d,
            DXT1 = 0x42,
            DXT3 = 0x43,
            DXT5 = 0x44,
            BC4U = 0x49,
            BC4S = 0x4a,
            BC5U = 0x4b,
            BC5S = 0x4c,
            BC7_UNORM = 0x4d,
            BC7_SRGB = 0x4e,
            BC6_UFloat,
            BC6_SFloat,

            ASTC_4x4_UNORM = 0x79,
            ASTC_5x4_UNORM = 0x7A,
            ASTC_5x5_UNORM = 0x7B,
            ASTC_6x5_UNORM = 0x7C,
            ASTC_6x6_UNORM = 0x7D,
            ASTC_8x5_UNORM = 0x7E,
            ASTC_8x6_UNORM = 0x7F,
            ASTC_8x8_UNORM = 0x80,
            ASTC_10x5_UNORM = 0x81,
            ASTC_10x6_UNORM = 0x82,
            ASTC_10x8_UNORM = 0x83,
            ASTC_10x10_UNORM = 0x84,
            ASTC_12x10_UNORM = 0x85,
            ASTC_12x12_UNORM = 0x86,
            ASTC_4x4_SRGB = 0x87,
            ASTC_5x4_SRGB = 0x88,
            ASTC_5x5_SRGB = 0x89,
            ASTC_6x5_SRGB = 0x8A,
            ASTC_6x6_SRGB = 0x8B,
            ASTC_8x5_SRGB = 0x8C,
            ASTC_8x6_SRGB = 0x8D,
            ASTC_8x8_SRGB = 0x8E,
            ASTC_10x5_SRGB = 0x8F,
            ASTC_10x6_SRGB = 0x90,
            ASTC_10x8_SRGB = 0x91,
            ASTC_10x10_SRGB = 0x92,
            ASTC_12x10_SRGB = 0x93,
            ASTC_12x12_SRGB = 0x94,
        };
    }
}
