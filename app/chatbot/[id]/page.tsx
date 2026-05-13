import ChatWidget from "@/app/components/ChatWidget";

export default async function ChatbotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (

    <main className="w-full h-screen bg-white overflow-hidden">
      <ChatWidget chatbotId={id} isEmbed={true} />
      
    </main>
  );
}