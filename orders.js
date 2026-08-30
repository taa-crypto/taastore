const {db,admin,method}=require('./_supabase');
module.exports=async(req,res)=>{
  try{
    if(req.method==='POST'){
      const b=req.body||{};
      const required=['orderId','buyerName','product','qty','total','growId','world','payment'];
      if(required.some(k=>b[k]===undefined||b[k]===null||String(b[k]).trim()==='')) return res.status(400).json({error:'Data order belum lengkap.'});
      const {data,error}=await db().from('orders').insert({order_id:String(b.orderId),buyer_name:String(b.buyerName),product:String(b.product),qty:Number(b.qty),total:Number(b.total),grow_id:String(b.growId),world:String(b.world),payment:String(b.payment),status:'WAITING_PAYMENT'}).select('order_id,buyer_name,product,qty,total,grow_id,world,payment,status,created_at').single();
      if(error) return res.status(400).json({error:error.message});
      return res.status(201).json(data);
    }
    if(req.method==='GET'){
      if(!admin(req)) return res.status(401).json({error:'Unauthorized'});
      const {data,error}=await db().from('orders').select('*').order('created_at',{ascending:false});
      if(error) return res.status(400).json({error:error.message});
      return res.json(data||[]);
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){return res.status(500).json({error:e.message})}
};
