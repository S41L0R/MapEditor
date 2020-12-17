using System;
using System.Collections.Generic;
using System.IO;
using Toolbox.Core.OpenGL;
using Toolbox.Core;
using Toolbox.Core.ModelView;
using Toolbox.Core.IO;
using BfresLibrary;
using Toolbox.Core.Imaging;

namespace CafeLibrary
{
    public class BFRES : ObjectTreeNode, IFileFormat, IModelSceneFormat
    {
        public bool CanSave { get; set; } = true;

        public string[] Description { get; set; } = new string[] { "BFRES" };
        public string[] Extension { get; set; } = new string[] { "*.bfres" };

        public File_Info FileInfo { get; set; }

        public bool Identify(File_Info fileInfo, Stream stream)
        {
            using (var reader = new FileReader(stream, true)) {
                return reader.CheckSignature(4, "FRES");
            }
        }

        public ModelRenderer Renderer => new ModelRenderer(ToGeneric());

        public ResFile ResFile;

        public void Load(Stream stream)
        {
            this.Label = FileInfo.FileName;
            Tag = this;
            ResFile = new ResFile(stream);

            ObjectTreeNode modelFolder = new ObjectTreeNode("Models");
            AddChild(modelFolder);

            var scene = ToGeneric();
            foreach (var model in scene.Models)
            {
                ObjectTreeNode modelNode = new ObjectTreeNode(model.Name);
                modelNode.ImageKey = "Model";
                modelNode.Tag = model;
                modelFolder.AddChild(modelNode);

                foreach (var mesh in model.Meshes)
                {
                    ObjectTreeNode meshNode = new ObjectTreeNode(mesh.Name);
                    meshNode.Tag = mesh;
                    modelNode.AddChild(meshNode);
                }
            }

            ObjectTreeNode textureFolder = new ObjectTreeNode("Textures");
            AddChild(textureFolder);

            foreach (var tex in scene.Textures)
            {
                ObjectTreeNode texNode = new ObjectTreeNode(tex.Name);
                texNode.Tag = tex;
                texNode.ImageKey = "Texture";
                textureFolder.AddChild(texNode);
            }
        }

        private STGenericScene Scene;
        public STGenericScene ToGeneric()
        {
            if (Scene != null) return Scene;

            var scene = new STGenericScene();
            scene.Name = FileInfo.FileName;
            foreach (var mdl in ResFile.Models.Values)
            {
                var model = new STGenericModel(mdl.Name);
                model.ParentResource = scene;
                scene.Models.Add(model);

                model.Skeleton = new FSKL(mdl.Skeleton);
                foreach (var shape in mdl.Shapes.Values)
                    model.Meshes.Add(new FSHP(ResFile, (FSKL)model.Skeleton, mdl, shape));
            }
            if (ResFile.IsPlatformSwitch)
            {
                var bntx = GetBinarySwitchTexture(ResFile);
                if (bntx != null)
                    scene.Textures.AddRange(bntx.TextureList);
            }
            else
            {
                foreach (BfresLibrary.WiiU.Texture tex in ResFile.Textures.Values)
                    scene.Textures.Add(new FTEX(ResFile, tex));
            }

            Scene = scene;
            return Scene;
        }

        private BNTX GetBinarySwitchTexture(ResFile resFile)
        {
            foreach (var external in resFile.ExternalFiles)
            {
                if (Utils.GetExtension(external.Key) == ".bntx")
                {
                    BNTX bntx = new BNTX();
                    bntx.FileInfo = new File_Info();
                    bntx.Load(new  MemoryStream(external.Value.Data));
                    return bntx;
                }
            }
            return null;
        }

        public void Save(Stream stream) {
            ResFile.Save(stream);
        }
    }
}
