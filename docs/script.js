"use strict";

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const turtle = {
    x: 0,
    y: 0,
    angle: 0,
    isPenDown : true,
    color:"#000000",

    forward: function(distance) {
        let radians = (Math.PI / 180) * this.angle;

        let deltaX = Math.cos(radians) * distance;
        let deltaY = Math.sin(- radians) * distance;

        let newX = this.x + deltaX;
        let newY = this.y + deltaY;

        if (this.isPenDown) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(newX, newY);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        this.x = newX;
        this.y = newY;
    },

    turn: function (a){
        this.angle += a;
        if (this.angle >= 360) {
            this.angle -= 360;
        }
    },

    penUp: function (){
        this.isPenDown = false;
    },

    penDown: function (){
        this.isPenDown = true;
    },

    changeColor: function (color){
        this.color = color;
    },

    setX: function (x){
        this.x = x;
    },

    setY: function (y){
        this.y = y;
    },
};

function s(i) {
    if (i === 0) {
        return 0;
    } 

    if (i % 2 === 0) {
        return s(i / 2);
    } else {
        return 1 - s(Math.floor(i / 2));
    }
}

function draw(i){
    let lunghezzaSequenza = Math.pow(2, i);

    for (let y = 0; y < lunghezzaSequenza; y++) {

        let valore = s(y);

        if (valore === 0) {
            turtle.forward(4);
        } else {
            turtle.turn(60);
        }
    }
}

function main() {
    turtle.setX(width - 10 );
    turtle.setY(0 + 10);
    turtle.angle = 0;

    draw(20);
}

window.addEventListener("load", main);