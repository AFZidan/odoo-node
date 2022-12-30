import Base from './Base.js';
import Customers from './Customers.js';
export default class Invoices extends Base {
	model = 'account.move';
	async list (offset = 0, limit = 20, fields = []) {
		// Get invoices ids list;
		const ids = await this.getIdes(offset, limit);
		if (!ids) {
			return {
				data: []
			};
		}
		// Get invoice fields
		if (!fields.length) {
			const data = await this.getFields(this.model);
			fields = Object.keys(data);
		}
		console.log('ids: ', ids);
		console.log('fields: ', fields.length);
		// Get invoices data
		const params = [];
		params.push(ids);
		params.push(['name', 'ref', 'date', 'state']);
		console.log('params: ', params);
		return this.run(this.model, 'read', [[params]]).then(result => {
			console.log('results: ', result);
			return result;
		});
	}

	async create (req,res) {
		const order = req.body;
		const params = [];
		if(!order?.customer){
			return res.status(422).send({error:'Customer is required',code:422});
		}
		if(!order?.items || !order.items.length){
			return res.status(422).send({error:'Order Items is required',code:422});
		}
		
		const customer = await (new Customers).updateOrCreate([['email','=',order?.customer?.email]],order?.customer);
		const lineEntries = [];
		for(const item of order.items){
			
			lineEntries.push({
				product_id:item.product_id,
				quantity:item.quantity,
				price_unit:item.price_unit,
				name:item.name
			});
		}
		params.push({
			partner_id:customer.id,
		});



		const invoice = await this.run(this.model,'create',params);
		return res.send({
			status: 'success',
			message: 'Invoice created successfully',
			data: invoice
		});
	}

	getIdes (offset = 0, limit = 20, filters = []) {
		const params = [];

		if (filters && filters.length) {
			params.push([filters]);
		} else {
			params.push([]);
		}
		params.push(offset);
		params.push(limit);
		return this.run(this.model, 'search', params);
	}
}
