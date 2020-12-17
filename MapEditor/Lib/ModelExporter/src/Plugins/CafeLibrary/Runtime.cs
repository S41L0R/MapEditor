using System;
using System.Collections.Generic;
using System.Text;

namespace CafeLibrary
{
    public class Runtime
    {
        public class SwitchKeys
        {
            public static string SwitchFolder = System.IO.Path.Combine(Environment.GetFolderPath(
                Environment.SpecialFolder.UserProfile), ".switch");

            public static string TitleKeys = System.IO.Path.Combine(SwitchFolder, "title.keys");
            public static string ProdKeys = System.IO.Path.Combine(SwitchFolder, "prod.keys");
            public static string DevKeys = System.IO.Path.Combine(SwitchFolder, "dev.keys");

            public static bool HasKeys()
            {
                Console.WriteLine($"ProdKeys {ProdKeys} Exists? {System.IO.File.Exists(ProdKeys)}");
                Console.WriteLine($"TitleKeys {TitleKeys} Exists? {System.IO.File.Exists(TitleKeys)}");

                return System.IO.File.Exists(ProdKeys) &&
                       System.IO.File.Exists(TitleKeys);
            }
        }
    }
}
