function DomainChart({ data, title }) {
    const maxValue = Math.max(...data.map((item) => item.value), 1);

    return (
        <div className="domain-chart">
            <h2>{title}</h2>

            <div className="chart-bars">
                {data.map((item) => {
                    const height = (item.value / maxValue) * 200;

                    return (
                        <div
                            key={item.label}
                            className="chart-item"
                        >
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${height}px`,
                                }}
                            />

                            <span className="chart-value">
                                {item.value}
                            </span>

                            <span className="chart-label">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DomainChart;