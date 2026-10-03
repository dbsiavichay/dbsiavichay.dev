"use client";

import "@xyflow/react/dist/base.css";

import {
  Handle,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import { Maximize, Minus, Plus } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  edgesOf,
  route,
  type Diagram,
  type DiagramNode,
  type EdgeKind,
  type Side,
} from "@/lib/diagram";
import { SEPARATOR } from "@/lib/separator";

import { EdgeShape, GroupShape, NodeShape, type ShapeState } from "./shapes";

/**
 * The interactive version of a diagram: pan, zoom and inspect. Loaded on
 * demand, never with the page. It draws the same nodes and connectors as the
 * static drawing, so switching between them changes nothing but the controls.
 */

export type FlowLabels = {
  canvas: string;
  /** What a screen reader calls a node and a connector. */
  nodeRole: string;
  edgeRole: string;
  zoomIn: string;
  zoomOut: string;
  fit: string;
  inspect: string;
  nodeHint: string;
  connections: string;
};

type HandleSpec = {
  id: string;
  side: Side;
  at: number;
  type: "source" | "target";
};

type NodeData = { node: DiagramNode; handles: HandleSpec[] };

type EdgeData = { kind: EdgeKind; label?: string; bend?: number };

type DiagramFlowNode = Node<NodeData, "diagram">;

type GroupFlowNode = Node<{ label: string }, "boundary">;

type DiagramFlowEdge = Edge<EdgeData, "diagram">;

/** The selected node and its neighbours, for highlighting. */
const Focus = createContext<{ selected: string | null; related: Set<string> }>({
  selected: null,
  related: new Set(),
});

const handleId = (side: Side, at: number) => `${side}-${at}`;

const positions: Record<Side, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

/** Zero-size handles exactly on the border, where the connectors meet the node. */
function handleStyle({ side, at }: HandleSpec) {
  const along = side === "left" || side === "right" ? "top" : "left";
  return {
    [along]: `${at * 100}%`,
    width: 0,
    height: 0,
    minWidth: 0,
    minHeight: 0,
    border: 0,
    background: "transparent",
  };
}

function DiagramNodeView({ data }: NodeProps<DiagramFlowNode>) {
  const { selected, related } = useContext(Focus);
  const { node, handles } = data;
  const state: ShapeState =
    selected === node.id
      ? "active"
      : selected && !related.has(node.id)
        ? "dimmed"
        : "idle";
  return (
    <>
      {handles.map((handle) => (
        <Handle
          key={`${handle.type}-${handle.id}`}
          id={handle.id}
          type={handle.type}
          position={positions[handle.side]}
          isConnectable={false}
          style={handleStyle(handle)}
        />
      ))}
      <svg
        width={node.w}
        height={node.h}
        className="block overflow-visible font-sans"
        aria-hidden="true"
      >
        <NodeShape node={node} state={state} />
      </svg>
    </>
  );
}

function GroupView({ data, width, height }: NodeProps<GroupFlowNode>) {
  if (!width || !height) return null;
  return (
    <svg width={width} height={height} className="block" aria-hidden="true">
      <GroupShape w={width} h={height} label={data.label} />
    </svg>
  );
}

