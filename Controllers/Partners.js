import Base from './Base.js';
export default class Partners extends Base {
	constructor(){
		super();
		this.model ='res.partner';
	}
	async create (data,isCompany=false) {
		const params = [];
		// get country id by given country code.

		const countryId = await this.run('res.country', 'search_read', [[['code', '=', data.country]]]).then(res => {
			return res?.[0]?.id || null;
		});

		const partner = {
			name: data.name,
			email: data.email,
			...((data.country && countryId && { country_id: countryId }) || {}),
			city: data?.city || '',
			street: data?.address || '',
			phone: data?.phone || '',
			mobile: data?.mobile || ''
		};
		params.push(partner);
		const id =  await this.run((isCompany && 'res.company' )||this.model, 'create', params);
		const accountId = await this.run('account.account','create',[{
			code: '600700'+id,
			name: `${partner.name} sales income`,
			account_type: 'income',
			company_id: id
		}]);
		
		let journal_id = null;
		if(isCompany){
			// create account.journal
			journal_id = await this.run('account.journal', 'create', [{
				name: 'Sales Journal',
				default_account_id:accountId,
				code: 'SALES',
				type: 'sale',
				company_id:id
			}]);
		}
		partner.id = id;
		partner.journal_id = journal_id;
		partner.account_id = accountId;
		return partner;
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
	find (filter,isCompany=false) {
		return this.run((isCompany && 'res.company' )||this.model, 'search_read', [filter]).then(res => {
			return res?.[0] || null;
		});
	}

	async updateOrCreate (filter, data,isCompany=false) {
		if(!filter ||!data?.email){
			console.error('updateOrCreate: ', 'filter or data is not valid');
			return null;
		}
		return this.find(filter).then(partner => {
			if(!partner){
				return  this.create({
					name: data.name,
					email: data.email,
					country:data.country_code,
					city: data?.city || '',
					street: data?.address || '',
					phone: data?.phone || '',
					mobile: data?.mobile || '',
				},isCompany);
			}
			return partner;
		});
	}
}
