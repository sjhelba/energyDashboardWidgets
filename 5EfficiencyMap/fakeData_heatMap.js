tempHistory = [];
effHistory = [];

const getRandomInt = (min, max) => Math.floor(Math.random()*(max-min+1)+min);
// const tempMin = 25;
// const tempMax = 85;

// const effMin = 200;
// const effMax = 1300;

const tempRangesPerMonth = {
  Jan: {min: 42, max: 62},
  Feb: {min: 45, max: 65},
  Mar: {min: 51, max: 72},
  Apr: {min: 59, max: 80},
  May: {min: 67, max: 87},
  Jun: {min: 72, max: 92},
  Jul: {min: 74, max: 96},
  Aug: {min: 75, max: 97},
  Sep: {min: 69, max: 82},
  Oct: {min: 61, max: 71},
  Nov: {min: 51, max: 63},
  Dec: {min: 42, max: 80}
};
const effRangePerTempThreshold = {
  lowTemp: {min: 200, max: 750},
  midTemp: {min: 500, max: 1050},
  highTemp: {min: 700, max: 1300}
}

const getRandomTemp = month => getRandomInt(tempRangesPerMonth[month].min, tempRangesPerMonth[month].max);
const getRandomEff = tempRange => getRandomInt(effRangePerTempThreshold[tempRange].min, effRangePerTempThreshold[tempRange].max) / 1000;


let jsToday = new Date();
let jsMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let jsThisYear = jsToday.getFullYear();
let jsLastYear = jsThisYear - 1;
let jsThisMonthIndex = jsToday.getMonth();
let jsThisMonth = jsMonths[jsThisMonthIndex];
let jsThisDate = jsToday.getDate()
let jsThisHour = jsToday.getHours();

const monthIndicesInYears = {
  [jsThisYear]: jsThisMonthIndex,
  [jsLastYear]: 11
};


for (let year = jsThisYear; year >= jsLastYear; year--) {
  for (let monthIndex = monthIndicesInYears[year]; monthIndex >= 0; monthIndex--) {
    for (let dayOfMonth = year === jsThisYear && monthIndex === jsThisMonthIndex ? jsThisDate : 30; dayOfMonth > 0; dayOfMonth--) {
      for (let hour = year === jsThisYear && monthIndex === jsThisMonthIndex && dayOfMonth === jsThisDate ? jsThisHour : 23; hour >= 0; hour--) {

        let tempEntry = {
          year: year,
          month: jsMonths[monthIndex],
          dateHr: [dayOfMonth, hour],
          value: getRandomTemp(jsMonths[monthIndex])
        };
        let effEntry = {
          year: year,
          month: jsMonths[monthIndex],
          dateHr: [dayOfMonth, hour],
          value: getRandomEff(tempEntry.value < 50 ? 'lowTemp' : (tempEntry.value < 75 ? 'midTemp' : 'highTemp'))
        };

        // newest entries later in indices
        tempHistory.unshift(tempEntry);
        effHistory.unshift(effEntry);
      }
    }
  }
}
