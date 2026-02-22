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
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 12,
              },
              padding: 10,
            }
          },
        },
      },
    });
  }, [data]);

  return (
    <div className="w-full h-auto max-h-[300px] sm:max-h-[350px] p-2 sm:p-3 mx-auto flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DoughnutChart;