function RecentActivity({ activities }) {
    return (
        <div className="recent-card">

            <div className="section-header">
                <h2>Recent Activity</h2>
            </div>

            <div className="activity-list">

                {
                    activities.length === 0 ? (

                        <p className="empty-text">
                            No activity today
                        </p>

                    ) : (

                        activities.map((activity, index) => (

                            <div key={index} className="activity-item">

                                <div>

                                    <h4>{activity.employee}</h4>
                                    <p>{activity.action}</p>

                                </div>

                                <span>{activity.time}</span>

                            </div>

                        ))

                    )
                }

            </div>

        </div>
    );
}

export default RecentActivity;