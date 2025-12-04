import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-between py-16 px-8">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-green-600">AyatBits</div>
          <div className="flex gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center gap-8 text-center flex-1 justify-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Craft the best docs in the world
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            A gamified Quranic study application focusing on puzzles to help you memorize and understand verses
          </p>
          <div className="flex gap-4 mt-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Try New Version
                </Button>
              </SignUpButton>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start Learning
                </Button>
              </Link>
            </SignedIn>
          </div>

        </div>

        {/* Footer */}
        <footer className="w-full mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 AyatBits. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
