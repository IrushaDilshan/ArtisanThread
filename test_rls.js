const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dgwcwxfjuvelnsusninc.supabase.co';
const supabaseAnonKey = 'sb_publishable_KnB81ypFNj1SbOt_PlT7xA_wuZZRvHZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: deliveries } = await supabase.from('deliveries').select('id, tracking_code, courier_id, status');
  console.log('Current deliveries in Supabase:', deliveries);

  if (deliveries && deliveries.length > 0) {
    const target = deliveries[0];
    const { error: updErr } = await supabase
      .from('deliveries')
      .update({ status: target.status })
      .eq('id', target.id);
    console.log('UPDATE TEST error:', updErr ? updErr.message : 'SUCCESS!');
  }

  // Also test orders insert
  const { error: ordInsErr } = await supabase.from('orders').insert([{
    order_number: 'ORD-TEST-' + Date.now(),
    total_amount: 1000,
  }]);
  console.log('ORDERS INSERT TEST error:', ordInsErr ? ordInsErr.message : 'SUCCESS!');
}

check();
