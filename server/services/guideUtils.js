// Pure utility functions for guide data.
// Kept free of Firebase / external dependencies so they can be unit-tested in isolation.

// Recalculates the overall completion percentage of a guide.
// Returns a number in the range [0, 100]. A guide with no steps returns 0.
export function calculateProgress(guide) {
  let completedSteps = 0;
  let totalSteps = 0;
  (guide.chapters || []).forEach(chapter => {
    const steps = chapter.steps || [];
    totalSteps += steps.length;
    steps.forEach(step => {
      if (step.isCompleted) {
        completedSteps++;
      }
    });
  });
  return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
}
