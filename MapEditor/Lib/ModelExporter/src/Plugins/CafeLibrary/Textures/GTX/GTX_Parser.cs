using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Toolbox.Core;
using Toolbox.Core.IO;
using Toolbox.Core.WiiU;
using Toolbox.Core.ModelView;

namespace CafeLibrary
{
    public class GTX_Parser
    {
        public List<TextureData> Textures = new List<TextureData>();
        public List<GTXDataBlock> blocks = new List<GTXDataBlock>();

        private GTXHeader header;

        public enum BlockType : uint
        {
            Invalid = 0x00,
            EndOfFile = 0x01,
            AlignData = 0x02,
            VertexShaderHeader = 0x03,
            VertexShaderProgram = 0x05,
            PixelShaderHeader = 0x06,
            PixelShaderProgram = 0x07,
            GeometryShaderHeader = 0x08,
            GeometryShaderProgram = 0x09,
            GeometryShaderProgram2 = 0x10,
            ImageInfo = 0x11,
            ImageData = 0x12,
            MipData = 0x13,
            ComputeShaderHeader = 0x14,
            ComputeShader = 0x15,
            UserBlock = 0x16,
        }

        public GTX_Parser(Stream stream)
        {
            ReadGx2(new FileReader(stream));
        }

        private void ReadGx2(FileReader reader)
        {
            reader.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;

            List<byte[]> data = new List<byte[]>();
            List<byte[]> mipMaps = new List<byte[]>();

            header = new GTXHeader();
            header.Read(reader);

            Console.WriteLine("header size " + header.HeaderSize);

            uint surfBlockType;
            uint dataBlockType;
            uint mipBlockType;
            uint vertexShaderHeader = 0x03;
            uint vertexShaderProgram = 0x05;
            uint pixelShaderHeader = 0x06;
            uint pixelShaderProgram = 0x07;
            uint geometryShaderHeader = 0x08;
            uint geometryShaderProgram = 0x09;
            uint userDataBlock = 0x10;

            if (header.MajorVersion == 6 && header.MinorVersion == 0)
            {
                surfBlockType = 0x0A;
                dataBlockType = 0x0B;
                mipBlockType = 0x0C;
            }
            else if (header.MajorVersion == 6 || header.MajorVersion == 7)
            {
                surfBlockType = 0x0B;
                dataBlockType = 0x0C;
                mipBlockType = 0x0D;
            }
            else
                throw new Exception($"Unsupported GTX version {header.MajorVersion}");

            if (header.GpuVersion != 2)
                throw new Exception($"Unsupported GPU version {header.GpuVersion}");

            reader.Position = header.HeaderSize;

            bool blockB = false;
            bool blockC = false;

            uint ImageInfo = 0;
            uint images = 0;

            while (reader.Position < reader.BaseStream.Length)
            {
                Console.WriteLine("BLOCK POS " + reader.Position + " " + reader.BaseStream.Length);
                GTXDataBlock block = new GTXDataBlock();
                block.Read(reader);
                blocks.Add(block);

                bool BlockIsEmpty = block.BlockType == BlockType.AlignData ||
                                    block.BlockType == BlockType.EndOfFile;

                //Here we use "if" instead of "case" statements as types vary between versions
                if ((uint)block.BlockType == surfBlockType)
                {
                    ImageInfo += 1;
                    blockB = true;

                    var surface = new SurfaceInfoParse();
                    surface.Read(new FileReader(block.data));

                    if (surface.tileMode == 0 || surface.tileMode > 16)
                        throw new Exception($"Invalid tileMode {surface.tileMode}!");

                    if (surface.numMips > 14)
                        throw new Exception($"Invalid number of mip maps {surface.numMips}!");

                    TextureData textureData = new TextureData();
                    textureData.Surface = surface;
                    Textures.Add(textureData);
                }
                else if ((uint)block.BlockType == dataBlockType)
                {
                    images += 1;
                    blockC = true;

                    data.Add(block.data);
                }
                else if ((uint)block.BlockType == mipBlockType)
                {
                    mipMaps.Add(block.data);
                }
            }
            if (Textures.Count != data.Count)
                throw new Exception($"Bad size! {Textures.Count} {data.Count}");

            int curTex = 0;
            int curMip = 0;
            foreach (var node in Textures)
            {
                TextureData tex = (TextureData)node;

                tex.ImageData = data[curTex];
                tex.Surface.bpp = GX2.surfaceGetBitsPerPixel(tex.Surface.format) >> 3;

                if (tex.Surface.numMips > 1)
                    tex.Surface.mipData = mipMaps[curMip++];
                else
                    tex.Surface.mipData = new byte[0];

                if (tex.Surface.mipData == null)
                    tex.Surface.numMips = 1;

                curTex++;
            }

            data.Clear();
            mipMaps.Clear();
        }

