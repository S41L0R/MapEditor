using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class BYAML : IFileFormat
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "BYAML" };
        public string[] Extension { get; set; } = new string[] { "*.byaml", "*.byml" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            //File too small to have any data
            if (stream.Length <= 8)
                return false;

            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(2, "BY") || reader.CheckSignature(2, "YB");
            }
        }

        public void Load(Stream stream)
        {
        }

        public void Save(Stream stream)
        {
        }
    }
}
