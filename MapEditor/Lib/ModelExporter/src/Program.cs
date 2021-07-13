using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Toolbox.Core;
using Toolbox.Core.Collada;
using Toolbox.Core.IO;

namespace ModelExporter
{
    class Program
    {
        static void Main(string[] args)
        {
            foreach (var arg in args)
            {
                if (arg != args[args.Length - 1])
                {
                    //Skip texture files as they will dump by bfres model
                    if (arg.Contains("Tex1") || arg.Contains("Tex2"))
                        continue;

                    if (arg.Contains(".Tex"))
                        continue;

                    string fileName = arg.Replace(".sbfres", ".Tex1.sbfres");
                    if (File.Exists(fileName))
                    {
                        var texfile = STFileLoader.OpenFileFormat(fileName);
                        var texscene = ((IModelSceneFormat)texfile).ToGeneric();
                        string folder = Path.GetFileNameWithoutExtension(fileName);
                        foreach (var tex in texscene.Textures)
                        {
                            tex.Export($"{args[args.Length - 1]}{tex.Name}.png",
                                new TextureExportSettings()
                                {
                                    ExportArrays = false,
                                    ExportMipmaps = false,
                                });
                        }
                    }

                    fileName = arg.Replace(".sbfres", ".Tex.sbfres");
                    if (File.Exists(fileName))
                    {
                        var texfile = STFileLoader.OpenFileFormat(fileName);
                        var texscene = ((IModelSceneFormat)texfile).ToGeneric();
                        string folder = Path.GetFileNameWithoutExtension(fileName);
                        foreach (var tex in texscene.Textures)
                        {
                            tex.Export($"{args[args.Length - 1]}{args[args.Length - 1]}{tex.Name}.png",
                                new TextureExportSettings()
                                {
                                    ExportArrays = false,
                                    ExportMipmaps = false
                                });
                        }
                    }
                    IFileFormat file;
                    if (File.Exists(arg))
                    {
                        file = STFileLoader.OpenFileFormat(arg);
                        ExportModel(file, args);
                    }
                    else
                    {
                        // The file might be split into multiple files...
                        var Exists = true;
                        var Suffix = 0;
                        while (Exists)
                        {
                            if (!File.Exists(arg.Insert(arg.Length - 7, "-" + Suffix.ToString("00"))))
                            {
                                // We want to give suffix 1 a chance - sometimes 0 is left out
                                if (Suffix != 0) {
                                    Exists = false;
                                    break;
                                }
                                else {
                                    Suffix = Suffix + 1;
                                }
                            }
                            file = STFileLoader.OpenFileFormat(arg.Insert(arg.Length - 7, "-" + Suffix.ToString("00")));
                            ExportModel(file, args);
                            Suffix = Suffix + 1;
                        }
                    }
                }
            }
        }
        static void ExportModel(Toolbox.Core.IFileFormat file, String[] args)
        {
            var scene = ((IModelSceneFormat)file).ToGeneric();
            foreach (var model in scene.Models)
            {
                DAE.Export($"{args[args.Length - 1]}{model.Name}.dae", new DAE.ExportSettings()
                {
                    ExportTextures = true,
                }, model, model.GetMappedTextures(), model.Skeleton);
            }
        }
    }
}
