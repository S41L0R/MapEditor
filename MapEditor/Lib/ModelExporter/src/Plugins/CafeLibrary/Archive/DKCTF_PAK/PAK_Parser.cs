using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core.IO;
using Toolbox.Core;
using System.Runtime.InteropServices;

namespace DKCTF
{
    public class PAK_Parser
    {
        public List<FileEntry> Files = new List<FileEntry>();

        private PakHeader Header;
        private List<DirectoryAssetEntry> Directories = new List<DirectoryAssetEntry>();
        private List<MetaOffsetEntry> MetaOffsets = new List<MetaOffsetEntry>();
        private List<CNameTagEntry> FileNameEntries = new List<CNameTagEntry>();

        public PAK_Parser(System.IO.Stream stream)
        {
            Directories.Clear();
            MetaOffsets.Clear();
            FileNameEntries.Clear();

            using (var reader = new FileReader(stream, true))
            {
                reader.SetByteOrder(true);
                Header = reader.ReadStruct<PakHeader>();
                var ADIRChunk = reader.ReadStruct<CChunkDescriptor>();
                ReadAssetDirectoryChunk(reader, ADIRChunk);
                var METAChunk = reader.ReadStruct<CChunkDescriptor>();
                ReadMetaChunk(reader, METAChunk);
                var STRGChunk = reader.ReadStruct<CChunkDescriptor>();
                ReadFileNameChunk(reader, STRGChunk);
            }

            for (int i = 0; i < Directories.Count; i++)
            {
                Files.Add(new FileEntry()
                {
                    FileData = Directories[i].Data,
                    FileName = Directories[i].Type,
                });
            }
        }

        public void Save(System.IO.Stream stream)
        {
        }

        private void ReadAssetDirectoryChunk(FileReader reader, CChunkDescriptor chunk)
        {
            if (chunk.ChunkType != "ADIR")
                throw new Exception("Unexpected type! Expected ADIR, got " + chunk.ChunkType);

            long pos = reader.Position;

            reader.SeekBegin(pos + chunk.DataOffset);
            uint numEntries = reader.ReadUInt32();
            for (int i = 0; i < numEntries; i++)
            {
                DirectoryAssetEntry entry = new DirectoryAssetEntry();
                entry.Read(reader);
                Directories.Add(entry);
            }

            reader.SeekBegin(pos + chunk.DataSize);
        }

        private void ReadMetaChunk(FileReader reader, CChunkDescriptor chunk)
        {
            if (chunk.ChunkType != "META")
                throw new Exception("Unexpected type! Expected META, got " + chunk.ChunkType);
            long pos = reader.Position;
            reader.SeekBegin(pos + chunk.DataOffset);
            uint numEntries = reader.ReadUInt32();
            for (int i = 0; i < numEntries; i++)
            {
                MetaOffsetEntry entry = reader.ReadStruct<MetaOffsetEntry>();
                MetaOffsets.Add(entry);
            }

            reader.SeekBegin(pos + chunk.DataSize);
        }

        private void ReadFileNameChunk(FileReader reader, CChunkDescriptor chunk)
        {
            if (chunk.ChunkType != "STRG")
                throw new Exception("Unexpected type! Expected STRG, got " + chunk.ChunkType);

            long pos = reader.Position;
            reader.SeekBegin(pos + chunk.DataOffset);
            uint numEntries = reader.ReadUInt32();
            for (int i = 0; i < numEntries; i++)
            {
                //   CNameTagEntry entry = reader.ReadStruct<CNameTagEntry>();
                //   FileNameEntries.Add(entry);
            }

            reader.SeekBegin(pos + chunk.DataSize);
        }

        public class FileEntry : ArchiveFileInfo
        {

        }

        public class DirectoryAssetEntry
        {
            public string Type;
            public CObjectId FileID;

            public long Offset;
            public long Size;

            public SubStream Data;

            public void Read(FileReader reader)
            {
                Type = reader.ReadString(4, Encoding.ASCII);
                FileID = reader.ReadStruct<CObjectId>();
                Offset = reader.ReadInt64();
                Size = reader.ReadInt64();

                Data = new SubStream(reader.BaseStream, Offset, Size);
            }

            public override string ToString()
            {
                return $"{FileID.Guid.Part4.ToString()}.{Type}";
            }
        }

        [StructLayout(LayoutKind.Sequential, Pack = 1)]
        public class MetaOffsetEntry
        {
            public CObjectTag ObjectTag;
            public uint FileOffset;
        }

        [StructLayout(LayoutKind.Sequential, Pack = 1)]
        public class PakHeader
        {
            CFormDescriptor PackForm;
            CFormDescriptor TocForm;
        }

        [StructLayout(LayoutKind.Sequential, Pack = 1)]
        public class CNameTagEntry
        {
            public CObjectTag ObjectTag;
            public string Name;
        }
    }
}
