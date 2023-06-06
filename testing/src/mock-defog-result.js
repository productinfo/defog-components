// mock various kinds of results with a similar (but broken) structure to the defog servers return value
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

const mockColumns = [
  "date",
  "day",
  "week",
  "month",
  "qtr",
  "year",
  "value_a",
  "value_b",
  "value_c",
  "holiday",
];

const commonVals = ["", [], null, undefined, "delete"];

const timeFormats = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DD",
  "YYYY-MM",
];

function randomiseArray(arr) {
  const newArr = arr.slice();
  for (let i = 0; i < newArr.length; i++) {
    const randIndex = Math.floor(Math.random() * newArr.length);
    const temp = newArr[i];
    newArr[i] = newArr[randIndex];
    newArr[randIndex] = temp;
  }
  return newArr;
}

function createData(columns, decimalColumns = [], onlyDates = false) {
  const nrows = Math.random() * 100;
  const data = [];
  const baseDate = dayjs(new Date(Math.random() * 1000000000000));
  const tfs = randomiseArray(timeFormats);

  for (let i = 0; i < nrows; i++) {
    const row = [];
    for (let j = 0; j < columns.length; j++) {
      // push a random value
      // if date, push a random date
      const colName = columns[j];
      let val;
      switch (colName) {
        case "date":
          val = baseDate.add(Math.random() * 100, "day");
          // jitter baseDate a little bit
          if (onlyDates) {
            val = val.format(tfs[j % tfs.length]);
          } else {
            val = val.toISOString().slice(0, -5);
          }
          break;
        case "week":
          val = Math.ceil(Math.random() * 52);
          break;
        case "month":
          val = Math.ceil(Math.random() * 12);
          if (onlyDates) {
            val = dayjs(val.toString(), "M").format(tfs[j % tfs.length]);
          }
          break;
        case "qtr":
          val = Math.ceil(Math.random() * 4);
          break;
        case "year":
          val = Math.floor(Math.random() * 10000);
          if (onlyDates) {
            val = dayjs(val.toString(), "YYYY").format(tfs[j % tfs.length]);
          }

          break;
        case "day":
          val = Math.floor(Math.random() * 7);
          break;
        case "holiday":
          val = Math.random() > 0.5;
          break;
        case "value_a":
        case "value_b":
        case "value_c":
        default:
          // randomly create integer column
          val =
            decimalColumns.indexOf(colName) >= 0
              ? Math.random() * 100
              : Math.floor(Math.random() * 100);
      }

      row.push(val);
    }
    data.push(row);
  }
  return data;
}

// random slice of an array
function randomSlice(arr) {
  const start = Math.floor(Math.random() * arr.length);
  const end = Math.floor(Math.random() * (arr.length - start)) + start;
  return arr.slice(start, end);
}

function createResponseObject(newProps = {}, testVals = null) {
  let selectedCols = randomSlice(mockColumns);

  const base = {
    columns: selectedCols,
    data: createData(selectedCols),
    previous_context: [
      "test",
      "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ],
    query_generated: "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ran_successfully: true,
    reason_for_query:
      "The user's question is not provided, so I will generate a query that selects all columns from the `date` table and orders the results by `caldate` in ascending order. This query will retrieve all the dates in the database and order them chronologically.",
    suggestion_for_further_questions:
      "aslgdnlj asdljnasoj asdojn sdoflja asdovja sdvjknasdovjn ",
  };

  return Object.assign(base, newProps);
}

function* testPropVals(newProps, prop, vals = null) {
  if (!vals) {
    vals = commonVals.slice();
  }

  for (let i = 0; i < vals.length; i++) {
    const res = createResponseObject(newProps);
    window.logStr =
      `Testing ${prop} prop. Current value:` +
      JSON.stringify(vals[i] === "" ? "empty string" : vals[i]);

    console.log(
      `Testing %c${prop}\x1b[0m prop. Current value:`,
      "color: #ff0000",
      vals[i] === "" ? "empty string" : vals[i]
    );

    if (vals[i] === "delete") {
      delete res[prop];
    } else {
      res[prop] = vals[i];
    }

    yield res;
  }
}

function* validData() {
  console.log("Testing with valid response.");

  window.logStr = `Testing with valid response.`;

  // valid result
  yield createResponseObject();
}

function* onlyQuantitativeColumns() {
  let selectedCols = mockColumns.filter((col) => col.startsWith("value"));
  console.log("Testing with only quantitative columns.");
  window.logStr = `Testing with only quantitative columns.`;

  yield createResponseObject({
    columns: selectedCols,
    data: createData(selectedCols, ["value_c"]),
  });
}

function* noData() {
  const testVals = commonVals.slice().filter((d) => d !== "");
  testVals.push([null]);

  yield* testPropVals({}, "data", testVals);
}

function* noColumns() {
  yield* testPropVals({}, "columns");
}

function* noSQL() {
  yield* testPropVals({}, "query_generated");
}

function* onlyDates() {
  let selectedCols = mockColumns.slice(0, 6);
  console.log("Testing with only date columns.");
  window.logStr = `Testing with only date columns.`;

  yield createResponseObject({
    columns: selectedCols,
    data: createData(selectedCols, [], true),
  });
}

export function* testCases() {
  const tests = [
    onlyDates,
    onlyQuantitativeColumns,
    validData,
    noData,
    noColumns,
    noSQL,
  ];
  for (let i = 0; i < tests.length; i++) {
    yield* tests[i]();
  }
}
