function AdminHeader() {

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (

        <div className="admin-header">

            <div>

                <h1 className="admin-title">
                    Welcome Back, Admin
                </h1>

                <p className="admin-subtitle">
                    QR Attendance System Overview
                </p>

            </div>

            <div className="admin-date">
                {today}
            </div>

        </div>

    );

}

export default AdminHeader;