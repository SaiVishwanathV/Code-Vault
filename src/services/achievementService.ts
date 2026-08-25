import { BADGE_DEFINITIONS } from '../lib/constants';
import { Achievement, Problem, Streak } from '../types';

export const achievementService = {
  /**
   * Evaluate all achievements based on user problem solving records & streak
   */
  evaluateAchievements(problems: Problem[], streak: Streak): Achievement[] {
    const totalCount = problems.length;
    const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
    const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
    const maxStreak = Math.max(streak.current_streak, streak.longest_streak);

    const distinctPlatforms = new Set(problems.map((p) => p.platform)).size;
    const revisedCount = problems.filter((p) => (p.revision_count || 0) > 0).length;

    return BADGE_DEFINITIONS.map((def) => {
      let currentProgress = 0;
      let unlocked = false;

      switch (def.badge_key) {
        // Consistency & Streaks
        case 'streak_3':
          currentProgress = maxStreak;
          unlocked = maxStreak >= 3;
          break;
        case 'streak_7':
          currentProgress = maxStreak;
          unlocked = maxStreak >= 7;
          break;
        case 'streak_30':
          currentProgress = maxStreak;
          unlocked = maxStreak >= 30;
          break;
        case 'streak_100':
          currentProgress = maxStreak;
          unlocked = maxStreak >= 100;
          break;

        // Problems Solved Count
        case 'first_problem':
          currentProgress = totalCount;
          unlocked = totalCount >= 1;
          break;
        case 'solved_25':
          currentProgress = totalCount;
          unlocked = totalCount >= 25;
          break;
        case 'solved_50':
          currentProgress = totalCount;
          unlocked = totalCount >= 50;
          break;
        case 'solved_100':
          currentProgress = totalCount;
          unlocked = totalCount >= 100;
          break;
        case 'solved_250':
          currentProgress = totalCount;
          unlocked = totalCount >= 250;
          break;
        case 'solved_500':
          currentProgress = totalCount;
          unlocked = totalCount >= 500;
          break;

        // Difficulty Tiers
        case 'easy_10':
          currentProgress = easyCount;
          unlocked = easyCount >= 10;
          break;
        case 'med_25':
          currentProgress = medCount;
          unlocked = medCount >= 25;
          break;
        case 'med_50':
          currentProgress = medCount;
          unlocked = medCount >= 50;
          break;
        case 'hard_10':
          currentProgress = hardCount;
          unlocked = hardCount >= 10;
          break;
        case 'hard_25':
          currentProgress = hardCount;
          unlocked = hardCount >= 25;
          break;

        // Special Milestones
        case 'multi_platform':
          currentProgress = distinctPlatforms;
          unlocked = distinctPlatforms >= 3;
          break;
        case 'revision_champion':
          currentProgress = revisedCount;
          unlocked = revisedCount >= 5;
          break;

        default:
          currentProgress = 0;
          unlocked = false;
      }

      return {
        ...def,
        progress: Math.min(currentProgress, def.target),
        unlocked,
        unlocked_at: unlocked ? new Date().toISOString() : undefined,
      };
    });
  },
};
