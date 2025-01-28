import { BindGroupBuilder } from "./bind_group";

// This class represents a framebuffer that includes a texture, its view, a sampler, and a bind group.
export class Framebuffer {

    // The texture used as the framebuffer's color attachment
    texture!: GPUTexture;

    // The view of the texture, which defines how to access it in GPU pipelines
    view!: GPUTextureView;

    // The sampler used to sample the texture in shaders
    sampler!: GPUSampler;

    // The bind group that holds the texture and sampler, used for binding them in GPU pipelines
    bindGroup!: GPUBindGroup;

    // Initializes the framebuffer, including creating a texture, view, sampler, and bind group
    async initialize(
        device: GPUDevice,  // The GPU device used to create the resources
        canvas: HTMLCanvasElement,  // The canvas element that defines the framebuffer's size
        bindGroupLayout: GPUBindGroupLayout,  // The layout for the bind group (describes how resources are bound)
        format: GPUTextureFormat  // The format of the texture (e.g., RGBA, depth)
    ) {
        // Retrieve the canvas size to define the framebuffer's dimensions
        var width = canvas.width;
        var height = canvas.height;

        // Define the texture descriptor, setting size, format, and usage flags
        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: width,  // Width from the canvas
                height: height  // Height from the canvas
            },
            mipLevelCount: 1,  // No mipmaps, just a single level
            format: format,  // The texture format (e.g., RGBA, depth)
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT  // Usage flags (binding and rendering)
        };

        // Create the texture with the specified descriptor
        this.texture = device.createTexture(textureDescriptor);

        // Define the texture view descriptor, describing how the texture will be accessed
        const viewDescriptor: GPUTextureViewDescriptor = {
            format: format,  // The format of the texture (same as the texture's format)
            dimension: "2d",  // The texture is a 2D texture
            aspect: "all",    // All texture aspects (color, depth, stencil)
            baseMipLevel: 0,  // Start from the first mip level (no mipmaps in this case)
            mipLevelCount: 1, // Use only the first mip level
            baseArrayLayer: 0, // Start from the first layer (for a 2D texture)
            arrayLayerCount: 1 // Only one layer (since this is a 2D texture)
        };

        // Create the texture view for the texture
        this.view = this.texture.createView(viewDescriptor);

        // Define the sampler descriptor, specifying how the texture will be sampled
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",  // Repeat the texture in the U (x) direction
            addressModeV: "repeat",  // Repeat the texture in the V (y) direction
            magFilter: "linear",     // Use linear filtering for magnification (zooming in)
            minFilter: "linear",     // Use linear filtering for minification (zooming out)
            mipmapFilter: "linear",  // Use linear filtering for mipmap selection
            maxAnisotropy: 1         // No anisotropic filtering (set to 1)
        };

        // Create the sampler to be used with the texture
        this.sampler = device.createSampler(samplerDescriptor);

        // Create a bind group builder to create a bind group that holds the texture and sampler
        var builder: BindGroupBuilder = new BindGroupBuilder(device);

        // Set the bind group layout (describes how resources will be accessed)
        builder.setLayout(bindGroupLayout);

        // Add the material (texture view and sampler) to the bind group
        builder.addMaterial(this.view, this.sampler);

        // Build the bind group asynchronously
        this.bindGroup = await builder.build();
    }
}