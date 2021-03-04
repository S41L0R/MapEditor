using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core;
using Toolbox.Core.IO;
using Toolbox.Core.Imaging;
using System.Runtime.InteropServices;
using Toolbox.Core.Switch;

namespace CafeLibrary
{
    public class XTX : IFileFormat, ITextureContainer
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "XTX" };
        public string[] Extension { get; set; } = new string[] { "*.xtx", "*.z" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, Stream stream) {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "DFvN");
            }
        }

        public bool DisplayIcons => true;

        public List<STGenericTexture> Textures = new List<STGenericTexture>();
        public IEnumerable<STGenericTexture> TextureList => Textures;

        private XTX_Parser Header;

        public void Load(Stream stream) {
            Header = new XTX_Parser(stream);
            foreach (var texture in Header.TextureInfos) {
                Textures.Add(new XTXTexture(texture) { Name = $"Texture{Textures.Count}" });
            }
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }
    }

    class XTXTexture : STGenericTexture
    {
        XTX_Parser.TextureInfo Image;

        public XTXTexture(XTX_Parser.TextureInfo imageEntry) {
            Image = imageEntry;
            Width = imageEntry.Width;
            Height = imageEntry.Height;
            MipCount = imageEntry.MipCount;
            ArrayCount = imageEntry.Depth;

            Platform = new SwitchSwizzle(imageEntry.GenericFormat)
            {
                Alignment = imageEntry.Alignment,
                MipOffsets = imageEntry.MipOffsets,
                Target = imageEntry.Target,
            };
        }

        public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0) {
            return Image.ImageData;
        }

        public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
        {
            var platform = Platform as SwitchSwizzle;

            Image.Width = width;
            Image.Height = height;
            Image.ImageData = ByteUtils.CombineArray(imageData.ToArray());
            Image.MipOffsets = platform.MipOffsets;
            Image.Target = platform.Target;
            Image.Alignment = platform.Alignment;
        }
    }
}

