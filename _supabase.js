const { createClient } = require('@supabase/supabase-js');
function db(){
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('Supabase environment variables are missing.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
function admin(req){
  const expected=process.env.ADMIN_KEY;
  const supplied=req.headers['x-admin-key']||'';
  return !!expected && supplied===expected;
}
function method(req,res,m){if(req.method!==m){res.status(405).json({error:'Method not allowed'});return false}return true}
module.exports={db,admin,method};
