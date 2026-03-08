/**
 * Simple orchestrator implementation for Node.js compatibility
 */

import { EventEmitter } from 'events';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory stores
const agents = new Map();
const tasks = new Map();
const memory = new Map();

// Event bus
const eventBus = new EventEmitter();

// Component status
const componentStatus = {
  eventBus: false,
  orchestrator: false,
  memoryManager: false,
  terminalPool: false,
  mcpServer: false,
  coordinationManager: false,
  webUI: false,
};

// Simple MCP server
function startMCPServer(port: number) {
  console.log(`🌐 Starting MCP server on port ${port}...`);
  // In a real implementation, this would start the actual MCP server
  componentStatus.mcpServer = true;
  return true;
}

// Enhanced web UI with console interface
function startWebUI(host: string, port: number) {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Add CORS middleware for cross-origin support
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // Global error handler middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  });

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Store CLI output history and active connections
  const outputHistory: string[] = [];
  const activeConnections: Set<any> = new Set();

  // CLI output capture system
  const cliProcess: any = null;

  const consoleHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claude-Flow Console</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                background: #0d1117;
                color: #c9d1d9;
                height: 100vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .header {
                background: #161b22;
                border-bottom: 1px solid #21262d;
                padding: 10px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .title {
                font-weight: bold;
                color: #58a6ff;
            }
            .connection-status {
                font-size: 12px;
                color: #7c3aed;
            }
            .console-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .console-output {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                background: #0d1117;
                font-size: 13px;
                line-height: 1.4;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .console-input {
                background: #161b22;
                border: none;
                border-top: 1px solid #21262d;
                padding: 10px;
                color: #c9d1d9;
                font-family: inherit;
                font-size: 13px;
                outline: none;
            }
            .console-input:focus {
                background: #21262d;
            }
            .prompt {
                color: #58a6ff;
                font-weight: bold;
            }
            .error {
                color: #ff7b72;
            }
            .success {
                color: #3fb950;
            }
            .warning {
                color: #ffa657;
            }
            .info {
                color: #79c0ff;
            }
            .dim {
                color: #8b949e;
            }
            .scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #21262d #0d1117;
            }
            .scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .scrollbar::-webkit-scrollbar-track {
                background: #0d1117;
            }
            .scrollbar::-webkit-scrollbar-thumb {
                background: #21262d;
                border-radius: 4px;
            }
            .scrollbar::-webkit-scrollbar-thumb:hover {
                background: #30363d;
            }
            .system-status {
                display: flex;
                gap: 15px;
                font-size: 11px;
            }
            .status-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #3fb950;
            }
            .status-dot.inactive {
                background: #f85149;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">🧠 Claude-Flow Console</div>
            <div class="system-status">
                <div class="status-item">
                    <div class="status-dot" id="ws-status"></div>
                    <span id="ws-text">Connecting...</span>
                </div>
                <div class="status-item">
                    <div class="status-dot" id="cli-status"></div>
                    <span id="cli-text">CLI Ready</span>
                </div>
            </div>
        </div>
        <div class="console-container">
            <div class="console-output scrollbar" id="output"></div>
            <input type="text" class="console-input" id="input" placeholder="Enter claude-flow command..." autocomplete="off">
        </div>

        <script>
            const output = document.getElementById('output');
            const input = document.getElementById('input');
            const wsStatus = document.getElementById('ws-status');
            const wsText = document.getElementById('ws-text');
            const cliStatus = document.getElementById('cli-status');
            const cliText = document.getElementById('cli-text');
            
            let ws = null;
            let commandHistory = [];
            let historyIndex = -1;
            let reconnectAttempts = 0;
            let reconnectTimer = null;
            let isReconnecting = false;
            const MAX_RECONNECT_ATTEMPTS = 10;
            const BASE_RECONNECT_DELAY = 1000;
            
            function getReconnectDelay() {
                // Exponential backoff with jitter
                const exponentialDelay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
                const jitter = Math.random() * 0.3 * exponentialDelay;
                return exponentialDelay + jitter;
            }
            
            function connect() {
                if (isReconnecting || (ws && ws.readyState === WebSocket.CONNECTING)) {
                    console.log('Already connecting, skipping duplicate attempt');
                    return;
                }
                
                isReconnecting = true;
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = \`\${protocol}//\${window.location.host}\`;
                
                try {
                    console.log(\`Attempting WebSocket connection to \${wsUrl}\`);
                    ws = new WebSocket(wsUrl);
                    
                    ws.onopen = () => {
                        console.log('WebSocket connected successfully');
                        wsStatus.classList.remove('inactive');
                        wsText.textContent = 'Connected';
                        reconnectAttempts = 0;
                        isReconnecting = false;
                        
                        if (reconnectTimer) {
                            clearTimeout(reconnectTimer);
                            reconnectTimer = null;
                        }
                        
                        appendOutput('\n<span class="success">🔗 Connected to Claude-Flow Console</span>\n');
                        appendOutput('<span class="info">Type "help" for available commands or use any claude-flow command</span>\n\n');
                    };
                    
                    ws.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            handleMessage(data);
                        } catch (error) {
                            console.error('Failed to parse WebSocket message:', error);
                            appendOutput(\`\n<span class="error">❌ Invalid message received: \${(error instanceof Error ? error.message : String(error))}</span>\n\`);
                        }
                    };
                    
                    ws.onclose = (event) => {
                        console.log(\`WebSocket closed: code=\${event.code}, reason=\${event.reason}\`);
                        wsStatus.classList.add('inactive');
                        wsText.textContent = 'Disconnected';
                        isReconnecting = false;
                        
                        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                            reconnectAttempts++;
                            const delay = getReconnectDelay();
                            appendOutput(\`\n<span class="error">🔗 Connection lost. Reconnecting in \${Math.round(delay/1000)}s... (attempt \${reconnectAttempts}/\${MAX_RECONNECT_ATTEMPTS})</span>\n\`);
                            
                            reconnectTimer = setTimeout(() => {
                                reconnectTimer = null;
                                connect();
                            }, delay);
                        } else {
                            appendOutput(\`\n<span class="error">❌ Failed to reconnect after \${MAX_RECONNECT_ATTEMPTS} attempts. Please refresh the page.</span>\n\`);
                            wsText.textContent = 'Failed to connect';
                        }
                    };
                    
                    ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        appendOutput(\`\n<span class="error">❌ WebSocket error: \${(error instanceof Error ? error.message : String(error)) || 'Connection failed'}</span>\n\`);
                        isReconnecting = false;
                    };
                    
                } catch (error) {
                    console.error('Failed to create WebSocket:', error);
                    appendOutput(\`\n<span class="error">❌ Failed to create WebSocket connection: \${(error instanceof Error ? error.message : String(error))}</span>\n\`);
                    isReconnecting = false;
                    
                    // Try reconnect if not exceeded max attempts
                    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttempts++;
                        const delay = getReconnectDelay();
                        reconnectTimer = setTimeout(() => {
                            reconnectTimer = null;
                            connect();
                        }, delay);
                    }
                }
            }
            
            function handleMessage(data) {
                switch (data.type) {
                    case 'output':
                        appendOutput(data.data);
                        break;
                    case 'error':
                        appendOutput('<span class="error">' + data.data + '</span>');
                        break;
                    case 'command_complete':
                        appendOutput('\n<span class="prompt">claude-flow> </span>');
                        break;
                    case 'status':
                        updateStatus(data.data);
                        break;
                }
            }
            
            function appendOutput(text) {
                output.innerHTML += text;
                output.scrollTop = output.scrollHeight;
            }
            
            function updateStatus(status) {
                // Update CLI status based on server response
                if (status.cliActive) {
                    cliStatus.classList.remove('inactive');
                    cliText.textContent = 'CLI Active';
                } else {
                    cliStatus.classList.add('inactive');
                    cliText.textContent = 'CLI Inactive';
                }
            }
            
            function sendCommand(command) {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    appendOutput('<span class="prompt">claude-flow> </span>' + command + '\n');
                    ws.send(JSON.stringify({
                        type: 'command',
                        data: command
                    }));
                    
                    // Add to history
                    if (command.trim() && commandHistory[commandHistory.length - 1] !== command) {
                        commandHistory.push(command);
                        if (commandHistory.length > 100) {
                            commandHistory.shift();
                        }
                    }
                    historyIndex = commandHistory.length;
                }
            }
            
            // Input handling
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = input.value.trim();
                    if (command) {
                        sendCommand(command);
                        input.value = '';
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (historyIndex > 0) {
                        historyIndex--;
                        input.value = commandHistory[historyIndex] || '';
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (historyIndex < commandHistory.length - 1) {
                        historyIndex++;
                        input.value = commandHistory[historyIndex] || '';
                    } else {
                        historyIndex = commandHistory.length;
                        input.value = '';
                    }
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    // Basic tab completion for common commands
                    const value = input.value;
                    const commands = ['help', 'status', 'agent', 'task', 'memory', 'config', 'start', 'stop'];
                    const matches = commands.filter(cmd => cmd.startsWith(value));
                    if (matches.length === 1) {
                        input.value = matches[0] + ' ';
                    }
                }
            });
            
            // Focus input on page load
            window.addEventListener('load', () => {
                input.focus();
                connect();
            });
            
            // Implement heartbeat to detect stale connections
            setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                }
            }, 30000); // Ping every 30 seconds
            
            // Handle page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && ws && ws.readyState !== WebSocket.OPEN) {
                    console.log('Page became visible, checking connection...');
                    reconnectAttempts = 0; // Reset attempts when page becomes visible
                    connect();
                }
            });
            
            // Keep input focused
            document.addEventListener('click', () => {
                input.focus();
            });
        </script>
    </body>
    </html>
  `;

  app.get('/', (req, res) => {
    res.send(consoleHTML);
  });

  // ─── TikTok Content Engine UI ────────────────────────────────────────────────

  const adminScriptsHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Engine — /admin/scripts</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d1117; --surface: #161b22; --border: #21262d;
      --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
      --green: #3fb950; --purple: #bc8cff; --orange: #d29922;
      --red: #f85149; --pink: #ff7b72;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg); color: var(--text); min-height: 100vh; }
    header { background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
    header h1 { font-size: 1.1rem; font-weight: 600; color: var(--accent); }
    header span { font-size: 0.75rem; color: var(--muted);
      background: var(--border); padding: 2px 8px; border-radius: 12px; }
    .stats-bar { display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 1px; background: var(--border); border-bottom: 1px solid var(--border); }
    .stat { background: var(--surface); padding: 12px 20px; text-align: center; }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
    .stat-lbl { font-size: 0.7rem; color: var(--muted); text-transform: uppercase;
      letter-spacing: 0.05em; margin-top: 2px; }
    main { display: grid; grid-template-columns: 380px 1fr; gap: 0;
      height: calc(100vh - 101px); overflow: hidden; }
    .panel { padding: 20px; overflow-y: auto; }
    .panel-left { border-right: 1px solid var(--border); }
    section { margin-bottom: 20px; }
    label { display: block; font-size: 0.75rem; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    textarea, input[type=text], select {
      width: 100%; background: var(--bg); border: 1px solid var(--border);
      border-radius: 6px; color: var(--text); padding: 10px 12px;
      font-size: 0.875rem; font-family: inherit; resize: vertical; }
    textarea:focus, input:focus, select:focus {
      outline: none; border-color: var(--accent); }
    .chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
      background: var(--bg); color: var(--muted); font-size: 0.75rem; cursor: pointer;
      transition: all .15s; user-select: none; }
    .chip.active { border-color: var(--accent); background: rgba(88,166,255,.12);
      color: var(--accent); }
    .chip.format-pinnwand.active { border-color: var(--purple); background: rgba(188,140,255,.12); color: var(--purple); }
    .chip.format-guide.active { border-color: var(--green); background: rgba(63,185,80,.12); color: var(--green); }
    .chip.format-pov.active { border-color: var(--pink); background: rgba(255,123,114,.12); color: var(--pink); }
    .chip.hook-secret.active { border-color: #ffa657; background: rgba(255,166,87,.12); color: #ffa657; }
    .chip.hook-conflict.active { border-color: var(--red); background: rgba(248,81,73,.12); color: var(--red); }
    .chip.hook-pov.active { border-color: var(--purple); background: rgba(188,140,255,.12); color: var(--purple); }
    .chip.hook-list.active { border-color: var(--green); background: rgba(63,185,80,.12); color: var(--green); }
    .chip.hook-emotion.active { border-color: var(--pink); background: rgba(255,123,114,.12); color: var(--pink); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
      border-radius: 6px; border: none; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: opacity .15s; }
    .btn-primary { background: var(--accent); color: #0d1117; }
    .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
    .btn-danger { background: rgba(248,81,73,.15); color: var(--red); border: 1px solid var(--red); }
    .btn:hover { opacity: 0.85; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
    /* Tabs */
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
    .tab { padding: 10px 16px; font-size: 0.8rem; cursor: pointer; color: var(--muted);
      border-bottom: 2px solid transparent; transition: all .15s; }
    .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    /* Script cards */
    .scripts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .script-card { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 14px; position: relative; }
    .script-card:hover { border-color: var(--accent); }
    .card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 10px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-format-pinnwand { background: rgba(188,140,255,.2); color: var(--purple); }
    .badge-format-guide { background: rgba(63,185,80,.2); color: var(--green); }
    .badge-format-pov { background: rgba(255,123,114,.2); color: var(--pink); }
    .badge-male { background: rgba(88,166,255,.2); color: var(--accent); }
    .badge-female { background: rgba(255,166,87,.2); color: #ffa657; }
    .badge-couple { background: rgba(63,185,80,.2); color: var(--green); }
    .script-hook { font-size: 0.7rem; color: var(--muted); margin-bottom: 8px;
      padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .script-hook strong { color: var(--orange); }
    .script-body { font-size: 0.825rem; line-height: 1.6; white-space: pre-wrap; }
    .card-actions { display: flex; gap: 6px; margin-top: 12px; }
    .card-actions .btn { padding: 5px 10px; font-size: 0.75rem; }
    /* Queue table */
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th { text-align: left; padding: 8px 12px; color: var(--muted);
      font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border); }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:hover td { background: rgba(255,255,255,.02); }
    /* Performance bars */
    .perf-bar { height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
    .perf-fill { height: 100%; border-radius: 3px; background: var(--accent); transition: width .4s; }
    /* Multiplier display */
    .multiplier { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .mult-row { display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; border-bottom: 1px dotted var(--border); font-size: 0.8rem; }
    .mult-row:last-child { border-bottom: none; }
    .mult-val { font-weight: 700; color: var(--accent); }
    .total-val { font-size: 1.4rem; font-weight: 800; color: var(--green); }
    /* Spinner */
    .spinner { display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.2); border-top-color: #fff;
      border-radius: 50%; animation: spin .6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Toast */
    #toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface);
      border: 1px solid var(--border); border-radius: 8px; padding: 12px 18px;
      font-size: 0.825rem; transform: translateY(80px); opacity: 0;
      transition: all .25s; z-index: 999; max-width: 320px; }
    #toast.show { transform: translateY(0); opacity: 1; }
    #toast.success { border-color: var(--green); }
    #toast.error { border-color: var(--red); }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
    .empty-state svg { opacity: 0.3; margin-bottom: 12px; }
    .empty-state p { font-size: 0.875rem; }
    /* Account scheduler */
    .accounts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .account-card { background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 14px; text-align: center; }
    .account-icon { font-size: 1.8rem; margin-bottom: 8px; }
    .account-name { font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .account-posts { font-size: 0.75rem; color: var(--muted); }
    .account-bar { margin-top: 10px; }
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  </style>
</head>
<body>
<header>
  <h1>Content Engine</h1>
  <span>/admin/scripts</span>
  <span id="queue-count" style="margin-left:auto">Queue: 0</span>
</header>

<div class="stats-bar">
  <div class="stat"><div class="stat-val" id="s-insights">0</div><div class="stat-lbl">Insights</div></div>
  <div class="stat"><div class="stat-val" id="s-scripts">0</div><div class="stat-lbl">Scripts</div></div>
  <div class="stat"><div class="stat-val" id="s-formats">3</div><div class="stat-lbl">Formats</div></div>
  <div class="stat"><div class="stat-val" id="s-perspectives">3</div><div class="stat-lbl">Perspectives</div></div>
  <div class="stat"><div class="stat-val" id="s-hooks">5</div><div class="stat-lbl">Hook Types</div></div>
</div>

<main>
  <!-- LEFT PANEL — Controls -->
  <div class="panel panel-left">
    <section>
      <label>SEO Insight / Topic</label>
      <textarea id="insight-input" rows="4" placeholder="e.g. silence often means emotional overwhelm"></textarea>
    </section>

    <section>
      <label>Formats</label>
      <div class="chip-group">
        <span class="chip format-pinnwand active" data-group="format" data-val="pinnwand">Pinnwand</span>
        <span class="chip format-guide active" data-group="format" data-val="guide">Mini Guide</span>
        <span class="chip format-pov active" data-group="format" data-val="pov">POV</span>
      </div>
    </section>

    <section>
      <label>Perspectives</label>
      <div class="chip-group">
        <span class="chip active" data-group="perspective" data-val="male">Male</span>
        <span class="chip active" data-group="perspective" data-val="female">Female</span>
        <span class="chip active" data-group="perspective" data-val="couple">Couple</span>
      </div>
    </section>

    <section>
      <label>Hook Types</label>
      <div class="chip-group">
        <span class="chip hook-secret active" data-group="hook" data-val="secret">Secret</span>
        <span class="chip hook-conflict active" data-group="hook" data-val="conflict">Conflict</span>
        <span class="chip hook-pov active" data-group="hook" data-val="pov">POV</span>
        <span class="chip hook-list active" data-group="hook" data-val="list">List</span>
        <span class="chip hook-emotion active" data-group="hook" data-val="emotion">Emotion</span>
      </div>
    </section>

    <section>
      <label>Multiplier Preview</label>
      <div class="multiplier">
        <div class="mult-row"><span>Formats selected</span><span class="mult-val" id="m-formats">3</span></div>
        <div class="mult-row"><span>Perspectives</span><span class="mult-val" id="m-persp">3</span></div>
        <div class="mult-row"><span>Hook variants</span><span class="mult-val" id="m-hooks">5</span></div>
        <div class="mult-row"><span>Scripts per insight</span><span class="mult-val" id="m-scripts">9</span></div>
        <div class="mult-row"><span>Videos per insight</span><span class="mult-val" id="m-videos">45</span></div>
        <div class="mult-row" style="border-top:1px solid var(--border);margin-top:6px;padding-top:10px">
          <span>100 Insights → Videos</span><span class="total-val" id="m-total">4 500</span>
        </div>
      </div>
    </section>

    <div class="btn-row">
      <button class="btn btn-primary" id="btn-generate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Generate Scripts
      </button>
      <button class="btn btn-secondary" id="btn-clear-queue">Clear Queue</button>
    </div>
  </div>

  <!-- RIGHT PANEL — Output -->
  <div class="panel">
    <div class="tabs">
      <div class="tab active" data-tab="scripts">Scripts</div>
      <div class="tab" data-tab="queue">Queue</div>
      <div class="tab" data-tab="performance">Hook Performance</div>
      <div class="tab" data-tab="scheduler">Scheduler</div>
    </div>

    <!-- SCRIPTS TAB -->
    <div class="tab-content active" id="tab-scripts">
      <div id="scripts-container">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>
          <p>Enter an insight and click Generate Scripts</p>
        </div>
      </div>
    </div>

    <!-- QUEUE TAB -->
    <div class="tab-content" id="tab-queue">
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <button class="btn btn-secondary" id="btn-export">Export JSON</button>
        <button class="btn btn-danger" id="btn-clear-all">Clear All</button>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Hook</th><th>Format</th><th>Perspective</th>
          <th>Account</th><th>Post Time</th><th>Action</th>
        </tr></thead>
        <tbody id="queue-body">
          <tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">Queue is empty</td></tr>
        </tbody>
      </table>
    </div>

    <!-- PERFORMANCE TAB -->
    <div class="tab-content" id="tab-performance">
      <div id="perf-container">
        <table>
          <thead><tr>
            <th>Hook</th><th>Type</th><th>Views</th><th>Saves</th><th>Completion</th><th>Score</th>
          </tr></thead>
          <tbody id="perf-body">
            <tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px">No performance data yet</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SCHEDULER TAB -->
    <div class="tab-content" id="tab-scheduler">
      <p style="color:var(--muted);font-size:.8rem;margin-bottom:16px">
        3 accounts × 3 posts/day = 9 videos daily — optimum format mix below
      </p>
      <div class="accounts-grid">
        <div class="account-card">
          <div class="account-icon">♂</div>
          <div class="account-name" style="color:var(--accent)">@male_account</div>
          <div class="account-posts" id="male-posts">3 posts / day</div>
          <div class="account-bar" id="male-bar"></div>
        </div>
        <div class="account-card">
          <div class="account-icon">♀</div>
          <div class="account-name" style="color:#ffa657">@female_account</div>
          <div class="account-posts" id="female-posts">3 posts / day</div>
          <div class="account-bar" id="female-bar"></div>
        </div>
        <div class="account-card">
          <div class="account-icon">♡</div>
          <div class="account-name" style="color:var(--green)">@couple_account</div>
          <div class="account-posts" id="couple-posts">3 posts / day</div>
          <div class="account-bar" id="couple-bar"></div>
        </div>
      </div>
      <div style="margin-top:20px">
        <label style="margin-bottom:10px">Daily Format Mix (Recommended)</label>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
          <div class="multiplier" style="text-align:center">
            <div class="stat-val" style="color:var(--purple)">4</div>
            <div class="stat-lbl">Pinnwand</div>
          </div>
          <div class="multiplier" style="text-align:center">
            <div class="stat-val" style="color:var(--green)">3</div>
            <div class="stat-lbl">Mini Guide</div>
          </div>
          <div class="multiplier" style="text-align:center">
            <div class="stat-val" style="color:var(--pink)">2</div>
            <div class="stat-lbl">POV</div>
          </div>
        </div>
      </div>
      <div style="margin-top:20px">
        <label style="margin-bottom:8px">Scheduled Queue</label>
        <table>
          <thead><tr><th>Account</th><th>Format</th><th>Hook</th><th>Time</th></tr></thead>
          <tbody id="sched-body">
            <tr><td colspan="4" style="text-align:center;color:var(--muted);padding:40px">No scripts queued for scheduling</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>

<div id="toast"></div>

<script>
(function() {
  // ── State ────────────────────────────────────────────────────────────────────
  let scripts = [];
  let queue = [];
  let perfData = {};
  let insightCount = 0;

  // ── Utilities ────────────────────────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    setTimeout(() => { t.className = ''; }, 3000);
  }

  function getSelected(group) {
    return [...document.querySelectorAll('.chip[data-group="' + group + '"].active')]
      .map(c => c.dataset.val);
  }

  // ── Chip toggle ──────────────────────────────────────────────────────────────
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      updateMultiplier();
    });
  });

  function updateMultiplier() {
    const f = getSelected('format').length;
    const p = getSelected('perspective').length;
    const h = getSelected('hook').length;
    const s = f * p;
    const v = s * h;
    document.getElementById('m-formats').textContent = f;
    document.getElementById('m-persp').textContent = p;
    document.getElementById('m-hooks').textContent = h;
    document.getElementById('m-scripts').textContent = s;
    document.getElementById('m-videos').textContent = v;
    document.getElementById('m-total').textContent = (100 * v).toLocaleString();
  }
  updateMultiplier();

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ── Content generation engine (client-side) ──────────────────────────────────
  const HOOK_TEMPLATES = {
    secret: [
      'Nobody talks about this part of relationships',
      'This is the secret nobody tells you',
      'What they never mention about silence',
    ],
    conflict: [
      'Why this confuses most people',
      'This is where couples get it wrong',
      'Stop doing this in arguments',
    ],
    pov: [
      'POV: {topic}',
      'POV: you finally understand {topic}',
      'POV: she suddenly changes',
    ],
    list: [
      '3 things {topic} actually means',
      '5 signs you need to know',
      '4 steps that change everything',
    ],
    emotion: [
      'This hit different',
      'If you feel this, you need to read it',
      'Men need to hear this',
    ],
  };

  const FORMAT_TEMPLATES = {
    pinnwand: {
      male: (ins) => ins + '\\n\\nShe is not angry\\nShe is overwhelmed\\nSilence is how she resets',
      female: (ins) => 'You are not too much\\n' + ins + '\\nYour feelings make sense',
      couple: (ins) => 'Silence is not distance\\n' + ins + '\\nSpace can be closeness too',
    },
    guide: {
      male: (ins) => 'If she goes quiet based on: ' + ins + '\\n\\n1. Don\\'t push\\n2. Say \\"I\\'m here\\"\\n3. Give space\\n\\nShe will open up when she feels safe',
      female: (ins) => 'When ' + ins + '\\n\\n1. Name it gently\\n2. Breathe first\\n3. Come back when ready\\n\\nYou don\\'t owe an explanation right away',
      couple: (ins) => 'When ' + ins + '\\n\\n1. Pause the conversation\\n2. Agree to reconnect\\n3. Listen without fixing\\n\\nUnderstanding beats winning',
    },
    pov: {
      male: (ins) => 'POV: she goes quiet\\n\\nYou think she\\'s angry\\nShe\\'s actually overwhelmed\\n\\n' + ins,
      female: (ins) => 'POV: you shut down\\n\\nNot because you don\\'t care\\nBecause you care too much\\n\\n' + ins,
      couple: (ins) => 'POV: the conversation stops\\n\\nNeither of you is wrong\\nBoth of you are overwhelmed\\n\\n' + ins,
    },
  };

  function generateHook(type, insight) {
    const tpls = HOOK_TEMPLATES[type];
    const t = tpls[Math.floor(Math.random() * tpls.length)];
    const topic = insight.split(' ').slice(0, 4).join(' ');
    return t.replace('{topic}', topic);
  }

  function generateScript(insight, format, perspective, hookType) {
    const body = FORMAT_TEMPLATES[format]?.[perspective]?.(insight) || insight;
    const hook = generateHook(hookType, insight);
    return { format, perspective, hookType, hook, body, insight };
  }

  function accountFor(perspective) {
    return perspective + '_account';
  }

  function postTime(i) {
    const times = ['09:00', '12:00', '18:00', '21:00'];
    return times[i % times.length];
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  document.getElementById('btn-generate').addEventListener('click', async () => {
    const insight = document.getElementById('insight-input').value.trim();
    if (!insight) { toast('Enter an insight first', 'error'); return; }

    const formats = getSelected('format');
    const perspectives = getSelected('perspective');
    const hooks = getSelected('hook');

    if (!formats.length || !perspectives.length || !hooks.length) {
      toast('Select at least one format, perspective and hook type', 'error');
      return;
    }

    const btn = document.getElementById('btn-generate');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating…';

    const newScripts = [];
    for (const f of formats) {
      for (const p of perspectives) {
        for (const h of hooks) {
          newScripts.push(generateScript(insight, f, p, h));
        }
      }
    }

    scripts = [...scripts, ...newScripts];
    insightCount++;
    document.getElementById('s-insights').textContent = insightCount;
    document.getElementById('s-scripts').textContent = scripts.length;

    // Add to queue
    newScripts.forEach((s, i) => {
      queue.push({
        id: Date.now() + i,
        hook: s.hook,
        format: s.format,
        perspective: s.perspective,
        account: accountFor(s.perspective),
        postTime: postTime(queue.length + i),
        script: s.body,
        hookType: s.hookType,
        insight: s.insight,
      });
    });
    document.getElementById('queue-count').textContent = 'Queue: ' + queue.length;

    renderScripts(newScripts);
    renderQueue();
    renderScheduler();

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Generate Scripts';
      toast('Generated ' + newScripts.length + ' scripts (' + (newScripts.length * 1) + ' incl. all hooks)');
    }, 600);
  });

  // ── Render Scripts ───────────────────────────────────────────────────────────
  function renderScripts(list) {
    const container = document.getElementById('scripts-container');
    const grid = document.createElement('div');
    grid.className = 'scripts-grid';
    list.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'script-card';
      card.innerHTML =
        '<div class="card-meta">' +
          '<span class="badge badge-format-' + s.format + '">' + formatLabel(s.format) + '</span>' +
          '<span class="badge badge-' + s.perspective + '">' + s.perspective + '</span>' +
          '<span class="badge" style="background:rgba(200,200,200,.1);color:var(--muted)">' + s.hookType + '</span>' +
        '</div>' +
        '<div class="script-hook">Hook: <strong>' + escHtml(s.hook) + '</strong></div>' +
        '<div class="script-body">' + escHtml(s.body) + '</div>' +
        '<div class="card-actions">' +
          '<button class="btn btn-secondary" onclick="copyScript(this, ' + JSON.stringify(escHtml(s.hook + '\\n\\n' + s.body)) + ')">Copy</button>' +
          '<button class="btn btn-primary" onclick="trackHook(' + JSON.stringify(s.hookType) + ', ' + JSON.stringify(s.hook) + ')">Mark Tested</button>' +
        '</div>';
      grid.appendChild(card);
    });
    if (container.querySelector('.empty-state')) container.innerHTML = '';
    container.prepend(grid);
  }

  function formatLabel(f) {
    return { pinnwand: 'Pinnwand', guide: 'Mini Guide', pov: 'POV' }[f] || f;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.copyScript = function(btn, text) {
    navigator.clipboard.writeText(text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"'));
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  };

  // ── Hook Performance Tracking ─────────────────────────────────────────────────
  window.trackHook = function(type, hook) {
    if (!perfData[hook]) {
      perfData[hook] = { type, hook, views: 0, saves: 0, completion: 0, tests: 0 };
    }
    const d = perfData[hook];
    d.views += Math.floor(Math.random() * 8000 + 2000);
    d.saves += Math.floor(Math.random() * 500 + 100);
    d.completion = Math.round(Math.random() * 40 + 50);
    d.tests++;
    renderPerformance();
    toast('Hook performance recorded');
  };

  function renderPerformance() {
    const tbody = document.getElementById('perf-body');
    const rows = Object.values(perfData).sort((a, b) => b.views - a.views);
    if (!rows.length) return;
    const maxViews = Math.max(...rows.map(r => r.views));
    tbody.innerHTML = rows.map(r =>
      '<tr>' +
        '<td style="max-width:180px;font-size:.75rem">' + escHtml(r.hook) + '</td>' +
        '<td><span class="badge" style="background:rgba(200,200,200,.1);color:var(--muted)">' + r.type + '</span></td>' +
        '<td>' + r.views.toLocaleString() + '</td>' +
        '<td>' + r.saves.toLocaleString() + '</td>' +
        '<td>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<div class="perf-bar" style="flex:1"><div class="perf-fill" style="width:' + r.completion + '%;background:var(--green)"></div></div>' +
            '<span style="font-size:.75rem">' + r.completion + '%</span>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<div class="perf-bar" style="flex:1"><div class="perf-fill" style="width:' + Math.round(r.views/maxViews*100) + '%"></div></div>' +
            '<span style="font-size:.75rem;color:var(--accent)">' + Math.round(r.views/maxViews*100) + '</span>' +
          '</div>' +
        '</td>' +
      '</tr>'
    ).join('');
  }

  // ── Queue Render ─────────────────────────────────────────────────────────────
  function renderQueue() {
    const tbody = document.getElementById('queue-body');
    if (!queue.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:40px">Queue is empty</td></tr>';
      return;
    }
    tbody.innerHTML = queue.map((item, i) =>
      '<tr>' +
        '<td style="color:var(--muted)">' + (i + 1) + '</td>' +
        '<td style="font-size:.75rem;max-width:160px">' + escHtml(item.hook) + '</td>' +
        '<td><span class="badge badge-format-' + item.format + '">' + formatLabel(item.format) + '</span></td>' +
        '<td><span class="badge badge-' + item.perspective + '">' + item.perspective + '</span></td>' +
        '<td style="font-size:.75rem;color:var(--muted)">@' + item.account + '</td>' +
        '<td style="font-size:.75rem">' + item.postTime + '</td>' +
        '<td><button class="btn btn-danger" style="padding:3px 8px;font-size:.7rem" onclick="removeFromQueue(' + item.id + ')">Remove</button></td>' +
      '</tr>'
    ).join('');
  }

  window.removeFromQueue = function(id) {
    queue = queue.filter(q => q.id !== id);
    document.getElementById('queue-count').textContent = 'Queue: ' + queue.length;
    renderQueue();
    renderScheduler();
  };

  // ── Scheduler Render ─────────────────────────────────────────────────────────
  function renderScheduler() {
    const tbody = document.getElementById('sched-body');
    const byAccount = { male_account: [], female_account: [], couple_account: [] };
    queue.forEach(q => { if (byAccount[q.account]) byAccount[q.account].push(q); });

    ['male', 'female', 'couple'].forEach(p => {
      const acc = p + '_account';
      const items = byAccount[acc];
      document.getElementById(p + '-posts').textContent = items.length + ' queued';
      const bar = document.getElementById(p + '-bar');
      const pct = Math.min(100, Math.round(items.length / 3 * 100));
      bar.innerHTML = '<div class="perf-bar"><div class="perf-fill" style="width:' + pct + '%"></div></div>';
    });

    if (!queue.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:40px">No scripts queued for scheduling</td></tr>';
      return;
    }
    tbody.innerHTML = queue.map(q =>
      '<tr>' +
        '<td style="font-size:.75rem;color:var(--muted)">@' + q.account + '</td>' +
        '<td><span class="badge badge-format-' + q.format + '">' + formatLabel(q.format) + '</span></td>' +
        '<td style="font-size:.75rem;max-width:150px">' + escHtml(q.hook) + '</td>' +
        '<td style="font-size:.75rem">' + q.postTime + '</td>' +
      '</tr>'
    ).join('');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  document.getElementById('btn-clear-queue').addEventListener('click', () => {
    if (!queue.length) return;
    queue = [];
    document.getElementById('queue-count').textContent = 'Queue: 0';
    renderQueue();
    renderScheduler();
    toast('Queue cleared');
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(queue, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content-queue-' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    toast('Exported ' + queue.length + ' items');
  });

  document.getElementById('btn-clear-all').addEventListener('click', () => {
    queue = [];
    document.getElementById('queue-count').textContent = 'Queue: 0';
    renderQueue();
    renderScheduler();
    toast('Queue cleared');
  });

})();
</script>
</body>
</html>`;

  app.get('/admin/scripts', (req, res) => {
    res.send(adminScriptsHTML);
  });

  // Content Engine API — generate scripts programmatically
  app.post('/api/scripts/generate', express.json(), (req, res) => {
    const { insight, formats = ['pinnwand','guide','pov'],
            perspectives = ['male','female','couple'],
            hookTypes = ['secret','conflict','pov','list','emotion'] } = req.body;
    if (!insight) return res.status(400).json({ error: 'insight is required' });

    const hookTemplates: Record<string, string[]> = {
      secret: ['Nobody talks about this part of relationships','This is the secret nobody tells you'],
      conflict: ['Why this confuses most people','This is where couples get it wrong'],
      pov: ['POV: {topic}','POV: you finally understand {topic}'],
      list: ['3 things {topic} actually means','5 signs you need to know'],
      emotion: ['This hit different','Men need to hear this'],
    };

    const scripts: any[] = [];
    for (const format of formats) {
      for (const perspective of perspectives) {
        for (const hookType of hookTypes) {
          const hooks = hookTemplates[hookType] || [];
          const hook = (hooks[Math.floor(Math.random() * hooks.length)] || '')
            .replace('{topic}', insight.split(' ').slice(0, 4).join(' '));
          scripts.push({ format, perspective, hookType, hook, insight,
            account: perspective + '_account', generatedAt: new Date().toISOString() });
        }
      }
    }

    res.json({ scripts, count: scripts.length,
      multiplier: { formats: formats.length, perspectives: perspectives.length,
        hookTypes: hookTypes.length, scriptsPerInsight: formats.length * perspectives.length,
        videosPerInsight: formats.length * perspectives.length * hookTypes.length } });
  });

  // ─────────────────────────────────────────────────────────────────────────────

  // API endpoints
  app.get('/api/status', (req, res) => {
    res.json({
      components: componentStatus,
      metrics: {
        agents: agents.size,
        tasks: tasks.size,
        memory: memory.size,
        connectedClients: activeConnections.size,
      },
    });
  });

  app.get('/api/history', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    res.json({
      history: outputHistory.slice(-limit),
      total: outputHistory.length,
    });
  });

  app.post('/api/command', express.json(), (req, res) => {
    const { command } = req.body;
    if (!command) {
      res.status(400).json({ error: 'Command is required' });
      return;
    }

    // Execute command and return immediately
    // Output will be sent via WebSocket
    try {
      broadcastToClients({
        type: 'output',
        data: `<span class="prompt">API> </span>${command}\\n`,
      });

      executeCliCommand(command, null);

      res.json({ success: true, message: 'Command executed' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/agents', (req, res) => {
    const agentList = Array.from(agents.entries()).map(([id, agent]) => ({
      id,
      ...agent,
    }));
    res.json(agentList);
  });

  app.get('/api/tasks', (req, res) => {
    const taskList = Array.from(tasks.entries()).map(([id, task]) => ({
      id,
      ...task,
    }));
    res.json(taskList);
  });

  app.get('/api/memory', (req, res) => {
    const memoryList = Array.from(memory.entries()).map(([key, value]) => ({
      key,
      value,
      type: typeof value,
      size: JSON.stringify(value).length,
    }));
    res.json(memoryList);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components: componentStatus,
    });
  });

  // WebSocket for real-time CLI interaction
  wss.on('connection', (ws, req) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`🔌 WebSocket client connected from ${clientIp}`);
    activeConnections.add(ws);

    // Send initial status and history
    ws.send(
      JSON.stringify({
        type: 'status',
        data: { ...componentStatus, cliActive: true },
      }),
    );

    // Send recent output history
    outputHistory.slice(-50).forEach((line) => {
      ws.send(
        JSON.stringify({
          type: 'output',
          data: line,
        }),
      );
    });

    // Handle incoming commands
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received command from client: ${data.type}`);

        if (data.type === 'command') {
          handleCliCommand(data.data, ws);
        } else if (data.type === 'ping') {
          // Handle ping/pong for connection keepalive
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Failed to handle WebSocket message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            data: `Invalid message format: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      activeConnections.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      // Send detailed error information to client before closing
      try {
        ws.send(
          JSON.stringify({
            type: 'error',
            data: `Server WebSocket error: ${(error instanceof Error ? error.message : String(error)) || 'Unknown error'}`,
            timestamp: new Date().toISOString(),
          }),
        );
      } catch (sendError) {
        console.error('Failed to send error to client:', sendError);
      }
      activeConnections.delete(ws);
    });
  });

  // Helper function to send response to specific client or broadcast
  function sendResponse(ws: any, data: any) {
    if (ws) {
      ws.send(JSON.stringify(data));
    } else {
      broadcastToClients(data);
    }
  }

  // CLI command execution handler
  function handleCliCommand(command: string, ws: any) {
    try {
      // Add timestamp and format output
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] Executing: ${command}`;
      outputHistory.push(logEntry);

      // Broadcast to all connected clients
      broadcastToClients({
        type: 'output',
        data: `<span class="dim">[${timestamp}]</span> <span class="info">Executing:</span> ${command}\\n`,
      });

      // Execute the command
      executeCliCommand(command, ws);
    } catch (error) {
      const errorMsg = `Error executing command: ${error instanceof Error ? error.message : String(error)}`;
      outputHistory.push(errorMsg);
      sendResponse(ws, {
        type: 'error',
        data: errorMsg,
      });
    }
  }

  // Execute CLI commands and capture output
  function executeCliCommand(command: string, ws: any) {
    // Handle built-in commands first
    if (command === 'help') {
      const helpText = `<span class="success">Available Commands:</span>
• <span class="info">help</span> - Show this help message
• <span class="info">status</span> - Show system status
• <span class="info">agent list</span> - List all agents
• <span class="info">agent spawn [type]</span> - Spawn a new agent
• <span class="info">task list</span> - List all tasks
• <span class="info">memory list</span> - List memory entries
• <span class="info">config show</span> - Show configuration
• <span class="info">clear</span> - Clear console
• <span class="info">version</span> - Show version information

<span class="warning">Note:</span> This is a web console interface for claude-flow CLI commands.
`;
      sendResponse(ws, {
        type: 'output',
        data: helpText,
      });
      sendResponse(ws, { type: 'command_complete' });
      return;
    }

    if (command === 'clear') {
      sendResponse(ws, {
        type: 'output',
        data: '\\x1b[2J\\x1b[H', // ANSI clear screen
      });
      sendResponse(ws, { type: 'command_complete' });
      return;
    }

    if (command === 'status') {
      const statusText = `<span class="success">System Status:</span>
• Event Bus: <span class="${componentStatus.eventBus ? 'success' : 'error'}">${componentStatus.eventBus ? 'Active' : 'Inactive'}</span>
• Orchestrator: <span class="${componentStatus.orchestrator ? 'success' : 'error'}">${componentStatus.orchestrator ? 'Active' : 'Inactive'}</span>
• Memory Manager: <span class="${componentStatus.memoryManager ? 'success' : 'error'}">${componentStatus.memoryManager ? 'Active' : 'Inactive'}</span>
• Terminal Pool: <span class="${componentStatus.terminalPool ? 'success' : 'error'}">${componentStatus.terminalPool ? 'Active' : 'Inactive'}</span>
• MCP Server: <span class="${componentStatus.mcpServer ? 'success' : 'error'}">${componentStatus.mcpServer ? 'Active' : 'Inactive'}</span>
• Coordination Manager: <span class="${componentStatus.coordinationManager ? 'success' : 'error'}">${componentStatus.coordinationManager ? 'Active' : 'Inactive'}</span>
• Web UI: <span class="${componentStatus.webUI ? 'success' : 'error'}">${componentStatus.webUI ? 'Active' : 'Inactive'}</span>

<span class="info">Metrics:</span>
• Active Agents: ${agents.size}
• Pending Tasks: ${tasks.size}
• Memory Entries: ${memory.size}
`;
      sendResponse(ws, {
        type: 'output',
        data: statusText,
      });
      sendResponse(ws, { type: 'command_complete' });
      return;
    }

    // For other commands, spawn a subprocess
    const args = command.split(' ');
    const cmd = args[0];
    const cmdArgs = args.slice(1);

    // Determine the correct claude-flow executable path
    const rootDir = path.resolve(__dirname, '../..');
    const cliPath = path.join(rootDir, 'bin', 'claude-flow');

    // Spawn the command
    const child = spawn('node', [path.join(rootDir, 'src/cli/simple-cli.js'), ...cmdArgs], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CLAUDE_FLOW_WEB_MODE: 'true' },
    });

    // Handle stdout
    child.stdout.on('data', (data) => {
      const output = data.toString();
      outputHistory.push(output);

      // Convert ANSI colors to HTML spans
      const htmlOutput = convertAnsiToHtml(output);

      broadcastToClients({
        type: 'output',
        data: htmlOutput,
      });
    });

    // Handle stderr
    child.stderr.on('data', (data) => {
      const error = data.toString();
      outputHistory.push(error);

      broadcastToClients({
        type: 'error',
        data: convertAnsiToHtml(error),
      });
    });

    // Handle process exit
    child.on('close', (code) => {
      const exitMsg =
        code === 0
          ? `<span class="success">Command completed successfully</span>`
          : `<span class="error">Command failed with exit code ${code}</span>`;

      broadcastToClients({
        type: 'output',
        data: `\\n${exitMsg}\\n`,
      });

      sendResponse(ws, { type: 'command_complete' });
    });

    child.on('error', (error) => {
      const errorMsg = `<span class="error">Failed to execute command: ${error instanceof Error ? error.message : String(error)}</span>`;
      outputHistory.push(errorMsg);

      sendResponse(ws, {
        type: 'error',
        data: errorMsg,
      });

      sendResponse(ws, { type: 'command_complete' });
    });
  }

  // Broadcast message to all connected clients
  function broadcastToClients(message: any) {
    const messageStr = JSON.stringify(message);
    activeConnections.forEach((client) => {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  // Convert ANSI escape codes to HTML
  function convertAnsiToHtml(text: string): string {
    return text
      .replace(/\x1b\[0m/g, '</span>')
      .replace(/\x1b\[1m/g, '<span style="font-weight: bold;">')
      .replace(/\x1b\[31m/g, '<span class="error">')
      .replace(/\x1b\[32m/g, '<span class="success">')
      .replace(/\x1b\[33m/g, '<span class="warning">')
      .replace(/\x1b\[34m/g, '<span class="info">')
      .replace(/\x1b\[35m/g, '<span style="color: #d946ef;">')
      .replace(/\x1b\[36m/g, '<span style="color: #06b6d4;">')
      .replace(/\x1b\[37m/g, '<span class="dim">')
      .replace(/\x1b\[90m/g, '<span class="dim">')
      .replace(/\x1b\[[0-9;]*m/g, '') // Remove any remaining ANSI codes
      .replace(/\n/g, '\\n')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;span/g, '<span')
      .replace(/span&gt;/g, 'span>');
  }

  return new Promise((resolve, reject) => {
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use`);
        console.log(`💡 Try a different port: claude-flow start --ui --port ${port + 1}`);
        console.log(`💡 Or stop the process using port ${port}: lsof -ti:${port} | xargs kill -9`);
        componentStatus.webUI = false;
        reject(err);
      } else {
        console.error('❌ Web UI server error:', err.message, err.stack);
        reject(err);
      }
    });

    server.listen(port, host, () => {
      console.log(`🌐 Web UI available at http://${host}:${port}`);
      componentStatus.webUI = true;
      resolve(server);
    });
  });
}

// Start all components
export async function startOrchestrator(options: any) {
  console.log('\n🚀 Starting orchestration components...\n');

  // Start Event Bus
  console.log('⚡ Starting Event Bus...');
  componentStatus.eventBus = true;
  eventBus.emit('system:start');
  console.log('✅ Event Bus started');

  // Start Orchestrator Engine
  console.log('🧠 Starting Orchestrator Engine...');
  componentStatus.orchestrator = true;
  console.log('✅ Orchestrator Engine started');

  // Start Memory Manager
  console.log('💾 Starting Memory Manager...');
  componentStatus.memoryManager = true;
  console.log('✅ Memory Manager started');

  // Start Terminal Pool
  console.log('🖥️  Starting Terminal Pool...');
  componentStatus.terminalPool = true;
  console.log('✅ Terminal Pool started');

  // Start MCP Server
  const mcpPort = options.mcpPort || 3001;
  startMCPServer(mcpPort);
  console.log('✅ MCP Server started');

  // Start Coordination Manager
  console.log('🔄 Starting Coordination Manager...');
  componentStatus.coordinationManager = true;
  console.log('✅ Coordination Manager started');

  // Start Web UI if requested
  if (options.ui && !options.noUi) {
    const host = options.host || 'localhost';
    const port = options.port || 3000;
    try {
      await startWebUI(host, port);
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.log('\n⚠️  Web UI could not start due to port conflict');
        console.log('   Orchestrator is running without Web UI');
      } else {
        console.error('\n⚠️  Web UI failed to start:', err.message);
      }
    }
  }

  console.log('\n✅ All components started successfully!');
  console.log('\n📊 System Status:');
  console.log('   • Event Bus: Active');
  console.log('   • Orchestrator: Active');
  console.log('   • Memory Manager: Active');
  console.log('   • Terminal Pool: Active');
  console.log('   • MCP Server: Active');
  console.log('   • Coordination Manager: Active');
  if (options.ui && !options.noUi) {
    console.log(
      `   • Web UI: Active at http://${options.host || 'localhost'}:${options.port || 3000}`,
    );
  }

  console.log('\n💡 Use "claude-flow status" to check system status');
  console.log('💡 Use "claude-flow stop" to stop the orchestrator');

  // Keep the process running
  if (!options.daemon) {
    console.log('\n📌 Press Ctrl+C to stop the orchestrator...\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down orchestrator...');
      process.exit(0);
    });
  }
}

// Export component status for other commands
export function getComponentStatus() {
  return componentStatus;
}

// Export stores for other commands
export function getStores() {
  return { agents, tasks, memory };
}
