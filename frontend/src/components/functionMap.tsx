import React, { useEffect, useState } from "react";
import CodeDiagram from "./CodeDiagram";

import { FileString } from "./CodeDiagram";

// [Same mockFileStrings data as before - keeping it unchanged]
const mockFileStrings = [
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
        code: "function add(a, b) { return a + b; }",
      },
      {
        filePath: "mathOperations.js",
        name: "multiply",
        params: ["a", "b"],
        code: "function multiply(a, b) { return a * b; }",
      },
      {
        filePath: "mathOperations.js",
        name: "subtract",
        params: ["a", "b"],
        code: "function subtract(a, b) { return a - b; }",
      },
      {
        filePath: "mathOperations.js",
        name: "calculate",
        params: ["a", "b"],
        code: "function calculate(a, b) { const sum = add(a, b); const product = multiply(a, b); const difference = subtract(a, b); return { sum, product, difference }; }",
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
  
        function triangleArea(a, b, angleDeg) {
          return 0.5 * a * b * sinDeg(angleDeg);
        }
  
        console.log(triangleArea(3, 4, 90));
      `,
    FunctionDef: [
      {
        filePath: "geometry.js",
        name: "squareArea",
        params: ["side"],
        code: "function squareArea(side) { return multiply(side, side); }",
      },
      {
        filePath: "geometry.js",
        name: "cubeVolume",
        params: ["side"],
        code: "function cubeVolume(side) { return multiply(squareArea(side), side); }",
      },
      {
        filePath: "geometry.js",
        name: "triangleArea",
        params: ["a", "b", "angleDeg"],
        code: "function triangleArea(a, b, angleDeg) { return 0.5 * a * b * sinDeg(angleDeg); }",
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
        parentFunc: "triangleArea",
        name: "sinDeg",
        args: ["angleDeg"],
      },
      {
        filePath: "geometry.js",
        parentFunc: null,
        name: "triangleArea",
        args: ["3", "4", "90"],
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
        code: "function square(x) { return multiply(x, x); }",
      },
      {
        filePath: "utils.js",
        name: "cube",
        params: ["x"],
        code: "function cube(x) { return multiply(square(x), x); }",
      },
      {
        filePath: "utils.js",
        name: "power",
        params: ["x", "y"],
        code: "function power(x, y) { let result = 1; for (let i = 0; i < y; i++) { result = multiply(result, x); } return result; }",
      },
    ],
    FunctionCall: [
      {
        filePath: "utils.js",
        parentFunc: "square",
        name: "multiply",
        args: ["x", "x"],
      },
      { filePath: "utils.js", parentFunc: "cube", name: "square", args: ["x"] },
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
          console.log(processStrings(["hello", "racecar", "world"]));
          console.log(processNumbers([1, 2, 3, 4, 5]));
          console.log(triangleArea(3, 4, 90));
        }
  
        runCalculations();
      `,
    FunctionDef: [
      {
        filePath: "app.js",
        name: "runCalculations",
        params: [],
        code: 'function runCalculations() { console.log(calculate(8, 3)); console.log(squareArea(6)); console.log(cubeVolume(2)); console.log(power(3, 4)); console.log(processStrings(["hello", "racecar", "world"])); console.log(processNumbers([1, 2, 3, 4, 5])); console.log(triangleArea(3, 4, 90)); }',
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
        parentFunc: "runCalculations",
        name: "processStrings",
        args: ['["hello", "racecar", "world"]'],
      },
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "processNumbers",
        args: ["[1, 2, 3, 4, 5]"],
      },
      {
        filePath: "app.js",
        parentFunc: "runCalculations",
        name: "triangleArea",
        args: ["3", "4", "90"],
      },
      {
        filePath: "app.js",
        parentFunc: null,
        name: "runCalculations",
        args: [],
      },
    ],
  },
  {
    filePath: "stringUtils.js",
    content: `
        // String utility functions
        function reverseString(str) {
          return str.split('').reverse().join('');
        }
  
        function isPalindrome(str) {
          return str === reverseString(str);
        }
  
        function countVowels(str) {
          return str.match(/[aeiou]/gi)?.length || 0;
        }
  
        console.log(isPalindrome("racecar")); // true
        console.log(countVowels("hello")); // 2
      `,
    FunctionDef: [
      {
        filePath: "stringUtils.js",
        name: "reverseString",
        params: ["str"],
        code: "function reverseString(str) { return str.split('').reverse().join(''); }",
      },
      {
        filePath: "stringUtils.js",
        name: "isPalindrome",
        params: ["str"],
        code: "function isPalindrome(str) { return str === reverseString(str); }",
      },
      {
        filePath: "stringUtils.js",
        name: "countVowels",
        params: ["str"],
        code: "function countVowels(str) { return str.match(/[aeiou]/gi)?.length || 0; }",
      },
    ],
    FunctionCall: [
      {
        filePath: "stringUtils.js",
        parentFunc: "isPalindrome",
        name: "reverseString",
        args: ["str"],
      },
      {
        filePath: "stringUtils.js",
        parentFunc: null,
        name: "isPalindrome",
        args: ['"racecar"'],
      },
      {
        filePath: "stringUtils.js",
        parentFunc: null,
        name: "countVowels",
        args: ['"hello"'],
      },
    ],
  },
  {
    filePath: "arrayUtils.js",
    content: `
        // Array utility functions
        function findMax(arr) {
          return Math.max(...arr);
        }
  
        function sumArray(arr) {
          return arr.reduce((a, b) => a + b, 0);
        }
  
        function filterEven(arr) {
          return arr.filter(x => x % 2 === 0);
        }
  
        console.log(sumArray([1, 2, 3])); // 6
        console.log(findMax([1, 2, 3])); // 3
        console.log(filterEven([1, 2, 3, 4])); // [2, 4]
      `,
    FunctionDef: [
      {
        filePath: "arrayUtils.js",
        name: "findMax",
        params: ["arr"],
        code: "function findMax(arr) { return Math.max(...arr); }",
      },
      {
        filePath: "arrayUtils.js",
        name: "sumArray",
        params: ["arr"],
        code: "function sumArray(arr) { return arr.reduce((a, b) => a + b, 0); }",
      },
      {
        filePath: "arrayUtils.js",
        name: "filterEven",
        params: ["arr"],
        code: "function filterEven(arr) { return arr.filter(x => x % 2 === 0); }",
      },
    ],
    FunctionCall: [
      {
        filePath: "arrayUtils.js",
        parentFunc: null,
        name: "sumArray",
        args: ["[1, 2, 3]"],
      },
      {
        filePath: "arrayUtils.js",
        parentFunc: null,
        name: "findMax",
        args: ["[1, 2, 3]"],
      },
      {
        filePath: "arrayUtils.js",
        parentFunc: null,
        name: "filterEven",
        args: ["[1, 2, 3, 4]"],
      },
    ],
  },
  {
    filePath: "dataProcessing.js",
    content: `
        // Data processing functions
        function processStrings(strings) {
          return strings.map(str => ({
            isPal: isPalindrome(str),
            vowelCount: countVowels(str)
          }));
        }
  
        function processNumbers(numbers) {
          const sum = sumArray(numbers);
          const max = findMax(numbers);
          const evens = filterEven(numbers);
          return { sum, max, evens };
        }
  
        console.log(processStrings(["hello", "racecar", "world"]));
        console.log(processNumbers([1, 2, 3, 4, 5]));
      `,
    FunctionDef: [
      {
        filePath: "dataProcessing.js",
        name: "processStrings",
        params: ["strings"],
        code: "function processStrings(strings) { return strings.map(str => ({ isPal: isPalindrome(str), vowelCount: countVowels(str) })); }",
      },
      {
        filePath: "dataProcessing.js",
        name: "processNumbers",
        params: ["numbers"],
        code: "function processNumbers(numbers) { const sum = sumArray(numbers); const max = findMax(numbers); const evens = filterEven(numbers); return { sum, max, evens }; }",
      },
    ],
    FunctionCall: [
      {
        filePath: "dataProcessing.js",
        parentFunc: "processStrings",
        name: "isPalindrome",
        args: ["str"],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: "processStrings",
        name: "countVowels",
        args: ["str"],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: "processNumbers",
        name: "sumArray",
        args: ["numbers"],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: "processNumbers",
        name: "findMax",
        args: ["numbers"],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: "processNumbers",
        name: "filterEven",
        args: ["numbers"],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: null,
        name: "processStrings",
        args: ['["hello", "racecar", "world"]'],
      },
      {
        filePath: "dataProcessing.js",
        parentFunc: null,
        name: "processNumbers",
        args: ["[1, 2, 3, 4, 5]"],
      },
    ],
  },
  {
    filePath: "trigUtils.js",
    content: `
        // Trigonometric utility functions
        function degToRad(deg) {
          return deg * (Math.PI / 180);
        }
  
        function sinDeg(deg) {
          return Math.sin(degToRad(deg));
        }
  
        function cosDeg(deg) {
          return Math.cos(degToRad(deg));
        }
  
        console.log(sinDeg(90)); // 1
        console.log(cosDeg(0)); // 1
      `,
    FunctionDef: [
      {
        filePath: "trigUtils.js",
        name: "degToRad",
        params: ["deg"],
        code: "function degToRad(deg) { return deg * (Math.PI / 180); }",
      },
      {
        filePath: "trigUtils.js",
        name: "sinDeg",
        params: ["deg"],
        code: "function sinDeg(deg) { return Math.sin(degToRad(deg)); }",
      },
      {
        filePath: "trigUtils.js",
        name: "cosDeg",
        params: ["deg"],
        code: "function cosDeg(deg) { return Math.cos(degToRad(deg)); }",
      },
    ],
    FunctionCall: [
      {
        filePath: "trigUtils.js",
        parentFunc: "sinDeg",
        name: "degToRad",
        args: ["deg"],
      },
      {
        filePath: "trigUtils.js",
        parentFunc: "cosDeg",
        name: "degToRad",
        args: ["deg"],
      },
      {
        filePath: "trigUtils.js",
        parentFunc: null,
        name: "sinDeg",
        args: ["90"],
      },
      {
        filePath: "trigUtils.js",
        parentFunc: null,
        name: "cosDeg",
        args: ["0"],
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
