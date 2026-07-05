// @route  POST /api/upload
// @access Admin
// Returns an absolute URL to the uploaded file, so it works the same way a pasted image URL would.
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded' });
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  return res.status(201).json({ url });
};

module.exports = { uploadImage };
