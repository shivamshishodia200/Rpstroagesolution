import { State } from '../models/State.js';
import { City } from '../models/City.js';
import { logAudit } from '../utils/audit.js';

export const getStates = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const states = await State.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, count: states.length, states });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    return res.status(200).json({ success: true, state });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createState = async (req, res) => {
  try {
    const { name, code, country, isActive } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'State name and code are required' });
    }

    const existing = await State.findOne({
      $or: [{ name: name.trim() }, { code: code.toUpperCase().trim() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A state with this name or code already exists',
      });
    }

    const state = await State.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      country: country || 'India',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAudit({
      req,
      action: 'STATE_CREATE',
      entityType: 'State',
      entityId: state._id,
      details: `Created state '${state.name}' (${state.code})`,
    });

    return res.status(201).json({ success: true, state });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    const { name, code, country, isActive } = req.body;

    if (name) {
      const duplicateName = await State.findOne({ name: name.trim(), _id: { $ne: id } });
      if (duplicateName) {
        return res.status(400).json({ success: false, message: 'State name already in use' });
      }
      state.name = name.trim();
    }

    if (code) {
      const duplicateCode = await State.findOne({ code: code.toUpperCase().trim(), _id: { $ne: id } });
      if (duplicateCode) {
        return res.status(400).json({ success: false, message: 'State code already in use' });
      }
      state.code = code.toUpperCase().trim();
    }

    if (country !== undefined) state.country = country;
    if (isActive !== undefined) state.isActive = Boolean(isActive);

    await state.save();

    await logAudit({
      req,
      action: 'STATE_UPDATE',
      entityType: 'State',
      entityId: state._id,
      details: `Updated state '${state.name}'`,
    });

    return res.status(200).json({ success: true, state });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    // Safety check: Are any cities in this state?
    const citiesUsing = await City.countDocuments({ state: state.name });
    if (citiesUsing > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete state: ${citiesUsing} city/cities are assigned to '${state.name}'. Please reassign them first.`,
      });
    }

    await State.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'STATE_DELETE',
      entityType: 'State',
      entityId: id,
      details: `Deleted state '${state.name}' (${state.code})`,
    });

    return res.status(200).json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
