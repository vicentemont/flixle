import { routes } from "./routes.js";
import { displayConsoleLogs } from "./views/film-view.js";

// just a name for a default route, corresponding to one of the routes keys, for when the shit hits the fan
const defaultRoute = "home";

// a listener to listen for hashchange. "hashchange" is a existing window event
window.addEventListener("hashchange", hashchangeHandler, true);

// upon changing hash, find and load the corresponding controller from the given hash
// location.hash is a Window property - in fact, related to the same event as hashchange
function hashchangeHandler() {
  // routeName can be undefined if nothing is found, it will use the defaultRoute name
  const routeName =
    Object.keys(routes).find((name) => location.hash === routes[name].hash) ||
    defaultRoute;

  location.hash = routes[routeName].hash;
  loadController(routes[routeName].controller);
  if (displayConsoleLogs) {
    console.log('hashChanged')

  }
}

async function loadController(controllerName) {
  try {
    // import the controller dinamically and start it
    const controller = await import(`./controllers/${controllerName}.js`);
    if (displayConsoleLogs) {
      console.log('loadedFileJS')
    }
    controller.start();
  } catch (err) {
    if (displayConsoleLogs) {
      console.log("err is:", err);
    }
    location.hash = routes[defaultRoute].hash;
  }
}

// start the router setting and loading the default router.
export function start() {
  location.hash = routes[defaultRoute].hash;
  loadController(routes[defaultRoute].controller);

}