        public class TextureData
        {
            public SurfaceInfoParse Surface;
            public byte[] ImageData;
            public byte[] MipData;
        }

        public void Save(Stream stream)
        {
            using (FileWriter writer = new FileWriter(stream, true))
            {
                writer.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;
                header.Write(writer);

                uint surfBlockType;
                uint dataBlockType;
                uint mipBlockType;

                if (header.MajorVersion == 6 && header.MinorVersion == 0)
                {
                    surfBlockType = 0x0A;
                    dataBlockType = 0x0B;
                    mipBlockType = 0x0C;
                }
                else if (header.MajorVersion == 6 || header.MajorVersion == 7)
                {
                    surfBlockType = 0x0B;
                    dataBlockType = 0x0C;
                    mipBlockType = 0x0D;
                }
                else
                    throw new Exception($"Unsupported GTX version {header.MajorVersion}");

                int imageInfoIndex = -1;
                int imageBlockIndex = -1;
                int imageMipBlockIndex = -1;

                writer.Seek(header.HeaderSize, System.IO.SeekOrigin.Begin);
                foreach (var block in blocks)
                {
                    if ((uint)block.BlockType == surfBlockType)
                    {
                        imageInfoIndex++;
                        imageBlockIndex++;
                        imageMipBlockIndex++;

                        block.data = Textures[imageInfoIndex].Surface.Write();
                        block.Write(writer);

                    }
                    else if ((uint)block.BlockType == dataBlockType)
                    {
                        var tex = Textures[imageBlockIndex];

                        var pos = writer.Position;
                        uint Alignment = tex.Surface.alignment;
                        //Create alignment block first
                        uint dataAlignment = GetAlignBlockSize((uint)pos + 32, Alignment);
                        GTXDataBlock dataAlignBlock = new GTXDataBlock(BlockType.AlignData, dataAlignment, 0, 0);
                        dataAlignBlock.Write(writer);

                        block.data = tex.Surface.data;
                        block.Write(writer);
                    }
                    else if ((uint)block.BlockType == mipBlockType)
                    {
                        var tex = Textures[imageMipBlockIndex];

                        var pos = writer.Position;
                        uint Alignment = tex.Surface.alignment;
                        //Create alignment block first
                        uint dataAlignment = GetAlignBlockSize((uint)pos + 32, Alignment);
                        GTXDataBlock dataAlignBlock = new GTXDataBlock(BlockType.AlignData, dataAlignment, 0, 0);
                        dataAlignBlock.Write(writer);

                        if (tex.Surface.mipData == null || tex.Surface.mipData.Length <= 0)
                            throw new Exception("Invalid mip data!");

                        block.data = tex.Surface.mipData;
                        block.Write(writer);
                    }
                    else if (block.BlockType != BlockType.AlignData)
                    {
                        block.Write(writer);
                    }
                }
            }
        }

        private static uint GetAlignBlockSize(uint DataOffset, uint Alignment)
        {
            uint alignSize = RoundUp(DataOffset, Alignment) - DataOffset - 32;

            uint z = 1;
            while (alignSize < 0)
                alignSize = RoundUp(DataOffset + (Alignment * z), Alignment) - DataOffset - 32;
            z += 1;

            return alignSize;
        }

        private static uint RoundUp(uint X, uint Y) { return ((X - 1) | (Y - 1)) + 1; }

        public class BlockDisplay : ObjectTreeNode
        {
            public BlockDisplay(Stream stream, string text)
            {
                Tag = stream;
                Label = text;
            }
        }

