const Blog = require('../models/Blog');

// 1. CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    const { title, snippet, readingTime, sections } = req.body;

    let coverImage = "";
    const sectionImages = {}; // key: fieldname, value: path

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'coverImage') {
          coverImage = file.path || file.secure_url;
        } else if (file.fieldname.startsWith('sectionImage_')) {
          sectionImages[file.fieldname] = file.path || file.secure_url;
        }
      });
    }

    let parsedSections = [];
    if (sections) {
      try {
        parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
      } catch (err) {
        parsedSections = [];
      }
    }

    // Attach section images to parsed sections
    parsedSections = parsedSections.map((sec, index) => {
      const imgKey = `sectionImage_${index}`;
      return {
        text: sec.text || '',
        imageUrl: sectionImages[imgKey] || sec.imageUrl || ''
      };
    });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const blog = await Blog.create({
      title,
      slug,
      snippet,
      readingTime,
      coverImage,
      sections: parsedSections
    });

    res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ALL BLOGS
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET SINGLE BLOG BY ID OR SLUG
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id);
    } else {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, snippet, readingTime, sections, existingCoverImage } = req.body;

    let coverImage = existingCoverImage;
    const sectionImages = {};

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'coverImage') {
          coverImage = file.path || file.secure_url;
        } else if (file.fieldname.startsWith('sectionImage_')) {
          sectionImages[file.fieldname] = file.path || file.secure_url;
        }
      });
    }

    let parsedSections = [];
    if (sections) {
      try {
        parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
      } catch (err) {
        parsedSections = [];
      }
    }

    parsedSections = parsedSections.map((sec, index) => {
      const imgKey = `sectionImage_${index}`;
      return {
        text: sec.text || '',
        imageUrl: sectionImages[imgKey] || sec.imageUrl || ''
      };
    });

    const updateData = {
      title,
      snippet,
      readingTime,
      sections: parsedSections
    };

    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    if (title) {
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
