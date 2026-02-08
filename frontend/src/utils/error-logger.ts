type FrontendErrorLog = {
  timestamp: string;
  component: string;
  method: string;
  message: string;
  stack?: string;
  resolved: boolean;
};

class FrontendErrorLogger {
  private storageKey = "app_errors";

  log(component: string, method: string, error: Error) {
    const errors = this.getErrors();

    const newLog: FrontendErrorLog = {
      timestamp: new Date().toISOString(),
      component,
      method,
      message: error.message,
      stack: error.stack,
      resolved: false,
    };

    errors.push(newLog);
    localStorage.setItem(this.storageKey, JSON.stringify(errors));
    // eslint-disable-next-line no-console
    console.error(`🔴 ERROR: ${component}.${method}`, error);
  }

  getErrors(): FrontendErrorLog[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

export const frontendErrorLogger = new FrontendErrorLogger();
