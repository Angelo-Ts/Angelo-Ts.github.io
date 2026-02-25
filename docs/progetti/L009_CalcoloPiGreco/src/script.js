//"use strict";

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

function main(){
    ctx.fillRect(0, 0, 500, 500);
    calcoloPunto();
}
window.addEventListener("load", main);


function calcoloPunto(){
    let l = 500;
    let hit = 0;
    let total = 100000;
    for (let i=0; i <= total; i++){
        let x = Math.random() * l;
        let y = Math.random() * l;


        let c1 = 250 - x;
        let c2 = 250 - y;
        let distance = Math.sqrt(Math.pow(c1, 2) + (Math.pow(c2, 2)));

        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, 360);
        if (distance <= (l / 2)) {
            ctx.fillStyle = '#fc03c6';
            hit ++;
        } else {
            ctx.fillStyle = '#03fcc2';
        }
        ctx.fill();

    }
    let PI = 4 * (hit / total);
    console.log(total);
    console.log(PI)
}
