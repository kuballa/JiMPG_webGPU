export class TriangleMesh {

    buffer: GPUBuffer       // Buffer to store vertex data on the GPU
    bufferLayout: GPUVertexBufferLayout  // Layout of the vertex data for the GPU shader

    constructor(device: GPUDevice) {

        // Define the vertex data: [x, y, u, v]
        const vertices: Float32Array = new Float32Array(
            [
                0.0,  0.0,  0.5, 0.5, 0.0,  // Vertex 1: position (x, y) and texture coordinates (u, v)
                0.0, -0.5, -0.5, 0.0, 1.0,  // Vertex 2: position (x, y) and texture coordinates (u, v)
                0.0,  0.5, -0.5, 1.0, 1.0,  // Vertex 3: position (x, y) and texture coordinates (u, v)
            ]
        )

        // Set the usage flags for the buffer: VERTEX data and the ability to copy to the buffer
        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        // Descriptor for creating the GPU buffer, specifying size and usage
        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,  // The size of the buffer is the byte length of the vertices array
            usage: usage,               // Usage flags
            mappedAtCreation: true      // Map the buffer at creation for immediate access
        };
        
        // Create the buffer on the GPU with the provided descriptor
        this.buffer = device.createBuffer(descriptor);

        // Set the vertex data to the buffer by mapping the buffer's memory range and copying the vertices
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        
        // Unmap the buffer after the data has been copied
        this.buffer.unmap();

        // Define the layout of the vertex buffer: how data is structured in the buffer
        this.bufferLayout = {
            arrayStride: 20,  // Total stride (in bytes) for one vertex (5 floats * 4 bytes per float)
            attributes: [
                {
                    shaderLocation: 0,           // The location in the shader for the position attribute
                    format: "float32x3",         // The data format for the position: 3 floats (x, y, z)
                    offset: 0                   // The offset in bytes where the position data starts
                },
                {
                    shaderLocation: 1,           // The location in the shader for the texture coordinates
                    format: "float32x2",         // The data format for the texture coordinates: 2 floats (u, v)
                    offset: 12                  // The offset in bytes where the texture coordinate data starts
                }
            ]
        }
    }

}
