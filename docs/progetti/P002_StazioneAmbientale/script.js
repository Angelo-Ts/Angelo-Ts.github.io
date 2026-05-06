/*

async function main() {
    const newObj = {
        id: "xyz",
        position: "LEN4-16",
        temperature: 21.5,
        humidity: 34.3,
        luminosity: 3.3,
        timestamp: "2026-03-30 08:36:50"
    };

    const response2 = await fetch("http://" + ip + "/data", { // ← await + header
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj)
    });
}*/

/*
let ip;
let labs = {};

const getIP = document.querySelector("#getData");
const labSelect = document.querySelector("#labSelect");
const stationSelect = document.querySelector("#stationSelect");

getIP.addEventListener("click", async () => {
    ip = document.querySelector("#ipInput").value;
    const json = await getData();
    labs = getLab(json);
    console.log(labs);
    populateLabSelect(labs);
});

async function getData() {
    const response = await fetch("http://" + ip + "/data");
    const json = await response.json();
    return json;
}

function getLab(jsonData) {
    const labs = {};
    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i]; // ← fix
        const parts = item.position.split("-");
        const labName = parts[0];
        const stationId = parts[1];

        if (!labs[labName]) {
            labs[labName] = {};
        }
        if (!labs[labName][stationId]) {
            labs[labName][stationId] = [];
        }
        labs[labName][stationId].push(item);
    }
    return labs;
}

// Quando cambia il laboratorio → aggiorna le postazioni
labSelect.addEventListener("change", () => {
    const selectedLab = labSelect.value;
    stationSelect.innerHTML = '<option value="">-- Seleziona postazione --</option>';

    if (!selectedLab) {
        stationSelect.disabled = true;
        return;
    }

    populateStationSelect(labs[selectedLab]);
    stationSelect.disabled = false;
});

// Quando cambia la postazione → mostra i dati
stationSelect.addEventListener("change", () => {
    const selectedLab = labSelect.value;
    const selectedStation = stationSelect.value;

    if (!selectedStation) return;

    const measurements = labs[selectedLab][selectedStation];
    displayData(measurements);
});

function populateLabSelect(labs) {
    labSelect.innerHTML = '<option value="">-- Seleziona laboratorio --</option>';
    for (const labName in labs) {
        const option = document.createElement("option");
        option.value = labName;
        option.textContent = labName;
        labSelect.appendChild(option);
    }
}

function populateStationSelect(stations) {
    for (const stationId in stations) {
        const option = document.createElement("option");
        option.value = stationId;
        option.textContent = "Postazione " + stationId;
        stationSelect.appendChild(option);
    }
}

function displayData(measurements) {
    const result = document.querySelector("#result");
    result.innerHTML = "";

    // 1. ULTIMA MISURAZIONE (ultimo elemento dell'array)
    const last = measurements[measurements.length - 1];

    // 2. MEDIA su tutte le misurazioni
    const avgTemp = (measurements.reduce((s, m) => s + m.temperature, 0) / measurements.length).toFixed(1);
    const avgHum  = (measurements.reduce((s, m) => s + m.humidity,    0) / measurements.length).toFixed(1);
    const avgLux  = (measurements.reduce((s, m) => s + m.luminosity,  0) / measurements.length).toFixed(1);

    // 3. Lista date uniche per il menù a tendina
    const uniqueDates = [...new Set(measurements.map(m => m.timestamp.split(" ")[0]))].sort();

    result.innerHTML = `
        <!-- ULTIMA MISURAZIONE -->
        <div class="section">
            <h3>🟢 Ultima misurazione — ${last.timestamp}</h3>
            <p>🌡️ ${last.temperature}°C &nbsp; 💧 ${last.humidity}% &nbsp; 💡 ${last.luminosity} lx</p>
        </div>

        <!-- MEDIA -->
        <div class="section">
            <h3>📊 Media (${measurements.length} misurazioni)</h3>
            <p>🌡️ ${avgTemp}°C &nbsp; 💧 ${avgHum}% &nbsp; 💡 ${avgLux} lx</p>
        </div>

        <!-- FILTRO PER DATA -->
        <div class="section">
            <h3>📅 Storico per data</h3>
            <select id="dateSelect">
                <option value="">-- Seleziona un giorno --</option>
                ${uniqueDates.map(d => `<option value="${d}">${d}</option>`).join("")}
            </select>
            <div id="filteredList"></div>
        </div>
    `;

    // Listener sul menù date
    document.querySelector("#dateSelect").addEventListener("change", () => {
        const selectedDate = document.querySelector("#dateSelect").value;
        const filtered = measurements.filter(m => m.timestamp.startsWith(selectedDate));
        const filteredList = document.querySelector("#filteredList");

        if (!selectedDate || filtered.length === 0) {
            filteredList.innerHTML = "<p>Nessuna misurazione per questa data.</p>";
            return;
        }

        filteredList.innerHTML = filtered.map(m => `
            <div class="measurement-row">
                <span>🕒 ${m.timestamp}</span>
                <span>🌡️ ${m.temperature}°C</span>
                <span>💧 ${m.humidity}%</span>
                <span>💡 ${m.luminosity} lx</span>
            </div>
        `).join("");
    });
}*/


