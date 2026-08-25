import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CommunityPostPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  if(user.user_metadata?.account_type==="advertiser") redirect("/advertise/dashboard");

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const trusted=url&&key?createSupabaseAdmin(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):supabase;

  const [{data:viewer},{data:verification},{data:post}]=await Promise.all([
    trusted.from("profiles").select("id,community,verification_status").eq("id",user.id).maybeSingle(),
    trusted.from("resident_verifications").select("status").eq("user_id",user.id).maybeSingle(),
    trusted.from("resident_posts").select("id,author_id,community,visible_to_both,category,body,location_text,view_count,status,created_at").eq("id",id).maybeSingle(),
  ]);

  const verified=viewer?.verification_status==="verified"||verification?.status==="verified";
  if(!verified) redirect("/");
  if(!post||post.status!=="active") notFound();
  if(!post.visible_to_both&&post.community!==viewer?.community) notFound();

  const {data:author}=await trusted.from("profiles").select("first_name,last_initial").eq("id",post.author_id).maybeSingle();
  const nextViews=Number(post.view_count??0)+1;
  if(key) await trusted.from("resident_posts").update({view_count:nextViews}).eq("id",id);

  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/" className="auth-brand">Jordan Ranch & Tamarron Residents</Link>
    <span className="badge">Resident Community</span>
    <div className="eyebrow" style={{marginTop:16}}>{String(post.category).replaceAll("_"," ")}</div>
    <div className="card-copy" style={{fontSize:18,lineHeight:1.55,marginTop:10}}>{post.body}</div>
    {post.location_text&&<div className="card-copy" style={{marginTop:10}}>Location: {post.location_text}</div>}
    <div className="meta" style={{marginTop:16,opacity:.65,fontSize:13}}>
      {author&&<span>Shared by {author.first_name} {author.last_initial}.</span>}
      <span>{new Date(post.created_at).toLocaleDateString()}</span>
      <span>{nextViews} views</span>
    </div>
    <Link href="/" className="btn-secondary" style={{marginTop:20,textAlign:"center",textDecoration:"none"}}>Back to Home</Link>
  </section></main>;
}
