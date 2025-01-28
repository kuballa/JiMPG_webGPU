// Import necessary classes and functions for vector and matrix operations
import { Triangle } from "./triangle";  // Import Triangle class
import { Quad } from "./quad";  // Import Quad class
import { Camera } from "./camera";  // Import Camera class (player)
import { vec3, mat4 } from "gl-matrix";  // Import vector and matrix classes from gl-matrix
import { object_types, RenderData } from "./definitions";  // Import enum and interface for object types and render data
import { Statue } from "./statue";  // Import Statue class for static objects like trees and statues

// The Scene class manages the game world, including all objects and the player's camera
export class Scene {

    // Arrays to hold objects in the scene (triangles, quads, trees)
    triangles: Triangle[];  // List of triangle objects
    quads: Quad[];          // List of quad objects
    trees: Statue[];        // List of tree objects (represented by Statue)
    statue: Statue;         // A specific statue in the scene
    beachSand: Statue;      // A specific beach sand statue in the scene
    player: Camera;         // The player object (camera)
    object_data: Float32Array; // Array to store transformation matrices for all objects
    triangle_count: number;  // Counter to track number of triangle objects
    quad_count: number;      // Counter to track number of quad objects
    tree_count: number;      // Counter to track number of tree objects

    constructor() {
        // Initialize the arrays for storing objects and transformation matrices
        this.triangles = [];
        this.quads = [];
        this.trees = [];
        this.object_data = new Float32Array(16 * 1024);  // Preallocate space for transformation matrices (16 elements per matrix)
        this.triangle_count = 0;
        this.quad_count = 0;
        this.tree_count = 0;

        // Call functions to populate the scene with objects
        this.make_triangles();  // Create triangles and add them to the scene
        this.make_quads();      // Create quads and add them to the scene
        this.make_trees();      // Create trees and add them to the scene
        
        // Create specific statue and beach sand objects at fixed positions
        this.statue = new Statue([0, 0, 0.05], [0, 0, 0]);
        this.beachSand = new Statue([0, 0, 0.085], [0, 0, 0]);

        // Create the player (camera) at a fixed starting position and initial rotation
        this.player = new Camera([-2, 0, 5], 0.5, 0.5);
    }

    // Function to create trees at predefined positions and add them to the scene
    make_trees() {
        var i: number = 0;
        let treePositions = [
            [-6, -3, 0], [-5.5, 3, 0], [-3, 2, 0],
            [0, -1, 0], [2, -4, 0], [-2, 4, 0],
            [2.5, 1.8, 0], [-1.5, 2.1, 0], [-4.5, -2.7, 0]
        ];

        // Loop through predefined tree positions and create tree objects
        for (var position in treePositions) {
            this.trees.push(
                new Statue(
                    [treePositions[position][0], treePositions[position][1], treePositions[position][2]],  // Position of the tree
                    [0, 0, 0]  // Rotation (identity, no rotation)
                )
            );

            // Initialize a blank transformation matrix (identity matrix)
            var blank_matrix = mat4.create();
            // Store the blank matrix for the current tree in the object data array
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>blank_matrix.at(j);
            }
            i++;
            this.tree_count++;  // Increment tree count
        }
    }

    // Function to create triangles at different y-positions and add them to the scene
    make_triangles() {
        var i: number = 0;
        // Loop through y-values to create triangles at different y-positions along the x-axis
        for (var y: number = -5; y <= 5; y++) {
            this.triangles.push(
                new Triangle([2, y, 0], 0)  // Create triangle object at a fixed x position and y position
            );

            // Initialize a blank transformation matrix (identity matrix)
            var blank_matrix = mat4.create();
            // Store the blank matrix for the current triangle in the object data array
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>blank_matrix.at(j);
            }
            i++;
            this.triangle_count++;  // Increment triangle count
        }
    }

    // Function to create quads across a grid of x and y values and add them to the scene
    make_quads() {
        var i: number = this.triangle_count;  // Start from the current index after triangles
        // Loop through x and y values to create a grid of quads
        for (var x: number = -10; x <= 10; x++) {
            for (var y: number = -10; y <= 10; y++) {
                this.quads.push(
                    new Quad([x, y, 0])  // Create quad object at the given x, y position
                );

                // Initialize a blank transformation matrix (identity matrix)
                var blank_matrix = mat4.create();
                // Store the blank matrix for the current quad in the object data array
                for (var j: number = 0; j < 16; j++) {
                    this.object_data[16 * i + j] = <number>blank_matrix.at(j);
                }
                i++;
                this.quad_count++;  // Increment quad count
            }
        }
    }

    // Update function to apply transformations to all objects in the scene
    update() {

        var i: number = 0;

        // Update each triangle and store its transformation matrix
        this.triangles.forEach((triangle) => {
            triangle.update();  // Update the triangle (apply any transformations)
            var model = triangle.get_model();  // Get the transformation matrix
            // Store the model matrix in the object data array
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>model.at(j);
            }
            i++;
        });

        // Update each quad and store its transformation matrix
        this.quads.forEach((quad) => {
            quad.update();  // Update the quad (apply any transformations)
            var model = quad.get_model();  // Get the transformation matrix
            // Store the model matrix in the object data array
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>model.at(j);
            }
            i++;
        });

        // Update each tree and store its transformation matrix
        this.trees.forEach((tree) => {
            tree.update();  // Update the tree (apply any transformations)
            var model = tree.get_model();  // Get the transformation matrix
            // Store the model matrix in the object data array
            for (var j: number = 0; j < 16; j++) {
                this.object_data[16 * i + j] = <number>model.at(j);
            }
            i++;
        });

        // Update the statue object and store its transformation matrix
        this.statue.update();
        var model = this.statue.get_model();
        for (var j: number = 0; j < 16; j++) {
            this.object_data[16 * i + j] = <number>model.at(j);
        }
        i++;

        // Update the beach sand statue and store its transformation matrix
        this.beachSand.update();
        var model = this.beachSand.get_model();
        for (var j: number = 0; j < 16; j++) {
            this.object_data[16 * i + j] = <number>model.at(j);
        }
        i++;

        // Update the player's camera state (apply movement/rotation)
        this.player.update();
    }

    // Function to return the player (camera) object
    get_player(): Camera {
        return this.player;
    }

    // Function to get the data required for rendering (view transform, model transforms, object counts)
    get_renderables(): RenderData {
        return {
            view_transform: this.player.get_view(),  // Get the player's view transformation matrix
            model_transforms: this.object_data,      // Get all the model transformation matrices
            object_counts: {  // Count of each object type in the scene
                [object_types.TRIANGLE]: this.triangle_count,
                [object_types.QUAD]: this.quad_count,
                [object_types.TREE]: this.tree_count,
            }
        }
    }

    // Function to adjust the player's camera rotation based on mouse movement
    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX;  // Adjust yaw (left-right rotation)
        this.player.eulers[2] %= 360;  // Keep yaw within 0-360 degrees

        // Adjust pitch (up-down rotation), clamp between -89 and 89 degrees
        this.player.eulers[1] = Math.min(89, Math.max(-89, this.player.eulers[1] - dY));
    }

    // Function to move the player based on forward/backward and left/right movement
    move_player(forwards_amount: number, right_amount: number) {
        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.forwards, forwards_amount  // Move forward/backward
        );

        vec3.scaleAndAdd(
            this.player.position, this.player.position, 
            this.player.right, right_amount  // Move left/right
        );
    }
}