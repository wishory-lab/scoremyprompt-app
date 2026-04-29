declare module 'jszip' {
  interface JSZipObject {
    name: string;
    dir: boolean;
    async(type: string): Promise<unknown>;
  }

  class JSZip {
    file(name: string, data: string | Uint8Array | ArrayBuffer | Blob): this;
    generateAsync(options: { type: string; compression?: string }): Promise<Uint8Array | ArrayBuffer | Blob | string>;
    folder(name: string): JSZip;
  }

  export default JSZip;
}
