'use client';

import Canvas from '../components/canvas/Canvas';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full h-screen">
        <Canvas />
      </div>
    </main>
  );
}
