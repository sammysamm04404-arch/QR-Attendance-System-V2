import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
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
                        stroke="var(--secondary)"
                        tick={{
                            fill: "var(--secondary)",
                            fontSize: 13,
                            fontWeight: 500
                        }}
                    />

                    <YAxis
                        stroke="var(--secondary)"
                        tick={{
                            fill: "var(--secondary)",
                            fontSize: 13
                        }}
                    />

                    <Tooltip
                        contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            color: "var(--text)"
                        }}
                        labelStyle={{
                            color: "var(--text)"
                        }}
                        itemStyle={{
                            color: "var(--text)"
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="present"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHours)"
                        activeDot={{
                            r: 6,
                            fill: "#2563eb"
                        }}
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>

    );

}

export default AdminCharts;