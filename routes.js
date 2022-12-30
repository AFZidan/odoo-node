import { Router } from 'express';
import Invoices from './Controllers/Invoices.js';
import Customers from './Controllers/Customers.js';
const router = new Router();
router.post('/invoices/create',(req,res)=>{
	return (new Invoices).create(req,res);
});
router.get('/customers', (req, res) => {
	return (new Customers()).list(req, res);
});
export default router;
