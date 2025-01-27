///<reference path="../libs/Away3D.next.d.ts" />

/*

 Shading example in Away3d

 Demonstrates:

 How to create multiple lightsources in a scene.
 How to apply specular maps, normals maps and diffuse texture maps to a material.

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

    export class Basic_Shading
    {
        //engine variables
        private _scene:away.containers.Scene;
        private _camera:away.entities.Camera;
        private _view:away.containers.View;
        private _cameraController:away.controllers.HoverController;

        //material objects
        private _planeMaterial:away.materials.TextureMaterial;
        private _sphereMaterial:away.materials.TextureMaterial;
        private _cubeMaterial:away.materials.TextureMaterial;
        private _torusMaterial:away.materials.TextureMaterial;

        //light objects
        private _light1:away.lights.DirectionalLight;
        private _light2:away.lights.DirectionalLight;
        private _lightPicker:away.materials.StaticLightPicker;

        //scene objects
        private _plane:away.entities.Mesh;
        private _sphere:away.entities.Mesh;
        private _cube:away.entities.Mesh;
        private _torus:away.entities.Mesh;

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
            this._scene = new away.containers.Scene();

            this._camera = new away.entities.Camera();

            this._view = new away.containers.View(new away.render.DefaultRenderer());
            //this._view.antiAlias = 4;
            this._view.scene = this._scene;
            this._view.camera = this._camera;

            //setup controller to be used on the camera
            this._cameraController = new away.controllers.HoverController(this._camera);
            this._cameraController.distance = 1000;
            this._cameraController.minTiltAngle = 0;
            this._cameraController.maxTiltAngle = 90;
            this._cameraController.panAngle = 45;
            this._cameraController.tiltAngle = 20;
        }

        /**
         * Initialise the lights
         */
        private initLights():void
        {
            this._light1 = new away.lights.DirectionalLight();
            this._light1.direction = new away.geom.Vector3D(0, -1, 0);
            this._light1.ambient = 0.1;
            this._light1.diffuse = 0.7;

            this._scene.addChild(this._light1);

            this._light2 = new away.lights.DirectionalLight();
            this._light2.direction = new away.geom.Vector3D(0, -1, 0);
            this._light2.color = 0x00FFFF;
            this._light2.ambient = 0.1;
            this._light2.diffuse = 0.7;

            this._scene.addChild(this._light2);

            this._lightPicker = new away.materials.StaticLightPicker([this._light1, this._light2]);
        }

        /**
         * Initialise the materials
         */
        private initMaterials():void
        {
            this._planeMaterial = new away.materials.TextureMaterial(away.materials.DefaultMaterialManager.getDefaultTexture());
            this._planeMaterial.lightPicker = this._lightPicker;
            this._planeMaterial.repeat = true;
            this._planeMaterial.mipmap = false;

            this._sphereMaterial = new away.materials.TextureMaterial(away.materials.DefaultMaterialManager.getDefaultTexture());
            this._sphereMaterial.lightPicker = this._lightPicker;

            this._cubeMaterial = new away.materials.TextureMaterial(away.materials.DefaultMaterialManager.getDefaultTexture());
            this._cubeMaterial.lightPicker = this._lightPicker;
            this._cubeMaterial.mipmap = false;

            this._torusMaterial = new away.materials.TextureMaterial(away.materials.DefaultMaterialManager.getDefaultTexture());
            this._torusMaterial.lightPicker = this._lightPicker;
            this._torusMaterial.repeat = true;
        }

        /**
         * Initialise the scene objects
         */
        private initObjects():void
        {
            this._plane = new away.entities.Mesh(new away.primitives.PlaneGeometry(1000, 1000), this._planeMaterial);
            this._plane.geometry.scaleUV(2, 2);
            this._plane.y = -20;

            this._scene.addChild(this._plane);

            this._sphere = new away.entities.Mesh(new away.primitives.SphereGeometry(150, 40, 20), this._sphereMaterial);
            this._sphere.x = 300;
            this._sphere.y = 160;
            this._sphere.z = 300;

            this._scene.addChild(this._sphere);

            this._cube = new away.entities.Mesh(new away.primitives.CubeGeometry(200, 200, 200, 1, 1, 1, false), this._cubeMaterial);
            this._cube.x = 300;
            this._cube.y = 160;
            this._cube.z = -250;

            this._scene.addChild(this._cube);

            this._torus = new away.entities.Mesh(new away.primitives.TorusGeometry(150, 60, 40, 20), this._torusMaterial);
            this._torus.geometry.scaleUV(10, 5);
            this._torus.x = -250;
            this._torus.y = 160;
            this._torus.z = -250;

            this._scene.addChild(this._torus);
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
	        document.onmousewheel= (event) => this.onMouseWheel(event);

            this.onResize();

            this._timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();

            away.library.AssetLibrary.addEventListener(away.events.LoaderEvent.RESOURCE_COMPLETE, away.utils.Delegate.create(this, this.onResourceComplete));

            //plane textures
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/floor_diffuse.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/floor_normal.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/floor_specular.jpg"));

            //sphere textures
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/beachball_diffuse.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/beachball_specular.jpg"));

            //cube textures
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/trinket_diffuse.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/trinket_normal.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/trinket_specular.jpg"));

            //torus textures
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/weave_diffuse.jpg"));
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/weave_normal.jpg"));
        }

        /**
         * Navigation and render loop
         */
        private onEnterFrame(dt:number):void
        {
            this._time += dt;

            this._light1.direction = new away.geom.Vector3D(Math.sin(this._time/10000)*150000, -1000, Math.cos(this._time/10000)*150000);

            this._view.render();
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
                    case "assets/floor_diffuse.jpg" :
                        this._planeMaterial.texture = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/floor_normal.jpg" :
                        this._planeMaterial.normalMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/floor_specular.jpg" :
                        this._planeMaterial.specularMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;

                    //sphere textures
                    case "assets/beachball_diffuse.jpg" :
                        this._sphereMaterial.texture = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/beachball_specular.jpg" :
                        this._sphereMaterial.specularMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;

                    //cube textures
                    case "assets/trinket_diffuse.jpg" :
                        this._cubeMaterial.texture = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/trinket_normal.jpg" :
                        this._cubeMaterial.normalMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/trinket_specular.jpg" :
                        this._cubeMaterial.specularMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;

                    //torus textures
                    case "assets/weave_diffuse.jpg" :
                        this._torusMaterial.texture = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
                        break;
                    case "assets/weave_normal.jpg" :
                        this._torusMaterial.normalMap = this._torusMaterial.specularMap = <away.textures.Texture2DBase> away.library.AssetLibrary.getAsset(asset.name);
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

        /**
         * Mouse move listener for navigation
         */
	    private onMouseMove(event)
	    {
		    if (this._move) {
			    this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			    this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		    }
	    }

        /**
         * Mouse wheel listener for navigation
         */
	    private onMouseWheel(event)
	    {
		    if (event.wheelDelta > 0 )
		    {
			    this._cameraController.distance += 20;
		    }
		    else
		    {
			    this._cameraController.distance -= 20;
		    }
	    }

        /**
         * window listener for resize events
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
    new examples.Basic_Shading();
}