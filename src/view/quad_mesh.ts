export class QuadMesh {

    // The GPU buffer that stores the vertex data
    buffer: GPUBuffer;

    // The layout of the vertex buffer (how the data is structured in memory)
    bufferLayout: GPUVertexBufferLayout;

    constructor(device: GPUDevice) {

        // Define the vertices for a quad. The format is x, y, z, u, v.
        // (x, y, z) are the coordinates of the vertex, and (u, v) are texture coordinates.
        const vertices: Float32Array = new Float32Array(
            [
                -0.5, -0.5,  0.0, 0.0, 0.0,  // Bottom-left
                 0.5, -0.5,  0.0, 1.0, 0.0,  // Bottom-right
                 0.5,  0.5,  0.0, 1.0, 1.0,  // Top-right

                 0.5,  0.5,  0.0, 1.0, 1.0,  // Top-right
                -0.5,  0.5,  0.0, 0.0, 1.0,  // Top-left
                -0.5, -0.5,  0.0, 0.0, 0.0,  // Bottom-left
            ]
        );

        // Define the buffer usage flags:
        // VERTEX: Indicates the buffer will be used as a vertex buffer
        // COPY_DST: Allows data to be copied to the buffer
        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        // Define the buffer descriptor, including its size and usage
        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,  // Size of the buffer in bytes (total size of vertices array)
            usage: usage,  // Usage flags that define how the buffer can be used
            mappedAtCreation: true  // Allows the buffer to be written by the CPU immediately after creation
        };

        // Create the GPU buffer with the specified descriptor
        this.buffer = device.createBuffer(descriptor);

        // Copy the vertex data into the mapped range of the buffer
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();  // Unmap the buffer to indicate it's no longer in use by the CPU

        // Define the buffer layout, which describes the structure of the vertex data
        this.bufferLayout = {
            arrayStride: 20,  // The number of bytes between consecutive vertices (5 * 4 bytes per vertex attribute)
            attributes: [
                {
                    shaderLocation: 0,  // Location in the shader where the vertex position is used
                    format: "float32x3",  // The format of the vertex position (3 floats for x, y, z)
                    offset: 0  // The offset of the position data within the vertex (start of the vertex)
                },
                {
                    shaderLocation: 1,  // Location in the shader where the texture coordinates are used
                    format: "float32x2",  // The format of the texture coordinates (2 floats for u, v)
                    offset: 12  // The offset of the texture coordinates within the vertex (12 bytes after the position)
                }
            ]
        };
    }
}
