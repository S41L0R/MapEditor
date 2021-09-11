using System;
using System.IO;
using Toolbox.Core;
using Toolbox.Core.Collada;
using Toolbox.Core.IO;
using CafeLibrary;
using System.Text.Json;
using System.Collections.Generic;
using BfresLibrary;
using Collada141;

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
                    BFRES file;
                    if (File.Exists(arg))
                    {
                        file = (BFRES)STFileLoader.OpenFileFormat(arg);
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
                            if (File.Exists(arg.Insert(arg.Length - 7, "-" + Suffix.ToString("00"))))
                            {
                                file = (BFRES)STFileLoader.OpenFileFormat(arg.Insert(arg.Length - 7, "-" + Suffix.ToString("00")));
                            }
                            else
                            {
                                break;
                            }
                            ExportModel(file, args);
                            Suffix = Suffix + 1;
                        }
                    }
                }
            }
        }
        static void ExportModel(BFRES file, String[] args)
        {
            var scene = ((IModelSceneFormat)file).ToGeneric();
            
            foreach (var model in scene.Models)
            {
                Dictionary<String, Dictionary<String, Dictionary<String, String>>> extraModelData = new Dictionary<String, Dictionary<String, Dictionary<String, String>>>();
                extraModelData["Materials"] = new Dictionary<String, Dictionary<String, String>>();
                for (int matIndex = 0; matIndex < file.ResFile.Models[model.Name].Materials.Count; matIndex++)
                {
                    extraModelData["Materials"][file.ResFile.Models[model.Name].Materials[matIndex].Name] = new Dictionary<String, String>();
                    for (int samplerIndex = 0; samplerIndex < file.ResFile.Models[model.Name].Materials[matIndex].Samplers.Count; samplerIndex++)
                    {
                        string samplerName = file.ResFile.Models[model.Name].Materials[matIndex].Samplers[samplerIndex].Name;
                        if (samplerName == "_ms0")
                        {
                            extraModelData["Materials"][file.ResFile.Models[model.Name].Materials[matIndex].Name]["MskTex"] = file.ResFile.Models[model.Name].Materials[matIndex].TextureRefs[samplerIndex].Name;
                        }
                        
                    }
                }
                String ExtraDataJsonData = JsonSerializer.Serialize(extraModelData);
                File.WriteAllText($"{args[args.Length - 1]}{model.Name}.json", ExtraDataJsonData);
                
                DAE.Export($"{args[args.Length - 1]}{model.Name}.dae", new DAE.ExportSettings()
                {
                    ExportTextures = true,
                }, model, model.GetMappedTextures(), model.Skeleton);
            }
        }
    }
}
