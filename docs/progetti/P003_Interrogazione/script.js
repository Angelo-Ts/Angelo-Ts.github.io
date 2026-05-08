const N = 3; // dimensione griglia
const CORRETTA = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // stato finale (0 ->vuoto)
let stato = [];
let mosse = 0;
let risolvendo = false; //variabile per BFS, l'utente non può interagire
let record = null;

// lettura record salvato nel localStorage
if (localStorage.getItem("record8")) {
    record = parseInt(localStorage.getItem("record8"));
}

// avvio, associazione tag a eventi con funzioni
window.onload = function () {
    document.getElementById("btn-nuova").onclick = nuovaPartita;
    document.getElementById("btn-risolvi").onclick = risolviBFS;
    document.getElementById("btn-salva").onclick = salvaPartita;
    document.getElementById("btn-carica").addEventListener("click", function() {
        document.getElementById("input-file").click();
    });
    document.getElementById("input-file").onchange = caricaPartita;
    nuovaPartita(); //inizio partita
};

// resetta tutto e inizia
function nuovaPartita() {
    risolvendo = false;
    document.getElementById("btn-risolvi").disabled = false;
    mosse = 0;
    aggiornaContatori();
    setMessaggio("clicca una tessera vicina allo spazio vuoto per spostarla.");
    do {
        stato = mescola([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    } while (!eRisolvibile(stato) || arrayUguali(stato, CORRETTA));
    disegnaBoard();
}

// generazione sequenza random
function mescola(arr) {
    const copia = arr.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = copia[i];
        copia[i] = copia[j];
        copia[j] = tmp;
    }
    return copia;
}

// controlla se il puzzle si puo risolvere
function eRisolvibile(arr) {
    let inversioni = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            //quante volte un numero + grande si trova prima di uno + piccolo
            if (arr[i] !== 0 && arr[j] !== 0 && arr[i] > arr[j]) {
                inversioni++;
            }
        }
    }
    return inversioni % 2 === 0; //inversioni pari allora è risolvibile
}

// crea i bottoni sulla pagina
function disegnaBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    for (let i = 0; i < N * N; i++) {
        const tile = document.createElement("button");
        tile.className = "tile";
        if (stato[i] === 0) {
            tile.classList.add("vuota");
        } else {
            tile.textContent = stato[i];

            if (stato[i] === CORRETTA[i]) {
                tile.classList.add("corretta");
            }
            tile.onclick = () => tentaMossa(i);
        }
        board.appendChild(tile);
    }
}

// prova a spostare la tessera
function tentaMossa(i) {
    if (risolvendo) { //BFS in corso, non si può interagire
        return;
    }
    const vuota = stato.indexOf(0); //posizione della casella vuota
    const distanza = Math.abs(Math.floor(i / N) - Math.floor(vuota / N))
        + Math.abs(i % N - vuota % N); //calcolo distanza
    if (distanza !== 1) { //se la casella vuota non è vicino
        return;
    }
    stato[vuota] = stato[i]; //sposta tessera nella casella vuota e viceversa
    stato[i] = 0;
    mosse++;
    aggiornaContatori();
    disegnaBoard();
    if (arrayUguali(stato, CORRETTA)) {
        vittoria();
    }
}

// vittoria
function vittoria() {
    risolvendo = false;
    document.getElementById("btn-risolvi").disabled = true;
    if (record === null || mosse < record) { //salva record
        record = mosse;
        localStorage.setItem("record8", record);
    }
    aggiornaContatori();
    setMessaggio("Puzzle risolto in " + mosse + " mosse!");
}

// scarica json
function salvaPartita() {
    const json = JSON.stringify({ stato: stato, mosse: mosse }, null, 2);
    const link = document.createElement("a");
    // trasforma json in un file virtuale (blob) e lo attacca al link
    link.href     = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    link.download = "partita8.json";
    link.click(); //avvio download
    setMessaggio("Partita salvata come partita8.json");
}

