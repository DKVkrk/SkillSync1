import Event from '../models/Event.js';

// @desc    Create a new split group/event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ status: 'fail', message: 'Please provide an event title' });
    }

    // Create the event record, initializing the creator as the first member
    const event = await Event.create({
      title,
      description,
      createdBy: req.user._id, // Injected by our protect middleware
      members: [req.user._id], // Group creator is automatically member #1
    });

    res.status(201).json({
      status: 'success',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all events the logged-in user belongs to
// @route   GET /api/events
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    // Find all documents where the current logged-in user's ID exists inside the members array
    const events = await Event.find({ members: req.user._id })
      .populate('createdBy', 'name email') // Swaps ID for creator's actual name & email
      .populate('members', 'name email phone upiId'); // Swaps member IDs for full profiles

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};