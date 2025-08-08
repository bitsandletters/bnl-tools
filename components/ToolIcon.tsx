// ABOUTME: Tool icon component using Font Awesome Pro icons
// ABOUTME: Provides consistent icon styling across the app

'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPalette, 
  faRuler, 
  faFont, 
  faDistributeSpacingHorizontal 
} from '@awesome.me/kit-dafe0a6e6d/icons/sharp/regular';

interface ToolIconProps {
  tool: 'color-scales' | 'modular-scale' | 'typography' | 'spacing';
  className?: string;
}

const iconMap = {
  'color-scales': faPalette,
  'modular-scale': faRuler,
  'typography': faFont,
  'spacing': faDistributeSpacingHorizontal,
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