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


function disegnaTrapezio(x, base, h){
    turtle.setY(250);
    turtle.setX(x   );
    turtle.angle = 0;
    turtle.changeColor('red');

    turtle.turn(90);
    turtle.forward(base);
}

function calcoloPi(){
    let raggio = 250; // raggio circonferenza per il disegno
    let nIterazioni = 10000; // numero di trapezi
    let newX = 250; // punto di partenza x sul canvas
    let sommaArea = 0;

    let h = 1 / nIterazioni; // passo per il calcolo numerico (unitario)

    for (let i = 0; i < nIterazioni; i++) {
        let x0 = i * h;
        let x1 = (i + 1) * h;

        let b0 = Math.sqrt(1 - x0 * x0);
        let b1 = Math.sqrt(1 - x1 * x1);

        // Area del trapezio
        let areaTrapezio = (b0 + b1) / 2 * h;
        sommaArea += areaTrapezio;

        // Disegno dei trapezi sul canvas (scala raggio reale)
        disegnaTrapezio(newX, b0 * raggio, (b1 - b0) * raggio);
        newX += h * raggio;
    }

    let pi = sommaArea * 4;
    console.log("PI", pi);
    document.getElementById('PI').textContent = pi;
}

function main(){

    ctx.arc(width/2, height/2, 250, 0, 360);
    ctx.stroke();

    turtle.setX(width/2);
    turtle.setY(width/2);
    turtle.forward(250);
    turtle.setX(width/2);
    turtle.setY(width/2);
    turtle.turn(90);
    turtle.forward(250);



    calcoloPi();
}
window.addEventListener("load", main);