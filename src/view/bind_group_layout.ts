// This class is responsible for building a GPU BindGroupLayout based on different types of bindings
export class BindGroupLayoutBuilder {

    // The GPU device this builder will be used with
    device: GPUDevice;

    // An array that will store all bind group layout entries
    bindGroupLayoutEntries!: GPUBindGroupLayoutEntry[];

    // The current binding number that is being assigned to each entry
    binding!: number;

    // Constructor that initializes the device and calls reset to set up initial state
    constructor(device: GPUDevice) {
        this.device = device;  // Assign the passed GPU device to this instance
        this.reset();  // Reset the builder state
    }

    // Resets the builder's state: clears the layout entries and resets the binding index
    reset() {
        this.bindGroupLayoutEntries = [];  // Clear any existing layout entries
        this.binding = 0;  // Reset the binding counter
    }

    // Adds a buffer entry to the bind group layout
    addBuffer(visibility: number, type: GPUBufferBindingType) {
        // Push a new bind group layout entry for a buffer
        this.bindGroupLayoutEntries.push({
            binding: this.binding,  // Current binding index
            visibility: visibility,  // Visibility flag (e.g., fragment, compute)
            buffer: {
                type: type,  // Buffer type (e.g., uniform, storage)
                hasDynamicOffset: false  // Whether the buffer has a dynamic offset (not used in this case)
            }
        });
        this.binding += 1;  // Increment binding index for next entry
    }

    // Adds a material entry to the bind group layout, including both a texture and a sampler
    addMaterial(visibility: number, type: GPUTextureViewDimension) {
        // Push a new bind group layout entry for a texture
        this.bindGroupLayoutEntries.push({
            binding: this.binding,  // Current binding index
            visibility: visibility,  // Visibility flag (e.g., fragment, compute)
            texture: {
                viewDimension: type,  // Texture view dimension (e.g., 2D, cube)
            }
        });
        this.binding += 1;  // Increment binding index for next entry

        // Push another entry for a sampler
        this.bindGroupLayoutEntries.push({
            binding: this.binding,  // Current binding index for sampler
            visibility: visibility,  // Visibility flag (e.g., fragment, compute)
            sampler: {}  // Empty sampler object (default settings)
        });
        this.binding += 1;  // Increment binding index for next entry
    }

    // Builds the bind group layout and returns a promise for the created layout
    async build(): Promise<GPUBindGroupLayout> {
        // Create the bind group layout with the specified entries
        const layout: GPUBindGroupLayout = await this.device.createBindGroupLayout({entries: this.bindGroupLayoutEntries});
        
        // Reset the builder state after layout is created
        this.reset();

        // Return the created bind group layout
        return layout;
    }
}