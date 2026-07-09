const User = require("../models/User"); // Adjust path to your User model

// 1. Create a new Admin (SuperAdmin & Admin allowed via routes)
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, permissions } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password, // Hashed by your schema pre-save hook
      role: "admin", 
      permissions: permissions || ["user_read"], // Default permission aligned with frontend
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. List all Admin accounts (SuperAdmin & Admin)
exports.listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "SuperAdmin"] } }).select("-password");
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Admin Details & Permissions (SuperAdmin or Admin modifying profiles)
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, permissions, role } = req.body;

    // Check if the actor is SuperAdmin OR an Admin editing an allowed asset
    if (req.user.role !== "SuperAdmin" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized privilege level" });
    }

    const updateData = { firstName, lastName, email, phoneNumber };
    
    // Allow both SuperAdmin and Admins to modify operational permission matrices if authorized
    if (permissions) updateData.permissions = permissions;
    if (role && req.user.role === "SuperAdmin") updateData.role = role; // Safeguard roles modification to SuperAdmins

    const updatedAdmin = await User.findByIdAndUpdate(id, updateData, { returnDocument: "after" }).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, message: "Admin updated successfully", data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Admin account (SuperAdmin & Admin authorized)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Authentication context missing" });
    }

    // Prevent deleting oneself
    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    const adminToDelete = await User.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // FIX: Protect SuperAdmins from deletion, allow "admin" profiles to be dropped.
    if (adminToDelete.role === "SuperAdmin") {
      return res.status(400).json({ success: false, message: "Super Admin accounts cannot be deleted" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Admin account deleted successfully" });
  } catch (error) {
    console.error("Delete Admin Error: ", error); 
    return res.status(500).json({ success: false, message: error.message });
  }
};