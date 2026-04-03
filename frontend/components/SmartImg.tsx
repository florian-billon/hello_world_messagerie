"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";

type SmartImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

/**
 * Img robuste: tente `src`, puis bascule sur `fallbackSrc` si le chargement échoue.
 * Utile pendant une transition (ex: WebP → PNG fallback).
 */
export default function SmartImg({ src, alt, fallbackSrc, onError, ...props }: SmartImgProps) {
  const [currentSrc, setCurrentSrc] = React.useState(src);

  // Si le src change (re-render), on réinitialise la source courante.
  React.useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      {...props}
      alt={alt}
      src={currentSrc}
      onError={(e) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}


