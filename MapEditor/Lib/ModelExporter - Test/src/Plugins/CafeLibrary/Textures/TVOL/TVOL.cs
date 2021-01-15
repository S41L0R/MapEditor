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
    public class TVOL : IFileFormat, ITextureContainer
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "Texture Volume" };
        public string[] Extension { get; set; } = new string[] { "*.tvol" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, System.IO.Stream stream) {
            return fileInfo.Extension == ".tvol";
        }

        public bool DisplayIcons => true;

        public List<STGenericTexture> Textures = new List<STGenericTexture>();
        public IEnumerable<STGenericTexture> TextureList => Textures;

        private TVOL_Parser Header { get; set; }

        public void Load(Stream stream)
        {
            Header = new TVOL_Parser(stream);
            foreach (var tex in Header.Images) {
                tex.Name = $"Textures{Textures.Count}";
                Textures.Add(tex);
            }
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }
    }
}
