let ip;
let labs = {};
let currentMeasurements = [];
let chart = null;
const seriesVisible = { temp: true, hum: true, lux: true };
let refreshInterval = null;

const getIP = document.querySelector("#getData");
const selettoreLabs = document.querySelector("#labSelect");
const selettoreStazioni = document.querySelector("#stationSelect");

//funzione di get per ottenere il JSON dal server
async function getData() {
    const response = await fetch("http://" + ip + "/data");
    //promessa che prima o poi conterra il risultato della chiamata asincrona
    const json = await response.json();
    return json;
}

//pulsante per invio dell'indirizzo IP, suddivide il JSON in labs e riempe i selettori a tendina
getIP.addEventListener("click", async () => {
    ip = document.querySelector("#ipInput").value;
    const json = await getData();
    labs = getLab(json);
    riempiSelettoreLab(labs);
});

//pulsante per invio dell'indirizzo IP con caricamento dati e refresh ogni minuto
getIP.addEventListener("click", async () => {
    ip = document.querySelector("#ipInput").value;
    // ferma eventuale refresh precedente
    if (refreshInterval){
        clearInterval(refreshInterval);
    }
    await loadData();
    //refresh ogni minuto
    refreshInterval = setInterval(loadData, 60000);
});

//suddivide il JSON in oggetti di labs, ogni lab ha le sue postazioni con le proprie misurazioni
function getLab(jsonData) {
    const labs = {};
    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
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

//Selezionando il lab. Mostra la media di tutte le misurazioni di tutte le postazioni
selettoreLabs.addEventListener("change", () => {
    const selectedLab = selettoreLabs.value;
    selettoreStazioni.innerHTML = '<option value="">-- Seleziona postazione --</option>';

    // nascondi tutto
    document.querySelector("#sectionLast").style.display    = "none";
    document.querySelector("#sectionChart").style.display   = "none";
    document.querySelector("#sectionHistory").style.display = "none";

    if (!selectedLab) {
        selettoreStazioni.disabled = true;
        document.querySelector("#sectionAvg").style.display = "none";
        return;
    }

    // riempe menu a tendina delle postazioni
    riempiSelettorePostazioni(labs[selectedLab]);
    selettoreStazioni.disabled = false;

    // calcola media di tutte le misurazioni di tutte le postazioni del lab
    const allMeasurements = Object.values(labs[selectedLab]).flat();
    const n = allMeasurements.length;
    const avgTemp = (allMeasurements.reduce((s, m) => s + m.temperature, 0) / n).toFixed(1);
    const avgHum  = (allMeasurements.reduce((s, m) => s + m.humidity,    0) / n).toFixed(1);
    const avgLux  = (allMeasurements.reduce((s, m) => s + m.luminosity,  0) / n).toFixed(1);

    document.querySelector("#avgTemp").textContent  = avgTemp + " °C";
    document.querySelector("#avgHum").textContent   = avgHum  + " %";
    document.querySelector("#avgLux").textContent   = avgLux  + " lx";
    document.querySelector("#avgCount").textContent = "Calcolata su " + n + " misurazioni — tutte le postazioni di " + selectedLab;
    document.querySelector("#sectionAvg").style.display  = "block";
});

//Selezionando la postazione, mostra i dati di quella postazione specifica
selettoreStazioni.addEventListener("change", () => {
    const selectedLab     = selettoreLabs.value;
    const selectedStation = selettoreStazioni.value;
    if (!selectedStation) {
        // torna alla sola media del lab
        document.querySelector("#sectionLast").style.display    = "none";
        document.querySelector("#sectionChart").style.display   = "none";
        document.querySelector("#sectionHistory").style.display = "none";
        return;
    }
    currentMeasurements = labs[selectedLab][selectedStation];
    displayData(currentMeasurements);
});

//riempe menu a tendina dei laboratori e delle postazioni, con i dati ottenuti dal JSON
function riempiSelettoreLab(labs) { // Rinominata
    selettoreLabs.innerHTML = '<option value="">-- Seleziona laboratorio --</option>';
    for (const labName in labs) {
        const option = document.createElement("option");
        option.value = labName;
        option.textContent = labName;
        selettoreLabs.appendChild(option);
    }
}
// ^^
function riempiSelettorePostazioni(stations) { // Rinominata
    for (const stationId in stations) {
        const option = document.createElement("option");
        option.value = stationId;
        option.textContent = "Postazione " + stationId;
        selettoreStazioni.appendChild(option);
    }
}

// mostra dati ultima misurazione, media, grafico e storico misurazioni per postazione
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

//grafico con Chart.js, con 3 variabili su due assi y diversi
function buildChart(measurements) {
    const labels = measurements.map((_, i) => "#" + (i + 1));
    const temps  = measurements.map(m => parseFloat(m.temperature.toFixed(1)));
    const hums   = measurements.map(m => parseFloat(m.humidity.toFixed(1)));
    const luxes  = measurements.map(m => parseFloat(m.luminosity.toFixed(1)));

    // se esiste, elimina grafico precedente cancellare le sovrapposizioni delle rette
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(document.getElementById("myChart"), {
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

//funzione per mostrare/nascondere le variabili del grafico e aggiornare pulsanti
function toggleSeries(key) {
    const idxMap = { temp: 0, hum: 1, lux: 2 };
    const btnMap = { temp: "#btnTemp", hum: "#btnHum", lux: "#btnLux" };
    seriesVisible[key] = !seriesVisible[key];
    if (chart) {
        chart.data.datasets[idxMap[key]].hidden = !seriesVisible[key];
        chart.update();
    }
    document.querySelector(btnMap[key]).classList.toggle("active",   seriesVisible[key]);
    document.querySelector(btnMap[key]).classList.toggle("inactive", !seriesVisible[key]);
}

//filtro per data, mostra solo le misurazioni di quella data selezionata
document.querySelector("#dateSelect").addEventListener("change", () => {
    const date = document.querySelector("#dateSelect").value;
    const list = document.querySelector("#filteredList");
    if (!date) {
        list.innerHTML = "<p>Seleziona una data.</p>";
        return;
    }
    const filtered = currentMeasurements.filter(m => m.timestamp.startsWith(date));
    if (!filtered.length) {
        list.innerHTML = "<p>Nessuna misurazione per questa data.</p>";
        return;
    }
    list.innerHTML = filtered.map(m => {
        const orario = m.timestamp.split(" ")[1];
        return `<div class="measurement-row">
            <span> ${orario}</span>
            <span> ${m.temperature}°C</span>
            <span> ${m.humidity}%</span>
            <span> ${m.luminosity} lx</span>
        </div>`;
    }).join("");
});


//funzione per inviare l'array nel json tramite metodo POST
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

//stato connessione al server, modifica pallino e testo
function setStatus(state) {
    const dot  = document.querySelector("#statusDot");
    const text = document.querySelector("#statusText");
    dot.className = "status-dot " + state;
    const labels = {
        connected:    "Connesso",
        disconnected: "Non connesso",
        loading:      "Connessione..."
    };
    text.textContent = labels[state] || "";
}

async function loadData() {
    try {
        setStatus("loading");
        const json = await getData();
        labs = getLab(json);

        // salva scelte dell'utente per evitare di perderle al refresh
        const labSelect     = selettoreLabs.value;
        const stazioneSelect = selettoreStazioni.value;

        riempiSelettoreLab(labs);

        //evita ripristino selezione durante il refresh
        if (labSelect && labs[labSelect]) {
            selettoreLabs.value = labSelect;
            riempiSelettorePostazioni(labs[labSelect]);
            selettoreStazioni.disabled = false;

            if (stazioneSelect && labs[labSelect][stazioneSelect]) {
                selettoreStazioni.value = stazioneSelect;
                currentMeasurements = labs[labSelect][stazioneSelect];
                displayData(currentMeasurements);
            }
        }

        setStatus("connected");
    } catch (e) {
        setStatus("disconnected");
    }
}
