'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { Copy, Check, Download, Share2 } from 'lucide-react';

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  showLogo?: boolean;
}

export function QRCodeDisplay({
  value,
  size = 200,
  label,
  showLogo = true,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Cyphra Confidential Payment',
          text: `Payment URI: ${value}`,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyphra-payment-qr-${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative p-3 bg-white rounded-xl border-2 border-zinc-200 shadow-md">
        <canvas ref={canvasRef} className="block" />
        {showLogo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-md bg-black p-0.5 border border-brand-yellow flex items-center justify-center shadow-md">
              <Image
                src="/logo.png"
                alt="Cyphra Emblem"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {label && <p className="text-xs text-zinc-600 text-center max-w-xs font-mono font-medium">{label}</p>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="primary" size="sm" onClick={handleCopy} className="text-xs font-bold">
          {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
          {copied ? 'Copied' : 'Copy URI'}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleShare} className="text-xs font-semibold">
          {shared ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
          Share
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownload} className="text-xs font-semibold">
          <Download className="w-3.5 h-3.5 mr-1" /> Download
        </Button>
      </div>
    </div>
  );
}
