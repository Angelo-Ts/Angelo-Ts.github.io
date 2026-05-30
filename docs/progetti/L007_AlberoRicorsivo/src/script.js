"use strict";

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const turtle = {
    x: window.innerWidth /2,
    y: window-innerHeight /2,
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

function recursiveTree(n, length){
    if (n === 0){
        turtle.forward(length);
    } else {/*
        turtle.forward(length);
        length = length * 0.70;
        n -= 1;

        turtle.turn( 30)
        let x = turtle.x;
        let y = turtle.y;
        let angle = turtle.angle;

        recursiveTree(n, length);

        turtle.setX(x);
        turtle.setY(y);
        turtle.turn(-turtle.angle);

        turtle.turn( -30 );
        recursiveTree(n, length);*/

        turtle.forward(length);
        const x = turtle.x;
        const y = turtle.y;
        const angle = turtle.angle;


        // Ramo destro
        turtle.turn(30);
        recursiveTree(n -1, length * 0.7);

        // Ripristina stato
        turtle.setX(x);
        turtle.setY(y);
        turtle.angle = angle;

        // Ramo sinistro
        turtle.turn(-30);
        recursiveTree(n -1, length * 0.7);

        turtle.setX(x);
        turtle.setY(y);
        turtle.angle = angle;
    }
}

function main() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    turtle.setX(window.innerWidth/2);
    turtle.setY(window.innerHeight/2);
    turtle.turn(90);

    recursiveTree(9 , 150);
}

window.addEventListener("load", main);