const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const { protect, authorizeRoles } = require("../middleware/auth");

// GET /api/invitations/search-students  — Instructor only
router.get(
  "/search-students",
  protect,
  authorizeRoles("instructor"),
  async (req, res) => {
    try {
      const { section, college, department, schoolYear } = req.query;
      if (!section)
        return res
          .status(400)
          .json({ message: "Section is required to search" });

      const query = { role: "student", isActive: true, section };
      if (college) query.college = new RegExp(college, "i");
      if (department) query.department = new RegExp(department, "i");
      if (schoolYear) query.schoolYear = schoolYear;

      const students = await User.find(query).select("-password");
      res.json({ students, count: students.length });
    } catch (error) {
      res.status(500).json({ message: "Server error during search" });
    }
  },
);

// POST /api/invitations/invite  — Instructor only
router.post(
  "/invite",
  protect,
  authorizeRoles("instructor"),
  async (req, res) => {
    try {
      const { section, college, department, schoolYear, studentIds } = req.body;
      if (!section || !studentIds || studentIds.length === 0)
        return res
          .status(400)
          .json({ message: "Section and at least one student are required" });

      let invitation = await Invitation.findOne({
        instructorId: req.user._id,
        section,
      });

      if (invitation) {
        const existing = invitation.invitedStudents.map((id) => id.toString());
        const newStudents = studentIds.filter((id) => !existing.includes(id));
        invitation.invitedStudents.push(...newStudents);
        await invitation.save();
      } else {
        invitation = await Invitation.create({
          instructorId: req.user._id,
          section,
          college: college || null,
          department: department || null,
          schoolYear: schoolYear || null,
          invitedStudents: studentIds,
        });
      }

      await invitation.populate("invitedStudents", "-password");
      res.json({
        message: `${studentIds.length} student(s) invited successfully`,
        invitation,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error during invitation" });
    }
  },
);

// GET /api/invitations/my-invitations  — Instructor only
router.get(
  "/my-invitations",
  protect,
  authorizeRoles("instructor"),
  async (req, res) => {
    try {
      const invitations = await Invitation.find({ instructorId: req.user._id })
        .populate("invitedStudents", "-password")
        .sort({ createdAt: -1 });
      res.json({ invitations });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET /api/invitations/my-materials  — Student only
router.get(
  "/my-materials",
  protect,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const invitations = await Invitation.find({
        invitedStudents: req.user._id,
        isActive: true,
      })
        .populate("instructorId", "fullName userId department")
        .sort({ createdAt: -1 });

      const materials = invitations.map((inv) => ({
        invitationId: inv._id,
        section: inv.section,
        instructor: inv.instructorId,
        materials: inv.materials,
      }));
      res.json({ materials });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// POST /api/invitations/:id/add-material  — Instructor only
router.post(
  "/:id/add-material",
  protect,
  authorizeRoles("instructor"),
  async (req, res) => {
    try {
      const { title, type, url, description } = req.body;
      if (!title)
        return res.status(400).json({ message: "Material title is required" });

      const invitation = await Invitation.findOne({
        _id: req.params.id,
        instructorId: req.user._id,
      });
      if (!invitation)
        return res.status(404).json({ message: "Invitation not found" });

      invitation.materials.push({ title, type, url, description });
      await invitation.save();
      res.json({ message: "Material added successfully", invitation });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
