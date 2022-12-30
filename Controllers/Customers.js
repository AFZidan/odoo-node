import Base from './Base.js';
export default class Customers extends Base {
	model = 'res.partner';
	async list (req, res) {
		console.log('created: ', 'testing');

		// // Get invoices ids list;
		// const ids = await this.getIdes(offset,limit);
		// if(!ids){
		//     return {
		//         data:[],
		//     };
		// }
		// // Get invoice fields
		// if(!fields.length){
		//     const data = await this.getFields(this.model);
		//     fields =Object.keys(data)
		// }
		// console.log('ids: ',ids);
		// console.log('fields: ',fields.length);
		// // Get invoices data
		// let params = [];
		// params.push(ids);
		// params.push(['name','ref','date','state']);
		// console.log("params: ",params);
		// return this.run(this.model, 'read',[[params]]).then(result=>{
		//     console.log('results: ',result);
		//     return result;
		// });
		return res.send('testing');
	}

	async create (data) {
		const params = [];
		// get country id by given country code.

		const countryId = await this.run('res.country', 'search_read', [[['code', '=', data.country]]]).then(res => {
			return res?.[0]?.id || null;
		});
		const customerData ={
			name: data.name,
			email: data.email,
			is_company: false,
			ref: `CUST_${data?.id || data.email}`,
			...((data.country && countryId && { country_id: countryId }) || {}),
			city: data?.city || '',
			street: data?.address || '',
			phone: data?.phone || '',
			mobile: data?.mobile || '',
			type: 'contact'
		};
		params.push(customerData);
		const id =  this.run(this.model, 'create', params);
		customerData.id = id;
		return customerData;
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

	/**
     *
     * @param Array filter : [[key,operator,value]]
     */
	getCustomer (filter) {
		return this.run(this.model, 'search_read', [filter]).then(res => {
			return res?.[0] || null;
		});
	}

	async updateOrCreate (filter, data) {
		if(!filter ||!data?.email){
			console.error('updateOrCreate: ', 'filter or data is not valid');
			return null;
		}
		return this.run(this.model, 'search_read', [filter]).then(res => {
			const customerData = res?.[0] || null;
			if(!customerData){
				return  this.create({
					name: data.name,
					email: data.email,
					country:data.country_code,
					city: data?.city || '',
					street: data?.address || '',
					phone: data?.phone || '',
					mobile: data?.mobile || '',
				});
			}
			return customerData;
		});
	}
}
