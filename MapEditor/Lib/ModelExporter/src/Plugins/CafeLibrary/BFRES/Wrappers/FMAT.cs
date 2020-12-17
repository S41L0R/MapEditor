using BfresLibrary;
using System;
using System.Collections.Generic;
using System.Text;
using Toolbox.Core;

namespace CafeLibrary
{
    public class FMAT : STGenericMaterial
    {
        /// <summary>
        /// The material section of the bfres.
        /// </summary>
        public Material Material { get; set; }

        /// <summary>
        /// Thee model in which the data in this section is parented to.
        /// </summary>
        public Model ParentModel { get; set; }

        /// <summary>
        /// The file in which the data in this section is parented to.
        /// </summary>
        public ResFile ParentFile { get; set; }

        public FMAT(ResFile resFile, Model model, Material material)
        {
            Name = material.Name;
            ParentFile = resFile;
            Material = material;
            ParentModel = model;

            for (int i = 0; i < material.TextureRefs.Count; i++)
            {
                string name = material.TextureRefs[i].Name;
                Sampler sampler = material.Samplers[i];
                Console.WriteLine($"sampler {sampler.Name}");
                if (sampler.Name == "_a0")
                {
                    this.TextureMaps.Add(new STGenericTextureMap()
                    {
                        Name = name,
                        Type = STTextureType.Diffuse,
                    });
                }
                if (sampler.Name == "_n0")
                {
                    this.TextureMaps.Add(new STGenericTextureMap()
                    {
                        Name = name,
                        Type = STTextureType.Normal,
                    });
                }
                if (sampler.Name == "_s0")
                {
                    this.TextureMaps.Add(new STGenericTextureMap()
                    {
                        Name = name,
                        Type = STTextureType.Specular,
                    });
                }
                if (sampler.Name == "_e0")
                {
                    this.TextureMaps.Add(new STGenericTextureMap()
                    {
                        Name = name,
                        Type = STTextureType.Emission,
                    });
                }
            }
        }
    }
}
