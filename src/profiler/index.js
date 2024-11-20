
import sensorData from "./../sample-response.json"  with { type: "json" };
import { dataAnalysis } from "./data-analysis.js"


export function profiler(product, badSamplesCount) {

    if (sensorData && sensorData.length === 1) {

        const { temperatureData, lightData, humidityData, co2Data } = sensorData[0];
        const { report, score } = dataAnalysis(temperatureData)
        return {
            report: {
                "temperature": [
                    {
                        "message": "No of times temperature went below required min level",
                        "value": 8
                    },
                    {
                        "message": "No of times temperature went above required max level",
                        "value": 5
                    },
                    {
                        "message": "No of times alarms were triggered",
                        "value": 15
                    },
                ],
                "humidity": [
                    {
                        "message": "No of times humidity went below required min level",
                        "value": 8
                    },
                    {
                        "message": "No of times humidity went above required max level",
                        "value": 5
                    },
                    {
                        "message": "No of times alarms were triggered",
                        "value": 15
                    },
                ],
                "co2": [
                    {
                        "message": "No of times Co2 went below required min level",
                        "value": 8
                    },
                    {
                        "message": "No of times Co2 went above required max level",
                        "value": 5
                    },
                    {
                        "message": "No of times alarms were triggered",
                        "value": 15
                    },
                ],
            },
            score: 98
        }
    } else {
        throw Error("incorrect sensor data")
    }
}