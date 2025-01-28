// Import mat4 from gl-matrix for matrix operations (mainly for transformations)
import { mat4 } from "gl-matrix";

// Enum representing different types of objects that can be rendered
export enum object_types {
    TRIANGLE,   // Represents a triangle object
    QUAD,       // Represents a quad object
    TREE        // Represents a tree object (likely in a 3D environment)
}

// Enum representing different types of rendering pipelines
export enum pipeline_types {
    SKY,        // Pipeline for rendering the sky (perhaps for background)
    STANDARD,   // Standard pipeline for general rendering of objects
    POST,       // Post-processing pipeline (effects applied after initial rendering)
    HUD         // Heads-Up Display pipeline (for rendering UI elements like health, score, etc.)
}

// Interface for rendering data that will be passed to the renderer
export interface RenderData {
    view_transform: mat4;       // The view transformation matrix, which represents the camera's view
    model_transforms: Float32Array;  // The transformation matrices for each object in the scene
    object_counts: {[obj in object_types]: number}  // Count of different object types to render
}