export class ControllerLink extends EventTarget {
  constructor(serial = navigator.serial) {
    super();
    this.serial = serial;
    this.port = null;
    this.writer = null;
    this.writeChain = Promise.resolve();
  }

  get connected() { return Boolean(this.writer); }

  async connect() {
    if (!this.serial) throw new Error("Web Serial is unavailable; use desktop Chromium on localhost");
    this.port = await this.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.writer = this.port.writable.getWriter();
    this.dispatchEvent(new Event("change"));
  }

  send(command) {
    if (!this.writer) return Promise.resolve(false);
    const bytes = new TextEncoder().encode(command);
    this.writeChain = this.writeChain.then(() => this.writer?.write(bytes)).then(() => true);
    return this.writeChain;
  }

  async disconnect() {
    if (!this.port) return;
    await this.writeChain.catch(() => {});
    this.writer?.releaseLock();
    this.writer = null;
    await this.port.close();
    this.port = null;
    this.dispatchEvent(new Event("change"));
  }
}
