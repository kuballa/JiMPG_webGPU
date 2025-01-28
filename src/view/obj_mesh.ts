import { vec3, vec2 } from "gl-matrix";

export class ObjMesh {

    // The vertex buffer that holds the mesh data
    buffer!: GPUBuffer;

    // The layout descriptor for the vertex buffer
    bufferLayout!: GPUVertexBufferLayout;

    // Arrays to store vertex positions (v), texture coordinates (vt), and normals (vn)
    v: vec3[];
    vt: vec2[];
    vn: vec3[];

    // Array to hold the final flattened vertex data (position + texture coordinate)
    vertices!: Float32Array;

    // The total number of vertices
    vertexCount!: number;

    constructor() {
        // Initialize empty arrays for the mesh data
        this.v = [];
        this.vt = [];
        this.vn = [];
    }

    // Initializes the mesh by loading the OBJ file and creating the GPU buffer
    async initialize(device: GPUDevice, url: string) {

        // Read and parse the OBJ file from the given URL
        await this.readFile(url);

        // Calculate the number of vertices by dividing the length of the vertices array by 5
        // (each vertex has 5 components: x, y, z, u, v)
        this.vertexCount = this.vertices.length / 5;

        // Set usage flags for the buffer: it will be used as a vertex buffer and data can be copied to it
        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        // Define the buffer descriptor
        const descriptor: GPUBufferDescriptor = {
            size: this.vertices.byteLength,  // The size of the buffer is based on the vertex data length
            usage: usage,  // Set usage flags
            mappedAtCreation: true  // Allow the CPU to write to the buffer after creation
        };

        // Create the GPU buffer with the defined descriptor
        this.buffer = device.createBuffer(descriptor);

        // Copy the vertices data to the buffer
        new Float32Array(this.buffer.getMappedRange()).set(this.vertices);
        this.buffer.unmap();  // Unmap the buffer to finalize the data transfer

        // Define the buffer layout, specifying the stride and attribute offsets
        this.bufferLayout = {
            arrayStride: 20,  // Each vertex takes up 20 bytes (3 for position, 2 for texture coordinates)
            attributes: [
                {
                    shaderLocation: 0,  // The position attribute in the shader
                    format: "float32x3",  // Position is a 3D vector (x, y, z)
                    offset: 0  // Position starts at the beginning of the vertex
                },
                {
                    shaderLocation: 1,  // The texture coordinate attribute in the shader
                    format: "float32x2",  // Texture coordinate is a 2D vector (u, v)
                    offset: 12  // Texture coordinates start at byte 12 (after position)
                }
            ]
        };
    }

    // Reads the OBJ file and processes its data (vertices, texture coordinates, normals, faces)
    async readFile(url: string) {

        var result: number[] = [];  // Array to hold the final flattened vertex data

        // Fetch and parse the OBJ file
        const response: Response = await fetch(url);
        const blob: Blob = await response.blob();
        const file_contents = (await blob.text());
        const lines = file_contents.split("\n");  // Split the file into lines

        // Process each line of the file
        lines.forEach((line) => {
            // Check if the line starts with "v ", "vt", "vn", or "f" and call the corresponding parser
            if (line[0] == "v" && line[1] == " ") {
                this.read_vertex_data(line);  // Parse vertex position
            }
            else if (line[0] == "v" && line[1] == "t") {
                this.read_texcoord_data(line);  // Parse texture coordinate
            }
            else if (line[0] == "v" && line[1] == "n") {
                this.read_normal_data(line);  // Parse normal
            }
            else if (line[0] == "f") {
                this.read_face_data(line, result);  // Parse face data
            }
        });

        // Convert the array of vertex data into a Float32Array (flattened vertex data)
        this.vertices = new Float32Array(result);
    }

    // Parses a line representing vertex positions (e.g., "v x y z")
    read_vertex_data(line: string) {

        const components = line.split(" ");  // Split the line into components
        const new_vertex: vec3 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf(),
            Number(components[3]).valueOf()
        ];

        // Store the vertex position in the v array
        this.v.push(new_vertex);
    }

    // Parses a line representing texture coordinates (e.g., "vt u v")
    read_texcoord_data(line: string) {

        const components = line.split(" ");
        const new_texcoord: vec2 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf()
        ];

        // Store the texture coordinates in the vt array
        this.vt.push(new_texcoord);
    }

    // Parses a line representing normal vectors (e.g., "vn nx ny nz")
    read_normal_data(line: string) {

        const components = line.split(" ");
        const new_normal: vec3 = [
            Number(components[1]).valueOf(),
            Number(components[2]).valueOf(),
            Number(components[3]).valueOf()
        ];

        // Store the normal vectors in the vn array
        this.vn.push(new_normal);
    }

    // Parses a line representing face data (e.g., "f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3")
    // Faces define which vertices make up the mesh (usually in triangles)
    read_face_data(line: string, result: number[]) {

        line = line.replace("\n", "");  // Remove any newline characters
        const vertex_descriptions = line.split(" ");  // Split the face description into vertex indices
        const triangle_count = vertex_descriptions.length - 3;  // Calculate how many triangles the face has

        // For each triangle in the face, process the vertices
        for (var i = 0; i < triangle_count; i++) {
            this.read_corner(vertex_descriptions[1], result);  // First corner of the triangle
            this.read_corner(vertex_descriptions[2 + i], result);  // Second corner of the triangle
            this.read_corner(vertex_descriptions[3 + i], result);  // Third corner of the triangle
        }
    }

    // Parses a single corner of a face, extracting vertex, texture, and normal data
    read_corner(vertex_description: string, result: number[]) {

        const v_vt_vn = vertex_description.split("/");  // Split the description into vertex, texture, and normal parts
        const v = this.v[Number(v_vt_vn[0]).valueOf() - 1];  // Get the vertex position (subtract 1 to account for 1-based indexing)
        
        // Check if texture coordinates exist, if not, default to (0, 0)
        let vt: vec2 = [0, 0];
        if (v_vt_vn[1]) {
            vt = this.vt[Number(v_vt_vn[1]).valueOf() - 1];  // Get the texture coordinate (subtract 1 for 1-based indexing)
        }

        // Push the vertex position and texture coordinates into the result array
        result.push(v[0]);
        result.push(v[1]);
        result.push(v[2]);
        result.push(vt[0]);
        result.push(vt[1]);
    }
}
