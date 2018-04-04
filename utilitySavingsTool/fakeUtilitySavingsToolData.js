const getRandomInt = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

const minForBaseline = 7000;
const maxForBaseline = 10000;
const minForProjected = 4000;
const maxForProjected = 8000;
const minForMeasured = 800;
const maxForMeasured = 5000;

kwH_baselineData = [
  {month: 'Jan', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Feb', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Mar', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Apr', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'May', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Jun', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Jul', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Aug', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Sep', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Oct', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Nov', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]},
  {month: 'Dec', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForBaseline, maxForBaseline),
      rendered: true
    }
  ]}
];














kwH_projectedData = [
  {month: 'Jan', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Feb', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Mar', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Apr', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'May', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Jun', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Jul', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Aug', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Sep', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Oct', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Nov', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]},
  {month: 'Dec', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForProjected, maxForProjected),
      rendered: true
    }
  ]}
];








































kwH_measuredData = [
  {month: 'Jan', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Feb', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Mar', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Apr', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'May', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Jun', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Jul', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Aug', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Sep', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Oct', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Nov', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Dec', year: 2016, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},











































































    {month: 'Jan', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Feb', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Mar', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Apr', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'May', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Jun', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Jul', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Aug', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Sep', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Oct', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Nov', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
    ]},
    {month: 'Dec', year: 2017, equipment: [
      {
        type: 'CHs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'PCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'SCPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CDPs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      },
      {
        type: 'CTFs',
        value: getRandomInt(minForMeasured, maxForMeasured),
        rendered: true
      }
  ]},





























































  {month: 'Jan', year: 2018, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Feb', year: 2018, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Mar', year: 2018, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]},
  {month: 'Apr', year: 2018, equipment: [
    {
      type: 'CHs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'PCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'SCPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CDPs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    },
    {
      type: 'CTFs',
      value: getRandomInt(minForMeasured, maxForMeasured),
      rendered: true
    }
  ]}
];