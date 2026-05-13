import { auth, currentUser } from "@clerk/nextjs/server"; //
import { db } from "@/app/db"; //
import { chatbots, users } from "@/app/db/schema"; //
import { eq, desc } from "drizzle-orm"; //
import { Bot, Plus, Globe, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import CreateChatbotModal from "./components/CreateChatbotModal";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  // ১. User Authentication Check
  if (!userId || !user) return null;

  // ২. Database Sync Logic (Add this part)
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
    console.log("User synced successfully!");
  }

  // ৩. Existing Chatbots Fetching Logic
  const userChatbots = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.userId, userId!))
    .orderBy(desc(chatbots.createdAt));

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Top Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-500 font-medium tracking-wide uppercase text-xs">
              <LayoutDashboard size={14} />
              Overview
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Chatbots</h1>
            <p className="text-zinc-400 mt-1">Deploy and manage your custom AI assistants.</p>
          </div>
          <CreateChatbotModal />
        </header>

        {userChatbots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 rounded-4xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl">
              <Bot size={40} className="text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No chatbots found</h3>
            <p className="text-zinc-500 text-center max-w-sm mb-8 leading-relaxed">
              It looks like you haven't created any bots yet. Start by connecting your website to train your first AI.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userChatbots.map((bot) => (
              <div 
                key={bot.id} 
                className="group bg-zinc-900/50 border border-white/5 rounded-3xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <Bot size={28} />
                  </div>
                  <div className="flex gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></span>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Live</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-1 truncate group-hover:text-blue-400 transition-colors">
                  {bot.displayName}
                </h3>
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-8">
                  <Globe size={14} className="shrink-0" />
                  <span className="truncate opacity-70 italic">{bot.websiteUrl}</span>
                </div>

                <Link 
                  href={`/chatbot/${bot.id}`} 
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-white hover:text-black transition-all duration-300 font-bold text-sm"
                >
                  <Settings size={18} /> Configure Bot
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}