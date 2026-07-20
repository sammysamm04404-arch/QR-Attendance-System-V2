import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell
} from "recharts";

import "../../styles/dashboard/WeeklyChart.css";

const COLORS = [
    "#4F46E5",
    "#6366F1",
    "#7C3AED",
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B"
];

function WeeklyChart({ data }) {

    return (

        <div className="weekly-chart-card">

            <div className="chart-header">

                <h2>Weekly Working Hours</h2>

                <span>Current Week</span>

            </div>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        contentStyle={{
                            borderRadius:16,
                            border:"none",
                            boxShadow:"0 8px 30px rgba(0,0,0,.12)"
                        }}
                        formatter={(value)=>[
                            `${value} Hours`,
                            "Worked"
                        ]}
                    />

                    <Bar
                        dataKey="hours"
                        radius={[12,12,0,0]}
                    >

                        {

                            data.map((entry,index)=>(
                                <Cell
                                    key={index}
                                    fill={COLORS[index]}
                                />
                            ))

                        }

                    </Bar>

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default WeeklyChart;

// add this into the dashboard css file
/*
.weekly-chart-card{

    background:#fff;

    border-radius:22px;

    padding:28px;

    box-shadow:0 10px 35px rgba(0,0,0,.08);

}

.chart-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

}

.chart-header h2{

    font-size:24px;

    color:#1e293b;

    font-weight:700;

}

.chart-header span{

    background:#eef2ff;

    color:#4f46e5;

    padding:8px 16px;

    border-radius:30px;

    font-size:13px;

    font-weight:600;

}
*/