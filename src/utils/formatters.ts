export function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** "há 3 h", "há 2 d" — usado nos metadados de promoções e notificações. */
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;

  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;

  return `há ${Math.floor(months / 12)} a`;
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString('pt-BR')} pts`;
}
