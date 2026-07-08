function EmptyState({
    message,
    ctaText = null,
    onCtaClick,
}) {
    return (
        <div className="empty-state">
            <p>{message}</p>

            {ctaText && (
                <button onClick={onCtaClick}>
                    {ctaText}
                </button>
            )}
        </div>
    );
}

export default EmptyState;