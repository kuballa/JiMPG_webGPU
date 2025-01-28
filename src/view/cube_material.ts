// This class handles creating and initializing a CubeMap material, which is a 3D texture (cube map)
// typically used for skyboxes, reflections, and other environment-based effects.
export class CubeMapMaterial {

    // The texture representing the cube map
    texture!: GPUTexture;

    // The view for the texture, which defines how to access it in the GPU pipeline
    view!: GPUTextureView;

    // The sampler for the texture, defining how the texture is sampled (filtering, wrapping, etc.)
    sampler!: GPUSampler;

    // Initializes the CubeMapMaterial with 6 texture URLs and sets up the texture and sampler
    async initialize(
        device: GPUDevice,  // The GPU device used to create the resources
        urls: string[]      // URLs of the 6 cube map images
    ) {
        // Array to store the 6 images as ImageBitmaps
        var imageData: ImageBitmap[] = new Array(6);

        // Fetch the image data from the provided URLs
        for (var i: number = 0; i < 6; i++) {
            // Fetch the image and convert it to a Blob
            const response: Response = await fetch(urls[i]);
            const blob: Blob = await response.blob();
            
            // Create an ImageBitmap from the Blob for GPU use
            imageData[i] = await createImageBitmap(blob);
        }

        // Load the image bitmaps into the GPU texture
        await this.loadImageBitmaps(device, imageData);

        // Create the texture view for the cube map
        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "rgba8unorm",  // Texture format (RGBA 8-bit normalized)
            dimension: "cube",     // Texture type (cube map)
            aspect: "all",         // Texture aspect (all components)
            baseMipLevel: 0,       // Start from the first mip level
            mipLevelCount: 1,      // Use a single mip level
            baseArrayLayer: 0,     // Start from the first layer
            arrayLayerCount: 6     // 6 layers for the cube map (one per face)
        };
        
        // Create the view for the cube map texture
        this.view = this.texture.createView(viewDescriptor);

        // Define the sampler settings for how the texture will be sampled
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",  // Repeat texture in the U (x) direction
            addressModeV: "repeat",  // Repeat texture in the V (y) direction
            magFilter: "linear",     // Use linear filtering for magnification
            minFilter: "nearest",    // Use nearest neighbor filtering for minification
            mipmapFilter: "nearest", // Use nearest neighbor filtering for mipmap selection
            maxAnisotropy: 1         // No anisotropic filtering (set to 1)
        };

        // Create the sampler to be used with the texture
        this.sampler = device.createSampler(samplerDescriptor);
    }

    // Loads the image bitmaps into the GPU texture
    async loadImageBitmaps(
        device: GPUDevice,  // The GPU device used to create the texture
        imageData: ImageBitmap[]  // The array of ImageBitmaps to load
    ) {
        // Define the texture descriptor for the cube map
        const textureDescriptor: GPUTextureDescriptor = {
            dimension: "2d",  // 2D texture type (though it will be used as a cube map)
            size: {
                width: imageData[0].width,  // Width of the texture (based on the first image)
                height: imageData[0].height,  // Height of the texture (based on the first image)
                depthOrArrayLayers: 6  // 6 layers for the cube map (one for each face)
            },
            format: "rgba8unorm",  // Texture format (RGBA 8-bit normalized)
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT  // Usages of the texture (binding, copying, and rendering)
        };

        // Create the texture on the GPU
        this.texture = device.createTexture(textureDescriptor);

        // Copy each image bitmap to the corresponding layer of the texture
        for (var i = 0; i < 6; i++) {
            device.queue.copyExternalImageToTexture(
                { source: imageData[i] },  // Source image bitmap
                { texture: this.texture, origin: [0, 0, i] },  // Destination texture and the specific layer (i) for the cube map face
                [imageData[i].width, imageData[i].height]  // Image dimensions
            );
        }
    }
}