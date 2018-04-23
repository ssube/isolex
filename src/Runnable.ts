export interface Runnable {
  start(): Promise<void>;
  stop(): Promise<void>;
}
