import { useEffect, useRef } from "react";
import { Chart as ChartJS } from "chart.js/auto";

const DoughnutChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "doughnut",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, 
        },
      },
    });
  }, [data]);

  return (
    <div className="w-[280px] h-[280px] p-3 mx-auto">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DoughnutChart;