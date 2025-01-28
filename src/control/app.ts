// Import necessary modules: Renderer (view), Scene (model), and jQuery for event handling
import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import $ from "jquery";

export class App {
    canvas: HTMLCanvasElement;        // Canvas element to render on
    renderer: Renderer;               // Renderer to handle rendering
    scene: Scene;                     // Scene for handling 3D objects and player movements

    // UI elements for displaying states
    keyLabel: HTMLElement;            // Label to show the last pressed key
    mouseXLabel: HTMLElement;         // Label to show mouse X position
    mouseYLabel: HTMLElement;         // Label to show mouse Y position
    fpsLabel: HTMLElement;            // Label to show frames per second (FPS)
    fpsHistoryLabel: HTMLElement;     // Label to show FPS ranking history

    // Movement controls
    forwards_amount: number;         // Amount to move forward or backward
    right_amount: number;            // Amount to move right or left

    // Variables to track frame timing and FPS calculation
    frameCount: number;              // Count the number of frames
    lastTime: number;                // Time of the last frame
    deltaTime: number;               // Time difference between frames
    fps: number;                     // Frames per second (FPS)

    // History of FPS for ranking
    fpsHistory: number[];            // Array to store FPS history
    fpsSums: number[];

    // Camera movement tracking
    isMovingCamera: boolean;         // Whether the camera is currently moving
    startMoveTime: number;           // Time when the camera started moving

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // Initialize renderer and scene
        this.renderer = new Renderer(canvas);
        this.scene = new Scene();

        // Initialize UI elements
        this.keyLabel = <HTMLElement>document.getElementById("key-label");
        this.mouseXLabel = <HTMLElement>document.getElementById("mouse-x-label");
        this.mouseYLabel = <HTMLElement>document.getElementById("mouse-y-label");
        this.fpsLabel = <HTMLElement>document.getElementById("frame-counter-label"); // FPS label
        this.fpsHistoryLabel = <HTMLElement>document.getElementById("fps-history-label"); // FPS ranking label

        // Initialize movement amounts and frame tracking variables
        this.forwards_amount = 0;
        this.right_amount = 0;
        this.frameCount = 0;  // Initialize frame count
        this.lastTime = 0;    // Initialize the time tracker
        this.deltaTime = 0;   // Time difference for FPS calculation
        this.fps = 0;         // Initialize FPS

        // Initialize FPS history array
        this.fpsHistory = [];
        this.fpsSums = [];
        this.isMovingCamera = false;   // Initially, camera is not moving
        this.startMoveTime = 0;        // No start time initially

        // Set up event listeners for keyboard input (keydown/keyup)
        $(document).on(
            "keydown",
            (event) => {
                this.handle_keypress(event);  // Handle key press events
            }
        );
        $(document).on(
            "keyup",
            (event) => {
                this.handle_keyrelease(event);  // Handle key release events
            }
        );

