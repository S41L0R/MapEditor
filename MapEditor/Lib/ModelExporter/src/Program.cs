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
                var file = STFileLoader.OpenFileFormat(arg);
                var scene = ((IModelSceneFormat)file).ToGeneric();
                foreach (var model in scene.Models)
                {
                    DAE.Export($"{model.Name}.dae", new DAE.ExportSettings()
                    {
                        ExportTextures = true,
                    }, model, model.GetMappedTextures(), model.Skeleton);
                }
				foreach (var tex in scene.Textures)
				{
					tex.Export($"{tex.Name}.png"),
						new TextureExportSettings()
						{
							ExportArrays = false,
							ExportMipmaps = false,
						});
				}
            }
        }
    }
}
