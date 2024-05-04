import _QRCode, {
  QRCodeOptions,
  QRCode as QRCodeType,
  QRCodeSegmentMode,
  QRCodeErrorCorrectionLevel,
  QRCodeSegment
} from "qrcode";
import modes from "../constants/modes";
import { Mode } from "../types";

export default class QRCode {
  data: string | number | Uint8ClampedArray | Uint8Array = "";
  options: QRCodeOptions & { mode?: Mode } = {
    version: undefined,
    errorCorrectionLevel: "L"
  };
  _qr: QRCodeType = {} as QRCodeType;

  __getSegment(): QRCodeSegment {
    let data = this.data;
    switch (this.options.mode) {
      case modes.numeric:
        data = data.toString().replace(/\D/g, "");
        break;
      case modes.alphanumeric:
        data = data.toString().replace(/[^0-9A-Z $%*+-./:]/g, "");
        break;
      case modes.byte:
        data =
          this.data instanceof Uint8Array || this.data instanceof Uint8ClampedArray
            ? this.data
            : new TextEncoder().encode(this.data.toString());

        break;
      case modes.kanji:
        data = this.data;
        break;
    }
    return {
      mode: this.options?.mode?.toLowerCase() as QRCodeSegmentMode,
      data
    } as QRCodeSegment;
  }

  constructor(version: number | undefined, errorCorrectionLevel: QRCodeErrorCorrectionLevel = "L") {
    this.options = { ...this.options, version, errorCorrectionLevel };
  }

  addData(data: string, mode?: Mode): void {
    this.options = { ...this.options, mode };
    this.data = data;
  }

  make(): void {
    if (this.options.mode) {
      const segment = this.__getSegment();
      this._qr = _QRCode.create([segment], this.options);
      return;
    }
    this._qr = _QRCode.create(this.data.toString(), this.options);
  }

  isDark(row: number, col: number): boolean {
    const modules = this._qr.modules.data;
    return modules[row * this.getModuleCount() + col] === 1;
  }

  getModuleCount(): number {
    return this._qr.modules.size;
  }
}

export const qrcode = (version: number | undefined, errorCorrectionLevel: QRCodeErrorCorrectionLevel = "L"): QRCode => {
  return new QRCode(version, errorCorrectionLevel);
};
