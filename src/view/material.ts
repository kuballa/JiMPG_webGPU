// This class represents a material, which includes a texture with multiple mip levels,
// a view for sampling the texture, a sampler, and a bind group for resource binding in shaders.
export class Material {

    // The texture used by the material, which can have multiple mip levels
    texture!: GPUTexture;

    // The view for the texture, which defines how to access it in GPU shaders
    view!: GPUTextureView;

    // The sampler used to sample the texture in shaders
    sampler!: GPUSampler;

    // The bind group that holds the texture and sampler for binding to a pipeline
    bindGroup!: GPUBindGroup;

    // Initializes the material by loading the texture with multiple mip levels
    async initialize(device: GPUDevice, name: string, bindGroupLayout: GPUBindGroupLayout) {

        var mipLevels = 0;  // Counter for the number of mip levels
        var width = 0;  // Width of the texture (same for all mip levels)
        var height = 0;  // Height of the texture (same for all mip levels)

        // Try loading the mip levels starting from level 0
        while (true) {
            // Generate the URL for the mip level texture image
            const url: string = "dist/img/" + name + "/" + name + String(mipLevels) + ".png";
            const response: Response = await fetch(url);
            
            // If the texture file for this mip level does not exist, stop loading
            if (!response.ok) {
                break;
            }

            // If it's the first mip level, get the image dimensions (width and height)
            if (mipLevels == 0) {
                const blob: Blob = await response.blob();
                const imageData: ImageBitmap = await createImageBitmap(blob);
                width = imageData.width;
                height = imageData.height;
                imageData.close();  // Close the ImageBitmap as it's no longer needed
            }

            // Increment mip level counter for the next iteration
            mipLevels += 1;
        }

        // Define the texture descriptor with the calculated mip levels and other parameters
        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: width,  // Width from the first mip level
                height: height  // Height from the first mip level
            },
            format: "rgba8unorm",  // Texture format (RGBA with 8-bit unsigned normalized values)
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,  // Usage flags (binding, copy, render)
            mipLevelCount: mipLevels  // Set the total number of mip levels
        };

        // Create the texture on the GPU
        this.texture = device.createTexture(textureDescriptor);

        // Load each mip level of the texture and copy it to the GPU texture
        for (var i = 0; i < mipLevels; i += 1) {
            const url: string = "dist/img/" + name + "/" + name + String(i) + ".png";
            const response: Response = await fetch(url);
            const blob: Blob = await response.blob();
            const imageData: ImageBitmap = await createImageBitmap(blob);
            
            // Load the image data for each mip level into the texture
            await this.loadImageBitmap(device, imageData, i);
            imageData.close();  // Close the ImageBitmap after loading
        }

        // Create the texture view, specifying the format and mip levels to access
        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "rgba8unorm",  // The format of the texture (same as the texture's format)
            dimension: "2d",  // The texture is 2D
            aspect: "all",    // All texture aspects (color, depth, etc.)
            baseMipLevel: 0,  // Start from the first mip level
            mipLevelCount: mipLevels,  // Use all mip levels
            baseArrayLayer: 0,  // Start from the first layer
            arrayLayerCount: 1  // Only one layer (since this is a 2D texture)
        };
        this.view = this.texture.createView(viewDescriptor);

        // Define the sampler for texture sampling in shaders
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",  // Repeat texture in the U (x) direction
            addressModeV: "repeat",  // Repeat texture in the V (y) direction
            magFilter: "linear",     // Linear filtering for magnification (zooming in)
            minFilter: "linear",     // Linear filtering for minification (zooming out)
            mipmapFilter: "linear",  // Linear filtering for mipmap selection
            maxAnisotropy: 4         // Maximum anisotropy (used for texture sampling at glancing angles)
        };
        this.sampler = device.createSampler(samplerDescriptor);

        // Create the bind group with the texture view and sampler
        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,  // Bind group layout
            entries: [
                {
                    binding: 0,  // Binding index for the texture view
                    resource: this.view  // The texture view
                },
                {
                    binding: 1,  // Binding index for the sampler
                    resource: this.sampler  // The sampler
                }
            ]
        });
    }

    // Loads an ImageBitmap into a specific mip level of the texture
    async loadImageBitmap(device: GPUDevice, imageData: ImageBitmap, i: number) {
        // Copy the image data to the specified mip level of the texture
        device.queue.copyExternalImageToTexture(
            { source: imageData },
            { texture: this.texture, mipLevel: i },  // Copy to the appropriate mip level
            { width: imageData.width, height: imageData.height }  // Dimensions of the image
        );
    }
}