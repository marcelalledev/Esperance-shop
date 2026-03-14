// productController.js

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    async getAllProducts(req, res) {
        try {
            const products = await this.productService.findAll();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductById(req, res) {
        const { id } = req.params;
        try {
            const product = await this.productService.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createProduct(req, res) {
        const newProduct = req.body;
        try {
            const createdProduct = await this.productService.create(newProduct);
            res.status(201).json(createdProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProduct(req, res) {
        const { id } = req.params;
        const updatedData = req.body;
        try {
            const updatedProduct = await this.productService.update(id, updatedData);
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        try {
            const deleted = await this.productService.delete(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
