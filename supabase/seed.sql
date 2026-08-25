-- ==============================================================================
-- CodeTracker Pro - Sample Seed Data
-- ==============================================================================

-- Sample Problems seed data for testing
-- Note: Replace '<YOUR_USER_UUID>' with an active user ID when running in Supabase SQL editor.

/*
INSERT INTO public.problems (user_id, problem_id, problem_name, platform, difficulty, topic, problem_link, solution_link, notes, solved_date, time_taken, favorite, revision_needed)
VALUES
  ('<YOUR_USER_UUID>', 'LC-1', 'Two Sum', 'LeetCode', 'Easy', 'Arrays', 'https://leetcode.com/problems/two-sum/', 'https://github.com/example/two-sum', 'Use Hash Map for O(N) time and space complexity. Check complement in map.', CURRENT_DATE - INTERVAL '10 days', 15, true, false),
  ('<YOUR_USER_UUID>', 'LC-3', 'Longest Substring Without Repeating Characters', 'LeetCode', 'Medium', 'Sliding Window', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'https://github.com/example/longest-substring', 'Maintain window [left, right] with character index map. Slide left on duplicate.', CURRENT_DATE - INTERVAL '9 days', 25, true, true),
  ('<YOUR_USER_UUID>', 'LC-206', 'Reverse Linked List', 'LeetCode', 'Easy', 'Linked List', 'https://leetcode.com/problems/reverse-linked-list/', 'https://github.com/example/reverse-ll', 'Iterative with 3 pointers (prev, curr, next) or recursive.', CURRENT_DATE - INTERVAL '7 days', 10, false, false),
  ('<YOUR_USER_UUID>', 'LC-42', 'Trapping Rain Water', 'LeetCode', 'Hard', 'Two Pointers', 'https://leetcode.com/problems/trapping-rain-water/', 'https://github.com/example/trapping-water', 'Two pointers tracking left_max and right_max from both ends.', CURRENT_DATE - INTERVAL '5 days', 45, true, true),
  ('<YOUR_USER_UUID>', 'GFG-4', 'Kadane Algorithm', 'GFG', 'Medium', 'Dynamic Programming', 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1', 'https://github.com/example/kadane', 'Track current_sum = max(num, current_sum + num) and max_so_far.', CURRENT_DATE - INTERVAL '4 days', 15, false, false),
  ('<YOUR_USER_UUID>', 'CF-158A', 'Next Round', 'Codeforces', 'Easy', 'Implementation', 'https://codeforces.com/problemset/problem/158/A', 'https://github.com/example/next-round', 'Count contestants who score >= k-th participant score and > 0.', CURRENT_DATE - INTERVAL '3 days', 12, false, false),
  ('<YOUR_USER_UUID>', 'LC-200', 'Number of Islands', 'LeetCode', 'Medium', 'Graphs', 'https://leetcode.com/problems/number-of-islands/', 'https://github.com/example/num-islands', 'DFS or BFS flood fill. Mark visited cells to 0.', CURRENT_DATE - INTERVAL '2 days', 30, true, false),
  ('<YOUR_USER_UUID>', 'LC-70', 'Climbing Stairs', 'LeetCode', 'Easy', 'Dynamic Programming', 'https://leetcode.com/problems/climbing-stairs/', 'https://github.com/example/climbing-stairs', 'Fibonacci sequence: dp[i] = dp[i-1] + dp[i-2].', CURRENT_DATE - INTERVAL '1 day', 8, false, false),
  ('<YOUR_USER_UUID>', 'LC-23', 'Merge k Sorted Lists', 'LeetCode', 'Hard', 'Heap', 'https://leetcode.com/problems/merge-k-sorted-lists/', 'https://github.com/example/merge-k-lists', 'Min-heap of size k storing current node pointers.', CURRENT_DATE, 35, true, true);
*/
