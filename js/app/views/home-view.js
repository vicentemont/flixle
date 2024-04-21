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

function renderLogo(eventName) {
    if (elements[eventName]) {
        return;
    }

    elements[eventName] = $(createLogo(eventName));

    elements[eventName].on('click', () => {

        elements.app.find('#buttonsSection').empty();
        window.location.hash = "home";
    
    })
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
        window.location.hash = "game";
    })

    elements.app.find('#buttonsSection').append(elements[eventName])
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
    console.log('asdfasdf')
    renderHomeMenu();
    renderLogo();
    renderStartButton("Start Game");
    
};