import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <img
        src="/images/logo/logo.svg"
        alt="Лавка"
        className={`${iconSize} rounded-xl shadow-md shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105`}
      />
      <span className={`${textSize} font-extrabold tracking-tight text-slate-900`}>
        Лавка<span className="text-indigo-600">.</span>
      </span>
    </Link>
  );
};
