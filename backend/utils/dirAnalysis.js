import { parse } from "@babel/parser";
import generate from "@babel/generator"; // Fixed import
import { dirAnalyzedRepo } from "../repo/dirAnalyzedRepo.js";

const fileStrings = [];
let functionDefs = [];
let functionCalls = [];

class FileString {
  constructor(filePath, content, FunctionDef, FunctionCall) {
    this.filePath = filePath;
    this.content = content;
    this.FunctionDef = FunctionDef;
    this.FunctionCall = FunctionCall;
  }
}

class FunctionDef {
  constructor(filePath, name, params, code) {
    this.filePath = filePath;
    this.name = name;
    this.params = params;
    this.code = code;
  }
}

class FunctionCall {
  constructor(filePath, parentFunc, name, args) {
    this.filePath = filePath;
    this.parentFunc = parentFunc;
    this.name = name;
    this.args = args;
  }
}

const parseJsFile = (file) => {
  try {
    if (!file.content || typeof file.content !== 'string') {
      console.error("Invalid content in file: ", file.path);
      return;
    }    
    //console.log("Parsing JS file: ", file.path);
    const ast = parse(file.content, { 
      sourceType: "module", 
      plugins: ["jsx", "typescript"] 
    });
    //console.log("Successful parse: ", file.path);
    findFunctions(ast, file.path);
    findCalls(ast, file.path);
    fileStrings.push(new FileString(file.path, file.content, functionDefs, functionCalls));
    functionDefs = [];
    functionCalls = [];
    console.log("File strings: ", fileStrings);
    dirAnalyzedRepo(fileStrings);
  } catch (error) {
    console.error("Error parsing JS file: ", file.path, "\n", error);
  }
};

const findFunctions = (node, filePath) => {
  let nodeName = null;
  let nodeParams = null;

  if ((node.type === "FunctionDeclaration" || node.type === "FunctionExpression") && node.id) {
    nodeName = node.id.name;
    nodeParams = node.params;
  } else if (node.type === "MethodDefinition" && node.key.name) {
    nodeName = node.key.name;
    nodeParams = node.value.params;
  } else if (node.type === "Property") {
    if (node.value.type === "FunctionExpression" && node.key.name) {
      nodeName = node.key.name;
      nodeParams = node.value.params;
    }
  } else if (node.type === "AssignmentExpression") {
    if (node.right.type === "FunctionExpression" && node.left.name) {
      nodeName = node.left.name;
      nodeParams = node.right.params;
    }
  } else if (node.type === "VariableDeclaration") {
    node.declarations.forEach((declaration) => {
      if (declaration.init && declaration.init.type === "FunctionExpression" && declaration.id?.name) {
        nodeName = declaration.id.name;
        nodeParams = declaration.init.params;
      }
    });
  } else if (node.type === "VariableDeclarator") {
    if (node.init && (node.init.type === "FunctionDeclaration" || node.init.type === "ArrowFunctionExpression") && node.id?.name) {
      nodeName = node.id.name;
      nodeParams = node.init.params;
    }
  }

  if (nodeName) {
    //console.log("nodeParams: ", nodeParams);
    const params = nodeParams?.map((param) => generate.default(param).code) || [];
    //console.log("Node: ", node);
    const code = generate.default(node).code;
    functionDefs.push(new FunctionDef(filePath, nodeName, params, code));
  }

  Object.keys(node).forEach((key) => {
    const child = node[key];
    if (child && typeof child === "object") {
      if (Array.isArray(child)) {
        child.forEach((subNode) => findFunctions(subNode, filePath));
      } else {
        findFunctions(child, filePath);
      }
    }
  });
};

const findCalls = (node, filePath, parentFunc = null) => {
  let newParentFunc = parentFunc;

  if ((node.type === "FunctionDeclaration" || node.type === "FunctionExpression") && node.id) {
    newParentFunc = node.id.name;
  } else if (node.type === "MethodDefinition" && node.key.name) {
    newParentFunc = node.key.name;
  } else if (node.type === "Property") {
    if (node.value.type === "FunctionExpression" && node.key.name) {
      newParentFunc = node.key.name;
    }
  } else if (node.type === "AssignmentExpression") {
    if (node.right.type === "FunctionExpression") {
      newParentFunc = node.left.name;
    }
  } else if (node.type === "VariableDeclaration") {
    node.declarations.forEach((declaration) => {
      if (declaration.init && declaration.init.type === "FunctionExpression" && declaration.id) {
        newParentFunc = declaration.id.name;
      }
    });
  } else if (node.type === "VariableDeclarator") {
    if (node.init && (node.init.type === "FunctionDeclaration" || node.init.type === "ArrowFunctionExpression") && node.id) {
      newParentFunc = node.id.name;
    }
  }

  if (node.type === "CallExpression" && node.callee.name) {
    //console.log("args: ", node.arguments);
    const args = node.arguments.map((arg) => generate.default(arg).code);
    functionCalls.push(new FunctionCall(filePath, parentFunc, node.callee.name, args));
  }

  Object.keys(node).forEach((key) => {
    const child = node[key];
    if (child && typeof child === "object") {
      if (Array.isArray(child)) {
        child.forEach((subNode) => findCalls(subNode, filePath, newParentFunc));
      } else {
        findCalls(child, filePath, newParentFunc);
      }
    }
  });
};

export function dirAnalysis(files) {
  files.forEach((file) => {
    parseJsFile(file);
  });
  //console.log("Function Definitions:", functionDefs);
  //console.log("Function Calls:", functionCalls);
  //console.log("File Strings:", fileStrings);
}