function DiagramEdgeView({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<DiagramFlowEdge>) {
  const { selected } = useContext(Focus);
  if (!data) return null;
  const points = route(
    { x: sourceX, y: sourceY },
    sourcePosition,
    { x: targetX, y: targetY },
    targetPosition,
    data.bend,
  );
  const state: ShapeState = !selected
    ? "idle"
    : source === selected || target === selected
      ? "active"
      : "dimmed";
  return (
    <EdgeShape
      points={points}
      kind={data.kind}
      label={data.label}
      state={state}
    />
  );
}

const nodeTypes = { diagram: DiagramNodeView, boundary: GroupView };
const edgeTypes = { diagram: DiagramEdgeView };

function toFlow(diagram: Diagram, labels: FlowLabels) {
  const names = new Map(diagram.nodes.map((node) => [node.id, node.label]));
  const handles = new Map<string, HandleSpec[]>();
  const addHandle = (node: string, spec: HandleSpec) => {
    const list = handles.get(node) ?? [];
    if (!list.some((h) => h.id === spec.id && h.type === spec.type)) {
      list.push(spec);
    }
    handles.set(node, list);
  };

  const edges: DiagramFlowEdge[] = diagram.edges.map((edge) => {
    const fromAt = edge.from.at ?? 0.5;
    const toAt = edge.to.at ?? 0.5;
    const sourceHandle = handleId(edge.from.side, fromAt);
    const targetHandle = handleId(edge.to.side, toAt);
    addHandle(edge.from.node, {
      id: sourceHandle,
      side: edge.from.side,
      at: fromAt,
      type: "source",
    });
    addHandle(edge.to.node, {
      id: targetHandle,
      side: edge.to.side,
      at: toAt,
      type: "target",
    });
    return {
      id: edge.id,
      type: "diagram",
      source: edge.from.node,
      target: edge.to.node,
      sourceHandle,
      targetHandle,
      selectable: false,
      focusable: false,
      ariaLabel: [names.get(edge.from.node), names.get(edge.to.node)].join(
        " → ",
      ),
      domAttributes: { "aria-roledescription": labels.edgeRole },
      data: { kind: edge.kind, label: edge.label, bend: edge.bend },
    };
  });

  // Boundaries sit behind the nodes and let clicks through to the pane.
  const groups: GroupFlowNode[] = diagram.groups.map((group) => ({
    id: `group-${group.id}`,
    type: "boundary",
    position: { x: group.x, y: group.y },
    width: group.w,
    height: group.h,
    data: { label: group.label },
    selectable: false,
    focusable: false,
    zIndex: -1,
    style: { pointerEvents: "none" },
  }));

  const nodes: DiagramFlowNode[] = diagram.nodes.map((node) => ({
    id: node.id,
    type: "diagram",
    position: { x: node.x, y: node.y },
    width: node.w,
    height: node.h,
    data: { node, handles: handles.get(node.id) ?? [] },
    ariaLabel: node.sublabel ? `${node.label}, ${node.sublabel}` : node.label,
    domAttributes: { "aria-roledescription": labels.nodeRole },
    className: "cursor-pointer rounded-md",
  }));

  return { nodes: [...groups, ...nodes] as Node[], edges };
}

const controlClass =
  "inline-flex size-9 items-center justify-center text-fg-muted transition-colors hover:bg-raised hover:text-fg [&_svg]:size-4";

function Controls({ labels }: { labels: FlowLabels }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel position="top-right">
      <div className="flex divide-x divide-line overflow-hidden rounded-md border border-line bg-surface">
        <button
          type="button"
          className={controlClass}
          aria-label={labels.zoomIn}
          onClick={() => zoomIn({ duration: 150 })}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          className={controlClass}
          aria-label={labels.zoomOut}
          onClick={() => zoomOut({ duration: 150 })}
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          className={controlClass}
          aria-label={labels.fit}
          onClick={() => fitView({ padding: 0.04, duration: 200 })}
        >
          <Maximize aria-hidden="true" />
        </button>
      </div>
    </Panel>
  );
}

type FlowCanvasProps = {
  diagram: Diagram;
  labels: FlowLabels;
  /** Width over height of the static drawing it replaces. */
  aspectRatio: number;
};

export default function FlowCanvas({
  diagram,
  labels,
  aspectRatio,
}: FlowCanvasProps) {
  const { nodes, edges } = useMemo(
    () => toFlow(diagram, labels),
    [diagram, labels],
  );
  const [selected, setSelected] = useState<string | null>(null);

  const focus = useMemo(() => {
    const related = new Set<string>();
    if (selected) {
      for (const edge of edgesOf(diagram, selected)) {
        related.add(edge.from.node);
        related.add(edge.to.node);
      }
    }
    return { selected, related };
  }, [diagram, selected]);

  const onSelectionChange = useCallback(
    ({ nodes: picked }: OnSelectionChangeParams) => {
      setSelected(picked.find((n) => n.type === "diagram")?.id ?? null);
    },
    [],
  );

  const node = diagram.nodes.find((n) => n.id === selected);
  const names = new Map(diagram.nodes.map((n) => [n.id, n.label]));

  return (
    <Focus.Provider value={focus}>
      <ReactFlowProvider>
        <div
          className="diagram-canvas relative min-h-80 w-full bg-surface"
          style={{ aspectRatio }}
        >
          <ReactFlow
            defaultNodes={nodes}
            defaultEdges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onSelectionChange={onSelectionChange}
            aria-label={labels.canvas}
            ariaLabelConfig={{
              "node.a11yDescription.default": labels.nodeHint,
              "node.a11yDescription.keyboardDisabled": labels.nodeHint,
            }}
            fitView
            fitViewOptions={{ padding: 0.04 }}
            minZoom={0.4}
            maxZoom={2.5}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesFocusable={false}
            deleteKeyCode={null}
            selectionKeyCode={null}
            multiSelectionKeyCode={null}
            zoomOnDoubleClick={false}
            // Wheel and trackpad scroll the page; pinch, or the buttons, zoom.
            zoomOnScroll={false}
            preventScrolling={false}
          >
            <Controls labels={labels} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <div
        aria-live="polite"
        className="min-h-24 border-t border-line px-4 py-4 text-sm sm:px-5"
      >
        {node ? (
          <>
            <p className="font-medium text-fg">
              {node.label}
              {node.sublabel ? (
                <span className="ml-2 font-mono text-xs font-normal text-fg-subtle">
                  {node.sublabel}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-fg-muted">{node.detail}</p>
            <p className="mt-2 font-mono text-xs text-fg-subtle">
              {labels.connections}:{" "}
              {edgesOf(diagram, node.id)
                .map((edge) =>
                  edge.from.node === node.id
                    ? `→ ${names.get(edge.to.node)}`
                    : `← ${names.get(edge.from.node)}`,
                )
                .join(SEPARATOR)}
            </p>
          </>
        ) : (
          <p className="text-fg-subtle">{labels.inspect}</p>
        )}
      </div>
    </Focus.Provider>
  );
}
