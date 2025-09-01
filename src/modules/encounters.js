const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Encounter schema representing a clinical interaction. Additional
// details such as diagnoses, procedures, vitals could be stored in
// separate collections referenced by encounterId.
const encounterSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    date: { type: Date, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Encounter = mongoose.models.Encounter || mongoose.model('Encounter', encounterSchema);

const EncounterCreate = z.object({
  patientId: z.string(),
  providerId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/),
  notes: z.string().optional(),
});

const EncounterUpdate = EncounterCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Encounters
 *   description: Manage clinical encounters (visits)
 */

router.get('/', async (_req, res) => {
  const list = await Encounter.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await Encounter.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { patientId, providerId } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  if (providerId) where.providerId = providerId;
  const list = await Encounter.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Encounter.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = EncounterCreate.parse(req.body);
    const item = await Encounter.create({ ...data, date: new Date(data.date) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = EncounterUpdate.parse(req.body);
    const item = await Encounter.findByIdAndUpdate(
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
  await Encounter.findByIdAndDelete(req.params.id).exec();
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