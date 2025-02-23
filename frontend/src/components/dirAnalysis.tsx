import { parse } from "acorn";
import escodegen from "escodegen";

const excludedDirs = new Set<string>([".git"]);
const fileStrings: FileString[] = [];
let functionDefs: FunctionDef[] = [];
let functionCalls: FunctionCall[] = [];

class FileString {
  filePath: string;
  content: string;
  FunctionDef: FunctionDef[];
  FunctionCall: FunctionCall[];

  constructor(
    filePath: string,
    content: string,
    FunctionDef: FunctionDef[],
    FunctionCall: FunctionCall[]
  ) {
    this.filePath = filePath;
    this.content = content;
    this.FunctionDef = FunctionDef;
    this.FunctionCall = FunctionCall;
  }
}

class FunctionDef {
  filePath: string;
  name: string;
  params: string[];
  code: string;

  constructor(filePath: string, name: string, params: string[], code: string) {
    this.filePath = filePath;
    this.name = name;
    this.params = params;
    this.code = code;
  }
}

class FunctionCall {
  filePath: string;
  parentFunc: string | null;
  name: string;
  args: string[];

  constructor(filePath: string, parentFunc: string | null, name: string, args: string[]) {
    this.filePath = filePath;
    this.parentFunc = parentFunc;
    this.name = name;
    this.args = args;
  }
}

const readGitignore = (file: File): void => {
  const fileReader = new FileReader();

  fileReader.onload = (event: ProgressEvent<FileReader>) => {
    if (event.target?.result) {
      const gitignoreContent = event.target.result as string;
      const lines = gitignoreContent.split("\n");

      lines.forEach((line) => {
        let trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          if (trimmedLine.startsWith("/")) {
            trimmedLine = trimmedLine.slice(1).trim();
          }
          if (!excludedDirs.has(trimmedLine)) {
            excludedDirs.add(trimmedLine);
          }
        }
      });
    }
  };
  fileReader.readAsText(file);
};

const parseJsFile = (file: File, filePath: string): void => {
  const fileReader = new FileReader();

  fileReader.onload = (event: ProgressEvent<FileReader>) => {
    if (event.target?.result) {
      const fileContent = event.target.result as string;
      try {
        const ast = parse(fileContent, { ecmaVersion: "latest" });
        findFunctions(ast, filePath);
        findCalls(ast, filePath);
        fileStrings.push(new FileString(filePath, fileContent, functionDefs, functionCalls));
        functionDefs = [];
        functionCalls = [];
        console.log("File Strings: ", fileStrings);
      } catch (error) {
        console.error("Error parsing JS file: ", filePath, "\n", error);
      }
    }
  };

  fileReader.readAsText(file);
};

const findFunctions = (node: any, filePath: string): void => {
  let nodeName: string | null = null;
  let nodeParams: any[] | null = null;

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
    node.declarations.forEach((declaration: any) => {
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
    const params = nodeParams?.map((param) => escodegen.generate(param)) || [];
    const code = escodegen.generate(node);
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

const findCalls = (node: any, filePath: string, parentFunc: string | null = null): void => {
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
    node.declarations.forEach((declaration: any) => {
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
    const args = node.arguments.map((arg: any) => escodegen.generate(arg));
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

export function dirAnalysis(files: File[]): void {
  files.forEach((file) => {
    if (file.name === ".gitignore") {
      readGitignore(file);
    }
  });

  files.forEach((file) => {
    const filePath = file.webkitRelativePath;
    const directoryName = filePath.split("/")[0];
    if (excludedDirs.has(directoryName)) {
      return;
    }
    if (filePath.endsWith(".js")) {
      parseJsFile(file, filePath);
    }
  });
  console.log("Function Definitions:", functionDefs);
  console.log("Function Calls:", functionCalls);
  console.log("File Strings:", fileStrings);
}
