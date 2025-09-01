const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Inventory item schema representing supplies and medications in stock.
const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    reorderLevel: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventorySchema);

const InventoryCreate = z.object({
  name: z.string(),
  quantity: z.number().int().nonnegative(),
  reorderLevel: z.number().int().nonnegative().optional(),
});

const InventoryUpdate = InventoryCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Manage internal supplies and medication stock
 */

router.get('/', async (_req, res) => {
  const list = await InventoryItem.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await InventoryItem.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { name } = req.query;
  const where = {};
  if (name) where.name = { $regex: name, $options: 'i' };
  const list = await InventoryItem.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await InventoryItem.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = InventoryCreate.parse(req.body);
    const item = await InventoryItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = InventoryUpdate.parse(req.body);
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, data, { new: true }).exec();
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.delete('/:id', async (req, res) => {
  await InventoryItem.findByIdAndDelete(req.params.id).exec();
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