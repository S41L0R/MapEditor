using System;
using System.Collections.Generic;
using Syroot.NintenTools.NSW.Bntx;
using Toolbox.Core;
using Toolbox.Core.IO;
using System.IO;

namespace CafeLibrary
{
    public class BNTX : IFileFormat, ITextureContainer, IPropertyDisplay
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "BNTX" };
        public string[] Extension { get; set; } = new string[] { "*.bntx" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, System.IO.Stream stream)
        {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "BNTX");
            }
        }

        public bool DisplayIcons => false;

        public object PropertyDisplay => BntxFile;

        public Dictionary<string, STGenericTexture> Textures = new Dictionary<string, STGenericTexture>();
        public IEnumerable<STGenericTexture> TextureList => Textures.Values;

        private BntxFile BntxFile { get; set; }

        public void Load(System.IO.Stream stream) {
            BntxFile = new BntxFile(stream);
            foreach (var tex in BntxFile.Textures)
                Textures.Add(tex.Name, new BntxTexture(BntxFile, tex));
        }

        public void Save(System.IO.Stream stream)
        {

        }
    }
}
