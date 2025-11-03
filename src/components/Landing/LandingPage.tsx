import SparkieIcon3D from './SparkieIcon3D'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
      `}</style>

      <section className="bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png')] min-h-screen w-full bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <SparkieIcon3D />
          <h1 
            className="text-6xl md:text-8xl text-gray-900"
            style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700 }}
          >
            Sparkie
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 text-center max-w-2xl mb-12">
          Your AI-powered math tutor that guides you through problems using the Socratic method.
          <br />
          <span className="text-gray-600">Learn by discovering, not just by listening.</span>
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="bg-gray-800 hover:bg-black text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-xl active:scale-95"
        >
          Start Learning
        </button>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🤔</div>
            <h3 className="font-semibold text-gray-900 mb-2">Socratic Method</h3>
            <p className="text-sm text-gray-600">
              Learn through guided questions, not direct answers
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-semibold text-gray-900 mb-2">Image Upload</h3>
            <p className="text-sm text-gray-600">
              Snap a photo of any math problem to get started
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <h3 className="font-semibold text-gray-900 mb-2">Celebrate Progress</h3>
            <p className="text-sm text-gray-600">
              Get encouragement as you solve problems step-by-step
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

