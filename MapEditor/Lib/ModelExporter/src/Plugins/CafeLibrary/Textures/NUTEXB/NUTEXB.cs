using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core;
using Toolbox.Core.IO;
using Toolbox.Core.Imaging;

namespace PluginSample
{
    public class NUTEXB : STGenericTexture, IFileFormat
    {
        public bool CanSave { get; set; } = true;
        public string[] Description { get; set; } = new string[] { "Namco Texture" };
        public string[] Extension { get; set; } = new string[] { "*.nutexb" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(3, "XET", reader.BaseStream.Length - 7);
            }
        }

   /*     public static NUTEXB Create(string filePath)
        {
            var image = (STGenericTexture)STFileLoader.OpenFileFormat(filePath);

            NUTEXB nutexb = new NUTEXB();
            nutexb.FileInfo = new File_Info();
            nutexb.Platform = new SwitchSwizzle(image.Platform.OutputFormat);
            nutexb.Platform.EncodeImage();

            nutexb.Header = new NUTEXB_Parser();
            nutexb.Header.FromGeneric(image);
        }*/

        NUTEXB_Parser Header;

        public void Load(Stream stream)
        {
            Name = FileInfo.FileName;
            Header = new NUTEXB_Parser(stream);
            Width = Header.ImageHeader.Width;
            Height = Header.ImageHeader.Height;
            MipCount = Header.ImageHeader.MipCount;
            ArrayCount = Header.ImageHeader.ArrayCount;
            Depth = Header.ImageHeader.Depth;

            Console.WriteLine($"NUTEXB {Name} {Width} {Height} {MipCount} {ArrayCount} {Depth} {Header.ImageData.Length}");

            if (Header.IsSwitch)
                Platform = new SwitchSwizzle(Header.GenericFormat);
            else
                Platform = new DefaultSwizzle(Header.GenericFormat);
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }

        public override byte[] GetImageData(int ArrayLevel = 0, int MipLevel = 0, int DepthLevel = 0) {
            return Header.ImageData;
        }

        public override void SetImageData(List<byte[]> imageData, uint width, uint height, int arrayLevel = 0)
        {
            throw new NotImplementedException();
        }
    }
}
