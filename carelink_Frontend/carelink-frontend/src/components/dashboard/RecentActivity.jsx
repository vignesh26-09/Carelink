function RecentActivity({ activities }) {
    return (
        <div className="recent-activity">
            <h2>Recent Activity</h2>

            <ul>
                {activities.map((activity, index) => (
                    <li key={index}>
                        <span className="activity-text">
                            {activity.title}
                        </span>

                        {" - "}

                        <span className="activity-date">
                            {activity.date}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RecentActivity;