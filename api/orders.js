const CRUDCRUD_TOKENS = [
  'bbdea4a2062f40b3a98a93961cf46147',
  'bd9a3ec70f874fa7b84f60f95cd82dff',
  'b2c7cdd91fb548f69456e69f9c521266'
];

let memorySessionsStore = [];
let memoryOrdersStore = [];

const fetchCloudData = async () => {
  if (memorySessionsStore.length > 0 || memoryOrdersStore.length > 0) {
    return;
  }

  for (const token of CRUDCRUD_TOKENS) {
    try {
      const res = await fetch(`https://crudcrud.com/api/${token}/payment_sessions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          memorySessionsStore = data;
        }
      }
      const orderRes = await fetch(`https://crudcrud.com/api/${token}/orders`);
      if (orderRes.ok) {
        const oData = await orderRes.json();
        if (Array.isArray(oData) && oData.length > 0) {
          memoryOrdersStore = oData;
        }
      }
    } catch (e) {}
  }
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
    await fetchCloudData();

    if (req.method === 'GET') {
      const { paymentRef, orderNumber } = req.query;

      if (paymentRef) {
        const session = memorySessionsStore.find(s => String(s.payment_ref) === String(paymentRef));
        if (!session) {
          return res.status(404).json({ success: false, message: 'Payment session reference not found.' });
        }
        let order = null;
        if (session.order_number) {
          order = memoryOrdersStore.find(o => String(o.order_number) === String(session.order_number));
        }
        return res.status(200).json({ success: true, session, order });
      }

      if (orderNumber) {
        const order = memoryOrdersStore.find(o => String(o.order_number) === String(orderNumber));
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        return res.status(200).json({ success: true, order });
      }

      return res.status(200).json({
        success: true,
        sessions: memorySessionsStore,
        orders: memoryOrdersStore
      });
    }

    if (req.method === 'POST') {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // 1. Submit Payment Proof for Session
      if (payload.utrNumber || payload.paymentScreenshot) {
        const cleanUtr = (payload.utrNumber || '').trim();
        const ref = payload.paymentRef || payload.payment_ref;

        if (cleanUtr) {
          const dupSess = memorySessionsStore.find(s => 
            s.utr_number && 
            String(s.utr_number).toLowerCase() === cleanUtr.toLowerCase() &&
            String(s.payment_ref) !== String(ref) &&
            s.status !== 'Rejected'
          );
          if (dupSess) {
            return res.status(400).json({
              success: false,
              message: `This UTR number (${cleanUtr}) has already been submitted for payment session #${dupSess.payment_ref}.`
            });
          }
        }

        let updatedSession = null;
        memorySessionsStore = memorySessionsStore.map(s => {
          if (String(s.payment_ref) === String(ref)) {
            updatedSession = {
              ...s,
              utr_number: cleanUtr || s.utr_number,
              payment_screenshot: payload.paymentScreenshot || s.payment_screenshot,
              status: 'Verification Pending',
              payment_proof_submitted_at: new Date().toISOString(),
              rejection_reason: null
            };
            return updatedSession;
          }
          return s;
        });

        if (!updatedSession && ref) {
          updatedSession = {
            id: Date.now(),
            payment_ref: ref,
            utr_number: cleanUtr,
            payment_screenshot: payload.paymentScreenshot,
            status: 'Verification Pending',
            payment_proof_submitted_at: new Date().toISOString()
          };
          memorySessionsStore.unshift(updatedSession);
        }

        return res.status(200).json({
          success: true,
          message: 'Payment proof submitted successfully! Verification is pending.',
          session: updatedSession
        });
      }

      // 2. Create Temporary Payment Session (Proceed to Payment)
      const rawItems = payload.items || [];
      const items = rawItems.map(i => {
        const itemName = i.item_name || i.name || 'South Indian Dish';
        const itemPrice = parseFloat(i.price || i.item_price || 0);
        const qty = parseInt(i.quantity || 1, 10);
        return {
          id: i.id || 1,
          menuItemId: i.id || 1,
          item_name: itemName,
          name: itemName,
          price: itemPrice,
          quantity: qty,
          subtotal: itemPrice * qty
        };
      });

      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const packing_charge = parseFloat(payload.packingFee || payload.packing_charge) || (payload.orderType === 'Dine In' ? 0 : 15);
      const delivery_charge = parseFloat(payload.deliveryFee || payload.delivery_charge) || (payload.orderType === 'Home Delivery' ? 30 : 0);
      const tax = parseFloat(payload.tax) || parseFloat((subtotal * 0.05).toFixed(2));
      const discount_amount = parseFloat(payload.discountAmount || payload.discount_amount) || 0;
      const total_amount = subtotal + tax + packing_charge + delivery_charge - discount_amount;

      const paymentRef = payload.paymentRef || `PAY-DJ-${Math.floor(1000 + Math.random() * 9000)}`;
      const upiId = '11424716@indus';
      const formattedAmount = total_amount.toFixed(2);
      const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=DosaJunction&am=${formattedAmount}&cu=INR`;

      const newSession = {
        id: Date.now(),
        payment_ref: paymentRef,
        customer_name: payload.customerName || payload.customer_name || 'Customer',
        customer_phone: payload.phone || payload.customerPhone || payload.customer_phone || '',
        customer_email: payload.email || payload.customerEmail || '',
        delivery_address: payload.deliveryAddress || payload.address || '',
        order_type: payload.orderType || payload.order_type || 'Home Delivery',
        payment_method: 'Online UPI Payment',
        subtotal,
        tax,
        packing_charge,
        delivery_charge,
        discount_amount,
        total_amount,
        cart_items: items,
        status: 'Created',
        upi_id: upiId,
        upi_uri: upiUri,
        created_at: new Date().toISOString()
      };

      memorySessionsStore = [newSession, ...memorySessionsStore.filter(s => s.payment_ref !== paymentRef)];

      return res.status(201).json({
        success: true,
        message: 'Temporary payment session created. Please complete UPI payment.',
        paymentRef,
        totalAmount: total_amount,
        upiUri,
        upiId,
        session: newSession
      });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const sessionId = payload.id || payload.session_id;
      const ref = payload.paymentRef || payload.payment_ref;
      const action = payload.action;

      let updatedSession = null;
      let createdOrder = null;

      if (action === 'approve') {
        const targetSession = memorySessionsStore.find(s => String(s.id) === String(sessionId) || String(s.payment_ref) === String(ref));

        if (targetSession) {
          if (targetSession.order_number) {
            createdOrder = memoryOrdersStore.find(o => String(o.order_number) === String(targetSession.order_number));
          }

          if (!createdOrder) {
            const orderNum = `DJ-${Math.floor(1000 + Math.random() * 9000)}`;
            const cartItems = typeof targetSession.cart_items === 'string' ? JSON.parse(targetSession.cart_items) : (targetSession.cart_items || []);

            createdOrder = {
              id: Date.now(),
              order_number: orderNum,
              customer_name: targetSession.customer_name,
              customer_phone: targetSession.customer_phone,
              customer_email: targetSession.customer_email,
              delivery_address: targetSession.delivery_address,
              order_type: targetSession.order_type,
              payment_method: 'Online UPI Payment',
              payment_status: 'Payment Verified',
              status: 'Confirmed',
              subtotal: targetSession.subtotal,
              tax: targetSession.tax,
              packing_charge: targetSession.packing_charge,
              delivery_charge: targetSession.delivery_charge,
              discount_amount: targetSession.discount_amount,
              total_amount: targetSession.total_amount,
              items: cartItems,
              utr_number: targetSession.utr_number,
              payment_screenshot: targetSession.payment_screenshot,
              created_at: new Date().toISOString()
            };
            memoryOrdersStore.unshift(createdOrder);
          }

          updatedSession = {
            ...targetSession,
            status: 'Approved',
            order_id: createdOrder.id,
            order_number: createdOrder.order_number
          };

          memorySessionsStore = memorySessionsStore.map(s => s.id === targetSession.id ? updatedSession : s);
        }
      } else if (action === 'reject') {
        memorySessionsStore = memorySessionsStore.map(s => {
          if (String(s.id) === String(sessionId) || String(s.payment_ref) === String(ref)) {
            updatedSession = {
              ...s,
              status: 'Rejected',
              rejection_reason: payload.rejectionReason || 'Verification failed.'
            };
            return updatedSession;
          }
          return s;
        });
      }

      return res.status(200).json({
        success: true,
        message: action === 'approve' ? `Payment approved! Order #${createdOrder?.order_number} placed.` : 'Payment rejected.',
        order: createdOrder,
        session: updatedSession
      });
    }

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
