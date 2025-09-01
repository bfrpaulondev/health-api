const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Vitals schema capturing basic measurements. Additional fields like
// respiratory rate or oxygen saturation could be included as needed.
const vitalsSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    heartRate: { type: Number, required: true },
    bloodPressure: { type: String, required: true },
    temperature: { type: Number, required: true },
  },
  { timestamps: true }
);

const Vitals = mongoose.models.Vitals || mongoose.model('Vitals', vitalsSchema);

const VitalsCreate = z.object({
  patientId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  heartRate: z.number().int().positive(),
  bloodPressure: z.string(),
  temperature: z.number(),
});

const VitalsUpdate = VitalsCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Manage vital signs measurements
 */

router.get('/', async (_req, res) => {
  const list = await Vitals.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await Vitals.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { patientId } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  const list = await Vitals.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Vitals.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = VitalsCreate.parse(req.body);
    const item = await Vitals.create({ ...data, date: new Date(data.date) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = VitalsUpdate.parse(req.body);
    const item = await Vitals.findByIdAndUpdate(
      req.params.id,
      { ...data, date: data.date ? new Date(data.date) : undefined },
      { new: true }
    ).exec();
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.delete('/:id', async (req, res) => {
  await Vitals.findByIdAndDelete(req.params.id).exec();
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