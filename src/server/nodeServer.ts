import express from 'express';
import { LinearTransformation } from '../transformations/linearTransformation';
import { LogTransformation } from '../transformations/logTransformation';
import { DiscreteTransformation } from '../transformations/discreteTransformation';

const app = express();
app.use(express.json());

app.post('/transform', (req, res) => {
    const { type, data } = req.body;

    let result;
    switch (type) {
        case 'linear':
            const linearTransformation = new LinearTransformation();
            result = linearTransformation.transform(data);
            break;
        case 'log':
            const logTransformation = new LogTransformation();
            result = logTransformation.transform(data);
            break;
        case 'discrete':
            const discreteTransformation = new DiscreteTransformation();
            result = discreteTransformation.transform(data);
            break;
        default:
            res.status(400).send({ error: 'Invalid transformation type' });
            return;
    }

    res.send({ result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));