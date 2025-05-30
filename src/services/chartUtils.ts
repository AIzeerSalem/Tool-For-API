import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { ChartConfig } from '../types';

interface ChartOptions {
  config: ChartConfig;
  data: any[];
  canvas: HTMLCanvasElement;
}

export const chartUtils = {
  createChart({ config, data, canvas }: ChartOptions): Chart {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const chartData = this.prepareChartData(config, data);
    const chartConfig = this.getChartConfiguration(config, chartData);

    return new Chart(ctx, chartConfig);
  },

  prepareChartData(config: ChartConfig, data: any[]): ChartData {
    const labels = data.map(item => item[config.labelKey]);
    const values = data.map(item => item[config.dataKey]);

    switch (config.type) {
      case 'bar':
        return {
          labels,
          datasets: [{
            label: config.title,
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        };

      case 'pie':
        return {
          labels,
          datasets: [{
            data: values,
            backgroundColor: this.generateColors(values.length),
          }]
        };

      case 'line':
        return {
          labels,
          datasets: [{
            label: config.title,
            data: values,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
          }]
        };

      default:
        throw new Error(`Unsupported chart type: ${config.type}`);
    }
  },

  getChartConfiguration(config: ChartConfig, data: ChartData): ChartConfiguration {
    const baseConfig: ChartConfiguration = {
      type: config.type,
      data,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: config.title
          },
          legend: {
            position: 'top' as const,
          }
        }
      }
    };

    // Add type-specific configurations
    switch (config.type) {
      case 'bar':
        return {
          ...baseConfig,
          options: {
            ...baseConfig.options,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        };

      case 'pie':
        return {
          ...baseConfig,
          options: {
            ...baseConfig.options,
            plugins: {
              ...baseConfig.options?.plugins,
              legend: {
                position: 'right' as const
              }
            }
          }
        };

      case 'line':
        return {
          ...baseConfig,
          options: {
            ...baseConfig.options,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        };

      default:
        return baseConfig;
    }
  },

  generateColors(count: number): string[] {
    const baseColors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)'
    ];

    // If we need more colors than our base set, generate them
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.508) % 360; // Use golden angle approximation
      colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    }

    return colors;
  }
}; 