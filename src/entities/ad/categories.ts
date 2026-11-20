import {
  Car,
  Building2,
  Briefcase,
  Shirt,
  Tent,
  PawPrint,
  Smartphone,
  Sofa,
  Wrench,
  Baby,
  Sparkles,
  LayoutGrid,
  LucideIcon,
} from 'lucide-react';

export interface CategoryItem {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 0, title: 'Все', icon: LayoutGrid, color: 'bg-indigo-50 text-indigo-600' },
  { id: 1, title: 'Электроника', icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
  { id: 2, title: 'Авто и гаражи', icon: Car, color: 'bg-violet-50 text-violet-600' },
  { id: 3, title: 'Недвижимость', icon: Building2, color: 'bg-emerald-50 text-emerald-600' },
  { id: 4, title: 'Одежда и обувь', icon: Shirt, color: 'bg-rose-50 text-rose-600' },
  { id: 5, title: 'Хобби и отдых', icon: Tent, color: 'bg-amber-50 text-amber-600' },
  { id: 6, title: 'Для дома', icon: Sofa, color: 'bg-teal-50 text-teal-600' },
  { id: 7, title: 'Работа', icon: Briefcase, color: 'bg-cyan-50 text-cyan-600' },
  { id: 8, title: 'Животные', icon: PawPrint, color: 'bg-orange-50 text-orange-600' },
  { id: 9, title: 'Запчасти', icon: Wrench, color: 'bg-slate-100 text-slate-700' },
  { id: 10, title: 'Детям', icon: Baby, color: 'bg-pink-50 text-pink-600' },
  { id: 11, title: 'Красота', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
];

export const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 0);

export function getCategoryById(id: number): CategoryItem | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
