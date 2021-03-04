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
                //Skip texture files as they will dump by bfres model
                if (arg.Contains("Tex1") || arg.Contains("Tex2"))
                    continue;

                if (arg.Contains("Tex"))
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
                        tex.Export($"{args[args.Length - 1]}{tex.Name}.png",
                            new TextureExportSettings()
                            {
                                ExportArrays = false,
                                ExportMipmaps = false,
                            });
                    }
                }
                //var file = STFileLoader.OpenFileFormat(arg);
                var file = (Toolbox.Core.IFileFormat)null;
                if (arg != args[args.Length - 1])
                {
                    file = STFileLoader.OpenFileFormat(arg);
                }
                try { 
                    var scene = ((IModelSceneFormat)file).ToGeneric();
                    foreach (var model in scene.Models)
                    {
                        DAE.Export($"{args[args.Length - 1]}{model.Name}.dae", new DAE.ExportSettings()
                        {
                            ExportTextures = true,
                        }, model, model.GetMappedTextures(), new STSkeleton());
                    }
                }
                catch
                {

                }
            }
        }
    }
}
