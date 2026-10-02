const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');

// @desc   Submit an adoption request
// @route  POST /api/adoption-requests
// @access Private
const createAdoptionRequest = async (req, res, next) => {
  try {
    const { petId, fullName, email, phone, address, reason, hasOtherPets } = req.body;

    // Check pet exists and is available
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found.' });
    }
    if (pet.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This pet is currently ${pet.status} and not accepting requests.`,
      });
    }

    // Check for duplicate request
    const existing = await AdoptionRequest.findOne({ pet: petId, requester: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an adoption request for this pet.',
      });
    }

    const adoptionRequest = await AdoptionRequest.create({
      pet: petId,
      requester: req.user._id,
      fullName,
      email,
      phone,
      address,
      reason,
      hasOtherPets: hasOtherPets || false,
    });

    await adoptionRequest.populate([
      { path: 'pet', select: 'name breed species photoPath' },
      { path: 'requester', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Adoption request submitted successfully.',
      data: adoptionRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all adoption requests (admin sees all, user sees their own)
// @route  GET /api/adoption-requests
// @access Private
const getAdoptionRequests = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { requester: req.user._id };
    const { petId, status } = req.query;

    if (petId) filter.pet = petId;
    if (status) filter.status = status;

    const requests = await AdoptionRequest.find(filter)
      .populate('pet', 'name breed species photoPath status')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc   Get a single adoption request
// @route  GET /api/adoption-requests/:id
// @access Private
const getAdoptionRequestById = async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)
      .populate('pet', 'name breed species photoPath status')
      .populate('requester', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Adoption request not found.' });
    }

    // Only allow admin or the requester to view
    if (
      req.user.role !== 'admin' &&
      request.requester._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc   Update adoption request status (admin only)
// @route  PATCH /api/adoption-requests/:id/status
// @access Private/Admin
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const request = await AdoptionRequest.findById(req.params.id).populate('pet');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Adoption request not found.' });
    }

    request.status = status;
    await request.save();

    // Auto-update pet status when request is approved
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(request.pet._id, { status: 'adopted' });
    }

    res.status(200).json({
      success: true,
      message: `Adoption request ${status}.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateRequestStatus,
};
