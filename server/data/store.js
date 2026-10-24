import { initialArticles } from './seedArticles.js';
import Article from '../models/Article.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// In-memory fallback dataset for seamless offline/standalone runs
let memoryArticles = JSON.parse(JSON.stringify(initialArticles));
let memoryUsers = [
  {
    _id: 'user-demo-1',
    id: 'user-demo-1',
    name: 'Editorial Member',
    email: 'reader@gazette.org',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'reader',
    savedArticles: ['art-1', 'art-4']
  },
  {
    _id: 'user-admin-1',
    id: 'user-admin-1',
    name: 'Marcus Vance',
    email: 'admin@beyondheadlines.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Chief Executive Editor & Publishing Administrator',
    savedArticles: []
  }
];

export const isDbConnected = () => {
  return Article.db && Article.db.readyState === 1;
};

export const syncSeedToMongo = async () => {
  try {
    if (isDbConnected()) {
      const count = await Article.countDocuments();
      if (count === 0) {
        console.log('Seeding initial news articles into MongoDB...');
        for (const item of initialArticles) {
          const { id, ...rest } = item;
          await Article.create(rest);
        }
        console.log('Successfully seeded MongoDB articles.');
      }

      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        await User.create({
          name: 'Marcus Vance',
          email: 'admin@beyondheadlines.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'Chief Executive Editor & Publishing Administrator'
        });
        console.log('Successfully seeded Admin user.');
      }
    }
  } catch (err) {
    console.error('Seed sync error:', err.message);
  }
};

