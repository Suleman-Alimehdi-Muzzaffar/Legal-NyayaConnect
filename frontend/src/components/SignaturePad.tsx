import React, { useRef, useState } from 'react';

export default function SignaturePad({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const t = (e as React.TouchEvent).touches?.[0];
    const x = (t ? t.clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = (t ? t.clientY : (e as React.MouseEvent).clientY) - rect.top;
    return { x, y };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#102542';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasDrawn(true);
    e.preventDefault();
  };
  const end = () => { drawing.current = false; };

  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  };

  const save = () => {
    if (!hasDrawn) return;
    const data = canvasRef.current!.toDataURL('image/png');
    onSave(data);
  };

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-3" role="group" aria-label="Signature pad">
      <canvas
        ref={canvasRef}
        width={460}
        height={160}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className="w-full border border-[#102542]/20 rounded-lg bg-white touch-none cursor-crosshair"
        role="img"
        aria-label="Signature canvas — draw your signature with mouse or touch"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') clear(); }}
      />
      <div className="flex justify-between gap-2">
        <button onClick={clear} aria-label="Clear signature" className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Clear</button>
        <div className="flex gap-2">
          <button onClick={onCancel} aria-label="Cancel signing" className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#D4AF37]">Cancel</button>
          <button onClick={save} disabled={!hasDrawn} aria-label="Save signature" className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#102542] font-bold text-sm disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#102542]">Sign & Save</button>
        </div>
      </div>
    </div>
  );
}
