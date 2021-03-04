using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core;
using Toolbox.Core.Imaging;
using Toolbox.Core.WiiU;
using BfresLibrary.WiiU;
using BfresLibrary;

namespace CafeLibrary
{
    public class FTEX : STGenericTexture
    {
        /// <summary>
        /// The texture section used in the bfres.
        /// </summary>
        public Texture Texture;

        /// <summary>
        /// The file in which the data in this section is parented to.
        /// </summary>
        public ResFile ParentFile { get; set; }

        public FTEX(ResFile resFile, Texture texture) : base() {
            ParentFile = resFile;
            Texture = texture;
            ReloadImage();
        }

        private void ReloadImage()
        {
            Name = Texture.Name;
            Width = Texture.Width;
            Height = Texture.Height;
            MipCount = Texture.MipCount;
            Depth = Texture.Depth;
            ArrayCount = Texture.ArrayLength;

            Platform = new WiiUSwizzle((GX2.GX2SurfaceFormat)Texture.Format)
            {
                AAMode = (GX2.GX2AAMode)Texture.AAMode,
                TileMode = (GX2.GX2TileMode)Texture.TileMode,
                SurfaceDimension = (GX2.GX2SurfaceDimension)Texture.Dim,
                SurfaceUse = (GX2.GX2SurfaceUse)Texture.Use,
                MipOffsets = Texture.MipOffsets,
                Swizzle = Texture.Swizzle,
                Alignment = Texture.Alignment,
                MipData = Texture.MipData,
                Pitch = Texture.Pitch,
            };
        }

        public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0) {
            return Texture.Data;
        }

        public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
        {
            throw new NotImplementedException();
        }
    }
}
