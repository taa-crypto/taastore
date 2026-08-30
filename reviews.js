const {db}=require('./_supabase');
module.exports=async(req,res)=>{
  try{
    if(req.method==='GET'){
      const {data,error}=await db().from('reviews').select('name,rating,comment,created_at,verified').eq('published',true).order('created_at',{ascending:false});
      if(error) return res.status(400).json({error:error.message}); return res.json(data||[]);
    }
    if(req.method==='POST'){
      const b=req.body||{}; const orderId=String(b.orderId||'').trim().toUpperCase(); const growId=String(b.growId||'').trim();
      if(!orderId||!growId||!b.comment) return res.status(400).json({error:'Data review belum lengkap.'});
      const {data:o,error:oe}=await db().from('orders').select('order_id,grow_id,status').eq('order_id',orderId).ilike('grow_id',growId).single();
      if(oe||!o) return res.status(400).json({error:'Order ID dan GrowID tidak cocok.'});
      if(o.status!=='COMPLETED') return res.status(400).json({error:'Order belum COMPLETED.'});
      const {data:existing}=await db().from('reviews').select('id').eq('order_id',orderId).maybeSingle();
      if(existing) return res.status(409).json({error:'Order ini sudah memiliki review.'});
      const publicName=b.anonymous?'Anonymous':mask(growId);
      const {data,error}=await db().from('reviews').insert({order_id:orderId,name:publicName,rating:Math.max(1,Math.min(5,Number(b.rating)||5)),comment:String(b.comment).slice(0,1000),verified:true,published:true}).select('name,rating,comment,created_at,verified').single();
      if(error) return res.status(400).json({error:error.message}); return res.status(201).json(data);
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){return res.status(500).json({error:e.message})}
};
function mask(s){if(s.length<=3)return '***';if(s.length<=6)return s[0]+'***'+s.slice(-1);return s.slice(0,2)+'***'+s.slice(-3)}
