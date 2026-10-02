const Pet = require('../models/Pet');
const fs = require('fs');
const path = require('path');

// @desc   Create a new pet listing
// @route  POST /api/pets
// @access Private/Admin
const createPet = async (req, res, next) => {
  try {
    const { name, breed, age, species, gender, description } = req.body;

    const photoPath = req.file
      ? `${process.env.UPLOAD_PATH || 'uploads/'}${req.file.filename}`
      : null;

    const pet = await Pet.create({
      name,
      breed,
      age,
      species,
      gender,
      description,
      photoPath,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Pet listing created successfully.',
      data: pet,
    });
  } catch (error) {
    // Delete uploaded file if pet creation fails
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

// @desc   Get all pets (with optional status filter)
// @route  GET /api/pets?status=available&species=dog&page=1&limit=12
// @access Public
const getPets = async (req, res, next) => {
  try {
    const { status, species, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (species) filter.species = species;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Pet.countDocuments(filter);

    const pets = await Pet.find(filter)
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single pet by ID
// @route  GET /api/pets/:id
// @access Public
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('addedBy', 'name email');

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc   Update pet status (admin only)
// @route  PATCH /api/pets/:id/status
// @access Private/Admin
const updatePetStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    pet.status = status;
    await pet.save();

    res.status(200).json({
      success: true,
      message: `Pet status updated to "${status}".`,
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update pet details (admin only)
// @route  PUT /api/pets/:id
// @access Private/Admin
const updatePet = async (req, res, next) => {
  try {
    const { name, breed, age, species, gender, description } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    // Handle new photo upload
    if (req.file) {
      // Delete old photo if it exists
      if (pet.photoPath && fs.existsSync(pet.photoPath)) {
        fs.unlink(pet.photoPath, () => {});
      }
      pet.photoPath = `${process.env.UPLOAD_PATH || 'uploads/'}${req.file.filename}`;
    }

    if (name !== undefined) pet.name = name;
    if (breed !== undefined) pet.breed = breed;
    if (age !== undefined) pet.age = age;
    if (species !== undefined) pet.species = species;
    if (gender !== undefined) pet.gender = gender;
    if (description !== undefined) pet.description = description;

    await pet.save();

    res.status(200).json({ success: true, message: 'Pet updated successfully.', data: pet });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// @desc   Delete pet (admin only)
// @route  DELETE /api/pets/:id
// @access Private/Admin
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }

    // Remove associated photo
    if (pet.photoPath && fs.existsSync(pet.photoPath)) {
      fs.unlink(pet.photoPath, () => {});
    }

    await pet.deleteOne();

    res.status(200).json({ success: true, message: 'Pet deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPet, getPets, getPetById, updatePetStatus, updatePet, deletePet };
