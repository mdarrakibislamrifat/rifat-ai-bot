import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <div className="fixed top-4 right-4">
      <UserButton />
    </div>
  );
}