import React from 'react';

const ProgressChart = function(props) {
  const { data, type = 'line', width = '100%', height = '400px' } = props;
  
  // Custom progress chart implementation without external libraries
  const renderLineChart = function() {
    const chartData = data || { labels: [], datasets: [] };
    
    return React.createElement(
      'div',
      { 
        className: 'progress-chart-container',
        style: { width: width, height: height, position: 'relative' }
      },
      React.createElement(
        'div',
        { className: 'chart-header' },
        React.createElement('h3', null, 'Your Progress Overview')
      ),
      React.createElement(
        'div',
        { className: 'chart-content' },
        // Progress bars for different metrics
        chartData.datasets && chartData.datasets.map(function(dataset, index) {
          return React.createElement(
            'div',
            { key: index, className: 'progress-item' },
            React.createElement(
              'div',
              { className: 'progress-label' },
              React.createElement('span', null, dataset.label),
              React.createElement('span', { className: 'progress-value' }, dataset.data + '%')
            ),
            React.createElement(
              'div',
              { className: 'progress-bar-container' },
              React.createElement(
                'div',
                { 
                  className: 'progress-bar-fill',
                  style: { 
                    width: dataset.data + '%',
                    backgroundColor: dataset.backgroundColor || '#3182ce'
                  }
                }
              )
            )
          );
        })
      )
    );
  };

  const renderCircularProgress = function() {
    const percentage = data.percentage || 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = (percentage / 100) * circumference + ' ' + circumference;

    return React.createElement(
      'div',
      { className: 'circular-progress', style: { textAlign: 'center' } },
      React.createElement(
        'svg',
        { width: '120', height: '120', viewBox: '0 0 100 100' },
        React.createElement('circle', {
          cx: '50',
          cy: '50',
          r: '45',
          stroke: '#e5e7eb',
          strokeWidth: '8',
          fill: 'none'
        }),
        React.createElement('circle', {
          cx: '50',
          cy: '50',
          r: '45',
          stroke: '#3182ce',
          strokeWidth: '8',
          fill: 'none',
          strokeDasharray: strokeDasharray,
          strokeLinecap: 'round',
          transform: 'rotate(-90 50 50)'
        }),
        React.createElement(
          'text',
          { x: '50', y: '50', textAnchor: 'middle', dy: '0.3em', fontSize: '16' },
          percentage + '%'
        )
      ),
      React.createElement(
        'p',
        { className: 'progress-label' },
        data.label || 'Progress'
      )
    );
  };

  return React.createElement(
    'div',
    { className: 'progress-chart-wrapper' },
    type === 'circular' ? renderCircularProgress() : renderLineChart()
  );
};

export default ProgressChart;
