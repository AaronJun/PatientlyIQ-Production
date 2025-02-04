export default {
    axes: {
      bottom: {
        mapsTo: 'sales',
        includeZero: false
      },
      left: {
        mapsTo: 'profit',
        includeZero: false
      }
    },
    bubble: {
      radiusMapsTo: 'surplus',
      radiusLabel: 'Surplus'
    },
    LegendOptions: {
      enabled: false,
      additionalItems: [
        {
          type: 'radius',
          name: 'Surplus'
        }
      ]
    },
    toolbar: {
      enabled: false
    },
    height: '300px'
  }