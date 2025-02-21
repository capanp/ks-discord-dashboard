const { ipcRenderer } = require("electron");
const fs = require('node:fs');

// Mesajı yakala ve textarea'ya ekle
ipcRenderer.on('console-output', (event, message) => {
    const textarea = document.getElementById('console-output');
    textarea.value += message + '\n';
});

// Ana işlemden gelen metni al
ipcRenderer.on('update-textarea', (event, text) => {
    const textarea = document.getElementById('console-out');
    textarea.value += text + '\n'; // Metni textarea'ya ekle
});




let timerInterval;
let totalSeconds = 0;
let isTrue = false;
async function start() {
    if(isTrue){
        document.querySelector('.lds-ripple').style.color = "#088572";
        document.querySelector('.circle-button').style.backgroundColor = "#088572";
        document.querySelector('.circle-button').textContent = "Başlat";
        isTrue = false;

        clearInterval(timerInterval); // Önceki sayaç varsa durdurulur
        document.querySelector('.timer').textContent = "00:00:00";
    } else {
        document.querySelector('.lds-ripple').style.color = "#852929";
        document.querySelector('.circle-button').style.backgroundColor = "#852929";
        document.querySelector('.circle-button').textContent = "Durdur";
        isTrue = true;
    
        clearInterval(timerInterval); // Önceki sayaç varsa durdurulur
        totalSeconds = 0; // Sayaç sıfırlanır
        timerInterval = setInterval(updateTimer, 1000); // 1 saniyede bir güncellenir
    
        ipcRenderer.send('start-node-app'); // Node uygulamasını başlat
    }
}

function updateTimer() {
    totalSeconds++;

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // Zamanı formatla (saat, dakika ve saniye 2 basamaklı olmalı)
    let formattedTime = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    document.querySelector('.timer').textContent = formattedTime; // Sayaç güncellenir
}






function changeToken() {
    let token = document.getElementById("tokenInput").value;
    if (token == "" || token == " ") return; //do nothing.
    document.getElementById("tokenInput").disabled = true;
    document.getElementById("inputButton").disabled = true;
    ipcRenderer.send('testToken', token);
}

function goPath() {
    ipcRenderer.send('openConfig');
}

ipcRenderer.on('replyConfig', (event, data) => {
    if (data) {
        //do nothing, correct config.

    } else {
        let tokenbg = document.getElementById('tokenBackground');
        tokenbg.style.display = "block";
    }
});

ipcRenderer.on('changeProfile', (event, data) => {
    if (data) {
        if (!Array.isArray(data)) return; //need array.

        let avatar = document.getElementsByClassName('profilResmi')[0];
        let avatarColor = document.getElementsByClassName('profilColor')[0];
        let botName = document.getElementsByClassName('botName')[0];
        let botTagName = document.getElementById('botTagName');
        let botID = document.getElementById('botID');

        avatar.src = data[0];
        avatarColor.style.backgroundColor = data[1];
        botName.innerHTML = data[2];
        botTagName.innerHTML = data[3];
        botID.innerHTML = data[4];
        servers.innerHTML = data[5] + "Sunucu.";
        users.innerHTML = data[6] + " Kullanıcı.";
    }
    let loader = document.getElementById('loader-container');
    let content = document.getElementById('content');

    loader.style.display = "none";
    content.style.display = "flex";
});

ipcRenderer.on('refuseToken', (event, data) => {
    document.getElementById("tokenInput").disabled = false;
    document.getElementById("inputButton").disabled = false;
});

ipcRenderer.send('checkConfig');

function updateProgressBar(cpu, cpu_usage, ram, ram_usage, os) {
    const progressBar = document.getElementById('myProgressBar');
    const cpuLabel = document.getElementById('islemci');
    const progressBar2 = document.getElementById('myProgressBar2');
    const ramLabel = document.getElementById('ram');
    const osLabel = document.getElementById('os');

    progressBar.style.width = cpu_usage + '%';
    progressBar.textContent = cpu_usage + '%';
    cpuLabel.textContent = 'İşlemci Modeli:' + cpu;

    progressBar2.style.width = ram_usage + '%';
    progressBar2.textContent = ram_usage + '%';
    ramLabel.textContent = 'Toplam bellek:' + ram + ' GB';

    osLabel.textContent = os;
}

async function updateFunc() {
    ipcRenderer.send('updateSystem');
}

closeBtn.addEventListener('click', () => {
    ipcRenderer.send('closeApp');
});

loaderExit.addEventListener('click', () => {
    ipcRenderer.send('closeApp');
});

miniBtn.addEventListener('click', () => {
    ipcRenderer.send('miniApp');
});

loaderMini.addEventListener('click', () => {
    ipcRenderer.send('miniApp');
});

const intervalId = setInterval(async () => {
    updateFunc();

    const configPath = './log.json';
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    updateProgressBar(config.cpu, config.cpu_usage, config.ram, config.ram_usage, config.os);
}, 1000);
