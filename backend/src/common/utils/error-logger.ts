import * as fs from "fs";
import * as path from "path";

interface ErrorLog {
  timestamp: string;
  file: string;
  function: string;
  error: string;
  stack?: string;
  resolved: boolean;
}

class ErrorLogger {
  private logPath = path.join(process.cwd(), "logs", "errors.json");

  constructor() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, JSON.stringify([], null, 2));
    }
  }

  log(file: string, functionName: string, error: Error) {
    const logs = this.readLogs();

    const newLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      file,
      function: functionName,
      error: error.message,
      stack: error.stack,
      resolved: false,
    };

    logs.push(newLog);
    fs.writeFileSync(this.logPath, JSON.stringify(logs, null, 2));

    // eslint-disable-next-line no-console
    console.error(`🔴 ERROR LOGGED: ${file} -> ${functionName}`);
  }

  markResolved(index: number) {
    const logs = this.readLogs();
    if (logs[index]) {
      logs[index].resolved = true;
      fs.writeFileSync(this.logPath, JSON.stringify(logs, null, 2));
    }
  }

  getUnresolved(): ErrorLog[] {
    return this.readLogs().filter((log) => !log.resolved);
  }

  private readLogs(): ErrorLog[] {
    const data = fs.readFileSync(this.logPath, "utf-8");
    return JSON.parse(data);
  }
}

export const errorLogger = new ErrorLogger();
