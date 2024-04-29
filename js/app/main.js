import { start } from "./router.js";
import { displayConsoleLogs } from "./views/film-view.js";

if(displayConsoleLogs){
    console.log("DOM is mounted and ready");
}
start();
