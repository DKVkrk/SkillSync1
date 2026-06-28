import Event from '../models/Event.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';

// Create a group
export const createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ status: 'fail', message: 'Title is required' });

    const event = await Event.create({
      title,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get all my joined groups
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ members: req.user._id })
      .populate('createdBy', 'name email')
      .populate('members', 'name email phone');
    res.status(200).json({ status: 'success', data: events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Send notification invitation using targeted User ID
export const sendGroupInvite = async (req, res) => {
  try {
    const { userId } = req.body;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    if (!event.members.includes(req.user._id)) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    if (event.members.includes(userId)) return res.status(400).json({ status: 'fail', message: 'User is already a member' });

    const existingInvite = await Invitation.findOne({ event: eventId, invitedUser: userId });
    if (existingInvite) return res.status(400).json({ status: 'fail', message: 'Invitation already pending' });

    const invitation = await Invitation.create({ event: eventId, invitedUser: userId, invitedBy: req.user._id });
    res.status(201).json({ status: 'success', message: 'Invitation sent!', data: invitation });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Fetch incoming alerts (App notification center feed)
export const getReceivedInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ invitedUser: req.user._id, status: 'pending' })
      .populate('event', 'title description')
      .populate('invitedBy', 'name phone');
    res.status(200).json({ status: 'success', data: invites });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Respond (Accept / Reject)
export const respondToInvite = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    const inviteId = req.params.id;

    if (!['accepted', 'rejected'].includes(action)) return res.status(400).json({ status: 'fail', message: 'Invalid action' });

    const invite = await Invitation.findById(inviteId);
    if (!invite) return res.status(404).json({ status: 'fail', message: 'Invitation not found' });
    if (invite.invitedUser.toString() !== req.user._id.toString()) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    invite.status = action;
    await invite.save();

    if (action === 'accepted') {
      await Event.findByIdAndUpdate(invite.event, { $addToSet: { members: req.user._id } });
    }

    res.status(200).json({ status: 'success', message: `Invitation ${action}` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};