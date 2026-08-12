import mongoose from "mongoose";
import slugify from "slugify";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    // The provider image remains in `image`; this is our original AI cover.
    generatedImageUrl: { type: String, default: "" },
    generatedImageStatus: { type: String, enum: ["not_requested", "processing", "completed", "failed"], default: "not_requested" },
    generatedImageError: { type: String, default: "" },

    url: {
      type: String,
      required: true,
      unique: true,
    },

    source: {
      type: String,
      default: "",
    },

    originalTitle: { type: String, default: "" },
    originalDescription: { type: String, default: "" },
    canonicalKey: { type: String, index: true, default: "" },
    sourceContentHash: { type: String, index: true, default: "" },

    author: {
      type: String,
      default: "",
    },
    authorName: { type: String, default: "" },

    seoTitle: {
      type: String,
      default: "",
    },

    metaDescription: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    keyFacts: { type: [String], default: [] },
    whyItMatters: { type: String, default: "" },
    sentiment: { type: String, enum: ["positive", "neutral", "negative", "mixed"], default: "neutral" },
    keywords: { type: [String], default: [] },

    whyThisMatters: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    publishStatus: {
      type: String,
      enum: ["draft", "published", "rejected"],
      default: "draft",
      index: true,
    },

    readingTime: { type: Number, default: 1 },

    publishedAt: {
      type: Date,
    },

    // ---------------- AI ----------------

    aiSummary: {
      type: String,
      default: "",
    },

    aiStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    // An article is claimed before the provider is called. This prevents a
    // restart or concurrent worker from sending a second paid/free API request.
    aiRequestCount: { type: Number, default: 0, min: 0 },
    aiRequestedAt: { type: Date },
    aiResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    aiError: { type: String, default: "" },

    aiImportance: {
      type: Number,
      min: 1,
      max: 10,
      default: 0,
    },

    aiScoreFactors: {
      trending: { type: Number, default: 0 },
      sourceQuality: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
      searchVolume: { type: Number, default: 0 },
      freshness: { type: Number, default: 0 },
    },

    factCheckStatus: {
      type: String,
      enum: ["Verified", "Developing", "Rumor"],
      default: "Developing",
    },

    factCheckReason: {
      type: String,
      default: "",
    },

    trendingBadge: {
      type: String,
      enum: ["Trending", "Breaking", "Popular", "Viral"],
      default: "Trending",
    },

    trendingBadgeReason: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    trendingScore: {
      type: Number,
      default: 0,
    },

    featured: {
  type: Boolean,
  default: false,
},

bookmarked: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

newsSchema.pre("validate", function setSlug() {
  if (!this.slug && this.title) this.slug = `${slugify(this.title, { lower: true, strict: true }).slice(0, 80)}-${this._id.toString().slice(-6)}`;
});

export default mongoose.model("News", newsSchema);