export const articleRepo = {
  async getAll({ category, search, tag, limit, page = 1 }) {
    if (isDbConnected()) {
      const query = {};
      if (category && category !== 'All') {
        query.category = new RegExp(`^${category}$`, 'i');
      }
      if (tag) {
        query.tags = tag;
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ title: regex }, { summary: regex }, { content: regex }, { author: regex }, { category: regex }];
      }

      const total = await Article.countDocuments(query);
      const docs = await Article.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * (limit || 100))
        .limit(limit ? Number(limit) : 100);

      return { total, articles: docs.map(d => ({ ...d.toObject(), id: d._id.toString() })) };
    }

    // Fallback in-memory
    let results = [...memoryArticles];
    if (category && category !== 'All') {
      results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (tag) {
      results = results.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const total = results.length;
    const startIndex = (page - 1) * (limit || 100);
    const paginated = (limit ? results.slice(startIndex, startIndex + Number(limit)) : results).map(a => {
      const art = ensureArticleComments(a);
      return {
        ...art,
        commentsCount: (art.comments && art.comments.length) || 3
      };
    });

    return { total, articles: paginated };
  },

  async getByIdOrSlug(identifier) {
    if (isDbConnected()) {
      let article;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(identifier);
      }
      if (!article) {
        article = await Article.findOne({ slug: identifier });
      }
      if (article) {
        article.views += 1;
        if (!article.comments || article.comments.length === 0) {
          const sample = getInitialCommentsForArticle(article);
          article.comments = sample;
        }
        await article.save();
        const obj = article.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          commentsCount: obj.comments ? obj.comments.length : 0
        };
      }
      return null;
    }

    const article = memoryArticles.find(a => a.id === identifier || a.slug === identifier);
    if (article) {
      article.views = (article.views || 0) + 1;
      const hydrated = ensureArticleComments(article);
      return {
        ...hydrated,
        commentsCount: hydrated.comments.length
      };
    }
    return null;
  },

  async getTrending(limit = 5) {
    if (isDbConnected()) {
      const articles = await Article.find().sort({ views: -1, publishedAt: -1 }).limit(limit);
      return articles.map(d => {
        const obj = d.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          commentsCount: (obj.comments && obj.comments.length) || 3
        };
      });
    }
    return [...memoryArticles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
      .map(a => {
        const art = ensureArticleComments(a);
        return {
          ...art,
          commentsCount: art.comments.length
        };
      });
  },

  async addComment(identifier, commentData) {
    const newComment = {
      id: `cmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      author: commentData.author || 'Anonymous Reader',
      authorRole: commentData.authorRole || 'Verified Reader',
      avatar: commentData.avatar || '',
      text: commentData.text,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      let article;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(identifier);
      }
      if (!article) {
        article = await Article.findOne({ slug: identifier });
      }
      if (article) {
        if (!article.comments || article.comments.length === 0) {
          article.comments = getInitialCommentsForArticle(article);
        }
        article.comments.unshift(newComment);
        await article.save();
        return { comment: newComment, total: article.comments.length };
      }
    }

    const article = memoryArticles.find(a => a.id === identifier || a.slug === identifier);
    if (article) {
      ensureArticleComments(article);
      article.comments.unshift(newComment);
      return { comment: newComment, total: article.comments.length };
    }
    return null;
  },

  async likeComment(identifier, commentId) {
    if (isDbConnected()) {
      let article;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(identifier);
      }
      if (!article) {
        article = await Article.findOne({ slug: identifier });
      }
      if (article && article.comments) {
        const cmt = article.comments.find(c => c.id === commentId || c._id?.toString() === commentId);
        if (cmt) {
          cmt.likes = (cmt.likes || 0) + 1;
          await article.save();
          return { likes: cmt.likes };
        }
      }
    }

    const article = memoryArticles.find(a => a.id === identifier || a.slug === identifier);
    if (article && article.comments) {
      const cmt = article.comments.find(c => c.id === commentId);
      if (cmt) {
        cmt.likes = (cmt.likes || 0) + 1;
        return { likes: cmt.likes };
      }
    }
    return null;
  },

  async create(data) {
    if (isDbConnected()) {
      const created = await Article.create(data);
      return { ...created.toObject(), id: created._id.toString() };
    }
    const newArticle = {
      ...data,
      id: `art-${Date.now()}`,
      views: 0,
      publishedAt: data.publishedAt || new Date().toISOString()
    };
    memoryArticles.unshift(newArticle);
    return newArticle;
  },

  async update(identifier, data) {
    if (isDbConnected()) {
      let article;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(identifier);
      }
      if (!article) {
        article = await Article.findOne({ slug: identifier });
      }
      if (article) {
        Object.assign(article, data);
        await article.save();
        return { ...article.toObject(), id: article._id.toString() };
      }
    }
    const index = memoryArticles.findIndex(a => a.id === identifier || a.slug === identifier);
    if (index !== -1) {
      memoryArticles[index] = { ...memoryArticles[index], ...data };
      return memoryArticles[index];
    }
    return null;
  },

  async delete(identifier) {
    if (isDbConnected()) {
      let result;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        result = await Article.findByIdAndDelete(identifier);
      }
      if (!result) {
        result = await Article.findOneAndDelete({ slug: identifier });
      }
      return Boolean(result);
    }
    const index = memoryArticles.findIndex(a => a.id === identifier || a.slug === identifier);
    if (index !== -1) {
      memoryArticles.splice(index, 1);
      return true;
    }
    return false;
  },

  async deleteComment(identifier, commentId) {
    if (isDbConnected()) {
      let article;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        article = await Article.findById(identifier);
      }
      if (!article) {
        article = await Article.findOne({ slug: identifier });
      }
      if (article && article.comments) {
        article.comments = article.comments.filter(c => c.id !== commentId && c._id?.toString() !== commentId);
        await article.save();
        return true;
      }
    }
    const article = memoryArticles.find(a => a.id === identifier || a.slug === identifier);
    if (article && article.comments) {
      article.comments = article.comments.filter(c => c.id !== commentId);
      return true;
    }
    return false;
  }
};

function getInitialCommentsForArticle(art) {
  const timeBase = new Date(art.publishedAt || Date.now()).getTime();
  return [
    {
      id: `cmt-${art.id || art.slug || 'p'}-1`,
      author: 'Dr. Michael Chen',
      authorRole: 'Policy Analyst',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: 'Crucial dispatch. The structural shifts detailed here reflect long-overdue institutional modernization. Rigorous reporting as always.',
      likes: 14,
      createdAt: new Date(timeBase - 2 * 3600000).toISOString()
    },
    {
      id: `cmt-${art.id || art.slug || 'p'}-2`,
      author: 'Sarah Jenkins',
      authorRole: 'Verified Subscriber',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      text: 'The execution benchmarks discussed will be key. Hope Beyond Headlines follows up on regional implementation data next quarter.',
      likes: 9,
      createdAt: new Date(timeBase - 4 * 3600000).toISOString()
    },
    {
      id: `cmt-${art.id || art.slug || 'p'}-3`,
      author: 'David K. O’Connor',
      authorRole: 'Community Contributor',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      text: 'Appreciate the transparent breakdown without sensationalism. This is why depth in journalism matters.',
      likes: 6,
      createdAt: new Date(timeBase - 6 * 3600000).toISOString()
    }
  ];
}

function ensureArticleComments(art) {
  if (!art.comments || art.comments.length === 0) {
    art.comments = getInitialCommentsForArticle(art);
  }
  return art;
}

export const userRepo = {
  async findByEmail(email) {
    if (isDbConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async findById(id) {
    if (isDbConnected()) {
      return await User.findById(id).select('-password');
    }
    const user = memoryUsers.find(u => u.id === id || u._id === id);
    if (user) {
      const { passwordHash, ...safe } = user;
      return safe;
    }
    return null;
  },

  async create({ name, email, password }) {
    if (isDbConnected()) {
      const user = new User({ name, email, password });
      await user.save();
      return user;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `user-${Date.now()}`,
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'reader',
      savedArticles: []
    };
    memoryUsers.push(newUser);
    return newUser;
  },

  async verifyPassword(user, password) {
    if (isDbConnected() && typeof user.comparePassword === 'function') {
      return await user.comparePassword(password);
    }
    if (user.passwordHash) {
      return await bcrypt.compare(password, user.passwordHash);
    }
    return false;
  },

  async toggleSavedArticle(userId, articleId) {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) return null;
      const idx = user.savedArticles.indexOf(articleId);
      if (idx > -1) {
        user.savedArticles.splice(idx, 1);
      } else {
        user.savedArticles.push(articleId);
      }
      await user.save();
      return user.savedArticles;
    }

    const user = memoryUsers.find(u => u.id === userId || u._id === userId);
    if (!user) return null;
    if (!user.savedArticles) user.savedArticles = [];
    const idx = user.savedArticles.indexOf(articleId);
    if (idx > -1) {
      user.savedArticles.splice(idx, 1);
    } else {
      user.savedArticles.push(articleId);
    }
    return user.savedArticles;
  },

  async updateProfile(userId, { name, email, avatar, bio, preferredCategory, notificationsEnabled, newPassword }) {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) return null;
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (typeof avatar !== 'undefined') user.avatar = avatar;
      if (typeof bio !== 'undefined') user.bio = bio;
      if (preferredCategory) user.preferredCategory = preferredCategory;
      if (typeof notificationsEnabled !== 'undefined') user.notificationsEnabled = notificationsEnabled;
      if (newPassword && newPassword.length >= 6) {
        user.password = newPassword;
      }
      await user.save();
      const safe = user.toObject();
      delete safe.password;
      return { ...safe, id: user._id.toString() };
    }

    const user = memoryUsers.find(u => u.id === userId || u._id === userId);
    if (!user) return null;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (typeof avatar !== 'undefined') user.avatar = avatar;
    if (typeof bio !== 'undefined') user.bio = bio;
    if (preferredCategory) user.preferredCategory = preferredCategory;
    if (typeof notificationsEnabled !== 'undefined') user.notificationsEnabled = notificationsEnabled;
    if (newPassword && newPassword.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }
    const { passwordHash, ...safe } = user;
    return safe;
  }
};
