const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: String,
    phone: String,
    dob: String // Format: YYYY-MM-DD
});

module.exports = mongoose.model('Employee', EmployeeSchema);
