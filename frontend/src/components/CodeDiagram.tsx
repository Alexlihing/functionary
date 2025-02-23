import React, { useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
} from "react-flow-renderer";
import { css } from "@emotion/react";
import { Tooltip } from "react-tooltip";
import "reactflow/dist/style.css";

// Define types for file strings, function definitions, and function calls
export type FileString = {
  filePath: string;
  content: string;
  FunctionDef: FunctionDef[];
  FunctionCall: FunctionCall[];
};

type FunctionDef = {
  filePath: string;
  name: string;
  params: string[];
  code: string;
};

type FunctionCall = {
  filePath: string;
  parentFunc: string | null;
  name: string;
  args: string[];
};

// Define props for the CodeDiagram component
type CodeDiagramProps = {
  fileStrings: FileString[];
  explain: (funcName: string) => void;
};

// Enhanced base styles for nodes
const baseNodeStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Poppins", sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
  padding: 25px;
  border-radius: 50%;
  background-clip: padding-box;

  &:hover {
    transform: scale(1.08) translateY(-5px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
`;

// Vibrant, modern color palette for file nodes
const fileColors = [
  { border: "#00b4d8", bgStart: "#e0f7ff", bgEnd: "#90e0ef" }, // Cyan
  { border: "#52b788", bgStart: "#d8f3dc", bgEnd: "#95d5b2" }, // Green
  { border: "#f48c06", bgStart: "#ffedd8", bgEnd: "#f4a261" }, // Orange
  { border: "#7209b7", bgStart: "#ede7ff", bgEnd: "#b298dc" }, // Purple
];

// Style for function nodes
const funcNodeStyle = css`
  ${baseNodeStyles}
  width: 140px;
  height: 140px;
  background: linear-gradient(145deg, #ffffff 0%, #f1f3f5 100%);
  border: 3px solid #495057;
  font-size: 16px;
  color: #212529;
  padding: 18px;
  backdrop-filter: blur(4px);
`;

// CodeDiagram component
const CodeDiagram = ({ fileStrings, explain }: CodeDiagramProps) => {
  // Memoize nodes and edges to improve performance
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const functionLocations: { [key: string]: string } = {};

    // Create file nodes
    fileStrings.forEach((file, fileIndex) => {
      const fileId = `file-${file.filePath.replace(/[^a-zA-Z0-9]/g, "-")}`;
      const color = fileColors[fileIndex % fileColors.length];
      const fileStyle = css`
        ${baseNodeStyles}
        width: 400px;
        height: 400px;
        background: linear-gradient(
          145deg,
          ${color.bgStart} 0%,
          ${color.bgEnd} 100%
        );
        border: 5px solid ${color.border};
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        backdrop-filter: blur(6px);
      `;

      nodes.push({
        id: fileId,
        type: "group",
        position: { x: fileIndex * 600, y: 0 }, // Spaced out
        data: {
          label: (
            <div>
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "26px",
                  letterSpacing: "0.5px",
                }}
              >
                {file.filePath.split("/").pop()}
              </div>
              <small
                style={{ color: "#343a40", fontSize: "16px", opacity: 0.85 }}
              >
                {file.FunctionDef.length} Functions
              </small>
            </div>
          ),
        },
        style: {
          css: fileStyle,
          width: 400,
          height: 400,
        },
      });

      // Create function nodes
      file.FunctionDef.forEach((func, funcIndex) => {
        const funcId = `func-${fileId}-${func.name}`;
        functionLocations[func.name] = funcId;

        const angle =
          (funcIndex / Math.max(file.FunctionDef.length, 1)) * 2 * Math.PI;
        const radius = 130;
        const centerX = 200;
        const centerY = 200;

        nodes.push({
          id: funcId,
          data: {
            label: (
              <div
                data-tooltip-id="function-tooltip"
                data-tooltip-content={func.code}
                style={{ cursor: "pointer" }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "6px",
                    fontSize: "18px",
                  }}
                >
                  {func.name}
                </div>
                <small style={{ color: "#495057", fontSize: "13px" }}>
                  ({func.params.join(", ")})
                </small>
              </div>
            ),
            funcName: func.name,
          },
          position: {
            x: centerX + radius * Math.cos(angle) - 70,
            y: centerY + radius * Math.sin(angle) - 70,
          },
          parentNode: fileId,
          extent: "parent",
          style: { css: funcNodeStyle },
        });
      });
    });

    // Create edges
    fileStrings.forEach((file) => {
      const fileId = `file-${file.filePath.replace(/[^a-zA-Z0-9]/g, "-")}`;

      file.FunctionCall.forEach((call) => {
        if (!functionLocations[call.name]) {
          console.warn(`Target function ${call.name} not found`);
          return;
        }

        const targetId = functionLocations[call.name];
        let sourceId: string;

        if (call.parentFunc) {
          sourceId = `func-${fileId}-${call.parentFunc}`;
          if (!nodes.some((n) => n.id === sourceId)) {
            console.warn(
              `Source function ${call.parentFunc} not found in ${fileId}`
            );
            return;
          }
        } else {
          sourceId = fileId;
        }

        if (!nodes.some((n) => n.id === targetId)) {
          console.warn(
            `Target function ${call.name} not found for edge from ${sourceId}`
          );
          return;
        }

        edges.push({
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: "bezier",
          animated: !!call.parentFunc,
          style: {
            stroke: call.parentFunc ? "#ff2d55" : "#ced4da",
            strokeWidth: 3,
            opacity: call.parentFunc ? 1 : 0.7,
          },
          markerEnd: {
            type: "arrowclosed",
            color: call.parentFunc ? "#ff2d55" : "#ced4da",
          },
          label: call.args.length > 0 ? call.args.join(", ") : "",
          labelStyle: {
            fill: "#212529",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Poppins, sans-serif",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            padding: 6,
            borderRadius: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
        });
      });
    });

    return { nodes, edges };
  }, [fileStrings]);

  // Handle node click event
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.data?.funcName) {
      explain(node.data.funcName);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f4f6f8" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
        nodesDraggable={true}
        minZoom={0.2}
        maxZoom={2}
        defaultZoom={0.7}
      >
        <Background
          variant="dots"
          gap={24}
          size={1.5}
          color="#dee2e6"
          style={{ background: "#f4f6f8" }}
        />
        <Controls
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "8px",
            backdropFilter: "blur(8px)",
          }}
        />
      </ReactFlow>
      <Tooltip
        id="function-tooltip"
        place="top"
        variant="dark"
        style={{
          backgroundColor: "rgba(33, 37, 41, 0.95)",
          color: "#ffffff",
          borderRadius: "10px",
          padding: "15px",
          maxWidth: "500px",
          whiteSpace: "pre-wrap",
          fontFamily: "Fira Code, monospace",
          fontSize: "14px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
        }}
      />
    </div>
  );
};

export default CodeDiagram;
