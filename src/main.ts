// Import the App class from the control/app module
import { App } from "./control/app";

// Get the HTML canvas element with the ID "gfx-main" and cast it to HTMLCanvasElement
const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");

// Create a new instance of the App class, passing the canvas element to its constructor
const app = new App(canvas);

// Initialize the renderer by calling the InitializeRenderer method on the App instance
app.InitializeRenderer();

// Start the animation loop by requesting the next frame
// Pass the `run` method of the app as the callback to `requestAnimationFrame`
requestAnimationFrame(app.run);