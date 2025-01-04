import express from 'express';
import { totalVisitors, addNewVisitor, returningVisitors } from '../controllers/visitorController.js';

const routerVisitors = express.Router();

router.get('/total-visitors', totalVisitors);
router.post('/add-visitor', addNewVisitor);
router.post('/returning-visitor', returningVisitors);

export default routerVisitors;
