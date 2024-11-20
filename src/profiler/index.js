
// import sensorData from "./../sample-response.json"  with { type: "json" };
import sensorData from "./../humidity-sample.json"  with { type: "json" };
import { tempAnalysis } from "./temp-analysis.js";
import { humidityAnalysis } from "./humidity-analysis.js";
import { co2Analysis } from "./co2-analysis.js";
import { lightAnalysis } from "./light-analysis.js";


export function profiler(product, badSamplesCount) {

    if (sensorData && sensorData.length === 1) {

        const { temperatureData, lightData, humidityData, co2Data } = sensorData[0];
        const { report: tempReport, score: tempScore } = tempAnalysis(product, temperatureData)
        const { report: humidityReport, score: humidityScore } = humidityAnalysis(product, humidityData);
        const { report: co2Report, score: co2Score } = co2Analysis(product, co2Data);
        const lightReport = lightAnalysis(lightData)
        console.log("scores", JSON.stringify({ badSamplesCount, tempScore, humidityScore, co2Score }))
        const score = ((5 - badSamplesCount) * 8) + tempScore + humidityScore + co2Score;
        return {
            report: {
                "temperature": tempReport,
                "humidity": humidityReport,
                "co2": co2Report,
                "door": lightReport
            },
            score
        }
    } else {
        throw Error("incorrect sensor data")
    }
}