import qrcode from 'qrcode-generator';

export function Qr({ text }: { text: string }) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 3, margin: 4, scalable: true });
  return (
    <div
      className="qr"
      role="img"
      aria-label="Invitation QR code"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
