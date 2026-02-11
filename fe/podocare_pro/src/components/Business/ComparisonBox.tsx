interface ComparisonBoxProps {
  label: string;
  percentage: number;
  title?: string;
}

export function ComparisonBox({
  label,
  percentage,
  title
}: ComparisonBoxProps) {
  const isNegative = percentage < 0;
  const isZero = percentage === 0;

  const getColorClass = () => {
    if (isZero) return "neutral";
    return isNegative ? "negative" : "positive";
  };

  return (
    <div
      className="comparison-box flex-column align-items-center default"
      title={title}
    >
      <span className="comparison-label block mb-025">vs {label}</span>
      <div className="flex align-items-center">
        <span className={`comparison-value ${getColorClass()}`}>
          {`${isNegative ? "" : "+"}${Math.round(percentage)}%`}
        </span>
        {!isZero && (
          <img
            src={`src/assets/arrow_${isNegative ? "down_red" : "up_green"}.svg`}
            alt=""
            className="comparison-icon"
          />
        )}
      </div>
    </div>
  );
}

export default ComparisonBox;
