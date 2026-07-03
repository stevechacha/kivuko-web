import { colors } from '../theme/colors';

export interface UzalendoGrade {
  code: string;
  label: string;
  badge: string;
  next_threshold: number | null;
}

export function computeGrade(points: number): UzalendoGrade {
  if (points >= 300) {
    return { code: 'A', label: 'Balozi wa Muungano', badge: '🏆', next_threshold: null };
  }
  if (points >= 150) {
    return { code: 'B', label: 'Mwanajadi wa Uzalendo', badge: '⭐', next_threshold: 300 };
  }
  if (points >= 50) {
    return { code: 'C', label: 'Mzalendo Anayechangia', badge: '🌱', next_threshold: 150 };
  }
  return { code: 'D', label: 'Mwanzo wa Safari', badge: '🚩', next_threshold: 50 };
}

export function gradeProgress(points: number, grade: UzalendoGrade): number {
  if (!grade.next_threshold) return 100;
  const prev = grade.code === 'D' ? 0 : grade.code === 'C' ? 50 : 150;
  return Math.min(100, Math.round(((points - prev) / (grade.next_threshold - prev)) * 100));
}

export { colors };
