const FooterConfig = require("../models/FooterConfig");

// 1. GET FOOTER CONFIG (PUBLIC)
exports.getFooterConfig = async (req, res) => {
  try {
    let footer = await FooterConfig.findOne();

    if (!footer) {
      // Create initial default footer document if none exists
      footer = await FooterConfig.create({});
    }

    res.status(200).json({ success: true, data: footer });
  } catch (error) {
    console.error("GET FOOTER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. UPDATE FOOTER CONFIG (ADMIN)
exports.updateFooterConfig = async (req, res) => {
  try {
    const {
      newsletterHeading,
      categories,
      supportLinks,
      quickLinks,
      policyLinks,
      contactEmail,
      contactPhone,
      contactHours,
      copyrightText,
      socialLinks,
    } = req.body;

    let footer = await FooterConfig.findOne();

    const updateData = {
      newsletterHeading,
      categories,
      supportLinks,
      quickLinks,
      policyLinks,
      contactEmail,
      contactPhone,
      contactHours,
      copyrightText,
      socialLinks,
    };

    if (!footer) {
      footer = await FooterConfig.create(updateData);
    } else {
      footer = await FooterConfig.findByIdAndUpdate(footer._id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: "Footer updated successfully",
      data: footer,
    });
  } catch (error) {
    console.error("UPDATE FOOTER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
