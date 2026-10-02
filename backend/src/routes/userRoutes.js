const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { profileUpload } = require('../config/multer');
const { protect } = require('../middleware/auth');
const {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  getPublicProfiles,
  getPublicProfileById,
} = require('../controllers/userController');

// Current user profile (all protected)
router.route('/profile').get(protect, getMyProfile).put(protect, updateMyProfile);

// Profile photo (protected, uses profileUpload for uploads/profile-images/)
router
  .route('/profile/photo')
  .post(protect, profileUpload.single('photo'), uploadProfilePhoto)
  .delete(protect, deleteProfilePhoto);

// Gallery (protected, uses profileUpload)
router.route('/profile/gallery').post(protect, profileUpload.array('photos', 5), uploadGalleryPhotos);
router.route('/profile/gallery/:photoId').delete(protect, deleteGalleryPhoto);

// Public user directory (protected — only logged-in users can browse)
router.route('/users').get(protect, getPublicProfiles);
router.route('/users/:id').get(protect, getPublicProfileById);

module.exports = router;
