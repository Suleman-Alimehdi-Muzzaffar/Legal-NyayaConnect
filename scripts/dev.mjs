// Runs the web app and the API server together with a single `npm run dev`.
// Cross-platform (Windows/macOS/Linux): no bash `&`, no `concurrently` needed.
import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const npmCli = process.env.npm_execpath;

function spawnNpm(args) {
  if (npmCli) {
    return spawn(process.execPath, [npmCli, ...args], {
      stdio: ["inherit", "pipe", "pipe"],
    });
  }
  return spawn(npmCmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: isWindows,
  });
}

const tasks = [
  {
    name: "web",
    args: ["run", "dev", "--workspace", "@workspace/nyayaconnect"],
  },
  {
    name: "api",
    args: ["run", "dev", "--workspace", "@workspace/api-server"],
  },
];

const children = [];

for (const { name, args } of tasks) {
  const child = spawnNpm(args);

  const pipe = (stream, dest) => {
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      for (const line of text.split("\n")) {
        if (line.trim() !== "") dest(`[${name}] ${line}`);
      }
    });
  };
  pipe(child.stdout, console.log);
  pipe(child.stderr, console.error);

  child.on("error", (err) => {
    console.error(`[${name}] failed to start: ${err.message}`);
    stopChildren();
    process.exit(1);
  });
  child.on("exit", (code) => {
    console.error(`[${name}] stopped (exit code ${code})`);
    stopChildren();
    process.exit(code ?? 1);
  });

  children.push(child);
}

let stopping = false;
function stopChildren() {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    if (isWindows) {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    } else {
      child.kill("SIGTERM");
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stopChildren());
}
