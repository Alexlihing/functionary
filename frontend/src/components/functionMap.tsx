import React, { useEffect, useState } from "react";
import CodeDiagram from "./CodeDiagram";

import { FileString } from "./CodeDiagram";

// [Same mockFileStrings data as before - keeping it unchanged]
const mockFileStrings: FileString[] = [
  {
    filePath: "mathOperations.js",
    content: `
          // Math operations
          function add(a, b) {
            return a + b;
          }
    
          function multiply(a, b) {
            return a * b;
          }
    
          function subtract(a, b) {
            return a - b;
          }
    
          function calculate(a, b) {
            const sum = add(a, b);
            const product = multiply(a, b);
            const difference = subtract(a, b);
            return { sum, product, difference };
          }
        `,
    FunctionDef: [
      {
        filePath: "mathOperations.js",
        name: "add",
        params: ["a", "b"],
        code: `
              function add(a, b) {
                return a + b;
              }
            `,
      },
      {
        filePath: "mathOperations.js",
        name: "multiply",
        params: ["a", "b"],
        code: `
              function multiply(a, b) {
                return a * b;
              }
            `,
      },
      {
        filePath: "mathOperations.js",
        name: "subtract",
        params: ["a", "b"],
        code: `
              function subtract(a, b) {
                return a - b;
              }
            `,
      },
      {
        filePath: "mathOperations.js",
        name: "calculate",
        params: ["a", "b"],
        code: `
              function calculate(a, b) {
                const sum = add(a, b);
                const product = multiply(a, b);
                const difference = subtract(a, b);
                return { sum, product, difference };
              }
            `,
      },
    ],
    FunctionCall: [
      {
        filePath: "mathOperations.js",
        parentFunc: "calculate",
        name: "add",
        args: ["a", "b"],
      },
      {
        filePath: "mathOperations.js",
        parentFunc: "calculate",
        name: "multiply",
        args: ["a", "b"],
      },
      {
        filePath: "mathOperations.js",
        parentFunc: "calculate",
        name: "subtract",
        args: ["a", "b"],
      },
      {
        filePath: "mathOperations.js",
        parentFunc: null,
        name: "calculate",
        args: ["10", "5"],
      },
    ],
  },
  {
    filePath: "geometry.js",
    content: `
          // Geometry functions
          function squareArea(side) {
            return multiply(side, side);
          }
    
          function cubeVolume(side) {
            return multiply(squareArea(side), side);
          }
        `,
    FunctionDef: [
      {
        filePath: "geometry.js",
        name: "squareArea",
        params: ["side"],
        code: `
              function squareArea(side) {
                return multiply(side, side);
              }
            `,
      },
      {
        filePath: "geometry.js",
        name: "cubeVolume",
        params: ["side"],
        code: `
              function cubeVolume(side) {
                return multiply(squareArea(side), side);
              }
            `,
      },
    ],
    FunctionCall: [
      {
        filePath: "geometry.js",
        parentFunc: "squareArea",
        name: "multiply",
        args: ["side", "side"],
      },
      {
        filePath: "geometry.js",
        parentFunc: "cubeVolume",
        name: "squareArea",
        args: ["side"],
      },
      {
        filePath: "geometry.js",
        parentFunc: "cubeVolume",
        name: "multiply",
        args: ["squareArea(side)", "side"],
      },
      {
        filePath: "geometry.js",
        parentFunc: null,
        name: "cubeVolume",
        args: ["4"],
      },
    ],
  },
  {
    filePath: "utils.js",
    content: `
          // Utility functions
          function square(x) {
            return multiply(x, x);
          }
    
          function cube(x) {
            return multiply(square(x), x);
          }
  
          function power(x, y) {
            let result = 1;
            for (let i = 0; i < y; i++) {
              result = multiply(result, x);
            }
            return result;
          }
        `,
    FunctionDef: [
      {
        filePath: "utils.js",
        name: "square",
        params: ["x"],
        code: `
              function square(x) {
                return multiply(x, x);
              }
            `,
      },
      {
        filePath: "utils.js",
        name: "cube",
        params: ["x"],
        code: `
              function cube(x) {
                return multiply(square(x), x);
              }
            `,
      },
      {
        filePath: "utils.js",
        name: "power",
        params: ["x", "y"],
        code: `
              function power(x, y) {
                let result = 1;
                for (let i = 0; i < y; i++) {
                  result = multiply(result, x);
                }
                return result;
              }
            `,
      },
    ],
    FunctionCall: [
      {
        filePath: "utils.js",
        parentFunc: "square",
        name: "multiply",
        args: ["x", "x"],
      },
      {
        filePath: "utils.js",
        parentFunc: "cube",
        name: "square",
        args: ["x"],
      },
      {
        filePath: "utils.js",
        parentFunc: "cube",
        name: "multiply",
        args: ["square(x)", "x"],
      },
      {
        filePath: "utils.js",
        parentFunc: "power",
        name: "multiply",
        args: ["result", "x"],
      },
      {
        filePath: "utils.js",
        parentFunc: null,
        name: "power",
        args: ["2", "5"],
      },
    ],
  },
  {
    filePath: "app.js",
    content: `
          // Application logic
          function runCalculations() {
            console.log(calculate(8, 3));
            console.log(squareArea(6));
            console.log(cubeVolume(2));
            console.log(power(3, 4));
          }
  
          runCalculations();
        `,
    FunctionDef: [
      {
        filePath: "app.js",
        name: "runCalculations",
        params: [],
        code: `
              function runCalculations() {
                console.log(calculate(8, 3));
                console.log(squareArea(6));
                console.log(cubeVolume(2));
                console.log(power(3, 4));
              }
            `,
      },
    ],
    FunctionCall: [
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "calculate",
        args: ["8", "3"],
      },
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "squareArea",
        args: ["6"],
      },
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "cubeVolume",
        args: ["2"],
      },
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "power",
        args: ["3", "4"],
      },
      {
        filePath: "app.js",
        parentFunc: null,
        name: "runCalculations",
        args: [],
      },
    ],
  },
];

const FunctionMap = () => {
  const [fileStrings, setFileStrings] = useState<FileString[]>([]);

  const explain = async (functionName: string) => {
    try {
      const response = await fetch("http://localhost:5001/RAGservice/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionName: functionName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setFileStrings(mockFileStrings);
      try {
        fetch("http://localhost:5001/RAGservice/embedCode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileStrings: mockFileStrings,
          }),
        });
      } catch (error) {
        console.log(error.message);
      }
    }, 1000);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {fileStrings.length > 0 ? (
        <CodeDiagram fileStrings={fileStrings} explain={explain} />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <p>Loading function map...</p>
        </div>
      )}
    </div>
  );
};

export default FunctionMap;
