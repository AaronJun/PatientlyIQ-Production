export default {
  legend: {
      enabled: false
      },
  toolbar: {
      enabled: false
  },
    axes: {
      left: {
        title: 'left',
        stacked: true,
        mapsTo: 'value',
        titleOrientation: 'right'
      },
      bottom: {
        scaleType: 'time',
        mapsTo: 'date'
      },
      right: {
        title: 'right',
        scaleType: 'linear',
        mapsTo: 'temp',
        correspondingDatasets: [
          'Temperature'
        ],
        titleOrientation: 'left'
      }
    },
    curve: 'curveMonotoneX',
    comboChartTypes: [
      {
        type: 'stacked-area',
        options: {
          points: {
            enabled: false
          }
        },
        correspondingDatasets: [
          'Dataset 1',
          'Dataset 2',
          'Dataset 3'
        ]
      },
      {
        type: 'line',
        correspondingDatasets: [
          'Temperature'
        ]
      }
    ],
    height: '300px'
  }