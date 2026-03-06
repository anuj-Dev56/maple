import { useEffect, useRef, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";

const DoughnutChart = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  // Generate random data for fallback
  const generateRandomData = () => {
    const labels = ["High", "Medium", "Low"];
    const values = [
      Math.floor(Math.random() * 80) + 10,
      Math.floor(Math.random() * 60) + 10,
      Math.floor(Math.random() * 50) + 10,
    ];

    return {
      labels,
      datasets: [
        {
          label: "Interest Level",
          data: values,
          backgroundColor: [
            "rgb(133, 105, 241)",
            "rgb(164, 101, 241)",
            "rgb(101, 143, 241)",
          ],
          borderColor: [
            "rgba(133, 105, 241, 0.2)",
            "rgba(164, 101, 241, 0.2)",
            "rgba(101, 143, 241, 0.2)",
          ],
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  };

  useEffect(() => {
    // Validate and set chart data
    if (data && data.labels && data.datasets && data.datasets.length > 0) {
      setChartData(data);
    } else {
      // Use random data as fallback
      setChartData(generateRandomData());
    }
  }, [data]);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    try {
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      // Create new chart with safe configuration
      chartRef.current = new ChartJS(canvasRef.current, {
        type: "doughnut",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                font: {
                  size: 12,
                  weight: "500",
                },
                padding: 15,
                color: "rgba(255, 255, 255, 0.7)",
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
            },
          },
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error creating chart:", error);
    }

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData]);

  return (
    <div className="w-full h-auto p-3 mx-auto flex items-center justify-center bg-zinc-900/50 rounded-lg">
      <div className="w-full" style={{ maxHeight: "300px", position: "relative" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default DoughnutChart;