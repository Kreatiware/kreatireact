import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  DoubleArrowRight,
  DoubleArrowLeft,
  Check,
  Hamburger,
  Times,
  Search,
  Minus,
  Plus,
  CalendarIcon,
  Maximize,
  Restore,
  InfoCircle,
  ExclamationTriangle,
  HelpCircle,
  User,
  Star,
  StarHalf,
  TimesCircle,
  Heart,
  Upload,
  Filter,
  Pencil,
  Trash,
  EllipsisV,
  Download,
  GripVertical,
  Copy,
  Print,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  Clock,
  Sort,
  Bell,
  BellOff,
  Refresh,
  ExternalLink,
  CheckCircle,
  Home,
  Settings,
  Grid,
  ListIcon,
  ImageIcon,
  Folder,
  File,
  Share,
} from './icons';
import type { IconProps } from './icons';

/** Map of icon names to their components */
const ICON_MAP: Record<string, React.FC<IconProps>> = {
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'double-arrow-right': DoubleArrowRight,
  'double-arrow-left': DoubleArrowLeft,
  check: Check,
  hamburger: Hamburger,
  times: Times,
  search: Search,
  minus: Minus,
  plus: Plus,
  calendar: CalendarIcon,
  maximize: Maximize,
  restore: Restore,
  'info-circle': InfoCircle,
  'exclamation-triangle': ExclamationTriangle,
  'help-circle': HelpCircle,
  user: User,
  star: Star,
  'star-half': StarHalf,
  'times-circle': TimesCircle,
  heart: Heart,
  upload: Upload,
  filter: Filter,
  pencil: Pencil,
  trash: Trash,
  'ellipsis-v': EllipsisV,
  download: Download,
  'grip-vertical': GripVertical,
  copy: Copy,
  print: Print,
  eye: Eye,
  'eye-off': EyeOff,
  mail: Mail,
  lock: Lock,
  phone: Phone,
  clock: Clock,
  sort: Sort,
  bell: Bell,
  'bell-off': BellOff,
  refresh: Refresh,
  'external-link': ExternalLink,
  'check-circle': CheckCircle,
  home: Home,
  settings: Settings,
  grid: Grid,
  list: ListIcon,
  image: ImageIcon,
  folder: Folder,
  file: File,
  share: Share,
};

export interface IconResolverProps extends IconProps {
  /** Icon name (e.g. "times", "check", "chevron-down") */
  name: string;
}

/**
 * Icon resolver that renders an icon component by name string.
 *
 * @description Looks up the icon name in the internal registry and renders
 * the matching component. Accepts all standard IconProps (size, color, className).
 * Returns null if the name is not found.
 *
 * @example
 * ```tsx
 * <Icon name="times" size={16} color="#ef4444" />
 * <Icon name="chevron-down" size={24} />
 * <Icon name="check" />
 * ```
 */
export const Icon: React.FC<IconResolverProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  const IconComponent = ICON_MAP[name.toLowerCase()];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} className={className} />;
};
