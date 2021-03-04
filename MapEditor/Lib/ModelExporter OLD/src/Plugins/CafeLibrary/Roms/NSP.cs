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
    public class NSP : IFileFormat, IArchiveFile
    {
        public bool CanSave { get; set; } = false;

        public string[] Description { get; set; } = new string[] { "NSP" };
        public string[] Extension { get; set; } = new string[] { "*.nsp" };

        public File_Info FileInfo { get; set; }

        public bool CanAddFiles { get; set; } = false;
        public bool CanRenameFiles { get; set; } = false;
        public bool CanReplaceFiles { get; set; } = false;
        public bool CanDeleteFiles { get; set; } = false;

        public List<ArchiveFileInfo> files = new List<ArchiveFileInfo>();
        public IEnumerable<ArchiveFileInfo> Files => files;

        public bool Identify(File_Info fileInfo, System.IO.Stream stream) {
            return fileInfo.Extension == ".nsp";
        }

        Nca Input { get; set; }
        Nca Control { get; set; }

        public void Load(System.IO.Stream stream)
        {
            FileInfo.KeepOpen = true;

            bool isDevBinary = true;
            string keySet = !isDevBinary ? Runtime.SwitchKeys.ProdKeys : Runtime.SwitchKeys.DevKeys;
            Keyset keyset = ExternalKeyReader.ReadKeyFile(keySet, Runtime.SwitchKeys.TitleKeys, null, null, isDevBinary);
            if (!Runtime.SwitchKeys.HasKeys())
                throw new Exception("Keyset not loaded!");

            string dir = Path.GetDirectoryName(FileInfo.FilePath);

            var pfs = new PartitionFileSystem(stream.AsStorage());
            Input = LoadNSP(stream, pfs, keyset);
            if (Input.Header.ContentType == NcaContentType.Program && File.Exists($"{dir}/basegame.nsp"))
            {
                //File is update so load base game nsp
                var baseGameStream = File.OpenRead($"{dir}/basegame.nsp");
                var basPpfs = new PartitionFileSystem(baseGameStream.AsStorage());
                var baseNCA = LoadNSP(baseGameStream, basPpfs, keyset);
                if (Input.SectionExists(NcaSectionType.Code))
                {
                    IFileSystem fs = baseNCA.OpenFileSystemWithPatch(Input, NcaSectionType.Code, IntegrityCheckLevel.IgnoreOnInvalid);
                    LoadFileSystem("PatchGameFiles/Exefs", fs);
                }
                if (Input.SectionExists(NcaSectionType.Data))
                {
                    IFileSystem fs = baseNCA.OpenFileSystemWithPatch(Input, NcaSectionType.Data, IntegrityCheckLevel.IgnoreOnInvalid);
                    LoadFileSystem("PatchGameFiles/Romfs", fs);
                }
                if (Input.SectionExists(NcaSectionType.Logo))
                {
                    IFileSystem fs = baseNCA.OpenFileSystemWithPatch(Input, NcaSectionType.Logo, IntegrityCheckLevel.IgnoreOnInvalid);
                    LoadFileSystem("PatchGameFiles/Logo", fs);
                }
            }
            else
            {
                if (Input.SectionExists(NcaSectionType.Code))
                {
                    IFileSystem fs = Input.OpenFileSystem(NcaSectionType.Code, IntegrityCheckLevel.IgnoreOnInvalid);
                    LoadFileSystem("GameFiles/Exefs", fs);
                }
                if (Input.SectionExists(NcaSectionType.Data))
                {
                    IFileSystem fs = Input.OpenFileSystem(NcaSectionType.Data, IntegrityCheckLevel.IgnoreOnInvalid);
                    LoadFileSystem("GameFiles/Romfs", fs);
                }
            }

          //  return;

            foreach (var subfile in pfs.Files)
            {
                var part = new PartitionFile(subfile);
                files.Add(part);

                if (Utils.GetExtension(subfile.Name) == ".nca")
                {
                    var nca = new Nca(keyset, pfs.OpenFile(subfile, OpenMode.Read).AsStorage());
                    part.FileData = nca.BaseStorage.AsStream();

                    if (nca.SectionExists(NcaSectionType.Code))
                    {
                        IFileSystem cs = nca.OpenFileSystem(NcaSectionType.Code, IntegrityCheckLevel.ErrorOnInvalid);
                       // LoadCodeFileSystem($"Partition/{part.FileName}", cs);
                    }
                    if (nca.SectionExists(NcaSectionType.Data))
                    {
                        IFileSystem fs = nca.OpenFileSystem(NcaSectionType.Data, IntegrityCheckLevel.ErrorOnInvalid);
                      //  LoadFileSystem($"Partition/{part.FileName}", fs);
                    }
                    if (nca.SectionExists(NcaSectionType.Logo))
                    {
                        IFileSystem ls = nca.OpenFileSystem(NcaSectionType.Logo, IntegrityCheckLevel.ErrorOnInvalid);
                       // LoadLogoFileSystem($"Partition/{part.FileName}", ls);
                    }
                }
            }
        }

        private Nca LoadNSP(System.IO.Stream stream, PartitionFileSystem pfs, Keyset keyset)
        {
            var CnmtNca = new Nca(keyset, pfs.OpenFile(pfs.Files.FirstOrDefault(s => s.Name.Contains(".cnmt.nca")), OpenMode.Read).AsStorage());
            var CnmtPfs = new PartitionFileSystem(CnmtNca.OpenStorage(0, IntegrityCheckLevel.None));
            var Cnmt = new Cnmt(CnmtPfs.OpenFile(CnmtPfs.Files[0], OpenMode.Read).AsStream());
            var Program = Cnmt.ContentEntries.FirstOrDefault(c => c.Type == LibHac.Ncm.ContentType.Program);
            var CtrlEntry = Cnmt.ContentEntries.FirstOrDefault(c => c.Type == LibHac.Ncm.ContentType.Control);
            // if (CtrlEntry != null)
            //    Control = new Nca(keyset, pfs.OpenFile(pfs.Files.FirstOrDefault(x => x.Name == $"{CtrlEntry.NcaId.ToHexString().ToLower()}.nca", OpenMode.Read)));

            var inputPartion = pfs.Files.FirstOrDefault(x => x.Name == $"{Program.NcaId.ToHexString().ToLower()}.nca");
            return new Nca(keyset, pfs.OpenFile(inputPartion, OpenMode.Read).AsStorage());
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
    