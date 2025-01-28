import { vec3, mat4 } from "gl-matrix";  // Import necessary classes for vector and matrix operations
import { Deg2Rad } from "./math_stuff";  // Import the Deg2Rad function to convert degrees to radians

// The Triangle class represents a 2D triangle object that can rotate in 3D space
export class Triangle {
    position: vec3;  // The position of the triangle in 3D space
    eulers: vec3;    // The Euler angles (rotation in degrees) for rotating the triangle around its axes
    model!: mat4;    // The transformation matrix of the triangle, which includes position and rotation

    // Constructor initializes the triangle's position and the initial rotation angle around the Z-axis (theta)
    constructor(position: vec3, theta: number) {
        this.position = position;  // Set the position of the triangle
        this.eulers = vec3.create();  // Create a new 3D vector to store Euler angles
        this.eulers[2] = theta;  // Set the initial rotation angle (around the Z-axis)
    }

    // The update function updates the triangle's transformation matrix based on its position and rotation
    update() {
        // Increment the rotation angle around the Z-axis (simulate rotation over time)
        this.eulers[2] += 1;  // Increase the Z-axis rotation by 1 degree
        this.eulers[2] %= 360;  // Ensure the angle stays within 0 to 360 degrees by using modulus

        // Create an identity matrix for the triangle's current transformation
        this.model = mat4.create();

        // Apply translation (move the triangle to its position in space)
        mat4.translate(
            this.model, this.model, this.position  // Apply the translation using the position vector
        );

        // Apply rotation around the Z-axis, using the updated Euler angle
        mat4.rotateZ(
            this.model, this.model, Deg2Rad(this.eulers[2])  // Convert the Euler angle from degrees to radians
        );
    }

    // The get_model function returns the current transformation matrix of the triangle
    get_model(): mat4 {
        return this.model;  // Return the transformation matrix, including position and rotation
    }
}