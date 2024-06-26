import "./index.css";

import React from "react";
// import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import { nextTestBtnClick, testCases } from "./mock-ask-data-responses";

window.autoTesting = false;
window.testsFinished = false;

window.testCases = testCases();

window.nextRes = window.testCases.next();

window.testingInterval = {
  init: () => {
    window.nextRes = window.testCases.next();
    nextTestBtnClick();
  },
  start: () =>
    (window.intervalId = setInterval(() => {
      if (window.autoTesting) {
        window.nextRes = window.testCases.next();
        nextTestBtnClick();
      }
    }, 1000)),
  stop: () => clearInterval(window.intervalId),
};

window.fetch = () => {
  return Promise.resolve({
    json: () => {
      const res = window.nextRes;

      const log = document.getElementById("log");
      log.innerHTML = window.logStr;

      if (res.done) {
        log.innerHTML = "All tests finished!";
        window.logStr = "All tests finished!";
        window.testsFinished = true;

        return Promise.resolve({ ran_successfully: true });
      }

      return Promise.resolve(res.value);
    },
  });
};

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
// ReactDOM.render(<App />, container)
window.testingInterval.init();
window.testingInterval.start();
