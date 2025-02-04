export default {
  axes: {
    bottom: {
      mapsTo: 'age',
      bins: 15,
      limitDomainToBins: true
    },
    left: {
      stacked: true,
      binned: true
    }
  },
  height: '300px'
}