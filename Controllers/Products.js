import Base from './Base.js';
export default class Products extends Base {
	constructor(){
		super();
		this.model ='product.product';
	}
	async create (data) {
		const params = [];
		const product ={
			name: data.name,
			type: 'service',
			default_code:data.id,
		};
		params.push(product);
		const id =  this.run(this.model, 'create', params);
		product.id = id;
		return product;
	}

	/**
	 * Get products ids list
	 * @param {number} offset 
	 * @param {number} limit 
	 * @param {array} filters 
	 * @return {array} products ids or empty array
	 */
	getIdes (offset = 0, limit = 20, filters = []) {
		const params = [];

		if (filters && filters.length) {
			params.push(filters);
		} else {
			params.push([]);
		}
		params.push(offset);
		params.push(limit);
		return this.run(this.model, 'search', params);
	}

	async updateOrCreate (filter, data) {
		if(!filter){
			console.error('updateOrCreate: ', 'filter or data is not valid');
			return null;
		}
		return this.find(filter).then(product => {
			if(!product){
				return  this.create(data);
			}
			return product;
		});
	}
}
