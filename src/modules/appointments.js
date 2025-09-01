const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Appointment schema with references to patient and provider.
const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// Validation
const AppointmentCreate = z.object({
  patientId: z.string(),
  providerId: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const AppointmentUpdate = AppointmentCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Manage appointment scheduling
 */

// List all appointments
router.get('/', async (_req, res) => {
  const list = await Appointment.find().exec();
  res.json(list);
});

// Count appointments
router.get('/count', async (_req, res) => {
  const count = await Appointment.countDocuments().exec();
  res.json({ count });
});

// Search appointments by patient or provider
router.get('/search', async (req, res) => {
  const { patientId, providerId } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  if (providerId) where.providerId = providerId;
  const list = await Appointment.find(where).exec();
  res.json(list);
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  const appt = await Appointment.findById(req.params.id).exec();
  if (!appt) return res.status(404).json({ error: 'not_found' });
  res.json(appt);
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const data = AppointmentCreate.parse(req.body);
    const appt = await Appointment.create({
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const data = AppointmentUpdate.parse(req.body);
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
      },
      { new: true }
    ).exec();
    if (!appt) return res.status(404).json({ error: 'not_found' });
    res.json(appt);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

// Cancel appointment (update status)
router.patch('/:id/cancel', async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true }).exec();
  if (!appt) return res.status(404).json({ error: 'not_found' });
  res.json(appt);
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

// Appointment history placeholder
router.get('/:id/history', async (_req, res) => {
  res.json([]);
});

// Notes placeholder
router.post('/:id/notes', async (_req, res) => {
  res.json({ status: 'note added' });
});

// Related appointments placeholder
router.get('/:id/related', async (_req, res) => {
  res.json([]);
});

module.exports = router;