let ip;
let labs = {};
let currentMeasurements = [];
let myChart = null;
const seriesVisible = { temp: true, hum: true, lux: true };

const getIP = document.querySelector("#getData");
const labSelect = document.querySelector("#labSelect");
const stationSelect = document.querySelector("#stationSelect");

async function getData() {
    const response = await fetch("http://" + ip + "/data");
    const json = await response.json();
    return json;
}

function getLab(jsonData) {
    const labs = {};
    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        const parts = item.position.split("-");
        const labName = parts[0];
        const stationId = parts[1];
        if (!labs[labName]) labs[labName] = {};
        if (!labs[labName][stationId]) labs[labName][stationId] = [];
        labs[labName][stationId].push(item);
    }
    return labs;
}

getIP.addEventListener("click", async () => {
    ip = document.querySelector("#ipInput").value;
    const json = await getData();
    labs = getLab(json);
    populateLabSelect(labs);
});

labSelect.addEventListener("change", () => {
    const selectedLab = labSelect.value;
    stationSelect.innerHTML = '<option value="">-- Seleziona postazione --</option>';
    if (!selectedLab) {
        stationSelect.disabled = true;
        return;
    }
    populateStationSelect(labs[selectedLab]);
    stationSelect.disabled = false;
});

stationSelect.addEventListener("change", () => {
    const selectedLab = labSelect.value;
    const selectedStation = stationSelect.value;
    if (!selectedStation) return;
    currentMeasurements = labs[selectedLab][selectedStation];
    displayData(currentMeasurements);
});

function populateLabSelect(labs) {
    labSelect.innerHTML = '<option value="">-- Seleziona laboratorio --</option>';
    for (const labName in labs) {
        const option = document.createElement("option");
        option.value = labName;
        option.textContent = labName;
        labSelect.appendChild(option);
    }
}

function populateStationSelect(stations) {
    for (const stationId in stations) {
        const option = document.createElement("option");
        option.value = stationId;
        option.textContent = "Postazione " + stationId;
        stationSelect.appendChild(option);
    }
}

function displayData(measurements) {
    const last = measurements[measurements.length - 1];

    document.querySelector("#sectionLast").style.display    = "block";
    document.querySelector("#sectionChart").style.display   = "block";
    document.querySelector("#sectionAvg").style.display     = "block";
    document.querySelector("#sectionHistory").style.display = "block";

    document.querySelector("#lastTemp").textContent = last.temperature.toFixed(1) + " °C";
    document.querySelector("#lastHum").textContent  = last.humidity.toFixed(1)    + " %";
    document.querySelector("#lastLux").textContent  = last.luminosity.toFixed(1)  + " lx";
    document.querySelector("#lastTs").textContent   = last.timestamp;

    const n = measurements.length;
    const avgTemp = (measurements.reduce((s, m) => s + m.temperature, 0) / n).toFixed(1);
    const avgHum  = (measurements.reduce((s, m) => s + m.humidity,    0) / n).toFixed(1);
    const avgLux  = (measurements.reduce((s, m) => s + m.luminosity,  0) / n).toFixed(1);

    document.querySelector("#avgTemp").textContent = avgTemp + " °C";
    document.querySelector("#avgHum").textContent  = avgHum  + " %";
    document.querySelector("#avgLux").textContent  = avgLux  + " lx";
    document.querySelector("#avgCount").textContent = "Calcolata su " + n + " misurazioni totali";

    buildChart(measurements);

    const dates = [...new Set(measurements.map(m => m.timestamp.split(" ")[0]))].sort();
    const dateSelect = document.querySelector("#dateSelect");
    dateSelect.innerHTML = '<option value="">-- Seleziona un giorno --</option>';
    dates.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        dateSelect.appendChild(opt);
    });
    document.querySelector("#filteredList").innerHTML =
        '<p>Seleziona una data per vedere le misurazioni.</p>';
}

