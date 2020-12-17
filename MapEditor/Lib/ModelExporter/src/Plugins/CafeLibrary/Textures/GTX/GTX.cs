using System;
using System.Collections.Generic;
using Syroot.NintenTools.NSW.Bntx;
using Toolbox.Core;
using Toolbox.Core.IO;
using Toolbox.Core.Imaging;
using Toolbox.Core.WiiU;
using System.IO;

namespace CafeLibrary
{
    public class GTX : IFileFormat, ITextureContainer, IPropertyDisplay
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "GTX" };
        public string[] Extension { get; set; } = new string[] { "*.gtx" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "Gfx2");
            }
        }

        public bool DisplayIcons => true;

        public object PropertyDisplay => GtxFile;

        public List<STGenericTexture> Textures = new List<STGenericTexture>();
        public IEnumerable<STGenericTexture> TextureList => Textures;

        private GTX_Parser GtxFile { get; set; }

        public void Load(Stream stream) {
            GtxFile = new GTX_Parser(stream);
            foreach (var tex in GtxFile.Textures)
                Textures.Add(new Texture(tex) { Name = $"Textures{Textures.Count}" });
        }

        public void Save(Stream stream) {
            GtxFile.Save(stream);
        }

        public class Texture : STGenericTexture
        {
            private GTX_Parser.TextureData TextureHeader;

            public Texture(GTX_Parser.TextureData texture) {
                TextureHeader = texture;

                Width = texture.Surface.width;
                Height = texture.Surface.height;
                MipCount = texture.Surface.numMips;
                ArrayCount = texture.Surface.depth;
                CanEdit = true;

                var surface = texture.Surface;
                var surfaceFormat = (GX2.GX2SurfaceFormat)surface.format;

                if (surface.compSel != null && surface.compSel.Length == 4)
                {
                    RedChannel = SetChannel(surface.compSel[0]);
                    GreenChannel = SetChannel(surface.compSel[1]);
                    BlueChannel = SetChannel(surface.compSel[2]);
                    AlphaChannel = SetChannel(surface.compSel[3]);
                }

                Platform = new WiiUSwizzle(surfaceFormat)
                {
                    AAMode = (GX2.GX2AAMode)surface.aa,
                    TileMode = (GX2.GX2TileMode)surface.tileMode,
                    ResourceFlags = (GX2.GX2RResourceFlags)surface.resourceFlags,
                    SurfaceDimension = (GX2.GX2SurfaceDimension)surface.dim,
                    SurfaceUse = (GX2.GX2SurfaceUse)surface.use,
                    MipOffsets = surface.mipOffset,
                    Swizzle = surface.swizzle,
                    Alignment = surface.alignment,
                    MipData = surface.mipData,
                    Pitch = surface.pitch,
                };
            }

            private STChannelType SetChannel(byte compSel)
            {
                if (compSel == 0) return STChannelType.Red;
                else if (compSel == 1) return STChannelType.Green;
                else if (compSel == 2) return STChannelType.Blue;
                else if (compSel == 3) return STChannelType.Alpha;
                else if (compSel == 4) return STChannelType.Zero;
                else return STChannelType.One;
            }

            public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0)
            {
                return TextureHeader.ImageData;
            }

            public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
            {
                throw new NotImplementedException();
            }
        }
    }
}
