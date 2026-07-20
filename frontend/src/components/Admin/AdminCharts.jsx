import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function AdminCharts({ data }) {

    return (

        <div className="weekly-chart-card">

            <h2>QR Attendance System</h2>

            <span>present Employees</span>

            <ResponsiveContainer
                width="100%"
                height={280}
            >

                <AreaChart data={data}>
                    <defs>

                        <linearGradient
                            id="colorHours"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="5%"
                                stopColor="#2563eb"
                                stopOpacity={0.8}
                            />

                            <stop
                                offset="95%"
                                stopColor="#2563eb"
                                stopOpacity={0}
                            />

                        </linearGradient>

                    </defs>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="day"
                    />

                    <Tooltip />

                    <Area
                        type="monotone"
                        dataKey="present"
                        stroke="#2563eb"
                        fillOpacity={1}
                        fill="url(#colorHours)"
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>

    );

}

export default AdminCharts;