import { createHmac, timingSafeEqual } from 'crypto';

export const hasValidHmac = async (req, res, next) => {
	try{
		let body = '';
		if (req.body && Object.keys(req.body).length) {
			body = JSON.stringify(req.body);
		}
		const signature = `${req.headers['x-hmac-sha256']}`;
		if(!signature){
			return res.status(401).json({error: 'Not Authorized'});
		}
		const computedSign = await createHmac('sha256', process.env?.APP_SECRET || '')
			.update(body, 'utf8').digest('base64');
		console.log('Generated Hash: ',computedSign);
		const computedSignBuffer = Buffer.from(computedSign, 'base64');
		const retrievedSigBuffer = Buffer.from(signature, 'base64');
  
		if (!timingSafeEqual(computedSignBuffer, retrievedSigBuffer)) {
			return res.status(401).send('Invalid signature');
		} 
		return next();
		
	}catch(err){
		console.log(err);
	}

  
};

// /Users/zidan/www/odoo-node/Auth.js
