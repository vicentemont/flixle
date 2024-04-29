import { displayConsoleLogs } from "../views/film-view.js";
import { render } from "./../views/home-view.js";

export function start() {
  if (displayConsoleLogs) {
    console.log('homee-controller start')
  }
  render();
}