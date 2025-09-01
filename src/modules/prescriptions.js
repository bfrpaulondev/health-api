const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Prescription schema representing medication orders. Fields such as
// quantity, refill count, and instructions could be added for a more
// comprehensive implementation.
const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

const PrescriptionCreate = z.object({
  patientId: z.string(),
  providerId: z.string(),
  medication: z.string(),
  dosage: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

const PrescriptionUpdate = PrescriptionCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Manage medication prescriptions
 */

router.get('/', async (_req, res) => {
  const list = await Prescription.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await Prescription.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { patientId, providerId } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  if (providerId) where.providerId = providerId;
  const list = await Prescription.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Prescription.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = PrescriptionCreate.parse(req.body);
    const item = await Prescription.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = PrescriptionUpdate.parse(req.body);
    const item = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      { new: true }
    ).exec();
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.delete('/:id', async (req, res) => {
  await Prescription.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

router.get('/:id/history', async (_req, res) => {
  res.json([]);
});

router.post('/:id/notes', async (_req, res) => {
  res.json({ status: 'note added' });
});

router.get('/:id/related', async (_req, res) => {
  res.json([]);
});

module.exports = router;