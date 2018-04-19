const getRandomInt = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

const minForBaseline = 7000;
const maxForBaseline = 10000;
const minForProjected = 4000;
const maxForProjected = 8000;
const minForMeasured = 800;
const maxForMeasured = 5000;
const minForTrhBaseline = 2500;
const maxForTrhBaseline = 4500;
const minForTrhMeasured = 1500;
const maxForTrhMeasured = 4000;

blendedRates = [
  {
    rate: 0.02,
    month: 'Feb',
    year: 2012
  },
  {
    rate: 0.03,
    month: 'Jan',
    year: 2013
  },
  {
    rate: 0.04,
    month: 'Jul',
    year: 2015
  },
  {
    rate: 0.05,
    month: 'Jan',
    year: 2017
  }
]

baselineData = [
  {month: 'Jan', year: 2016, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Feb', year: 2015, trh: 300 || getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Mar', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Apr', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'May', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Jun', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Jul', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Aug', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Sep', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Oct', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Nov', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }},
  {month: 'Dec', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForBaseline, maxForBaseline),
    PCPs: getRandomInt(minForBaseline, maxForBaseline),
    SCPs: getRandomInt(minForBaseline, maxForBaseline),
    CDPs: getRandomInt(minForBaseline, maxForBaseline),
    CTFs: getRandomInt(minForBaseline, maxForBaseline)
  }}
];














projectedData = [
  {month: 'Jan', year: 2016, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Feb', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Mar', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Apr', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'May', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Jun', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Jul', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Aug', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Sep', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Oct', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Nov', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }},
  {month: 'Dec', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForProjected, maxForProjected),
    PCPs: getRandomInt(minForProjected, maxForProjected),
    SCPs: getRandomInt(minForProjected, maxForProjected),
    CDPs: getRandomInt(minForProjected, maxForProjected),
    CTFs: getRandomInt(minForProjected, maxForProjected)
  }}
];








































measuredData = [
  {month: 'Feb', year: 2016, trh: 3000 || getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Mar', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Apr', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'May', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Jun', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Jul', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Aug', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Sep', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Oct', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Nov', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Dec', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},




    {month: 'Jan', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Feb', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Mar', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Apr', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'May', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Jun', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Jul', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Aug', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Sep', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Oct', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Nov', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
    }},
    {month: 'Dec', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForMeasured, maxForMeasured),
      PCPs: getRandomInt(minForMeasured, maxForMeasured),
      SCPs: getRandomInt(minForMeasured, maxForMeasured),
      CDPs: getRandomInt(minForMeasured, maxForMeasured),
      CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},





  {month: 'Jan', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Feb', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Mar', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }},
  {month: 'Apr', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForMeasured, maxForMeasured),
    PCPs: getRandomInt(minForMeasured, maxForMeasured),
    SCPs: getRandomInt(minForMeasured, maxForMeasured),
    CDPs: getRandomInt(minForMeasured, maxForMeasured),
    CTFs: getRandomInt(minForMeasured, maxForMeasured)
  }}
];