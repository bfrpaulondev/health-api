const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Schema for healthcare providers. Includes a name, specialty and
// status field indicating whether the provider is active. In larger
// systems additional metadata such as license numbers, contact
// information and schedules would be stored in other collections.
const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Provider = mongoose.models.Provider || mongoose.model('Provider', providerSchema);

// Validation schemas using Zod
const ProviderCreate = z.object({
  name: z.string().min(2),
  specialty: z.string().min(2),
  active: z.boolean().optional(),
});

const ProviderUpdate = ProviderCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: Operations related to healthcare providers
 */

// List all providers
router.get('/', async (_req, res) => {
  const providers = await Provider.find().exec();
  res.json(providers);
});

// Count providers
router.get('/count', async (_req, res) => {
  const count = await Provider.countDocuments().exec();
  res.json({ count });
});

// Search providers by name or specialty
router.get('/search', async (req, res) => {
  const term = req.query.term || '';
  const providers = await Provider.find({
    $or: [
      { name: { $regex: term, $options: 'i' } },
      { specialty: { $regex: term, $options: 'i' } },
    ],
  }).exec();
  res.json(providers);
});

// Get provider by ID
router.get('/:id', async (req, res) => {
  const provider = await Provider.findById(req.params.id).exec();
  if (!provider) return res.status(404).json({ error: 'not_found' });
  res.json(provider);
});

// Create new provider
router.post('/', async (req, res) => {
  try {
    const data = ProviderCreate.parse(req.body);
    const provider = await Provider.create(data);
    res.status(201).json(provider);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

// Update provider
router.put('/:id', async (req, res) => {
  try {
    const data = ProviderUpdate.parse(req.body);
    const provider = await Provider.findByIdAndUpdate(req.params.id, data, { new: true }).exec();
    if (!provider) return res.status(404).json({ error: 'not_found' });
    res.json(provider);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

// Delete provider
router.delete('/:id', async (req, res) => {
  await Provider.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

// Provider history placeholder
router.get('/:id/history', async (_req, res) => {
  res.json([]);
});

// Add note to provider (placeholder)
router.post('/:id/notes', async (_req, res) => {
  res.json({ status: 'note added' });
});

// Related providers (placeholder)
router.get('/:id/related', async (_req, res) => {
  res.json([]);
});

module.exports = router;
