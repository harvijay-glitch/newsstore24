function Hero() {
  return (
    <section className="bg-gray-100 py-20">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

        {/* Left Side */}

        <div>

          <span className="bg-red-600 text-white px-4 py-1 rounded-full">
            Breaking News
          </span>

          <h1 className="text-6xl font-bold mt-6 leading-tight">

            AI is Changing the Future of Journalism

          </h1>

          <p className="text-gray-600 mt-6 text-lg">

            Discover the latest stories from around the world.
            Stay updated with Technology, Business,
            Sports and Breaking News.

          </p>

          <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">

            Read More

          </button>

        </div>

        {/* Right Side */}

        <div>

          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900"
            alt="News"
            className="rounded-xl shadow-xl"
          />

        </div>

      </div>

    </section>
  )
}

export default Hero