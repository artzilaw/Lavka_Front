export interface CategoryMeta {
  id: number;
  title: string;
  badgeClass: string;
}

export const AD_CATEGORIES: CategoryMeta[] = [
  { id: 1, title: 'Электроника', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80' },
  { id: 2, title: 'Авто и гаражи', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80' },
  { id: 3, title: 'Недвижимость', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
  { id: 4, title: 'Одежда и обувь', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80' },
  { id: 5, title: 'Хобби и отдых', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80' },
  { id: 6, title: 'Для дома', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80' },
  { id: 7, title: 'Работа', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/80' },
  { id: 8, title: 'Животные', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/80' },
  { id: 9, title: 'Запчасти', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80' },
  { id: 10, title: 'Детям', badgeClass: 'bg-pink-50 text-pink-700 border-pink-200/80' },
  { id: 11, title: 'Красота', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80' },
];

export function getCategoryById(id?: number): CategoryMeta {
  return (
    AD_CATEGORIES.find((c) => c.id === id) || {
      id: id || 0,
      title: 'Другое',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    }
  );
}
