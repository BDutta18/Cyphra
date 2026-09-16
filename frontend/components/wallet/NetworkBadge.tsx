'use client';

import React from 'react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';

export function NetworkBadge() {
  const { network } = useMidnightWallet();
  const displayNet = network ? network.toUpperCase() : 'PREVIEW';

  return (
    <div className="hidden sm:flex items-center">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider bg-[#FFD400] text-black border border-black/15 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        {displayNet}
      </span>
    </div>
  );
}
