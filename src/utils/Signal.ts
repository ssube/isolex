export const SIGNAL_RELOAD: Array<NodeJS.Signals> = ['SIGHUP'];
export const SIGNAL_STOP: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM'];

export function signal(signals: Array<NodeJS.Signals>): Promise<void> {
  return new Promise((res, _) => {
    function handler() {
      for (const sig of signals) {
        process.removeListener(sig, handler);
      }
      res();
    }

    for (const sig of signals) {
      process.on(sig, handler);
    }
  });
}
