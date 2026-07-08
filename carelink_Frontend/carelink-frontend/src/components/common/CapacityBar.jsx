function CapacityBar({ current, total }) {
    const percentage =
        total > 0 ? (current / total) * 100 : 0;

    let backgroundColor = "#22c55e"; // Green

    if (percentage >= 90) {
        backgroundColor = "#ef4444"; // Red
    } else if (percentage >= 70) {
        backgroundColor = "#f59e0b"; // Amber
    }

    return (
        <div className="capacity-bar">
            <div
                className="capacity-fill"
                style={{
                    width: `${percentage}%`,
                    backgroundColor,
                }}
            />
            <span>
                {current} / {total} ({Math.round(percentage)}%)
            </span>
        </div>
    );
}

export default CapacityBar;