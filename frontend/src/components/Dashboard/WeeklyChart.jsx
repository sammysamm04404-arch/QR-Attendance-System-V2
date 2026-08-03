import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function WeeklyChart({ data }) {

    return (

        <div className="dash-weekly-chart-card">

            <h2>Weekly Attendance</h2>

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

                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3"/>

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
                        dataKey="hours"
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

export default WeeklyChart;