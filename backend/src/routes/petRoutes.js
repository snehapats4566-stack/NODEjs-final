const express = require('express');
const { body, param } = require('express-validator');
const {
  createPet,
  getPets,
  getPetById,
  updatePetStatus,
  updatePet,
  deletePet,
} = require('../controllers/petController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../config/multer');

const router = express.Router();

// Validation rules
const petValidation = [
  body('name').trim().notEmpty().withMessage('Pet name is required')
    .isLength({ max: 60 }).withMessage('Name cannot exceed 60 characters'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('age').isFloat({ min: 0, max: 30 }).withMessage('Age must be between 0 and 30'),
  body('species').optional().isIn(['dog', 'cat', 'bird', 'rabbit', 'other'])
    .withMessage('Invalid species'),
  body('gender').optional().isIn(['male', 'female', 'unknown']).withMessage('Invalid gender'),
];

const statusValidation = [
  body('status').isIn(['available', 'adopted', 'pending'])
    .withMessage('Status must be available, adopted, or pending'),
];

// Public routes
router.get('/', getPets);
router.get('/:id', getPetById);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('photo'), petValidation, validate, createPet);
router.put('/:id', protect, adminOnly, upload.single('photo'), updatePet);
router.patch('/:id/status', protect, adminOnly, statusValidation, validate, updatePetStatus);
router.delete('/:id', protect, adminOnly, deletePet);

module.exports = router;