        public class GTXHeader
        {
            readonly string Magic = "Gfx2";
            public uint HeaderSize;
            public uint MajorVersion;
            public uint MinorVersion;
            public uint GpuVersion;
            public uint AlignMode;

            public void Read(FileReader reader)
            {
                string Signature = reader.ReadString(4, Encoding.ASCII);
                if (Signature != Magic)
                    throw new Exception($"Invalid signature {Signature}! Expected Gfx2.");

                HeaderSize = reader.ReadUInt32();
                MajorVersion = reader.ReadUInt32();
                MinorVersion = reader.ReadUInt32();
                GpuVersion = reader.ReadUInt32(); //Ignored in 6.0
                AlignMode = reader.ReadUInt32();
            }
            public void Write(FileWriter writer)
            {
                writer.WriteSignature(Magic);
                writer.Write(HeaderSize);
                writer.Write(MajorVersion);
                writer.Write(MinorVersion);
                writer.Write(GpuVersion);
                writer.Write(AlignMode);
            }
        }
        public class GTXDataBlock
        {
            readonly string Magic = "BLK{";
            public uint HeaderSize;
            public uint MajorVersion;
            public uint MinorVersion;
            public BlockType BlockType;
            public uint Identifier;
            public uint Index;
            public uint DataSize;
            public byte[] data;

            public GTXDataBlock() { }

            public GTXDataBlock(BlockType blockType, uint dataSize, uint identifier, uint index)
            {
                HeaderSize = 32;
                MajorVersion = 1;
                MinorVersion = 0;
                BlockType = blockType;
                DataSize = dataSize;
                Identifier = identifier;
                Index = index;
                data = new byte[dataSize];
            }

            public void Read(FileReader reader)
            {
                long blockStart = reader.Position;

                string Signature = reader.ReadString(4, Encoding.ASCII);
                if (Signature != Magic)
                    throw new Exception($"Invalid signature {Signature}! Expected BLK.");

                HeaderSize = reader.ReadUInt32();
                MajorVersion = reader.ReadUInt32(); //Must be 0x01 for 6.x
                MinorVersion = reader.ReadUInt32(); //Must be 0x00 for 6.x
                BlockType = reader.ReadEnum<BlockType>(false);
                DataSize = reader.ReadUInt32();
                Identifier = reader.ReadUInt32();
                Index = reader.ReadUInt32();

                reader.Seek(blockStart + HeaderSize, System.IO.SeekOrigin.Begin);
                data = reader.ReadBytes((int)DataSize);
            }
            public void Write(FileWriter writer)
            {
                long blockStart = writer.Position;

                writer.WriteSignature(Magic);
                writer.Write(HeaderSize);
                writer.Write(MajorVersion);
                writer.Write(MinorVersion);
                writer.Write(BlockType, false);
                writer.Write(data.Length);
                writer.Write(Identifier);
                writer.Write(Index);
                writer.Seek(blockStart + HeaderSize, System.IO.SeekOrigin.Begin);

                writer.Write(data);
            }
        }

        public class SurfaceInfoParse : GX2.GX2Surface
        {
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
                numSlices = reader.ReadUInt32();
                compSel = reader.ReadBytes(4);
                texRegs = reader.ReadUInt32s(5);
            }

            public byte[] Write()
            {
                MemoryStream mem = new MemoryStream();

                FileWriter writer = new FileWriter(mem);
                writer.ByteOrder = Syroot.BinaryData.ByteOrder.BigEndian;
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

                for (int i = 0; i < 13; i++)
                {
                    if (mipOffset.Length > i)
                        writer.Write(mipOffset[i]);
                    else
                        writer.Write(0);
                }

                writer.Write(firstMip);
                writer.Write(imageCount);
                writer.Write(firstSlice);
                writer.Write(numSlices);

                for (int i = 0; i < 4; i++)
                {
                    if (compSel != null && compSel.Length > i)
                        writer.Write(compSel[i]);
                    else
                        writer.Write((byte)0);
                }

                for (int i = 0; i < 5; i++)
                {
                    if (texRegs != null && texRegs.Length > i)
                        writer.Write(texRegs[i]);
                    else
                        writer.Write(0);
                }

                return mem.ToArray();
            }
        }
    }
}
