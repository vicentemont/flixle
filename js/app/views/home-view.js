import { getNewCorrectAnswer } from "./film-view.js";
const elements = {};
const handlers = {};

function createStartButton(buttonText) {
    return `<button id="startButton">${buttonText}</button>`
}

function createHomeMenu() {
    return `<div id="homeMenu" style="color: white;">
   
    <div id="buttonsSection">
    </div>
    </div>`
}

function createLogo() {
    return `<div id="homeMenu" style="color: white;"> <h1>Flixle</h1>`
}

function createInstructions() {
    return `<img src="Instructions.png" style="width:700px" alt="">
    `
}

function renderLogo(eventName) {
    if (elements[eventName]) {
        return;
    }

    elements[eventName] = $(createLogo(eventName));
    elements.app.find('#homeMenu').prepend(elements[eventName])
}

function renderStartButton(eventName) {
    if (elements[eventName]) {
        return;
    }
    elements[eventName] = $(createStartButton(eventName));

    elements[eventName].on('click', () => {
        getNewCorrectAnswer();
        elements.app.find('#buttonsSection').empty();
        elements['Instructions'].remove();

        window.location.hash = "game";
    })

    elements.app.find('#buttonsSection').append(elements[eventName])
}

function renderInstructions(eventName) {
    elements[eventName] = $(createInstructions());
    elements.app.find('#homeMenu').append(elements[eventName])
}

function renderHomeMenu() {
    //
    const menu = createHomeMenu();
    elements.menu = $(menu);
    elements.app.append(menu);

}


export function render() {
    elements.app = $("#app");
    //elements.app.empty();
    renderHomeMenu();
    renderLogo();
    renderStartButton("Start Game");
    renderInstructions("Instructions");

};