// carica json da locale
function caricaPartita(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    // strumento lettura file, chiama funzione per lettura letti
    const reader = new FileReader();
    reader.onload = function (e) {
        const dati = JSON.parse(e.target.result);
        if (!dati.stato || dati.stato.length !== N * N) { //controlla se il file è valido
            setMessaggio("file non valido!");
            return;
        }
        //ripristino gioco con dati del file
        stato = dati.stato;
        mosse = dati.mosse;
        risolvendo = false;
        document.getElementById("btn-risolvi").disabled = false;
        aggiornaContatori();
        disegnaBoard();
        setMessaggio("partita caricata. continua a giocare.");
    };
    reader.readAsText(file);
    event.target.value = ""; //svuota input
}

function risolviBFS() {
    if (risolvendo) { //sta risolvendo o è già risolto
        return;
    }
    if (arrayUguali(stato, CORRETTA)) {
        setMessaggio("Il puzzle è già risolto!");
        return;
    }
    risolvendo = true;
    document.getElementById("btn-risolvi").disabled = true;
    setMessaggio("BFS in esecuzione... calcolo la soluzione.");

    const chiaveInizio = stato.join(",");
    const chiaveCorretta   = CORRETTA.join(",");
    // coda
    const coda     = [{ stato: stato.slice(), chiave: chiaveInizio }];
    const visitati = {};
    visitati[chiaveInizio] = { padre: null, stato: stato.slice() };

    while (coda.length > 0) {
        const corrente = coda.shift(); // prende il primo della coda (FIFO)

        if (corrente.chiave === chiaveCorretta) {
            break;
        }
        // genera tutti gli stati raggiungibili con una mossa
        for (const vicino of getVicini(corrente.stato)) {
            const chiaveV = vicino.join(",");
            if (!visitati[chiaveV]) { // se non è già stato visitato
                // salva da dove viene (serve per ricostruire il percorso)
                visitati[chiaveV] = { padre: corrente.chiave, stato: vicino };
                coda.push({ stato: vicino, chiave: chiaveV });
            }
        }
    }

    //se l'obbiettivo non è nei visitati non è presente soluzione
    if (!visitati[chiaveCorretta]) {
        setMessaggio("BFS non ha trovato una soluzione.");
        risolvendo = false;
        document.getElementById("btn-risolvi").disabled = false;
        return;
    }

    // ricostruisce il percorso all'indietro, dallo stato giusto fino allo stato iniziale
    const percorso = [];
    let chiaveAttuale = chiaveCorretta;
    while (chiaveAttuale !== chiaveInizio) {
        percorso.unshift(visitati[chiaveAttuale].stato); // aggiunge in testa
        chiaveAttuale = visitati[chiaveAttuale].padre;   // vai al padre
    }

    setMessaggio("Soluzione trovata in " + percorso.length + " mosse! Animazione...");
    animazionePercorso(percorso, 0);
}

function getVicini(arr) {
    //trova pos della casella vuota (val 0)
    const vuota = arr.indexOf(0);

    // converte pos in riga e colonna nella griglia
    const riga = Math.floor(vuota / N);
    const col  = vuota % N;

    //su, giù, sinistra, destra
    const direzioni = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const risultati = [];

    for (const [dr, dc] of direzioni) {
        const nr = riga + dr; // riga del vicino
        const nc = col  + dc; // colonna del vicino

        // se il vicino è fuori dalla griglia
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) {
            continue;
        }
        // converte riga/colonna del vicino i dell'array
        const ni = nr * N + nc;
        //copia dello stato e sposta la tessera nella casella vuota
        const copia = arr.slice();
        copia[vuota] = copia[ni];
        copia[ni]    = 0;

        risultati.push(copia);
    }
    // restituisce tutti gli stati raggiungibili con una mossa
    return risultati;
}

//f ricorsiva asincrona per animare il percorso
function animazionePercorso(percorso, step) {
    if (!risolvendo || step >= percorso.length) {
        vittoria();
        return;
    }
    stato = percorso[step].slice();
    mosse++;
    aggiornaContatori();
    disegnaBoard();
    for (const tile of document.querySelectorAll(".tile:not(.vuota)")) {
        tile.classList.add("solving");
    }
    setTimeout(() => animazionePercorso(percorso, step + 1), 200);
}
//ut
function arrayUguali(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function aggiornaContatori() {
    document.getElementById("mosse").textContent = mosse;
    document.getElementById("record").textContent = record !== null ? record : "--";
}
function setMessaggio(testo) {
    document.getElementById("messaggio").textContent = testo;
}