        // Mouse click to request pointer lock for mouse movement capture
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }

        // Listen for mouse movement and handle accordingly
        this.canvas.addEventListener(
            "mousemove",
            (event: MouseEvent) => {this.handle_mouse_move(event);}  // Mouse move handling
        );

        // Set up the button to trigger camera movement
        $("#move-camera-button").on("click", () => {
            this.move_camera_route(); // Call the function when the button is clicked
        });
    }

    // Initialize the renderer asynchronously (e.g., setting up WebGL/WebGPU)
    async InitializeRenderer() {
        await this.renderer.Initialize();
    }

    // Animation loop for rendering and game logic
    run = (timestamp: number) => {
        var running: boolean = true;

        // Calculate deltaTime: the time difference between the current frame and the last frame
        if (this.lastTime) {
            this.deltaTime = (timestamp - this.lastTime) / 1000;  // Convert milliseconds to seconds
        }
        this.lastTime = timestamp;

        // Calculate FPS: FPS = 1 / deltaTime (time per frame)
        if (this.deltaTime > 0) {
            this.fps = Math.round(1 / this.deltaTime);  // Round to get FPS as an integer
        }

        // Update the FPS display label
        this.fpsLabel.innerText = `FPS: ${this.fps}`;

        // Update the scene (e.g., update objects, camera)
        this.scene.update();

        // Move the player based on keyboard input
        this.scene.move_player(this.forwards_amount, this.right_amount);

        // Render the scene (pass in the objects to render and the player's position)
        this.renderer.render(
            this.scene.get_renderables(),
            this.scene.player
        );

        // Continue the animation loop if running is true
        if (running) {
            requestAnimationFrame(this.run);
        }
    }

    // Handle key press events (update movement controls)
    handle_keypress(event: JQuery.KeyDownEvent) {
        // Update the key label with the pressed key's code
        this.keyLabel.innerText = event.code;

        // Update movement directions based on the pressed key
        if (event.code == "KeyW") {
            this.forwards_amount = 0.02;  // Move forward
        }
        if (event.code == "KeyS") {
            this.forwards_amount = -0.02;  // Move backward
        }
        if (event.code == "KeyA") {
            this.right_amount = -0.02;  // Move left
        }
        if (event.code == "KeyD") {
            this.right_amount = 0.02;  // Move right
        }
    }

    // Handle key release events (stop movement when key is released)
    handle_keyrelease(event: JQuery.KeyUpEvent) {
        // Update the key label with the released key's code
        this.keyLabel.innerText = event.code;

        // Stop movement when the key is released
        if (event.code == "KeyW" || event.code == "KeyS") {
            this.forwards_amount = 0;  // Stop moving forward/backward
        }
        if (event.code == "KeyA" || event.code == "KeyD") {
            this.right_amount = 0;  // Stop moving left/right
        }
    }

    // Handle mouse movement (update mouse position labels and rotate player)
    handle_mouse_move(event: MouseEvent) {
        // Update the mouse position labels with current mouse coordinates
        this.mouseXLabel.innerText = event.clientX.toString();
        this.mouseYLabel.innerText = event.clientY.toString();

        // Rotate the player based on mouse movement
        this.scene.spin_player(
            event.movementX / 5, event.movementY / 5  // Adjust sensitivity by dividing by 5
        );
    }

    // Start camera movement along a route when the button is clicked
    move_camera_route() {
        console.log("Starting the camera movement along a preset route.");

        // Set camera moving state to true
        this.isMovingCamera = true;
        this.startMoveTime = Date.now();  // Record start time
        
        // Time tracking variables
        const duration = 10;  // Duration in seconds
        const startTime = Date.now();  // Start time

        // Start FPS tracking
        let lastTime = startTime;
        let fps: number = 0;
        let fpsSum: number = 0;  // Variable to accumulate FPS values

        // Initialize the list to store FPS sums
        if (!this.fpsSums) {
            this.fpsSums = []; // Initialize if it doesn't exist
        }

        // Function to calculate FPS
        const calculateFPS = (timestamp: number) => {
            let deltaTime = (timestamp - lastTime) / 1000;  // Convert to seconds
            if (deltaTime > 0) {
                fps = Math.round(1 / deltaTime);  // Calculate FPS
            }
            lastTime = timestamp;
            
            // Record FPS in history while camera is moving
            this.fpsHistory.push(fps);

            // Accumulate the FPS value for summing
            fpsSum += fps;

            // Limit FPS history length to avoid excessive memory usage
            if (this.fpsHistory.length > 100) {
                this.fpsHistory.shift();  // Remove oldest entry if history exceeds 100 frames
            }
        };

        // Create a function to update the camera movement over time
        const moveRoute = () => {
            // Calculate the time elapsed
            const elapsedTime = (Date.now() - startTime) / 1000;  // in seconds

            // Check if the 10 seconds have passed
            if (elapsedTime >= duration) {
                console.log("Route completed.");
                // Stop recording FPS after the movement is complete
                this.isMovingCamera = false;

                // Store the sum of FPS in the fpsSums list
                this.fpsSums.push(fpsSum);

                // Sort the list in descending order for rankings
                this.fpsSums.sort((a, b) => b - a);

                // Display the rankings in the fpsHistoryLabel
                let rankingDisplay = "Top FPS Rankings:\n";
                for (let i = 0; i < Math.min(this.fpsSums.length, 5); i++) {
                    rankingDisplay += `#${i + 1}: ${this.fpsSums[i]} FPS\n`;
                }
                console.log(rankingDisplay);  // Print the ranking to the console
                this.fpsHistoryLabel.innerText = rankingDisplay;  // Display the ranking on the page

                return;  // Stop the route once the 10 seconds are over
            }

            // Smoothly move the camera forward by a factor proportional to the elapsed time
            const progress = elapsedTime / duration;  // Progress as a percentage (0 to 1)

            // Move player forward
            this.scene.move_player(0, progress * 0.1);  // Scale the movement by progress
            // Rotate the player as part of the movement
            this.scene.spin_player(-progress, 0);  // Rotation increases over time

            // Continue updating the route until 10 seconds are up
            requestAnimationFrame(moveRoute);

            // Measure FPS during the movement
            requestAnimationFrame(calculateFPS);
        };

        // Start the camera movement and FPS tracking
        moveRoute();
    }
}