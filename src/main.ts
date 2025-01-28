import { App } from "./control/app";

const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gfx-main");

const app = new App(canvas);
app.InitializeRenderer();

// Start the animation loop, passing the timestamp argument to `run`
requestAnimationFrame(app.run);
