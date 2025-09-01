const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Lab result schema. For a production system this might include
// reference ranges, units, and flags for abnormal results.
const labSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    testName: { type: String, required: true },
    result: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const Lab = mongoose.models.Lab || mongoose.model('Lab', labSchema);

const LabCreate = z.object({
  patientId: z.string(),
  testName: z.string(),
  result: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const LabUpdate = LabCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Manage laboratory test results
 */

router.get('/', async (_req, res) => {
  const list = await Lab.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await Lab.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { patientId, testName } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  if (testName) where.testName = { $regex: testName, $options: 'i' };
  const list = await Lab.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Lab.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = LabCreate.parse(req.body);
    const item = await Lab.create({ ...data, date: new Date(data.date) });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = LabUpdate.parse(req.body);
    const item = await Lab.findByIdAndUpdate(
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
  await Lab.findByIdAndDelete(req.params.id).exec();
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