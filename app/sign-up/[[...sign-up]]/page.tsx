import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 rotate-45">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 -rotate-12">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Start Your Journey
          </h1>
          <p className="text-gray-400">
            Create an account to begin mastering the Quran
          </p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 text-white border-gray-700",
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
                formFieldInput: "bg-gray-800 border-gray-700 text-white",
                formFieldLabel: "text-gray-300",
                footerActionLink: "text-green-500 hover:text-green-400",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-green-500",
                formResendCodeLink: "text-green-500",
                otpCodeFieldInput: "bg-gray-800 border-gray-700 text-white",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

