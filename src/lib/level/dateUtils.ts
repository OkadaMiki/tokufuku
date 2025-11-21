export const getBusinessDate = (d: Date): string => {
  const copy = new Date(d);
  // 5時間引けば、0-24時の日付がそのまま「営業日」になる
  // 例: 5/20 04:00 -> 5/19 23:00 -> 5/19
  //     5/20 05:00 -> 5/20 00:00 -> 5/20
  copy.setHours(copy.getHours() - 5);
  return copy.toDateString(); // "Mon Nov 21 2025" 形式
};

export const shouldResetDailyChallenge = (lastLoginDate: string | undefined): boolean => {
    const now = new Date();
    const lastDate = lastLoginDate ? new Date(lastLoginDate) : null;
    
    const currentBusinessDate = getBusinessDate(now);
    const lastBusinessDate = lastDate ? getBusinessDate(lastDate) : null;

    return currentBusinessDate !== lastBusinessDate;
};
