const {db,admin}=require('./_supabase');
module.exports=async(req,res)=>{
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!admin(req)) return res.status(401).json({error:'Unauthorized'});
  try{
    const {orderId,status}=req.body||{};
    if(!orderId||!['PAID','COMPLETED'].includes(status)) return res.status(400).json({error:'Invalid status.'});
    const patch={status}; if(status==='PAID') patch.paid_at=new Date().toISOString(); if(status==='COMPLETED') patch.completed_at=new Date().toISOString();
    const {data,error}=await db().from('orders').update(patch).eq('order_id',orderId).select('*').single();
    if(error) return res.status(400).json({error:error.message}); return res.json(data);
  }catch(e){return res.status(500).json({error:e.message})}
};
