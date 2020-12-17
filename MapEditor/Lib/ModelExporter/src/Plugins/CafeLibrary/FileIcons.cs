using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core;

namespace CafeLibrary
{
    public class FileIcons : IFileIconLoader
    {
        public string Identify(string text, Stream stream)
        {
            if (text.Contains(".bfres")) return "Bfres";
            if (text.Contains(".byml")) return "Byaml";
            if (text.Contains(".byaml")) return "Byaml";
            if (text.Contains(".bntx")) return "TextureContainer";

            return "";
        }

        public Dictionary<string, byte[]> ImageList =>  new Dictionary<string, byte[]>()
        {
            { "Bfres", Properties.Resources.Bfres },
            { "Aamp", Properties.Resources.Aamp },
            { "Bfsha", Properties.Resources.Bfsha },
            { "Bnsh", Properties.Resources.Bnsh },
            { "Byaml", Properties.Resources.Byaml },
            { "Font", Properties.Resources.Font },
        };
    }
}
