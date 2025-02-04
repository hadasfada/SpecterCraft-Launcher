/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const { ipcRenderer } = require('electron');
import { config } from './utils.js';

let dev = process.env.NODE_ENV === 'dev';


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector("progress");
        document.addEventListener('DOMContentLoaded', () => this.startAnimation());
    }

    async startAnimation() {
        let splashes = [
            { "message": "aynen bundan", "author": "hadas" },
            { "message": "bol şanş", "author": "hadas" },
            { "message": "hala betada", "author": "hadas" },
            { "message": "hep betada", "author": "hadas" },
            { "message": "şunu da eklesene", "author": "hadas" },
            { "message": "mistik olsun.", "author": "hadas" },
            { "message": "tuhaf bir yazi ekle", "author": "hadas" },
            { "message": "kafam acıyor", "author": "hadas" },
            { "message": "işlem çok acısız", "author": "hadas" },
            { "message": "bip bop bop bip", "author": "hadas" },
        ]
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        this.splashAuthor.children[0].textContent = "@" + splash.author;
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);
        this.checkUpdate();
    }

    async checkUpdate() {
        if (dev) return this.startLauncher();
        this.setStatus(`Güncelleme aranıyor...`);

        ipcRenderer.invoke('update-app').then(err => {
            if (err.error) {
                let error = err.message;
                this.shutdown(`bir hatacık var :<br>${error}`);
            }
        })

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Güncelleme var!!!`);
            this.toggleProgress();
            ipcRenderer.send('start-update');
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            this.maintenanceCheck();
        })
    }

    async maintenanceCheck() {
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            this.startLauncher();
        }).catch(e => {
            console.error(e);
            return this.shutdown("İnternet bağlantın yok :(,<br>lütfen daha sonra dene!!");
        })
    }

    startLauncher() {
        this.setStatus(`Başlatılıyor`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>5 Saniyeye Kapanıyor!`);
        let i = 4;
        setInterval(() => {
            this.setStatus(`${text}<br>Kapanıyor! byee :3 ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
})
new Splash();