// This class is responsible for building a GPU BindGroup, which is a collection of resources bound to a pipeline
export class BindGroupBuilder {

    // The GPU device used to create the bind group
    device: GPUDevice;

    // The layout to be used for this bind group
    layout!: GPUBindGroupLayout;

    // A list to store the entries (bindings) for the bind group
    entries!: GPUBindGroupEntry[];

    // The current binding number being assigned to each entry
    binding!: number;

    // Constructor initializes the device and resets the state
    constructor(device: GPUDevice) {
        this.device = device;  // Assign the passed GPU device to this instance
        this.reset();  // Reset the builder state
    }

    // Resets the builder state: clears the entries and resets the binding index
    reset() {
        this.entries = [];  // Clear any existing entries
        this.binding = 0;  // Reset the binding counter
    }

    // Sets the layout for the bind group. This layout defines how resources are bound.
    setLayout(layout: GPUBindGroupLayout) {
        this.layout = layout;  // Assign the passed layout to this instance
    }

    // Adds a buffer entry to the bind group
    addBuffer(buffer: GPUBuffer) {
        // Push a new entry for the buffer
        this.entries.push({
            binding: this.binding,  // Current binding index
            resource: {
                buffer: buffer  // The GPUBuffer being added
            }
        });
        this.binding += 1;  // Increment binding index for the next resource
    }

    // Adds a material entry consisting of a texture view and a sampler to the bind group
    addMaterial(view: GPUTextureView, sampler: GPUSampler) {
        // Push a new entry for the texture view
        this.entries.push({
            binding: this.binding,  // Current binding index for texture view
            resource: view  // The GPUTextureView being added
        });
        this.binding += 1;  // Increment binding index for the next resource

        // Push another entry for the sampler
        this.entries.push({
            binding: this.binding,  // Current binding index for sampler
            resource: sampler  // The GPUSampler being added
        });
        this.binding += 1;  // Increment binding index for the next resource
    }

    // Builds the bind group asynchronously and returns a Promise for the created bind group
    async build(): Promise<GPUBindGroup> {
        // Create the bind group with the specified layout and entries
        const bindGroup = await this.device.createBindGroup({
            layout: this.layout,  // The bind group's layout
            entries: this.entries  // The list of resource entries
        });

        // Reset the builder state after the bind group is created
        this.reset();

        // Return the created bind group
        return bindGroup;
    }
}