using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class NXARC : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "NX Archive" };
        public string[] Extension { get; set; } = new string[] { "*.nxarc" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            using (var reader = new Toolbox.Core.IO.FileReader(stream, true)) {
                return reader.CheckSignature(4, "RAXN");
            }
        }

        public IEnumerable<ArchiveFileInfo> Files => Header.Files;
        public void ClearFiles() { Header.Files.Clear(); }

        public NXARC_Parser Header;

        public void Load(Stream stream) {
            Header = new NXARC_Parser(stream);
        }

        public void Save(Stream stream) {
            Header.Save(stream);
        }

        public bool AddFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Add(new NXARC_Parser.FileEntry()
            {
                FileName = archiveFileInfo.FileName,
                FileData = archiveFileInfo.FileData,
            });
            return true;
        }

        public bool DeleteFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Remove((NXARC_Parser.FileEntry)archiveFileInfo);
            return true;
        }
    }
}
