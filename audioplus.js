class AudioPlus extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.init();
  }

  attributeChangedCallback(name, _, value) {
    if (name === "src" && this.audio) {
      this.audio.src = value || "";
      this.buildWaveform();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: system-ui, sans-serif;
        }
        .player {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #111;
          padding: 12px 16px;
          border-radius: 16px;
          color: white;
          max-width: 480px;
          position: relative;
          user-select: none;
        }
        button {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }
        canvas {
          flex: 1;
          height: 48px;
          cursor: pointer;
        }
        .menu {
          position: fixed;
          display: none;
          background: #1a1a1a;
          border-radius: 8px;
          padding: 6px 0;
          min-width: 120px;
          box-shadow: 0 8px 24px rgba(0,0,0,.5);
          z-index: 9999;
        }
        .menu div {
          padding: 8px 14px;
          cursor: pointer;
          font-size: 14px;
          color: #fff; /* ← required */
        }
        .menu div:hover {
          background: #2a2a2a;
        }
        .menu div.active::after {
          content: " ✓";
          float: right;
          color: #22c55e;
        }
      </style>

      <div class="player">
        <button id="play">▶</button>
        <canvas id="wave"></canvas>
      </div>

      <div id="menu" class="menu">
        <span style="color: #fff; text-align: center; width: 100%; display: block;">Playback Speed</span>
        <hr />
        <div data-speed="0.1">0.1×</div>
        <div data-speed="0.25">0.25×</div>
        <div data-speed="0.5">0.5×</div>
        <div data-speed="0.75">0.75×</div>
        <hr />
        <div data-speed="1">1×</div>
        <div data-speed="2">2×</div>
        <div data-speed="3">3×</div>
        <div data-speed="4">4×</div>
        <div data-speed="5">5×</div>
        <hr />
        <span style="color: #fff; text-align: center; width: 100%; display: block;">Other</span>
        <hr />
        <div data-loop>Loop</div>
      </div>

      <audio></audio>
    `;
  }

  init() {
    const root = this.shadowRoot;
    this.audio = root.querySelector("audio");
    this.canvas = root.querySelector("#wave");
    this.ctx = this.canvas.getContext("2d");
    this.playBtn = root.querySelector("#play");
    this.menu = root.querySelector("#menu");

    this.audio.src = this.getAttribute("src") || "";
    this.audio.preload = "metadata";

    this.resizeCanvas();
    this.bindControls();
    this.buildWaveform();
    this.draw();
  }

  resizeCanvas() {
    const r = this.canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    this.canvas.width = r.width * d;
    this.canvas.height = r.height * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  bindControls() {
    this.playBtn.onclick = () => {
      if (this.audio.paused) {
        this.audio.play();
        this.playBtn.textContent = "⏸";
      } else {
        this.audio.pause();
        this.playBtn.textContent = "▶";
      }
    };

    this.canvas.onclick = e => {
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      this.audio.currentTime = (x / this.canvas.width) * this.audio.duration;
    };

    // right-click menu
    this.canvas.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
      this.openMenu(e.clientX, e.clientY);
    });

    this.menu.addEventListener("click", e => {
      const speedItem = e.target.closest("[data-speed]");
      const loopItem = e.target.closest("[data-loop]");
    
      if (speedItem) {
        const rate = parseFloat(speedItem.dataset.speed);
        this.audio.playbackRate = rate;
        this.updateActiveSpeed(rate);
        this.closeMenu();
      }
    
      if (loopItem) {
        this.audio.loop = !this.audio.loop;
        loopItem.classList.toggle("active", this.audio.loop);
      }
      this.menu.querySelector("[data-loop]")
        .classList.toggle("active", this.audio.loop);
    });    

    document.addEventListener("click", () => this.closeMenu());
    this.updateActiveSpeed(1);
  }

  openMenu(x, y) {
    this.menu.style.display = "block";
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
  }

  closeMenu() {
    this.menu.style.display = "none";
  }

  updateActiveSpeed(rate) {
    this.menu.querySelectorAll("[data-speed]").forEach(el => {
      el.classList.toggle(
        "active",
        parseFloat(el.dataset.speed) === rate
      );
    });
  }

  async buildWaveform() {
    if (!this.audio.src) return;

    const res = await fetch(this.audio.src);
    const buf = await res.arrayBuffer();
    const ac = new AudioContext();
    const decoded = await ac.decodeAudioData(buf);
    const data = decoded.getChannelData(0);

    const bars = this.canvas.width;
    const step = Math.floor(data.length / bars);
    let peaks = [];

    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        const v = data[i * step + j] || 0;
        sum += v * v;
      }
      peaks.push(Math.sqrt(sum / step));
    }

    const max = Math.max(...peaks) || 1;
    this.peaks = peaks.map(v => Math.pow(v / max, 0.6));
  }

  draw() {
    requestAnimationFrame(() => this.draw());
    if (!this.peaks) return;

    const { ctx, canvas, audio } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mid = canvas.height / 2;
    const progress = audio.currentTime / audio.duration || 0;

    this.peaks.forEach((v, i) => {
      const h = v * mid;
      ctx.fillStyle =
        i / this.peaks.length < progress ? "#22c55e" : "#14532d";
      ctx.fillRect(i, mid - h, 1, h * 2);
    });
  }
}
customElements.define("audio-plus", AudioPlus);
(() => {
  if (window.__AUDIOPLUS_BANNER__) return;
  window.__AUDIOPLUS_BANNER__ = true;

  console.groupCollapsed(
    "%c AudioPlus ",
    `
      background: #7dd3fc;
      color: #0f172a;
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-family: system-ui, sans-serif;
    `
  );

  const logo = [
    "   ██    █",
    "  █ █     █",
    " █  █  █   █",
    "█   █  █   █",
    " █  █  █   █",
    "  █ █     █",
    "   ██    █"
    ];
    
    logo.forEach(line =>
      console.log(
        "%c" + line,
        "font-family:monospace;color:#0f172a;background:#7dd3fc;line-height:1"
      )
    );          

  console.log(
    "%cThis site uses AudioPlus.",
    "color:#0f172a;font-weight:500;font-family:system-ui,sans-serif;"
  );

  console.log(
    "%cWant to use it too? Try here!",
    "color:#2563eb;font-family:system-ui,sans-serif;"
  );

  console.log(
    "%chttps://example.com/docs",
    "color:#16a34a;text-decoration:underline;font-family:system-ui,sans-serif;"
  );

  console.groupEnd();
})();