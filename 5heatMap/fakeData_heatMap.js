tempHistory = [];
effHistory = [];

const getRandomInt = (min, max) => Math.floor(Math.random()*(max-min+1)+min);
const tempMin = 25;
const tempMax = 85;

const effMin = 200;
const effMax = 1300;

const getRandomTemp = () => getRandomInt(tempMin, tempMax);
const getRandomEff = () => getRandomInt(effMin, effMax) / 1000;


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
          value: getRandomTemp()
        };
        let effEntry = {
          year: year,
          month: jsMonths[monthIndex],
          dateHr: [dayOfMonth, hour],
          value: getRandomEff()
        };

        // newest entries later in indices
        tempHistory.unshift(tempEntry);
        effHistory.unshift(effEntry);
      }
    }
  }
}
