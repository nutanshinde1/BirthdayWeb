const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');
const axios = require('axios');
const Employee = require('./models/Employee');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/birthdayDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ➕ Add Employee
app.post('/add', async (req, res) => {
    const { name, phone, dob } = req.body;
    const emp = new Employee({ name, phone, dob });
    await emp.save();
    res.send('Employee added');
});

// 🧾 Get all Employees
app.get('/employees', async (req, res) => {
    const all = await Employee.find();
    res.json(all);
});
// Update
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, dob } = req.body;
    await Employee.findByIdAndUpdate(id, { name, phone, dob });
    res.send('Employee updated');
});

// Delete
app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    console.log("🛠️ DELETE route hit with ID:", id);  // Add this line
    try {
        const deletedEmp = await Employee.findByIdAndDelete(id);
        if (!deletedEmp) {
            return res.status(404).send("Employee not found");
        }
        res.send("Employee deleted");
    } catch (err) {
        console.error("Error deleting employee:", err.message);
        res.status(500).send("Server error");
    }
});


// 📩 WhatsApp Sender using Twilio
const accountSid = 'AC768ffc3273d11090aae37b70d9033401';
const authToken = 'f3fcff3d85daa219b9249a162f3db492';
const twilioClient = require('twilio')(accountSid, authToken);
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio sandbox number

// ⏰ Daily Cron Job to Send Birthday WhatsApp Messages
cron.schedule('0 9 * * *', async () => {
    const today = new Date().toISOString().slice(5, 10); // MM-DD
    const employees = await Employee.find();

    employees.forEach(emp => {
        if (emp.dob.slice(5, 10) === today) {
            twilioClient.messages.create({
                from: whatsappFrom,
                to: `whatsapp:+91${emp.phone}`,
                body: `🎉 Happy Birthday ${emp.name}! Have a wonderful day! 🎂`
            })
            .then(msg => console.log(`Sent to ${emp.name}: ${msg.sid}`))
            .catch(err => console.error(`Error sending to ${emp.name}:`, err.message));
        }
    });
});

app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));

