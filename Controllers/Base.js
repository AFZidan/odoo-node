import { promisify } from 'util';
import Odoo from 'odoo-xmlrpc';

export default class Base {
	client;
	connected = false;
	model = null;

	constructor () {
		if(!process.env?.ODOO_HOST){
			throw new Error('ODOO_HOST is not defined');
		}
		this.client = new Odoo({
			url: process.env.ODOO_HOST,
			db: process.env.ODOO_DB,
			username: process.env.ODOO_USERNAME,
			password: process.env.ODOO_PASSWORD
		});
		this.client.connect = promisify(this.client.connect);
		this.client.execute_kw = promisify(this.client.execute_kw);
	}

	connect (callback) {
		if (this.connected) {
			return callback();
		}
		return this.client.connect((err) => {
			if (err) {
				console.error('Odoo Connection Error: ', err);
				return err;
			}
			this.connected = true;
			console.log('Connected to Odoo server.');
			return callback();
		});
	}

	async run (model, method, args = []) {
		return this.client.connect().then(() => {
			const params = [];
			params.push(args);
			return this.client.execute_kw(model, method, params);
		});
	}

	async getFields (model) {
		return this.run(model, 'fields_get', [[], ['string', 'type', 'searchable', 'required', 'readonly']]);
	}

	/**
     *
     * @param Array filter : [[key,operator,value]]
     */
	find (filter) {
		if(typeof filter == 'number'){
			filter= [['id', '=', filter]];
		}
		return this.run(this.model, 'search_read', [filter]).then(res => {
			return res?.[0] || null;
		});
	}
	
	
	/**
		 *
		 * @param Array filter : [[key,operator,value]]
		 */
	findAll (filter) {
		return this.run(this.model, 'search_read', [filter]).then(res => {
			return res || null;
		});
	}
}
