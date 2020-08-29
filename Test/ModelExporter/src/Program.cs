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

                string fileName = arg.Replace(".sbfres", ".Tex1.sbfres");
                if (File.Exists(fileName))
                {
                    var texfile = STFileLoader.OpenFileFormat(fileName);
                    var texscene = ((IModelSceneFormat)texfile).ToGeneric();
                    string folder = Path.GetFileNameWithoutExtension(fileName);
                    foreach (var tex in texscene.Textures)
                    {
                        tex.Export($"{tex.Name}.png",
                            new TextureExportSettings()
                            {
                                ExportArrays = false,
                                ExportMipmaps = false,
                            });
                    }
                }

                var file = STFileLoader.OpenFileFormat(arg);
                var scene = ((IModelSceneFormat)file).ToGeneric();
                foreach (var model in scene.Models)
                {
                    DAE.Export($"{model.Name}.dae", new DAE.ExportSettings()
                    {
                        ExportTextures = true,
                    }, model, model.GetMappedTextures(), model.Skeleton);
                }
            }
        }
    }
}
