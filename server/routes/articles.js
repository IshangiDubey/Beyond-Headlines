import express from 'express';
import { articleRepo } from '../data/store.js';

const router = express.Router();

// GET /api/articles - List articles with filtering, searching, pagination
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, limit, page } = req.query;
    const data = await articleRepo.getAll({ category, search, tag, limit, page });
    res.json({
      success: true,
      total: data.total,
      articles: data.articles
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/trending - Most viewed articles
router.get('/trending', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const trending = await articleRepo.getTrending(limit);
    res.json({ success: true, articles: trending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/:identifier - Single article by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const article = await articleRepo.getByIdOrSlug(req.params.identifier);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    // Also fetch related articles from the same category
    const { articles: related } = await articleRepo.getAll({
      category: article.category,
      limit: 3
    });

    res.json({
      success: true,
      article,
      related: related.filter(a => (a.id || a._id) !== (article.id || article._id))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/:identifier/comments - List comments for article
router.get('/:identifier/comments', async (req, res) => {
  try {
    const article = await articleRepo.getByIdOrSlug(req.params.identifier);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({
      success: true,
      comments: article.comments || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles/:identifier/comments - Add new comment to article
router.post('/:identifier/comments', async (req, res) => {
  try {
    const { author, authorRole, avatar, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }
    const result = await articleRepo.addComment(req.params.identifier, {
      author: author ? author.trim() : 'Reader',
      authorRole: authorRole || 'Verified Reader',
      avatar: avatar || '',
      text: text.trim()
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.status(201).json({
      success: true,
      comment: result.comment,
      total: result.total
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles/:identifier/comments/:commentId/like - Upvote/Like comment
router.post('/:identifier/comments/:commentId/like', async (req, res) => {
  try {
    const result = await articleRepo.likeComment(req.params.identifier, req.params.commentId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Comment or article not found.' });
    }
    res.json({ success: true, likes: result.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles - Create an article (for editor or demo publish)
router.post('/', async (req, res) => {
  try {
    const { title, summary, content, category, author, imageUrl, tags, authorRole } = req.body;
    if (!title || !summary || !content || !category || !author) {
      return res.status(400).json({ success: false, message: 'Missing required article fields.' });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newArticle = await articleRepo.create({
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      summary,
      content,
      category,
      author,
      authorRole: authorRole || 'Contributing Writer',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      tags: tags || [category],
      readTime: `${Math.max(2, Math.ceil(content.split(' ').length / 180))} min read`,
      publishedAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, article: newArticle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/articles/:identifier - Update an article
router.put('/:identifier', async (req, res) => {
  try {
    const updated = await articleRepo.update(req.params.identifier, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, article: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/articles/:identifier - Delete an article
router.delete('/:identifier', async (req, res) => {
  try {
    const deleted = await articleRepo.delete(req.params.identifier);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/articles/:identifier/comments/:commentId - Delete a comment
router.delete('/:identifier/comments/:commentId', async (req, res) => {
  try {
    const deleted = await articleRepo.deleteComment(req.params.identifier, req.params.commentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article or comment not found.' });
    }
    res.json({ success: true, message: 'Comment removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
