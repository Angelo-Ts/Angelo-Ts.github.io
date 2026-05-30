/*"use strict";


function validate(input) {
    if (typeof input !== "string") {
        throw new Error("Input must be a string");
    }

    // Remove spaces
    input = input.replace(/\s+/g, "");

    if (input.length === 0) {
        throw new Error("Empty input");
    }

    // Make sure first term has a sign
    if (input[0] !== "+" && input[0] !== "-") {
        input = "+" + input;
    }

    // Split into terms like ["+2x^3", "+x^2", "-3"]
    const terms = input.match(/[+-][^+-]+/g);

    const result = {};

    for (let term of terms) {
        let sign = term[0] === "-" ? -1 : 1;
        term = term.slice(1); // remove sign

        let coefficient, exponent;

        if (term.includes("x")) {
            const parts = term.split("x");

            // Coefficient
            if (parts[0] === "") {
                coefficient = 1;
            } else {
                if (isNaN(parts[0])) {
                    throw new Error("Invalid coefficient");
                }
                coefficient = parseFloat(parts[0]);
            }

            // Exponent
            if (parts[1] === "") {
                exponent = 1;
            } else {
                if (!parts[1].startsWith("^")) {
                    throw new Error("Invalid exponent format");
                }

                const expStr = parts[1].slice(1);

                if (!/^\d+$/.test(expStr)) {
                    throw new Error("Exponent must be a non-negative integer");
                }

                exponent = parseInt(expStr);
            }

        } else {
            // Constant term
            if (isNaN(term)) {
                throw new Error("Invalid constant term");
            }

            coefficient = parseFloat(term);
            exponent = 0;
        }

        coefficient *= sign;

        // Combine like terms
        result[exponent] = (result[exponent] || 0) + coefficient;
    }

    return result;
}


window.addEventListener('load', () => {

    let scale = 1.0;
    const val = document.querySelector("#zoomValue");
    val.innerHTML = document.querySelector("#zoom").value;


    const canvas = document.querySelector("#Canvas");
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const offX = width/2;
    const offY = height/2;
    let funStr = null;




    function drawAxes(divs) {
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0,0,width,height);

        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(width/2,0);
        ctx.lineTo(width/2,height);
        ctx.moveTo(0,height/2);
        ctx.lineTo(width,height/2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        const stepX = width/divs;
        const stepY = height/divs;
        for(let i = 0; i <= divs; ++i) {
            ctx.beginPath();
            ctx.moveTo(i*stepX,0);
            ctx.lineTo(i*stepX,height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0,i*stepY);
            ctx.lineTo(width,i*stepY);
            ctx.stroke();
        }

    }

    const drawF = (minX,maxX,funStr) => {
        const step = 0.1;

        function f(x) {
            let y = 0;

            for(let exp in funStr) {
                y += Math.pow(x,exp) * funStr[exp];
            }
            return -y;
        }

        drawAxes(100);
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = 2;
        for (let x = minX; x < maxX; x+=step) {
            let y0 = f(x);
            let y1 = f(x+step);
            ctx.beginPath();
            ctx.moveTo((x)*scale + offX,(y0)*scale + offY);
            ctx.lineTo((x+step)*scale + offX + 0.5,(y1)*scale + offY + 0.5);
            ctx.stroke();
        }
    };
    let min = -100;
    let max = 100;
    //let coeff = [1,1,-200];

    //drawF(min,max,coeff);


    drawAxes(100);

    const zoomBar = document.querySelector("#zoom");
    zoomBar.addEventListener("change", () => {
        scale = zoomBar.value;
        if (zoomBar.value == 0.5) zoomBar.value = -1.5;
        if (zoomBar.value == -1) zoomBar.value = 1;
        scale = (scale <= 0.5 && scale >= -1) ? 1 : scale;
        if (scale < 0) {
            scale = 1.0 / Math.abs(scale);
        }
        drawAxes(100);
        drawF(min,max,funStr);

        if (val) {
            val.innerHTML = scale < 1 ? scale.toFixed(2) : scale;
        }

    });



    const eqnIn = document.querySelector("#equation");
    eqnIn.addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            let eqn = eqnIn.value;
            funStr = validate(eqn);
            drawF(min,max,funStr);
            const displayer = document.querySelector("#eqn");
            displayer.innerHTML = eqn;
        }
    });

}); */