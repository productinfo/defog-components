import React from 'react';
import { Table, message } from 'antd';
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from './Charts/ColumnChart.jsx';
import TrendChart from './Charts/TrendChart.jsx';

const DefogDynamicViz = ({vizType, response, rawData, query, debugMode, apiKey}) => {
  let results;
  const uploadFeedback = (feedback) => {
    fetch(`https://api.defog.ai/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        response: response,
        feedback: feedback,
      }),
    })

    feedback === "Good" ? message.success("We are glad that this was a good result. Thank you for the feedback!") : message.info("Thank you for the feedback, we will use your feedback to make the results better!")
  }

  if (vizType === "table") {
    results = <Table
      dataSource={response.data}
      columns={response.columns}
      style={{
        maxHeight: 300,
        overflow: "auto",
      }}
      size="small"
      pagination={{ pageSize: 5}}
    />
  } else if (vizType === "piechart") {
    results = <PieChart
      resourceId={null}
      data={{
        dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
        title: query,
      }}
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  } else if (vizType === "columnchart") {
    results = <ColumnChart
      resourceId={null}
      data={{
        dataJSON: rawData.map((el) => el[1]),
        xAxisCategories: rawData.map((el) => el[0]),
        title: query,
      }}
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  } else if (vizType === "trendchart") {
    results = <TrendChart
      resourceId={null}
      data={{
        dataJSON: rawData,
        title: query,
      }}
      transformMode="base"
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  }

  return <div>    
    {results}
    {debugMode && <div className="rateQualityContainer">
      <p>The following query was generated:</p>
      <pre>
        {response.generatedSql}
      </pre>
      <p>How did we do with is this query?</p>
      <button style={{backgroundColor: "#fff", border: "0px"}} onClick={() => uploadFeedback("Good")}>👍 Good </button>
      <button style={{backgroundColor: "#fff", border: "0px"}} onClick={() => uploadFeedback("Bad")}>👎 Bad </button>
    </div>
    }
  </div>
}

export default React.memo(DefogDynamicViz, () => true);