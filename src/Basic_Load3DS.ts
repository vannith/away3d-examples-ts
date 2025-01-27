///<reference path="../libs/Away3D.next.d.ts" />

/*

 3ds file loading example in Away3d

 Demonstrates:

 How to use the Loader3D object to load an embedded internal 3ds model.
 How to map an external asset reference inside a file to an internal embedded asset.
 How to extract material data and use it to set custom material properties on a model.

 Code by Rob Bateman
 rob@infiniteturtles.co.uk
 http://www.infiniteturtles.co.uk

 This code is distributed under the MIT License

 Copyright (c) The Away Foundation http://www.theawayfoundation.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the “Software”), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

module examples
{

    export class Basic_Load3DS
    {
        //engine variables
        private _view:away.containers.View;
        private _cameraController:away.controllers.HoverController;

        //material objects
        private _groundMaterial:away.materials.TextureMaterial;

        //light objects
        private _light:away.lights.DirectionalLight;
        private _lightPicker:away.materials.StaticLightPicker;
        private _direction:away.geom.Vector3D;

        //scene objects
        private _loader:away.containers.Loader3D;
        private _ground:away.entities.Mesh;

        //navigation variables
        private _timer:away.utils.RequestAnimationFrame;
        private _time:number = 0;
        private _move:boolean = false;
        private _lastPanAngle:number;
        private _lastTiltAngle:number;
        private _lastMouseX:number;
        private _lastMouseY:number;

	    /**
         * Constructor
         */
        constructor()
        {
            this.init();
        }

        /**
         * Global initialise function
         */
        private init():void
        {
            this.initEngine();
            this.initLights();
            this.initMaterials();
            this.initObjects();
            this.initListeners();
        }

        /**
         * Initialise the engine
         */
        private initEngine():void
        {
            this._view = new away.containers.View(new away.render.DefaultRenderer());

            //setup the camera for optimal shadow rendering
            this._view.camera.projection.far = 2100;

            //setup controller to be used on the camera
            this._cameraController = new away.controllers.HoverController(this._view.camera, null, 45, 20, 1000, 10);
        }

        /**
         * Initialise the lights
         */
        private initLights():void
        {
            this._light = new away.lights.DirectionalLight(-1, -1, 1);
            this._direction = new away.geom.Vector3D(-1, -1, 1);
            this._lightPicker = new away.materials.StaticLightPicker([this._light]);
            this._view.scene.addChild(this._light);
        }

        /**
         * Initialise the materials
         */
        private initMaterials():void
        {
            this._groundMaterial = new away.materials.TextureMaterial();
            this._groundMaterial.shadowMethod = new away.materials.SoftShadowMapMethod(this._light , 10 , 5 );
            this._groundMaterial.shadowMethod.epsilon = 0.2;
            this._groundMaterial.lightPicker = this._lightPicker;
            this._groundMaterial.specular = 0;
            this._ground = new away.entities.Mesh(new away.primitives.PlaneGeometry(1000, 1000), this._groundMaterial);
            this._ground.castsShadows =false;
            this._view.scene.addChild(this._ground);
        }

        /**
         * Initialise the scene objects
         */
        private initObjects():void
        {
            this._loader = new away.containers.Loader3D();
            this._loader.transform.scale = new away.geom.Vector3D(300, 300, 300);
            this._loader.z = -200;
            this._view.scene.addChild(this._loader);
        }

        /**
         * Initialise the listeners
         */
        private initListeners():void
        {
            window.onresize  = (event) => this.onResize(event);

            document.onmousedown = (event) => this.onMouseDown(event);
            document.onmouseup = (event) => this.onMouseUp(event);
            document.onmousemove = (event) => this.onMouseMove(event);

            this.onResize();

            this._timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();

            //setup the url map for textures in the 3ds file
            var assetLoaderContext:away.net.AssetLoaderContext = new away.net.AssetLoaderContext();
            assetLoaderContext.mapUrl("texture.jpg", "assets/soldier_ant.jpg");

            this._loader.addEventListener(away.events.AssetEvent.ASSET_COMPLETE, away.utils.Delegate.create(this, this.onAssetComplete));
            this._loader.load(new away.net.URLRequest("assets/soldier_ant.3ds"), assetLoaderContext, null, new away.parsers.Max3DSParser(false));

            away.library.AssetLibrary.addEventListener(away.events.LoaderEvent.RESOURCE_COMPLETE, away.utils.Delegate.create(this, this.onResourceComplete));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/CoarseRedSand.jpg"));
        }

        /**
         * Navigation and render loop
         */
        private onEnterFrame(dt:number):void
        {
            this._time += dt;

            this._direction.x = -Math.sin(this._time/4000);
            this._direction.z = -Math.cos(this._time/4000);
            this._light.direction = this._direction;

            this._view.render();
        }

        /**
         * Listener function for asset complete event on loader
         */
        private onAssetComplete (event:away.events.AssetEvent)
        {
            var asset:away.library.IAsset = event.asset;

            switch (asset.assetType)
            {
                case away.library.AssetType.MESH :
                    var mesh:away.entities.Mesh = <away.entities.Mesh> event.asset;
                    mesh.castsShadows = true;
                    break;
                case away.library.AssetType.MATERIAL :
                    var material:away.materials.TextureMaterial = <away.materials.TextureMaterial> event.asset;
                    material.shadowMethod = new away.materials.SoftShadowMapMethod(this._light , 10 , 5 );
                    material.shadowMethod.epsilon = 0.2;
                    material.lightPicker = this._lightPicker;
                    material.gloss = 30;
                    material.specular = 1;
                    material.ambientColor = 0x303040;
                    material.ambient = 1;

                    break;
            }
        }

        /**
         * Listener function for resource complete event on asset library
         */
        private onResourceComplete (event:away.events.LoaderEvent)
        {
            var assets:away.library.IAsset[] = event.assets;
            var length:number = assets.length;

            for ( var c : number = 0 ; c < length ; c ++ )
            {
                var asset:away.library.IAsset = assets[c];

                console.log(asset.name, event.url);

                switch (event.url)
                {
                    //plane textures
                    case "assets/CoarseRedSand.jpg" :
                        this._groundMaterial.texture = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                }
            }
        }

        /**
         * Mouse down listener for navigation
         */
        private onMouseDown(event):void
        {
            this._lastPanAngle = this._cameraController.panAngle;
            this._lastTiltAngle = this._cameraController.tiltAngle;
            this._lastMouseX = event.clientX;
            this._lastMouseY = event.clientY;
            this._move = true;
        }

        /**
         * Mouse up listener for navigation
         */
        private onMouseUp(event):void
        {
            this._move = false;
        }

        private onMouseMove(event)
        {
            if (this._move) {
                this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
                this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
            }
        }

        /**
         * stage listener for resize events
         */
        private onResize(event = null):void
        {
            this._view.y         = 0;
            this._view.x         = 0;
            this._view.width     = window.innerWidth;
            this._view.height    = window.innerHeight;
        }
    }
}


window.onload = function ()
{
    new examples.Basic_Load3DS();
}