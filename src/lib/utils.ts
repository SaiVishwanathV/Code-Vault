import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid, eachDayOfInterval, subDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { Problem } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string, formatStr: string = 'MMM dd, yyyy'): string {
  if (!dateString) return 'N/A';
  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return dateString;
    return format(parsed, formatStr);
  } catch {
    return dateString;
  }
}

export function isValidUrl(urlString?: string): boolean {
  if (!urlString || !urlString.trim()) return true;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function triggerConfetti() {
  confetti({
    particleCount: 65,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#E9B949', '#4F7A5A', '#D4A32D', '#7FA38A', '#2D3748'],
  });
}

/**
 * Export problems array to CSV format string (clean without solution_link)
 */
export function exportProblemsToCsv(problems: Problem[], filename: string = 'codevault_problems.csv') {
  const headers = [
    'Problem ID',
    'Problem Name',
    'Platform',
    'Difficulty',
    'Topic',
    'Problem URL',
    'Solved Date',
    'Time Taken (mins)',
    'Favorite',
    'Revision Needed',
    'Revision Date',
    'Personal Notes',
  ];

  const rows = problems.map((p) => [
    `"${(p.problem_id || '').replace(/"/g, '""')}"`,
    `"${(p.problem_name || '').replace(/"/g, '""')}"`,
    `"${(p.platform || '').replace(/"/g, '""')}"`,
    `"${(p.difficulty || '').replace(/"/g, '""')}"`,
    `"${(p.topic || '').replace(/"/g, '""')}"`,
    `"${(p.problem_link || '').replace(/"/g, '""')}"`,
    `"${(p.solved_date || '').replace(/"/g, '""')}"`,
    p.time_taken ?? 0,
    p.favorite ? 'Yes' : 'No',
    p.revision_needed ? 'Yes' : 'No',
    `"${(p.revision_date || '').replace(/"/g, '""')}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse uploaded CSV string into Partial<Problem>[]
 */
export function parseProblemsCsv(csvText: string): Partial<Problem>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Partial<Problem>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (!row || row.length < 2) continue;

    const [
      problem_id,
      problem_name,
      platform,
      difficulty,
      topic,
      problem_link,
      solved_date,
      time_taken,
      favorite,
      revision_needed,
      revision_date,
      notes,
    ] = row;

    if (!problem_name) continue;

    results.push({
      problem_id: problem_id || `IMP-${Date.now().toString().slice(-4)}`,
      problem_name: problem_name.trim(),
      platform: (platform?.trim() as any) || 'LeetCode',
      difficulty: (['Easy', 'Medium', 'Hard'].includes(difficulty?.trim()) ? difficulty.trim() : 'Medium') as any,
      topic: topic?.trim() || 'Arrays',
      problem_link: problem_link?.trim() || '',
      solved_date: solved_date?.trim() || format(new Date(), 'yyyy-MM-dd'),
      time_taken: parseInt(time_taken || '15', 10) || 15,
      favorite: favorite?.toLowerCase() === 'yes' || favorite?.toLowerCase() === 'true',
      revision_needed: revision_needed?.toLowerCase() === 'yes' || revision_needed?.toLowerCase() === 'true',
      revision_date: revision_date?.trim() || undefined,
      notes: notes?.trim() || '',
    });
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

/**
 * Generates continuous heatmap day slots for the last 365 days
 */
export function generateHeatmapData(problems: Problem[]) {
  const endDate = new Date();
  const startDate = subDays(endDate, 364);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const dateCountMap: Record<string, { count: number; problems: Problem[] }> = {};

  problems.forEach((p) => {
    const d = p.solved_date;
    if (!dateCountMap[d]) {
      dateCountMap[d] = { count: 0, problems: [] };
    }
    dateCountMap[d].count += 1;
    dateCountMap[d].problems.push(p);
  });

  return days.map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const entry = dateCountMap[dateKey];
    const count = entry ? entry.count : 0;

    let intensity = 0;
    if (count === 1) intensity = 1;
    else if (count === 2) intensity = 2;
    else if (count >= 3 && count < 5) intensity = 3;
    else if (count >= 5) intensity = 4;

    return {
      date: dateKey,
      dayOfWeek: day.getDay(),
      count,
      intensity,
      problems: entry ? entry.problems : [],
    };
  });
}
