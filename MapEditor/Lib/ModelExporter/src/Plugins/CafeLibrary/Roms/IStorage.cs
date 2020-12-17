using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core;
using Toolbox.Core.IO;
using LibHac;
using LibHac.Fs;
using LibHac.FsSystem;
using LibHac.FsSystem.NcaUtils;
using LibHac.FsSystem.RomFs;
using System.IO;

namespace CafeLibrary
{
    public class IStorage : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "IStorage" };
        public string[] Extension { get; set; } = new string[] { "*.istorage" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public List<ArchiveFileInfo> files = new List<ArchiveFileInfo>();
        public IEnumerable<ArchiveFileInfo> Files => files;

        public bool Identify(File_Info fileInfo, System.IO.Stream stream)
        {
            return fileInfo.Extension == ".nca";
        }

        public void Load(Stream stream)
        {
            IFileSystem fs = new RomFsFileSystem(stream.AsStorage());
            foreach (DirectoryEntryEx entry in fs.EnumerateEntries()) {
                if (entry.Type == DirectoryEntryType.File)
                files.Add(new RomfsFile($"Romfs", entry, fs));
            }
        }

        public void ClearFiles() { files.Clear(); }

        public bool AddFile(ArchiveFileInfo archiveFileInfo)
        {
            return false;
        }

        public bool DeleteFile(ArchiveFileInfo archiveFileInfo)
        {
            return false;
        }

        public void Save(System.IO.Stream stream)
        {

        }
    }
}
