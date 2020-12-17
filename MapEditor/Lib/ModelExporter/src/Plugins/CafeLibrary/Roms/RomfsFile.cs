using System;
using System.Collections.Generic;
using System.Text;
using LibHac.Fs;
using LibHac.FsSystem;
using LibHac.FsSystem.NcaUtils;
using Toolbox.Core;

namespace CafeLibrary
{
    public class RomfsFile : ArchiveFileInfo
    {
        public DirectoryEntryEx directoryEntry;

        public IFileSystem FileSystem;
        public IFile File
        {
            get
            {
                FileSystem.OpenFile(out IFile file, directoryEntry.FullPath, OpenMode.Read);
                return file;
            }
        }

        public RomfsFile(string partDir, DirectoryEntryEx dir, IFileSystem fileSystem)
        {
            string path = dir.FullPath.Remove(0, 1);

            directoryEntry = dir;
            FileSystem = fileSystem;
            FileName = $"{partDir}/{path}";

            if (File != null)
                FileData = File.AsStream();
        }

        public override uint GetFileSize()
        {
            return (uint)directoryEntry.Size;
        }
    }
}
