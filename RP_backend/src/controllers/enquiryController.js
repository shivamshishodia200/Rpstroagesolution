import { Enquiry } from '../models/Enquiry.js';
import { logAudit } from '../utils/audit.js';

// GET all enquiries with filters, search, pagination
export const getEnquiries = async (req, res) => {
  try {
    const { search, city, status, product, startDate, endDate, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { requirementDetails: { $regex: search, $options: 'i' } },
      ];
    }
    if (city) query.city = { $regex: city, $options: 'i' };
    if (status) query.status = status;
    if (product) query.productOfInterest = { $regex: product, $options: 'i' };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort(sort).skip(skip).limit(parseInt(limit, 10)).lean(),
      Enquiry.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      enquiries,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET single enquiry
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    return res.status(200).json({ success: true, enquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE enquiry status or assignment
export const updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    const { status, assignedTo, newNote } = req.body;

    if (status) enquiry.status = status;
    if (assignedTo) enquiry.assignedTo = assignedTo;

    if (newNote && newNote.trim()) {
      enquiry.internalNotes.push({
        note: newNote.trim(),
        addedBy: req.user.name,
        addedAt: new Date(),
      });
    }

    await enquiry.save();

    await logAudit({
      req,
      action: 'UPDATE_ENQUIRY',
      entityType: 'Enquiry',
      entityId: enquiry._id,
      details: `Updated enquiry status to '${enquiry.status}' for ${enquiry.name}`,
    });

    return res.status(200).json({ success: true, enquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// EXPORT enquiries to CSV
export const exportEnquiriesCSV = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();

    const headers = 'ID,Name,Phone,Email,Company,City,Product,Area,Status,Created At\n';
    const rows = enquiries
      .map((e) => {
        return `"${e._id}","${(e.name || '').replace(/"/g, '""')}","${e.phone || ''}","${e.email || ''}","${(e.company || '').replace(/"/g, '""')}","${(e.city || '').replace(/"/g, '""')}","${(e.productOfInterest || '').replace(/"/g, '""')}","${(e.storeArea || '').replace(/"/g, '""')}","${e.status}","${new Date(e.createdAt).toISOString()}"`;
      })
      .join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`rp_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(headers + rows);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
