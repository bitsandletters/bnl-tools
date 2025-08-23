// ABOUTME: Tool icon component using Font Awesome Pro icons
// ABOUTME: Provides consistent icon styling across the app

'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@awesome.me/kit-dafe0a6e6d/icons/sharp/regular';

interface ToolIconProps {
  tool: 'color-scales';
  className?: string;
}

const iconMap = {
  'color-scales': faPalette
};

export default function ToolIcon({ tool, className = '' }: ToolIconProps) {
  const icon = iconMap[tool];
  
  if (!icon) {
    return null;
  }

  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={`text-2xl ${className}`}
      style={{ color: 'var(--app-color-text-loud)' }}
    />
  );
} 