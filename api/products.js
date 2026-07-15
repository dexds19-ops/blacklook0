import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const products = await kv.get('store_products') || [];
            return res.status(200).json(products);
        }

        if (req.method === 'POST') {
            const newProduct = req.body;
            const currentProducts = await kv.get('store_products') || [];
            
            newProduct.id = 'prod_' + Date.now();
            newProduct.createdAt = new Date().toISOString();
            
            currentProducts.push(newProduct);
            
            await kv.set('store_products', currentProducts);
            return res.status(200).json({ success: true, products: currentProducts });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}