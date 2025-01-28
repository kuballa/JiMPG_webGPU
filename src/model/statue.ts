import { vec3, mat4 } from "gl-matrix";  // Import necessary classes for vector and matrix operations
import { Deg2Rad } from "./math_stuff";  // Import the Deg2Rad function to convert degrees to radians

// The Statue class represents a static object in the scene, such as a tree or other decorative object
export class Statue {
    position: vec3;  // The position of the statue in 3D space
    eulers: vec3;    // The Euler angles (rotation in degrees) for rotating the statue around its axes
    model!: mat4;    // The transformation matrix of the statue, which includes position and rotation

    // Constructor initializes the statue's position and rotation angles (Euler angles)
    constructor(position: vec3, eulers: vec3) {
        this.position = position;
        this.eulers = eulers;
    }

    // The update function updates the statue's transformation matrix based on its position and rotation
    update() {
        // Create an identity matrix to represent the statue's current transformation
        this.model = mat4.create();

        // Apply translation (move the statue to its position)
        mat4.translate(
            this.model, this.model, this.position  // Apply the translation using the position vector
        );

        // Apply a rotation around the Y-axis (vertical axis), using the second Euler angle (eulers[1])
        mat4.rotateY(
            this.model, this.model, Deg2Rad(this.eulers[1])  // Convert the Euler angle from degrees to radians
        );

        // Apply a rotation around the Z-axis (axis perpendicular to the screen), using the third Euler angle (eulers[2])
        mat4.rotateZ(
            this.model, this.model, Deg2Rad(this.eulers[2])  // Convert the Euler angle from degrees to radians
        );
    }

    // The get_model function returns the current transformation matrix of the statue
    get_model(): mat4 {
        return this.model;  // Return the transformation matrix, including position and rotation
    }
}
