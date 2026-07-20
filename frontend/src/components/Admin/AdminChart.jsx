import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

function AdminChart({ data }) {

    return (

        <div className="admin-chart-card">

            <div className="chart-header">

                <h2>
                    QR Attendance System
                </h2>

                <span>
                    Present Employees
                </span>

            </div>

            <ResponsiveContainer
                width="100%"
                height={340}
            >

                <BarChart
                    data={data}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="day"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="present"
                        radius={[8,8,0,0]}
                        fill="#4F46E5"
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default AdminChart;