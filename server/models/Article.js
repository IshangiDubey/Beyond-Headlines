import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Politics', 'Agriculture', 'Education', 'Economy', 'Technology', 'Health', 'World', 'Environment']
    },
    author: { type: String, required: true },
    authorRole: { type: String, default: 'Staff Correspondent' },
    readTime: { type: String, default: '4 min read' },
    publishedAt: { type: Date, default: Date.now },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false },
    breaking: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    comments: [
      {
        id: { type: String },
        author: { type: String, required: true },
        authorRole: { type: String, default: 'Reader' },
        avatar: { type: String, default: '' },
        text: { type: String, required: true },
        likes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

articleSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default Article;
