const CRUDCRUD_TOKENS = [
  'bbdea4a2062f40b3a98a93961cf46147',
  'bd9a3ec70f874fa7b84f60f95cd82dff',
  'b2c7cdd91fb548f69456e69f9c521266'
];

let memoryOrdersStore = [];

const fetchCloudOrders = async () => {
  if (memoryOrdersStore.length > 0) {
    return memoryOrdersStore;
  }

  for (const token of CRUDCRUD_TOKENS) {
    try {
      const res = await fetch(`https://crudcrud.com/api/${token}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memoryOrdersStore = data;
          return memoryOrdersStore;
        }
      }
    } catch (e) {}
  }

  return memoryOrdersStore;
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'DELETE') {
      memoryOrdersStore = [];
      for (const token of CRUDCRUD_TOKENS) {
        try {
          const res = await fetch(`https://crudcrud.com/api/${token}/orders`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              for (const item of data) {
                if (item._id) {
                  await fetch(`https://crudcrud.com/api/${token}/orders/${item._id}`, { method: 'DELETE' });
                }
              }
            }
          }
        } catch (e) {}
      }
      return res.status(200).json({ success: true, message: 'All orders cleared successfully' });
    }

    let currentOrders = await fetchCloudOrders();

    if (req.method === 'POST') {
      const orderData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const orderNum = orderData.order_number || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const rawItems = orderData.items || [];
      const items = rawItems.map(i => {
        const itemName = i.item_name || i.name || 'South Indian Dish';
        const itemPrice = parseFloat(i.price || i.item_price || 0);
        const qty = parseInt(i.quantity || 1, 10);
        const itemSubtotal = itemPrice * qty;

        return {
          id: i.id || 1,
          menuItemId: i.id || 1,
          item_name: itemName,
          name: itemName,
          price: itemPrice,
          quantity: qty,
          subtotal: itemSubtotal
        };
      });

      const calculatedSubtotal = items.reduce((sum, i) => sum + (parseFloat(i.subtotal) || 0), 0);
      const subtotal = parseFloat(orderData.subtotal) > 0 ? parseFloat(orderData.subtotal) : calculatedSubtotal;

      const packing_charge = parseFloat(orderData.packingFee || orderData.packing_charge) || (orderData.orderType === 'Dine In' || orderData.orderType === 'Dine-In' ? 0 : 15);
      const delivery_charge = parseFloat(orderData.deliveryFee || orderData.delivery_charge) || (orderData.orderType === 'Home Delivery' ? 30 : 0);
      const tax = parseFloat(orderData.tax) || parseFloat((subtotal * 0.05).toFixed(2));
      const discount_amount = parseFloat(orderData.discountAmount || orderData.discount_amount) || 0;

      const calculatedTotal = subtotal + tax + packing_charge + delivery_charge - discount_amount;
      const total_amount = parseFloat(orderData.totalAmount || orderData.total_amount) > 0
        ? parseFloat(orderData.totalAmount || orderData.total_amount)
        : calculatedTotal;

      const newOrder = {
        id: Date.now(),
        order_number: orderNum,
        customer_name: orderData.customerName || orderData.customer_name || 'Customer',
        customer_phone: orderData.phone || orderData.customerPhone || orderData.customer_phone || '',
        customer_email: orderData.email || orderData.customerEmail || '',
        delivery_address: orderData.deliveryAddress || orderData.address || '',
        order_type: orderData.orderType || orderData.order_type || 'Home Delivery',
        payment_method: orderData.paymentMethod || orderData.payment_method || 'Cash on Delivery',
        payment_status: orderData.payment_status || 'PENDING',
        status: orderData.status || 'Pending',
        subtotal: subtotal,
        tax: tax,
        packing_charge: packing_charge,
        delivery_charge: delivery_charge,
        discount_amount: discount_amount,
        total_amount: total_amount,
        items: items,
        created_at: orderData.created_at || new Date().toISOString()
      };

      // Add to memory store immediately
      memoryOrdersStore = [newOrder, ...memoryOrdersStore.filter(o => o.order_number !== newOrder.order_number)];

      // Sync to cloud token
      for (const token of CRUDCRUD_TOKENS) {
        try {
          const cloudRes = await fetch(`https://crudcrud.com/api/${token}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          });
          if (cloudRes.ok) break;
        } catch (e) {}
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        orderNumber: orderNum,
        order: newOrder
      });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const updateData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const targetId = updateData.id || updateData.order_id;
      const targetNum = updateData.order_number || updateData.orderNumber;
      const newStatus = updateData.status;
      const newPayStatus = updateData.payment_status || updateData.paymentStatus;

      await fetchCloudOrders();

      let updatedOrder = null;
      memoryOrdersStore = memoryOrdersStore.map(ord => {
        const isMatch = (targetId && String(ord.id) === String(targetId)) ||
                        (targetNum && String(ord.order_number) === String(targetNum)) ||
                        (targetId && String(ord.order_number) === String(targetId)) ||
                        (targetNum && String(ord.id) === String(targetNum));
        if (isMatch) {
          updatedOrder = {
            ...ord,
            ...(newStatus ? { status: newStatus } : {}),
            ...(newPayStatus ? { payment_status: newPayStatus } : {})
          };
          return updatedOrder;
        }
        return ord;
      });

      if (!updatedOrder && (targetId || targetNum)) {
        updatedOrder = {
          id: targetId || Date.now(),
          order_number: targetNum || targetId,
          status: newStatus || 'Ready',
          payment_status: newPayStatus || 'PAID',
          created_at: new Date().toISOString()
        };
        memoryOrdersStore.unshift(updatedOrder);
      }

      if (updatedOrder) {
        for (const token of CRUDCRUD_TOKENS) {
          try {
            await fetch(`https://crudcrud.com/api/${token}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedOrder)
            });
            break;
          } catch (e) {}
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        orders: memoryOrdersStore
      });
    }

    return res.status(200).json({
      success: true,
      count: memoryOrdersStore.length,
      orders: memoryOrdersStore
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
