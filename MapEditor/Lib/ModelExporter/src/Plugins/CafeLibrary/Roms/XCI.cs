using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core;
using Toolbox.Core.IO;
using System.Linq;
using LibHac;
using LibHac.Fs;
using LibHac.FsSystem;
using LibHac.FsSystem.NcaUtils;
using LibHac.FsSystem.RomFs;
using System.IO;

namespace CafeLibrary.Roms
{
    public class XCI : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "XCI" };
        public string[] Extension { get; set; } = new string[] { "*.xci" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public List<ArchiveFileInfo> files = new List<ArchiveFileInfo>();
        public IEnumerable<ArchiveFileInfo> Files => files;

        public bool Identify(File_Info fileInfo, System.IO.Stream stream)
        {
            return fileInfo.Extension == ".xci";
        }

        Nca Input { get; set; }
        Nca Control { get; set; }

        public void Load(System.IO.Stream stream)
        {
            FileInfo.KeepOpen = true;

            bool isDevBinary = false;
            string keySet = !isDevBinary ? Runtime.SwitchKeys.ProdKeys : Runtime.SwitchKeys.DevKeys;
            Keyset keyset = ExternalKeyReader.ReadKeyFile(keySet, Runtime.SwitchKeys.TitleKeys, null, null, isDevBinary);
            if (!Runtime.SwitchKeys.HasKeys())
                throw new Exception("Keyset not loaded!");

            string dir = Path.GetDirectoryName(FileInfo.FilePath);

            Xci xci = new Xci(keyset, stream.AsStorage());
            Input = LoadXCI(stream, xci, keyset);

            if (Input.SectionExists(NcaSectionType.Data))
            {
                IFileSystem fs = Input.OpenFileSystem(NcaSectionType.Data, IntegrityCheckLevel.IgnoreOnInvalid);
                LoadFileSystem("GameFiles/Romfs", fs);
            }
        }

        private Nca LoadXCI(System.IO.Stream stream, Xci pfs, Keyset keyset)
        {
            var part = pfs.OpenPartition(XciPartitionType.Secure);

            var CnmtNca = new Nca(keyset, part.OpenFile(part.Files.FirstOrDefault(s => s.Name.Contains(".cnmt.nca")), OpenMode.Read).AsStorage());
            var CnmtPfs = new PartitionFileSystem(CnmtNca.OpenStorage(0, IntegrityCheckLevel.None));
            var Cnmt = new Cnmt(CnmtPfs.OpenFile(CnmtPfs.Files[0], OpenMode.Read).AsStream());
            var Program = Cnmt.ContentEntries.FirstOrDefault(c => c.Type == LibHac.Ncm.ContentType.Program);
            var CtrlEntry = Cnmt.ContentEntries.FirstOrDefault(c => c.Type == LibHac.Ncm.ContentType.Control);
            // if (CtrlEntry != null)
            //    Control = new Nca(keyset, pfs.OpenFile(pfs.Files.FirstOrDefault(x => x.Name == $"{CtrlEntry.NcaId.ToHexString().ToLower()}.nca", OpenMode.Read)));

            var inputPartion = part.Files.FirstOrDefault(x => x.Name == $"{Program.NcaId.ToHexString().ToLower()}.nca");
            return new Nca(keyset, part.OpenFile(inputPartion, OpenMode.Read).AsStorage());
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


        public class PartitionFile : ArchiveFileInfo
        {
            public PartitionFileEntry PartitionEntry;

            public PartitionFile(PartitionFileEntry entry)
            {
                FileName = $"Partition/{entry.Name}";
                PartitionEntry = entry;
            }
        }
    }
}
