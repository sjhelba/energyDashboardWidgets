const getRandomInt = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

const minForKwhBaseline = 7000;
const maxForKwhBaseline = 10000;

const minForKwhProjected = 4000;
const maxForKwhProjected = 8000;

const minForKwhMeasured = 800;
const maxForKwhMeasured = 5000;


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
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Feb', year: 2015, trh: 300 || getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Mar', year: 2015, trh: 3999, equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Apr', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'May', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Jun', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Jul', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Aug', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Sep', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Oct', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Nov', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }},
  {month: 'Dec', year: 2015, trh: getRandomInt(minForTrhBaseline, maxForTrhBaseline), equipmentKwhs: {
    CHs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    PCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    SCPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CDPs: getRandomInt(minForKwhBaseline, maxForKwhBaseline),
    CTFs: getRandomInt(minForKwhBaseline, maxForKwhBaseline)
  }}
];














projectedData = [
  {month: 'Jan', year: 2016, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Feb', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Mar', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Apr', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'May', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Jun', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Jul', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Aug', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Sep', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Oct', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Nov', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }},
  {month: 'Dec', year: 2015, equipmentKwhs: {
    CHs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    PCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    SCPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CDPs: getRandomInt(minForKwhProjected, maxForKwhProjected),
    CTFs: getRandomInt(minForKwhProjected, maxForKwhProjected)
  }}
];








































measuredData = [
  {month: 'Feb', year: 2016, trh: 3000 || getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Mar', year: 2016, trh: 4000, equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Apr', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'May', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Jun', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Jul', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Aug', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Sep', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Oct', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Nov', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Dec', year: 2016, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},




    {month: 'Jan', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Feb', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Mar', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Apr', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'May', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Jun', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Jul', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Aug', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Sep', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Oct', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Nov', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
    }},
    {month: 'Dec', year: 2017, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
      CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
      CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},





  {month: 'Jan', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Feb', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Mar', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }},
  {month: 'Apr', year: 2018, trh: getRandomInt(minForTrhMeasured, maxForTrhMeasured), equipmentKwhs: {
    CHs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    PCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    SCPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CDPs: getRandomInt(minForKwhMeasured, maxForKwhMeasured),
    CTFs: getRandomInt(minForKwhMeasured, maxForKwhMeasured)
  }}
];