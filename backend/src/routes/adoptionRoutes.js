const express = require('express');
const { body } = require('express-validator');
const {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateRequestStatus,
} = require('../controllers/adoptionController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const requestValidation = [
  body('petId').notEmpty().withMessage('Pet ID is required').isMongoId().withMessage('Invalid pet ID'),
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required')
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage('Please enter a valid phone number'),
  body('address').trim().notEmpty().withMessage('Address is required')
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),
  body('reason').trim().notEmpty().withMessage('Reason for adoption is required')
    .isLength({ min: 20, max: 1000 }).withMessage('Reason must be 20-1000 characters'),
  body('hasOtherPets').optional().isBoolean().withMessage('hasOtherPets must be a boolean'),
];

const statusValidation = [
  body('status').isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved, or rejected'),
];

router.post('/', protect, requestValidation, validate, createAdoptionRequest);
router.get('/', protect, getAdoptionRequests);
router.get('/:id', protect, getAdoptionRequestById);
router.patch('/:id/status', protect, adminOnly, statusValidation, validate, updateRequestStatus);

module.exports = router;
