// Import necessary functions from gl-matrix (for vector and matrix math) and Deg2Rad from math_stuff
import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math_stuff";

export class Camera {

    position: vec3;      // Camera's position in 3D space
    eulers: vec3;        // Euler angles (pitch, yaw, roll) in radians
    view!: mat4;         // View matrix, representing the camera's view transformation
    forwards: vec3;      // The direction the camera is facing
    right: vec3;         // The direction to the right of the camera (used for strafe movement)
    up: vec3;            // The up direction for the camera (usually [0, 1, 0] in world space)

    // Camera constructor: initializes position, Euler angles (theta, phi), and direction vectors
    constructor(position: vec3, theta: number, phi: number) {
        this.position = position;       // Set camera's position
        this.eulers = [0, phi, theta];  // Set initial Euler angles (pitch = 0, yaw = phi, roll = theta)
        this.forwards = vec3.create();  // Initialize forwards vector
        this.right = vec3.create();     // Initialize right vector
        this.up = vec3.create();        // Initialize up vector
    }

    // Update method: calculates the camera's orientation and view matrix based on Euler angles
    update() {

        // Calculate the forwards direction based on the camera's Euler angles (theta, phi)
        // Using spherical coordinates to calculate the camera's direction
        this.forwards = [
            Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),  // x direction
            Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),  // y direction
            Math.sin(Deg2Rad(this.eulers[1]))                                      // z direction (vertical)
        ];

        // Calculate the right direction by taking the cross product of forwards and world up vector [0, 0, 1]
        vec3.cross(this.right, this.forwards, [0, 0, 1]);

        // Recalculate the up direction as the cross product of right and forwards to ensure it's orthogonal
        vec3.cross(this.up, this.right, this.forwards);

        // Create a target position for the camera to look at, which is the position + forwards vector
        var target: vec3 = vec3.create();
        vec3.add(target, this.position, this.forwards);

        // Initialize the view matrix and compute it using the lookAt function from gl-matrix
        this.view = mat4.create();
        mat4.lookAt(this.view, this.position, target, this.up);  // Set the view matrix based on position, target, and up vector
    }

    // Method to get the camera's current view matrix
    get_view(): mat4 {
        return this.view;
    }
}