import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { chatbots, users } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";
import { Bot, Globe, Settings, LayoutDashboard, Cpu } from "lucide-react";
import Link from "next/link";
import CreateChatbotModal from "./components/CreateChatbotModal";
import CopyButton from "./components/CopyButton";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return null;

  const existingUser = await db.select().from(users).where(eq(users.id, userId));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: userId,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
  }

  const userChatbots = await db
    .select()
    .from(chatbots)
    .where(eq(chatbots.userId, userId!))
    .orderBy(desc(chatbots.createdAt));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-14">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-500">
                <LayoutDashboard size={12} />
                Overview
              </div>
            </div>
            <h1 className="text-[2.6rem] font-bold tracking-tight leading-none text-white mb-2">
              Chatbots
            </h1>
            <p className="text-[15px] text-zinc-500 font-normal">
              Deploy and manage your custom AI assistants.
            </p>
          </div>

          <CreateChatbotModal />
        </header>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-14" />

        {/* Empty State */}
        {userChatbots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4">
            <div className="relative mb-8">
              <div className="w-16 h-16 bg-zinc-900 border border-white/6 rounded-2xl flex items-center justify-center">
                <Bot size={28} className="text-zinc-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-700 border border-zinc-900 rounded-full" />
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-2">No bots yet</h3>
            <p className="text-[14px] text-zinc-500 text-center max-w-[300px] leading-relaxed">
              Connect a website to train your first AI assistant and deploy it instantly.
            </p>
          </div>
        ) : (
          /* Bot Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userChatbots.map((bot) => (
              <div
                key={bot.id}
                className="group relative bg-zinc-950 border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Subtle hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top row */}
                <div className="relative flex items-start justify-between mb-5">
                  {/* Bot icon */}
                  <div className="w-10 h-10 bg-zinc-900 border border-white/[0.08] rounded-xl flex items-center justify-center group-hover:border-blue-500/20 transition-colors duration-300">
                    <Cpu size={18} className="text-zinc-400 group-hover:text-blue-400 transition-colors duration-300" strokeWidth={1.5} />
                  </div>

                  {/* Status + ID */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-500">
                        Live
                      </span>
                    </div>

                    {/* ID badge */}
                    <div className="flex items-center gap-0.5 bg-zinc-900 border border-white/[0.06] rounded-lg px-2 py-1">
                      <span className="text-[10px] font-mono text-zinc-300 tracking-wide">
                        {bot.id.slice(0, 8)}
                      </span>
                      <CopyButton text={bot.id} />
                    </div>
                  </div>
                </div>

                {/* Bot info */}
                <div className="relative mb-5">
                  <h3 className="text-[15px] font-semibold text-white truncate mb-1.5 group-hover:text-blue-100 transition-colors duration-200">
                    {bot.displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Globe size={11} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[12px] ">
                      {bot.websiteUrl}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/chatbot/${bot.id}`}
                  className="relative flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-medium
                    bg-zinc-900 text-zinc-400 border border-white/[0.06]
                    hover:bg-blue-600 hover:text-white hover:border-blue-500/50
                    active:scale-[0.98] transition-all duration-200"
                >
                  <Settings size={14} strokeWidth={2} />
                  Configure Bot
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}