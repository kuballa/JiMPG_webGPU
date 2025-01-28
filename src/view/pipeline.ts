export class RenderPipelineBuilder {

    // The GPU device used to create pipeline objects
    device: GPUDevice;

    // A list of bind group layouts associated with the pipeline
    bindGroupLayouts: GPUBindGroupLayout[];

    // The source code for the vertex and fragment shaders
    src_code!: string;
    vertex_entry!: string;
    fragment_entry!: string;

    // Descriptions of the vertex buffers used by the pipeline
    buffers: GPUVertexBufferLayout[];

    // Render target configurations (color attachments)
    renderTargets!: GPUColorTargetState[];

    // Depth and stencil state configuration
    depthStencilState: GPUDepthStencilState | undefined;

    constructor(device: GPUDevice) {
        this.bindGroupLayouts = [];  // Initialize an empty array for bind group layouts
        this.device = device;  // Assign the device
        this.buffers = [];  // Initialize an empty array for buffer layouts
        this.depthStencilState = undefined;  // Initialize depth/stencil state as undefined
        this.reset();  // Reset internal state to initial values
    }

    // Reset method clears the pipeline configuration
    reset() {
        this.bindGroupLayouts = [];  // Clear bind group layouts
        this.buffers = [];  // Clear vertex buffer layouts
        this.renderTargets = [];  // Clear render targets
    }

    // Add a bind group layout to the pipeline builder
    async addBindGroupLayout(layout: GPUBindGroupLayout) {
        this.bindGroupLayouts.push(layout);  // Add the provided bind group layout to the list
    }

    // Set the source code for the vertex and fragment shaders
    setSourceCode(src_code: string, vertex_entry: string, fragment_entry: string) {
        this.src_code = src_code;  // Store the shader source code
        this.vertex_entry = vertex_entry;  // Store the entry point for the vertex shader
        this.fragment_entry = fragment_entry;  // Store the entry point for the fragment shader
    }

    // Add a description of the vertex buffer layout to the pipeline
    addVertexBufferDescription(vertexBufferLayout: GPUVertexBufferLayout) {
        this.buffers.push(vertexBufferLayout);  // Add the buffer layout to the list
    }

    // Add a render target (color attachment) to the pipeline
    addRenderTarget(format: GPUTextureFormat, blend: boolean) {
        // Define the color target state for the render target
        var target: GPUColorTargetState = {
            format: format,  // The format of the render target texture
        };

        // If blending is enabled, set up the blend state
        if (blend) {
            target.blend = {
                color: {
                    operation: "add",  // The color blending operation
                    srcFactor: "src-alpha",  // Source blend factor
                    dstFactor: "one-minus-src-alpha"  // Destination blend factor
                },
                alpha: {
                    operation: "add",  // The alpha blending operation
                    srcFactor: "one",  // Source alpha blend factor
                    dstFactor: "zero"  // Destination alpha blend factor
                },
            };
        }

        this.renderTargets.push(target);  // Add the render target to the list
    }

    // Set the depth/stencil state for the pipeline
    setDepthStencilState(depthStencil: GPUDepthStencilState) {
        this.depthStencilState = depthStencil;  // Store the depth/stencil state
    }

    // Build and create the render pipeline using the provided configurations
    async build(label: string): Promise<GPURenderPipeline> {

        // Create a pipeline layout using the bind group layouts
        var layout = this.device.createPipelineLayout({
            bindGroupLayouts: this.bindGroupLayouts  // Bind group layouts specify how resources are bound to shaders
        });

        // Create and return the render pipeline
        const pipeline = await this.device.createRenderPipeline({
            label: label,  // Label for debugging purposes
            vertex: {
                module: this.device.createShaderModule({
                    code: this.src_code  // The vertex shader source code
                }),
                entryPoint: this.vertex_entry,  // The entry point for the vertex shader
                buffers: this.buffers  // Vertex buffer layouts
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: this.src_code  // The fragment shader source code
                }),
                entryPoint: this.fragment_entry,  // The entry point for the fragment shader
                targets: this.renderTargets  // Render targets (color attachments)
            },

            primitive: {
                topology: "triangle-list"  // Specify the primitive topology (triangles in this case)
            },

            layout: layout,  // Use the pipeline layout defined earlier
            depthStencil: this.depthStencilState,  // Optional depth/stencil state (can be undefined)
        });

        // Reset internal state after building the pipeline
        this.reset();

        return pipeline;  // Return the created pipeline
    }
}