// Order Controller Logic

class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }

    async createOrder(req, res) {
        try {
            const orderData = req.body;
            const newOrder = await this.orderService.create(orderData);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error creating order', error });
        }
    }

    async getOrder(req, res) {
        try {
            const orderId = req.params.id;
            const order = await this.orderService.getById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order', error });
        }
    }

    async updateOrder(req, res) {
        try {
            const orderId = req.params.id;
            const orderData = req.body;
            const updatedOrder = await this.orderService.update(orderId, orderData);
            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found or update failed' });
            }
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: 'Error updating order', error });
        }
    }

    async deleteOrder(req, res) {
        try {
            const orderId = req.params.id;
            const result = await this.orderService.delete(orderId);
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting order', error });
        }
    }
}

module.exports = OrderController;