function NewsCard({ image, category, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">

      <img
        src={image}
        alt={title}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">

        <span className="text-blue-600 font-semibold">
          {category}
        </span>

        <h2 className="text-2xl font-bold mt-2">
          {title}
        </h2>

        <p className="text-gray-600 mt-3">
          {description}
        </p>

        <button className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
          Read More
        </button>

      </div>

    </div>
  );
}

export default NewsCard;