function buildChart(measurements) {
    const labels = measurements.map((_, i) => "#" + (i + 1));
    const temps  = measurements.map(m => parseFloat(m.temperature.toFixed(1)));
    const hums   = measurements.map(m => parseFloat(m.humidity.toFixed(1)));
    const luxes  = measurements.map(m => parseFloat(m.luminosity.toFixed(1)));

    if (myChart) myChart.destroy();

    myChart = new Chart(document.getElementById("myChart"), {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "Temperatura (°C)", data: temps, borderColor: "#378ADD", backgroundColor: "transparent", borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#378ADD", yAxisID: "yLeft", hidden: !seriesVisible.temp, borderDash: [] },
                { label: "Umidità (%)",      data: hums,  borderColor: "#1D9E75", backgroundColor: "transparent", borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#1D9E75", pointStyle: "triangle", yAxisID: "yLeft", hidden: !seriesVisible.hum, borderDash: [4, 3] },
                { label: "Luminosità (lx)",  data: luxes, borderColor: "#BA7517", backgroundColor: "transparent", borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#BA7517", pointStyle: "rect",     yAxisID: "yRight", hidden: !seriesVisible.lux, borderDash: [2, 2] }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => { const u = ["°C", "%", "lx"]; return ctx.dataset.label + ": " + ctx.parsed.y + " " + u[ctx.datasetIndex]; } } }
            },
            scales: {
                x:      { ticks: { font: { size: 11 }, color: "#888780", autoSkip: true, maxTicksLimit: 12 }, grid: { color: "rgba(136,135,128,0.12)" } },
                yLeft:  { position: "left",  ticks: { font: { size: 11 }, color: "#888780" }, grid: { color: "rgba(136,135,128,0.12)" }, title: { display: true, text: "°C / %", font: { size: 11 }, color: "#888780" } },
                yRight: { position: "right", ticks: { font: { size: 11 }, color: "#BA7517" }, grid: { drawOnChartArea: false },           title: { display: true, text: "lx",    font: { size: 11 }, color: "#BA7517" } }
            }
        }
    });
}

function toggleSeries(key) {
    const idxMap = { temp: 0, hum: 1, lux: 2 };
    const btnMap = { temp: "#btnTemp", hum: "#btnHum", lux: "#btnLux" };
    seriesVisible[key] = !seriesVisible[key];
    if (myChart) { myChart.data.datasets[idxMap[key]].hidden = !seriesVisible[key]; myChart.update(); }
    document.querySelector(btnMap[key]).classList.toggle("active",   seriesVisible[key]);
    document.querySelector(btnMap[key]).classList.toggle("inactive", !seriesVisible[key]);
}

document.querySelector("#dateSelect").addEventListener("change", () => {
    const date = document.querySelector("#dateSelect").value;
    const list = document.querySelector("#filteredList");
    if (!date) { list.innerHTML = "<p>Seleziona una data.</p>"; return; }
    const filtered = currentMeasurements.filter(m => m.timestamp.startsWith(date));
    if (!filtered.length) { list.innerHTML = "<p>Nessuna misurazione per questa data.</p>"; return; }
    list.innerHTML = filtered.map(m => {
        const orario = m.timestamp.split(" ")[1];
        return `<div class="measurement-row">
            <span>🕒 ${orario}</span>
            <span>🌡️ ${m.temperature}°C</span>
            <span>💧 ${m.humidity}%</span>
            <span>💡 ${m.luminosity} lx</span>
        </div>`;
    }).join("");
});

async function postData() {
    const feedback    = document.querySelector("#postFeedback");
    const temperature = parseFloat(document.querySelector("#postTemp").value);
    const humidity    = parseFloat(document.querySelector("#postHum").value);
    const luminosity  = parseFloat(document.querySelector("#postLux").value);
    const position    = document.querySelector("#postPosition").value.trim();

    if (!position || isNaN(temperature) || isNaN(humidity) || isNaN(luminosity)) {
        feedback.className = "post-feedback err";
        feedback.textContent = "Compila tutti i campi.";
        return;
    }

    const now = new Date();
    const timestamp = now.getFullYear() + "-"
        + String(now.getMonth() + 1).padStart(2, "0") + "-"
        + String(now.getDate()).padStart(2, "0") + " "
        + String(now.getHours()).padStart(2, "0") + ":"
        + String(now.getMinutes()).padStart(2, "0") + ":"
        + String(now.getSeconds()).padStart(2, "0");

    const newObj = { position, temperature, humidity, luminosity, timestamp };

    try {
        const response = await fetch("http://" + ip + "/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newObj)
        });
        if (response.ok) {
            feedback.className = "post-feedback ok";
            feedback.textContent = "Inviato a " + position + " (" + timestamp + ")";
        } else {
            feedback.className = "post-feedback err";
            feedback.textContent = "Errore server: " + response.status + " " + response.statusText;
        }
    } catch (e) {
        feedback.className = "post-feedback err";
        feedback.textContent = "Errore di connessione: " + e.message;
    }
}