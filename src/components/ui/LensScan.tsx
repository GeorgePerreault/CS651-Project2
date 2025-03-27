import React, { ReactNode, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface LensScanProps {
  children: ReactNode;
  className?: string;
  isScanning?: boolean;
  width?: string | number;
  height?: string | number;
  dotCount?: number;
}

interface Dot {
  top: string;
  left: string;
  size: string;
  delay: string;
}

const LensScan = ({
  children,
  className,
  isScanning = true,
  width = '400px',
  height = '400px',
  dotCount = 15,
}: LensScanProps) => {
  const dots = useMemo(() => {
    return Array.from({ length: dotCount }, () => ({
      top: `${Math.random() * 100}%`, // Fully random top position
      left: `${Math.random() * 100}%`, // Fully random left position
      size: ['w-1 h-1', 'w-2 h-2', 'w-3 h-3'][Math.floor(Math.random() * 3)], // Random size
      delay: `${(Math.random() * 2).toFixed(1)}s` // Random animation delay
    }));
  }, [dotCount]);

  return (
    <div
      className={cn('lens-scan-container', className)}
      style={{ width, height }}
    >
      <div className="lens-scan-content">{children}</div>

      {isScanning && (
        <div className="lens-scan-overlay">
          <div className="lens-scan-line animate-scan-line"></div>

          {dots.map((dot, index) => (
            <div
              key={index}
              className={`lens-scan-dot ${dot.size} animate-scan-dot-${index % 13 + 1}`}
              style={{
                top: dot.top,
                left: dot.left,
                transform: 'translate(-50%, -50%)',
                animationDelay: dot.delay
              }}
            ></div>
          ))}

          <div
            className="lens-scan-wave w-20 h-20 animate-scan-wave"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LensScan;
