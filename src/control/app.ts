import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import $ from "jquery";

export class App {

    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;

    // Labels for displaying state
    keyLabel: HTMLElement;
    mouseXLabel: HTMLElement;
    mouseYLabel: HTMLElement;
    fpsLabel: HTMLElement;  // Added label for FPS

    forwards_amount: number;
    right_amount: number;

    frameCount: number;  // Variable to track frames
    lastTime: number;  // Time of the last frame
    deltaTime: number;  // Time difference between frames
    fps: number;  // Frames per second

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.renderer = new Renderer(canvas);
        this.scene = new Scene();

        // Initialize labels
        this.keyLabel = <HTMLElement>document.getElementById("key-label");
        this.mouseXLabel = <HTMLElement>document.getElementById("mouse-x-label");
        this.mouseYLabel = <HTMLElement>document.getElementById("mouse-y-label");
        this.fpsLabel = <HTMLElement>document.getElementById("frame-counter-label"); // FPS label

        this.forwards_amount = 0;
        this.right_amount = 0;
        this.frameCount = 0;  // Initialize frame count
        this.lastTime = 0;    // Initialize the time tracker
        this.deltaTime = 0;   // Time difference for FPS calculation
        this.fps = 0;         // Initialize FPS

        $(document).on(
            "keydown",
            (event) => {
                this.handle_keypress(event);
            }
        );
        $(document).on(
            "keyup",
            (event) => {
                this.handle_keyrelease(event);
            }
        );
        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }
        this.canvas.addEventListener(
            "mousemove",
            (event: MouseEvent) => {this.handle_mouse_move(event);}
        );
    }

    async InitializeRenderer() {
        await this.renderer.Initialize();
    }

    run = (timestamp: number) => {
        var running: boolean = true;

        // Calculate deltaTime (time difference between frames)
        if (this.lastTime) {
            this.deltaTime = (timestamp - this.lastTime) / 1000;  // Convert from ms to seconds
        }
        this.lastTime = timestamp;

        // Calculate FPS: FPS = 1 / deltaTime (time per frame)
        if (this.deltaTime > 0) {
            this.fps = Math.round(1 / this.deltaTime);
        }

        // Update FPS label
        this.fpsLabel.innerText = `FPS: ${this.fps}`;

        this.scene.update();
        this.scene.move_player(this.forwards_amount, this.right_amount);

        this.renderer.render(
            this.scene.get_renderables(),
            this.scene.player
        );

        if (running) {
            requestAnimationFrame(this.run);
        }
    }

    handle_keypress(event: JQuery.KeyDownEvent) {
        this.keyLabel.innerText = event.code;

        if (event.code == "KeyW") {
            this.forwards_amount = 0.02;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = -0.02;
        }
        if (event.code == "KeyA") {
            this.right_amount = -0.02;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0.02;
        }
    }

    handle_keyrelease(event: JQuery.KeyUpEvent) {
        this.keyLabel.innerText = event.code;

        if (event.code == "KeyW") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyS") {
            this.forwards_amount = 0;
        }
        if (event.code == "KeyA") {
            this.right_amount = 0;
        }
        if (event.code == "KeyD") {
            this.right_amount = 0;
        }
    }

    handle_mouse_move(event: MouseEvent) {
        this.mouseXLabel.innerText = event.clientX.toString();
        this.mouseYLabel.innerText = event.clientY.toString();

        this.scene.spin_player(
            event.movementX / 5, event.movementY / 5
        );
    }
}
