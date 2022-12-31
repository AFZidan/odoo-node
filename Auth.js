import { createHmac, timingSafeEqual } from 'crypto';

const isLengthEqual = (digestA, digestB) => {
	if (digestA.length !== digestB.length) {
		return false;
	}
  
	for (let i = 0; i < digestA.length; i++) {
		if (Buffer.from(digestA)[i] !== Buffer.from(digestB)[i]) {
			return false;
		}
	}
  
	return true;
};
export const hasValidHmac = async (req, res, next) => {
	const hmac = req.headers?.['x-hmac-sha256'] || req.query?.hmac || '';
	const appSecret = process.env?.APP_SECRET || '';
	if(!hmac){
		return res.status(401).json({error: 'Not Authorized'});
	}
	try{
		let body = '';
		if (req.body && Object.keys(req.body).length) {
			body = JSON.stringify(req.body);
		}
		
		const computedHmac = createHmac('sha256', appSecret)
			.update(body, 'utf8').digest('base64');
		console.log('Generated Hash: ',computedHmac);
		const computedHmacBuffer = Buffer.from(computedHmac, 'base64');
		const retrievedSigBuffer = Buffer.from(hmac, 'base64');
  
		if (!isLengthEqual(hmac,computedHmac) || !timingSafeEqual(computedHmacBuffer, retrievedSigBuffer)) {
			return res.status(401).send('Invalid signature');
		} 
		return next();
		
	}catch(err){
		console.error(err);
		return err;
	}

  
};

// /Users/zidan/www/odoo-node/Auth.js
