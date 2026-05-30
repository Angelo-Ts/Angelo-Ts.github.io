"use strict";
const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const turtle = {
    x: 150,
    y: 150,
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
//------------------------------------------------------------------

let n = document.getElementById('n');
n.addEventListener('change', getN);

function getN () {
    let n = document.getElementById('n').value;
    console.log(n);

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    turtle.setX(window.innerWidth/2);
    turtle.setY(window.innerHeight/2);
    for (let i = 0; i < 3; i++) {
        vonKoch(n, 250);
        turtle.turn(120);
    }
}

function vonKoch(n, length){
    if( n == 0){
        turtle.forward(length);
    } else {
        length = length/3;
        n -= 1;
        vonKoch(n, length);
        turtle.turn(-60);
        vonKoch(n, length);
        turtle.turn(120);
        vonKoch(n, length);
        turtle.turn(-60);
        vonKoch(n, length);
    }

}