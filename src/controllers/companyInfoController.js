import CompanyInfo from "../models/CompanyInfo.js";

// Get company info
export const getCompanyInfo = async (req, res) => {
  try {
    let companyInfo = await CompanyInfo.findOne();
    if (!companyInfo) {
      // Create default company info if it doesn't exist
      companyInfo = await CompanyInfo.create({
        companyName: "Baqavi Book Centre",
        email: "baqavibookcentre@gmail.com",
        phone: "+91 9999999999",
        address: "123 Main Street",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "India",
        taxId: "",
        website: "https://www.baqavibookcentre.com",
        logo: "",
      });
    }
    res.json(companyInfo);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update company info
export const updateCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = await CompanyInfo.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedInfo) {
      return res.status(404).json({ success: false, message: "Company info not found" });
    }
    
    res.json({ success: true, companyInfo: updatedInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};