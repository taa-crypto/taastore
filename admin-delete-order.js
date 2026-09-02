export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = String(req.headers['x-admin-key'] || '');
  const expectedKey = String(process.env.TAASTORE_ADMIN_KEY || '');
  if (!expectedKey || !adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let orderId = '';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    orderId = String(body.order_id || '').trim();
  } catch (_) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!orderId || orderId.length > 100) {
    return res.status(400).json({ error: 'Invalid order_id' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server is not configured for admin deletion' });
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // Server-side eligibility check: only completed/cancelled orders may be deleted.
    const lookupUrl = `${supabaseUrl}/rest/v1/orders?select=order_id,status,order_type,sell_status&order_id=eq.${encodeURIComponent(orderId)}&limit=1`;
    const lookup = await fetch(lookupUrl, { headers });
    const lookupText = await lookup.text();
    if (!lookup.ok) {
      return res.status(502).json({ error: 'Supabase lookup failed', detail: lookupText.slice(0, 500) });
    }

    let rows;
    try { rows = JSON.parse(lookupText); } catch (_) { rows = []; }
    const order = Array.isArray(rows) ? rows[0] : null;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isSell = String(order.order_type || '').toUpperCase() === 'SELL';
    const deletable = isSell
      ? (String(order.sell_status || '').toUpperCase() === 'SELL_COMPLETED' || String(order.sell_status || '').toUpperCase() === 'SELL_CANCELLED' || String(order.status || '').toUpperCase() === 'COMPLETED')
      : String(order.status || '').toUpperCase() === 'COMPLETED';

    if (!deletable) {
      return res.status(409).json({ error: 'Only completed/cancelled history can be deleted' });
    }

    const deleteUrl = `${supabaseUrl}/rest/v1/orders?order_id=eq.${encodeURIComponent(orderId)}`;
    const deleted = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { ...headers, Prefer: 'return=representation' }
    });
    const deletedText = await deleted.text();
    if (!deleted.ok) {
      return res.status(502).json({ error: 'Supabase delete failed', detail: deletedText.slice(0, 500) });
    }

    let deletedRows = [];
    try { deletedRows = JSON.parse(deletedText); } catch (_) {}
    if (!Array.isArray(deletedRows) || deletedRows.length === 0) {
      return res.status(404).json({ error: 'Order was not deleted' });
    }

    return res.status(200).json({ ok: true, order_id: orderId });
  } catch (err) {
    console.error('TAASTORE admin delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
