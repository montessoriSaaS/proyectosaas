import express from 'express';
import Stripe from 'stripe';

const stripeExpress = new Stripe('sk_test_TuClaveSecreta');
const app = express();

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripeExpress.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'https://tu-sitio.com/success',
            cancel_url: 'https://tu-sitio.com/cancel',
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
