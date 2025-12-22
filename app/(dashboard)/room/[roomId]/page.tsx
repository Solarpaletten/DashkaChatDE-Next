/**
 * Страница комнаты /room/[roomId]
 * Динамический роут для чат-комнат
 */

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;

  return (
    <div className="p-4">
      {/* TODO: Интеграция с WebSocket */}
      {/* TODO: <DualTranslator roomId={roomId} /> */}
      <h1 className="text-xl font-bold">Room: {roomId}</h1>
    </div>
  );
}
