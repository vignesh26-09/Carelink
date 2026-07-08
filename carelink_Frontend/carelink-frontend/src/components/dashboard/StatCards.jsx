
function StatCards({ stats }) {
    return (
        <div className="stat-cards">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="stat-card"
                >
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                </div>
            ))}
        </div>
    );
}

export default StatCards;