const { ipcRenderer } = require("electron");

function goPath() {
    ipcRenderer.send('openConfig');
}

// <a> öğesine tıklama olayı atama
document.getElementById("path").onclick = goPath;

closeBtn.addEventListener('click', ()=> {
    ipcRenderer.send('closeApp');
});

miniBtn.addEventListener('click', ()=> {
    ipcRenderer.send('miniApp');
});
