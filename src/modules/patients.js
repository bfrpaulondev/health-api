const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

// Define a simple Patient schema. In a production system this would
// include many more fields and validation rules but for the sake of
// example we keep it concise.
const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['M', 'F', 'O'], default: 'O' },
  },
  { timestamps: true }
);

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

// Zod schemas for request validation
const PatientCreate = z.object({
  name: z.string().min(2),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['M', 'F', 'O']).optional(),
});

const PatientUpdate = PatientCreate.partial();

/**
 * Generates a router for the patients module. The routes are mounted
 * under `/patients` by the application. Each endpoint includes a
 * swagger annotation describing its purpose and responses.
 */
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Operations related to patient records
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: List all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: A list of patients.
 */
router.get('/', async (_req, res) => {
  const patients = await Patient.find().exec();
  res.json(patients);
});

/**
 * @swagger
 * /patients/count:
 *   get:
 *     summary: Count all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: The total number of patient records.
 */
router.get('/count', async (_req, res) => {
  const count = await Patient.countDocuments().exec();
  res.json({ count });
});

/**
 * @swagger
 * /patients/search:
 *   get:
 *     summary: Search patients by name
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: The term to search for in patient names.
 *     responses:
 *       200:
 *         description: Matching patients.
 */
router.get('/search', async (req, res) => {
  const term = req.query.term || '';
  const patients = await Patient.find({ name: { $regex: term, $options: 'i' } }).exec();
  res.json(patients);
});

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get a single patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested patient.
 *       404:
 *         description: Patient not found.
 */
router.get('/:id', async (req, res) => {
  const patient = await Patient.findById(req.params.id).exec();
  if (!patient) return res.status(404).json({ error: 'not_found' });
  res.json(patient);
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: The created patient.
 */
router.post('/', async (req, res) => {
  try {
    const data = PatientCreate.parse(req.body);
    const patient = await Patient.create({
      name: data.name,
      dob: new Date(data.dob),
      gender: data.gender || 'O',
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update an existing patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: The updated patient.
 *       404:
 *         description: Patient not found.
 */
router.put('/:id', async (req, res) => {
  try {
    const data = PatientUpdate.parse(req.body);
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...data, dob: data.dob ? new Date(data.dob) : undefined },
      { new: true }
    ).exec();
    if (!patient) return res.status(404).json({ error: 'not_found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: 'validation_error', details: err.errors });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted.
 */
router.delete('/:id', async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

/**
 * @swagger
 * /patients/{id}/history:
 *   get:
 *     summary: Get historical records for a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The patient's history (placeholder).
 */
router.get('/:id/history', async (_req, res) => {
  // In a real implementation this would fetch historical data from a
  // related collection or service. Here we return an empty array.
  res.json([]);
});

/**
 * @swagger
 * /patients/{id}/notes:
 *   post:
 *     summary: Add a note to a patient record
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Confirmation of the added note (placeholder).
 */
router.post('/:id/notes', async (_req, res) => {
  // Placeholder: in a real system this would persist the note
  res.json({ status: 'note added' });
});

/**
 * @swagger
 * /patients/{id}/related:
 *   get:
 *     summary: Get related records for a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related records (placeholder).
 */
router.get('/:id/related', async (_req, res) => {
  // Placeholder: return an empty array for demonstration purposes
  res.json([]);
});

module.exports = router;
