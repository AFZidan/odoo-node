import Base from './Base.js';
import Partners from './Partners.js';
import Products from './Products.js';
export default class Invoices extends Base {
	constructor(){
		super();
		this.model ='account.move';
	}

	async create (req,res) {
		const order = req.body;
		
		const customer = await this.getCustomer(order,res);
		const company = await this.getCompany(order,res);
		const products = await this.getProducts(order,res);
		const lineEntries = [];
		
		for (const item of order.items){
			lineEntries.push([0,'',{
				product_id: products.filter(product=>`${product.default_code}` === `${item.id}`)?.[0]?.id,
				quantity:item?.quantity || 1,
				price_unit:item?.price,
				name:item?.name,
				account_id:company.account_id,
				// use current date for due date
				date_maturity: new Date().toISOString().split('T')[0],// format: 'YYYY-MM-DD',
				// tax_ids:[[6,false,[12]]]
			}]);
		}

		//add a discount if provided
		if(order?.discount){
			lineEntries.push([0,'',{
				name: order?.discount?.name || 'discount',
				price_unit:(order?.discount?.value || 0) * -1,
				tax_ids:[]
			}]);
		}
		const params = [];
		
		params.push({
			partner_id:customer.id,
			journal_id:company.journal_id,
			company_id:company.id,
			ref:`order_${order.id}`,
			payment_state:'paid',
			invoice_line_ids:lineEntries,
			move_type:'out_invoice',
			// use current date for due date
			invoice_date: new Date().toISOString().split('T')[0]
		});
		
		// Create the Invoice
		const invoiceId =  await this.run(this.model,'create',params);
		
		this.run(this.model,'action_post',[invoiceId]);
		
		return res.send({
			status: 'success',
			message: 'Invoice created successfully',
			data: invoiceId
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


	getCustomer(order,res){

		// validate Order customer
		if(!order?.customer){
			return res.status(422).send({error:'Customer is required',code:422});
		}
		// create the customer if not exists
		return (new Partners).updateOrCreate([['email','=',order?.customer?.email]],order?.customer);
	}
	getCompany(order,res){

		// validate Order Company
		if(!order?.vendor){
			return res.status(422).send({error:'The Service provider is required',code:422});
		}
		// create the customer if not exists
		return (new Partners).updateOrCreate([['email','=',order?.vendor?.email]],order?.vendor,true);
	}

	async getProducts(order,res){

		// validate the order items
		if(!order?.items || !order.items.length){
			return res.status(422).send({error:'Order Items is required',code:422});
		}

			
		// get the products/services ids
		const itemsIds = [['default_code','in',order.items.map(item=>item.id)]];
		let products =await (new Products).findAll(itemsIds);
		// create products/services if not exists
		if(!products || !products.length || !products.length === order.items.length){
			products = await (new Products).create(order.items);
			products = await Promise.all(order.items.map(item=>{
				return (new Products).updateOrCreate([['default_code','=',item.id]],item);
			})).then(result=>result.map(item=>item.id));
		}
		return products;
	}
}
