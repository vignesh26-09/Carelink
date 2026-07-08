function NotificationStack({
    notifications,
    removeNotification,
}) {
    return (
        <div className="notification-stack">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`notification ${notif.type}`}
                >
                    <span>{notif.message}</span>

                    <button
                        onClick={() =>
                            removeNotification(notif.id)
                        }
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default NotificationStack;