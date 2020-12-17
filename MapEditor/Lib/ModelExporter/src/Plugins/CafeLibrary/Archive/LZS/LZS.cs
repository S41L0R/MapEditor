using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    /// <summary>
    /// Bokujou Monogatari Saikai no Mineral Town Archive File.
    /// </summary>
    public class LZS : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "LZS" };
        public string[] Extension { get; set; } = new string[] { "*.lzs" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public bool Identify(File_Info fileInfo, Stream stream)  {
            return false;
            return fileInfo.Extension == ".lzs";
        }

        public IEnumerable<ArchiveFileInfo> Files => Header.Files;
        public void ClearFiles() { Header.Files.Clear(); }

        public LZS_Parser Header;

        public void Load(Stream stream) {
            Header = new LZS_Parser(stream);
        }

        public void Save(Stream stream)
        {
            Header.Save(stream);
        }

        public bool AddFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Add(new LZS_Parser.FileEntry()
            {
                FileName = archiveFileInfo.FileName,
                FileData = archiveFileInfo.FileData,
            });
            return true;
        }

        public bool DeleteFile(ArchiveFileInfo archiveFileInfo)
        {
            Header.Files.Remove((LZS_Parser.FileEntry)archiveFileInfo);
            return true;
        }
    }
}
