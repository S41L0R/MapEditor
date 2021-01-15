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

namespace CafeLibrary.Roms
{
    public class NCA : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "NCA" };
        public string[] Extension { get; set; } = new string[] { "*.nca" };

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

        public void Load(System.IO.Stream stream)
        {
            bool isDevBinary = false;
            string keySet = !isDevBinary ? Runtime.SwitchKeys.ProdKeys : Runtime.SwitchKeys.DevKeys;
            Keyset keyset = ExternalKeyReader.ReadKeyFile(keySet, Runtime.SwitchKeys.TitleKeys, null, null, isDevBinary);
            if (!Runtime.SwitchKeys.HasKeys())
                throw new Exception("Keyset not loaded!");

            var ncaF = new Nca(keyset, stream.AsStorage());
            if (ncaF.SectionExists(NcaSectionType.Code))
            {
                IFileSystem fs = ncaF.OpenFileSystem(NcaSectionType.Code, IntegrityCheckLevel.None);
                LoadFileSystem("Exefs", fs);
            }
            if (ncaF.SectionExists(NcaSectionType.Data))
            {
                IFileSystem fs = ncaF.OpenFileSystem(NcaSectionType.Data, IntegrityCheckLevel.ErrorOnInvalid);
                LoadFileSystem("Romfs", fs);
            }
            if (ncaF.SectionExists(NcaSectionType.Logo))
            {
                IFileSystem fs = ncaF.OpenFileSystem(NcaSectionType.Logo, IntegrityCheckLevel.None);
                LoadFileSystem("Logo", fs);
            }
        }

        private void LoadFileSystem(string partDir, IFileSystem fs)
        {
            foreach (DirectoryEntryEx entry in fs.EnumerateEntries())
            {
                if (entry.Type == DirectoryEntryType.File)
                    files.Add(new RomfsFile($"{partDir}", entry, fs));
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
