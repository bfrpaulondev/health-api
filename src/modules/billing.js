const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Billing schema representing invoices for services rendered. Real
// implementations might link multiple services and track payments.
const billingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'pending'], default: 'unpaid' },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Billing = mongoose.models.Billing || mongoose.model('Billing', billingSchema);

const BillingCreate = z.object({
  patientId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['unpaid', 'paid', 'pending']).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const BillingUpdate = BillingCreate.partial();

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Manage invoices and payments
 */

router.get('/', async (_req, res) => {
  const list = await Billing.find().exec();
  res.json(list);
});

router.get('/count', async (_req, res) => {
  const count = await Billing.countDocuments().exec();
  res.json({ count });
});

router.get('/search', async (req, res) => {
  const { patientId, status } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;
  const list = await Billing.find(where).exec();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await Billing.findById(req.params.id).exec();
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  try {
    const data = BillingCreate.parse(req.body);
    const item = await Billing.create({
      ...data,
      dueDate: new Date(data.dueDate),
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = BillingUpdate.parse(req.body);
    const item = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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
  await Billing.findByIdAndDelete(req.params.id).exec();
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