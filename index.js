import express from 'express';
import {} from 'dotenv/config';
import routes from './routes.js';
import { hasValidHmac } from './Auth.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = parseInt(process.env.PORT) || 3000;
app.use(express.json());
app.use('/api',hasValidHmac);
app.use('/api', routes);
// catch 404 and forward to error handler
app.use((req, res) => {
	return res.status(404).send({
		error: 'The requested Page not found',
		status: 404
	});
});
// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
	if (err) {
		res.status(err.status || 500);
		return res.send(err.message);
	}
	return next();
});

app.listen(port, () => {
	console.log(`Server Started at ${port}`);
});
