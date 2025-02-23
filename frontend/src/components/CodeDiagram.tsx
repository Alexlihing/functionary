import React, { useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
} from "react-flow-renderer";
import { css, Global } from "@emotion/react";
import { Tooltip } from "react-tooltip";
import "reactflow/dist/style.css";

// Define types
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

type CodeDiagramProps = {
  fileStrings: FileString[];
  explain: (funcName: string) => void;
};

// Color palette
const fileColors = [
  { border: "#00b4d8", bgStart: "#e0f7ff", bgEnd: "#90e0ef" }, // Cyan
  { border: "#52b788", bgStart: "#d8f3dc", bgEnd: "#95d5b2" }, // Green
  { border: "#f48c06", bgStart: "#ffedd8", bgEnd: "#f4a261" }, // Orange
  { border: "#7209b7", bgStart: "#ede7ff", bgEnd: "#b298dc" }, // Purple
];

// Utility function to convert hex to RGBA
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CodeDiagram = ({ fileStrings, explain }: CodeDiagramProps) => {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const functionLocations: { [key: string]: string } = {};

    // Grid layout parameters
    const numColumns = Math.ceil(Math.sqrt(fileStrings.length));
    const parentWidth = 400;
    const parentHeight = 400;
    const gap = 300;

    // File nodes
    fileStrings.forEach((file, fileIndex) => {
      const fileId = `file-${file.filePath.replace(/[^a-zA-Z0-9]/g, "-")}`;
      const color = fileColors[fileIndex % fileColors.length];
      const fileName = file.filePath.split("/").pop() || file.filePath;

      // Calculate grid position
      const columnIndex = fileIndex % numColumns;
      const rowIndex = Math.floor(fileIndex / numColumns);
      const x = columnIndex * (parentWidth + gap);
      const y = rowIndex * (parentHeight + gap);

      // Main file node
      nodes.push({
        id: fileId,
        position: { x, y },
        data: {
          label: (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  color: color.border,
                  textShadow:
                    "2px 2px 8px rgba(0,0,0,0.7), -1px -1px 4px rgba(255,255,255,0.5)",
                  padding: "12px 24px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "50px",
                  backdropFilter: "blur(4px)",
                  border: `2px solid ${hexToRgba(color.border, 0.3)}`,
                }}
              >
                {fileName}
                <div
                  style={{
                    fontSize: "16px",
                    color: hexToRgba(color.border, 0.9),
                    marginTop: "8px",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {file.FunctionDef.length} Functions
                </div>
              </div>
            </div>
          ),
        },
        style: {
          width: parentWidth,
          height: parentHeight,
          background: `radial-gradient(circle at center, ${hexToRgba(
            color.bgStart,
            0.3
          )} 0%, ${hexToRgba(color.bgEnd, 0.3)} 100%)`,
          border: `6px solid ${color.border}`,
          borderRadius: "50%",
          "--border-color": color.border,
        },
        className: "file-node",
      });

      // Function nodes
      file.FunctionDef.forEach((func, funcIndex) => {
        const funcId = `func-${fileId}-${func.name}`;
        const labelId = `label-${funcId}`;
        functionLocations[func.name] = funcId;

        // Position functions around the file node
        const angle =
          (funcIndex / Math.max(file.FunctionDef.length, 1)) * Math.PI * 2;
        const radius = 200;
        const funcX = x + parentWidth / 2 + Math.cos(angle) * radius - 70;
        const funcY = y + parentHeight / 2 + Math.sin(angle) * radius - 70;
        const labelY = funcY - 30; // Position label 30px above the function node

        // Function node
        nodes.push({
          id: funcId,
          position: { x: funcX, y: funcY },
          data: {
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                data-tooltip-id="function-tooltip"
                data-tooltip-content={func.code}
              >
                <div
                  style={{
                    fontWeight: 400,
                    marginBottom: "4px",
                    fontSize: "20px",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {func.name}
                </div>
                <small
                  style={{
                    color: "#495057",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  ({func.params.join(", ")})
                </small>
              </div>
            ),
            funcName: func.name,
          },
          className: "func-node",
          style: {
            width: 140,
            height: 140,
            background: `linear-gradient(145deg, #ffffff 0%, ${hexToRgba(
              color.bgEnd,
              0.5
            )} 100%)`,
            border: `3px solid ${color.border}`,
            borderRadius: "50%",
            "--border-color": color.border,
          },
        });

        // File name label node (outside the circle)
        nodes.push({
          id: labelId,
          position: { x: funcX, y: labelY },
          data: {
            label: (
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: color.border,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </div>
            ),
          },
          style: {
            width: "auto",
            height: "auto",
            background: "transparent",
            border: "none",
            padding: 0,
          },
          draggable: false, // Prevent dragging the label independently
        });
      });
    });

    // Edges
    fileStrings.forEach((file, fileIndex) => {
      const fileId = `file-${file.filePath.replace(/[^a-zA-Z0-9]/g, "-")}`;
      const color = fileColors[fileIndex % fileColors.length];
      const colorIndex = fileIndex % fileColors.length;

      file.FunctionCall.forEach((call) => {
        if (!functionLocations[call.name]) return;
        const targetId = functionLocations[call.name];
        const sourceId = call.parentFunc
          ? `func-${fileId}-${call.parentFunc}`
          : fileId;

        if (
          !nodes.some((n) => n.id === sourceId) ||
          !nodes.some((n) => n.id === targetId)
        )
          return;

        edges.push({
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: "bezier",
          animated: !!call.parentFunc,
          className: `custom-edge file-color-${colorIndex}`,
          style: { stroke: color.border, strokeWidth: 3 },
          markerEnd: { type: "arrowclosed", color: color.border },
          label: call.args.length > 0 ? call.args.join(", ") : "",
          labelStyle: {
            fill: "#212529",
            fontSize: 14,
            fontWeight: 400,
            fontFamily: "Poppins, sans-serif", // Fixed: Single string with comma
          },
          labelBgStyle: {
            fill: hexToRgba(color.bgStart, 0.7),
            padding: 8,
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          },
        });
      });
    });

    return { nodes, edges };
  }, [fileStrings]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.data?.funcName) explain(node.data.funcName);
  };

  // Generate glow styles for each file color
  const glowStyles = fileColors
    .map(
      (color, index) => `
        @keyframes glow-${index} {
          0%, 100% {
            filter: drop-shadow(0 0 3px ${hexToRgba(color.border, 0.7)});
          }
          50% {
            filter: drop-shadow(0 0 10px ${hexToRgba(color.border, 1)});
          }
        }
        .custom-edge.file-color-${index} {
          animation: glow-${index} 2s infinite;
        }
      `
    )
    .join("");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #f4f6f8 0%, #e9ecef 100%)",
      }}
    >
      <Global
        styles={css`
          ${glowStyles}
          .file-node,
          .func-node {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: "Poppins, sans-serif";
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            text-align: center;
            padding: 25px;
            border-radius: 50%;
            background-clip: padding-box;
          }
          .file-node:hover,
          .func-node:hover {
            transform: scale(1.1) translateY(-8px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3),
              0 0 15px var(--border-color);
          }
          .custom-edge {
            transition: stroke-width 0.2s, stroke 0.2s;
          }
          .custom-edge:hover {
            stroke-width: 5;
            stroke: #ff6b6b;
          }
        `}
      />
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
          style={{ background: "transparent" }}
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
          fontFamily: "Fira Code, monospace", // Fixed: Single string with comma
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
