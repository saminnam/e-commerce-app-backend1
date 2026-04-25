const Contact = require('../models/Contact');

// GET contact info
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.status(200).json(contact || {});
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
};

// UPDATE or CREATE contact info
exports.updateContact = async (req, res) => {
  try {
    // We search for any record and update it, or create it if it doesn't exist
    const updatedContact = await Contact.findOneAndUpdate(
      {}, 
      req.body, 
      { new: true, upsert: true }
    );
    res.status(200).json(updatedContact);
  } catch (err) {
    res.status(400).json({ message: "Error updating data", error: err });
  }
};