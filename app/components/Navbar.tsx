import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex justify-between p-4 shadow-sm">
      <h1 className="font-bold text-xl">Rifat AI</h1>
      <UserButton afterSignOutUrl="/" />
    </nav>
  );
}