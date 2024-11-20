import productConfig from "../config/product.js";
import alarms from "../config/alarms.js"

/**
 * 
 {
    "dateTime": "2024-11-05T01:32:55Z",
    "value": 35.4,
    "confidence0": 0,
    "confidence1": 0,
    "outOfRange": false,
    "inTripBounds": true
}
 */

export function dataAnalysis(data) {
    let belowMinCount = 0;
    let aboveMaxCount = 0;

    const { apple: { temperature: { min, max } } } = productConfig;

    const sorted = data.map(record => ({ ...record, time: new Date(record.dateTime).getTime() })).sort((a, b) => a.time - b.time);
    // will contain subarrays. 
    // Subarrays will have items that whose temperature is more than max and are consecutive
    const risenTemperatures = [];
    sorted.forEach((record, index) => {
        const { value } = record;
        let increasedTemp = []
        if (value < min) {
            belowMinCount += 1;
            if (increasedTemp.length > 0) {
                risenTemperatures.push(increasedTemp);
                increasedTemp = [];
            }
        } else if (value > max) {
            aboveMaxCount += 1;
            if (index > 0) {
                previousTemp = sorted[-1].value;
                if (previousTemp > max) {
                    increasedTemp.push(record)
                }
            }
        } else {
            if (increasedTemp.length > 0) {
                risenTemperatures.push(increasedTemp);
                increasedTemp = [];
            }
        }
    });

    return {
        report: [{
            "message": "No of times temperature went below required min level",
            "value": belowMinCount
        },
        {
            "message": "No of times temperature went above required max level",
            "value": aboveMaxCount
        },
        {
            "message": "No of times alarms were triggered",
            "value": countAlarmTriggers(risenTemperatures)
        },],
        score: 15
    }
}

function countAlarmTriggers(risenTemperatures) {
    const { temperature: temperatureDeviationLimit } = alarms;
    const alarmTriggers = risenTemperatures.filter(subarray => {
        if (subarray.length > 1) {
            const startTime = subarray[0].time;
            const endTime = subarray[subarray.length - 1].time;
            const timeDiff = (endTime - startTime) / (1000 * 60);
            return timeDiff >= temperatureDeviationLimit;
        }
    })
    return alarmTriggers.length;
}


/**
 * 
 * 
 */
function calculateScore(alarmsCount, risenTemperatures) {
    const deviations = risenTemperatures.map(records => {
        const temperatures = records.map(record => record.value)
        return Math.max(...temperatures) - Math.min(...temperatures);
    }
    )
    return Math.max(...deviations);
}