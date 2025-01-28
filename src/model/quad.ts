// Import necessary functions from gl-matrix for 3D math (vectors and matrices)
import { vec3, mat4 } from "gl-matrix";

// Quad class to represent a 2D object (a quad) in 3D space
export class Quad {
    position: vec3;     // The position of the quad in 3D space
    model!: mat4;       // The model transformation matrix that applies position and other transformations

    // Constructor to initialize the quad's position in space
    constructor(position: vec3) {
        this.position = position;  // Set the position when the quad is created
    }

    // Method to update the model matrix, applying transformations like translation
    update() {
        // Create a new identity matrix (no transformations)
        this.model = mat4.create();

        // Apply translation to the model matrix based on the quad's position
        mat4.translate(
            this.model,  // The result matrix (updated model matrix)
            this.model,  // The original matrix (identity, initially)
            this.position // The position to translate the quad to
        );
    }

    // Method to get the model matrix, which represents the position and transformations of the quad
    get_model(): mat4 {
        return this.model;  // Return the model matrix for rendering or further transformations
    }
}
