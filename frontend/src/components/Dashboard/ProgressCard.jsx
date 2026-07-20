function ProgressCard({ todayAttendance, currentTime, attendanceStatus }) {

    let progress = 0;
    let status = "Not Started";
    let workHours = "00h 00m";

    const TOTAL_WORK_HOURS = 8;
    const TOTAL_WORK_MS = TOTAL_WORK_HOURS * 60 * 60 * 1000;

    if (todayAttendance?.check_in) {

        const checkInDate = new Date(todayAttendance.check_in);

        let elapsedMs = 0;

        if (!todayAttendance?.check_out) {

            status = "Working";

            elapsedMs = currentTime - checkInDate;

        }

        else {

            status = "Completed";

            const checkOutDate = new Date(todayAttendance.check_out);

            elapsedMs = checkOutDate - checkInDate;

        }

        elapsedMs = Math.max(0, elapsedMs);

        const totalMinutes = Math.floor(elapsedMs / 60000);

        const hours = Math.floor(totalMinutes / 60);

        const minutes = totalMinutes % 60;

        workHours = `${hours}h ${minutes}m`;

        let workPercentage = (elapsedMs / TOTAL_WORK_MS) * 100;

        progress = Math.max(0, Math.min(100, workPercentage));

    }

    return (

        <div className="progress-card">

            <div className="progress-header">

                <h2>Today's Progress</h2>

                <span>{progress.toFixed(2)}%</span>

            </div>

            <div className="progress-bar">

                <div

                    className="progress-fill"

                    style={{

                        width: `${progress}%`

                    }}

                ></div>

            </div>

            <div className="progress-details">

                <div>

                    <h4>Working Hours</h4>

                    <p>{workHours}</p>

                </div>

                <div>

                    <h4>Status</h4>

                    <p>{attendanceStatus}</p>

                </div>

            </div>

        </div>

    );

}

export default ProgressCard;