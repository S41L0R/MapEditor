using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core;
using Toolbox.Core.IO;
using Toolbox.Core.Imaging;

namespace PluginSample
{
    public class BXLIM : STGenericTexture, IFileFormat
    {
        public bool CanSave { get; set; } = false;
        public string[] Description { get; set; } = new string[] { "Binary Cafe Image" };
        public string[] Extension { get; set; } = new string[] { "*.bflim" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            if (fileInfo.Extension == ".szs") return false;

            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "FLIM", reader.BaseStream.Length - 0x28);
            }
        }

        BXLIM_Parser Header;

        public void Load(Stream stream)
        {
            Name = FileInfo.FileName;
            Header = new BXLIM_Parser(stream);
            Width = Header.ImageBlock.Width;
            Height = Header.ImageBlock.Height;
            if (Header.IsCTR)
            {
                Platform = new CTRSwizzle(BXLIM_Parser.CTRFormats[Header.ImageBlock.Format])
                {
                    SwizzleMode = (CTR_3DS.Orientation)Header.ImageBlock.Flags,
                };
            }
            else
            {
                Platform = new WiiUSwizzle(BXLIM_Parser.CafeFormatsWiiU[Header.ImageBlock.Format])
                {
                    TileMode = Header.ImageBlock.TileMode,
                    Swizzle = Header.ImageBlock.CafeSwizzle,
                };
            }

            if (Platform.OutputFormat == TexFormat.BC5_UNORM||
                Platform.OutputFormat == TexFormat.BC5_SNORM)
            {
                RedChannel = STChannelType.Red;
                GreenChannel = STChannelType.Red;
                BlueChannel = STChannelType.Red;
                AlphaChannel = STChannelType.Green;
            }

            MipCount = 1;
        }

        public void Save(Stream stream)
        {
            Header.Save(stream);
        }

        public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0) {
            return Header.DataBlock;
        }

        public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
        {
            throw new NotImplementedException();
        }
    }
}
