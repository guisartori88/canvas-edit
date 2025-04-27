import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import { nodeTypes } from './CustomNodeTypes';

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTextToImageNode,
    addImageToImageNode,
    addImageInpaintingNode,
  } = useCanvasStore();

  const onAddTextToImageNode = useCallback(() => {
    addTextToImageNode({
      x: Math.random() * 500,
      y: Math.random() * 300,
    });
  }, [addTextToImageNode]);

  const onAddImageToImageNode = useCallback(() => {
    addImageToImageNode({
      x: Math.random() * 500,
      y: Math.random() * 300,
    });
  }, [addImageToImageNode]);

  const onAddImageInpaintingNode = useCallback(() => {
    addImageInpaintingNode({
      x: Math.random() * 500,
      y: Math.random() * 300,
    });
  }, [addImageInpaintingNode]);

  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="bg-white p-2 rounded shadow flex flex-col gap-2">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={onAddTextToImageNode}
            >
              Add Text-to-Image
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={onAddImageToImageNode}
            >
              Add Image-to-Image
            </button>
            <button 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              onClick={onAddImageInpaintingNode}
            >
              Add Image Inpainting
            </button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
} 