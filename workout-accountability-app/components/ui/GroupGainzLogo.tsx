'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface GroupGainzLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function GroupGainzLogo({ size = 40, className = '', showText = true }: GroupGainzLogoProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg"
        style={{ width: size, height: size }}
      >
        {/* Try to load the PNG image, fallback to SVG */}
        <div className="relative w-full h-full flex items-center justify-center">
          {!imageError ? (
            <Image
              src="/GroupGainzLogo.png"
              alt="GroupGainz Logo"
              width={size}
              height={size}
              className="object-contain"
              style={{ width: '100%', height: '100%' }}
              onError={handleImageError}
            />
          ) : (
            <svg
              width={size * 0.6}
              height={size * 0.6}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(50, 50)">
                <path
                  d="M-25 -10 C-35 -15 -40 -5 -35 5 C-30 15 -20 20 -10 15 L0 10"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M25 -10 C35 -15 40 -5 35 5 C30 15 20 20 10 15 L0 10"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="white"
                  opacity="0.9"
                />
                <circle
                  cx="0"
                  cy="8"
                  r="8"
                  fill="white"
                  opacity="0.95"
                />
                <path
                  d="M-20 0 C-25 -5 -25 -10 -20 -8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                <path
                  d="M20 0 C25 -5 25 -10 20 -8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </g>
            </svg>
          )}
        </div>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 blur-sm"
          style={{ width: size * 1.1, height: size * 1.1, marginLeft: -size * 0.05, marginTop: -size * 0.05 }}
        />
      </div>
      
      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
            GroupGainz
          </span>
        </div>
      )}
    </div>
  );
}
