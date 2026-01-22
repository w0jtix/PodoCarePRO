export interface ProgressBarProps {
  current: number;
  goal?: number;
  isCurrentMonth?: boolean;
  gradient?: string;
}

const DEFAULT_GRADIENT = "linear-gradient(to left, #9f02b4, #1d2671)";

export function ProgressBar({
  current,
  goal,
  isCurrentMonth = true,
  gradient = DEFAULT_GRADIENT,
}: ProgressBarProps) {
  const hasGoal = goal !== undefined;
  const isGoalZero = goal === 0;
  const isGoalMet = isGoalZero || (hasGoal && current >= goal);

  const percentage = isGoalZero ? 100 : (hasGoal && goal > 0 ? Math.min((current / goal) * 100, 100) : 0);
  const markerPosition = isGoalMet && !isGoalZero && current > 0 ? (goal! / current) * 100 : 0;
  const targetWidth = isGoalMet ? 100 : percentage;

  return (
    <div className="progress-bar-container">
      <div
        className="progress-bar-bg"
        style={{ background: gradient, opacity: 0.1 }}
      />
      <div
        className="progress-bar-fill"
        style={{
          width: `${targetWidth}%`,
          background: gradient,
          opacity: hasGoal ? (isGoalMet ? 0.8 : 0.2) : 0.6
        }}
      />
      {hasGoal && isGoalMet && !isGoalZero && (
        <div
          className="progress-bar-marker pointer"
          style={{ left: `${markerPosition}%` }}
          title={`Cel: ${goal}`}
        />
      )}
      <span className="progress-bar-text">
        {hasGoal ? `${current} / ${goal}` : current}
      </span>
    </div>
  );
}

export default ProgressBar;