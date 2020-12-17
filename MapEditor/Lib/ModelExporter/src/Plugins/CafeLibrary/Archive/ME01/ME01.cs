using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class PAC : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "ME01", "SA01" };
        public string[] Extension { get; set; } = new string[] { "*.bin", "*.sgarc" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            using (var reader = new Toolbox.Core.IO.FileReader(stream, true))
            {
                bool IsMEO1 = reader.CheckSignature(4, "ME01");
                bool IsSA01 = reader.CheckSignature(4, "SA01");
                return IsMEO1 || IsSA01;
            }
        }

        public IEnumerable<ArchiveFileInfo> Files => Header.Files;
        public void ClearFiles() { Header.Files.Clear(); }

        public ME01_Parser Header;

        public void Load(Stream stream) {
            Header = new ME01_Parser(stream);
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }

        public bool AddFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Add(new ME01_Parser.FileEntry()
            {
                FileName = archiveFileInfo.FileName,
                FileData = archiveFileInfo.FileData,
            });
            return true;
        }

        public bool DeleteFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Remove((ME01_Parser.FileEntry)archiveFileInfo);
            return true;
        }
    }
}
