import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(){
 try{
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Please sign in to continue."},{status:401});
  const admin=createAdminClient();
  const {data:business}=await admin.from("businesses").select("id,name,category,promotion_rank").eq("owner_user_id",user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(!business)return NextResponse.json({error:"Complete your business profile first."},{status:404});
  const {data:competitors}=await admin.from("businesses").select("id,promotion_rank").eq("category",business.category).gt("promotion_rank",0).order("promotion_rank",{ascending:false}).order("created_at",{ascending:true});
  const rows=(competitors??[]) as Array<{id:string;promotion_rank:number|null}>;
  const currentBid=Math.max(0,Number(business.promotion_rank??0));
  const currentIndex=rows.findIndex(r=>r.id===business.id);
  const rank=currentBid>0&&currentIndex>=0?currentIndex+1:null;
  let nextBid=10;
  if(currentBid>0&&rank&&rank>1){nextBid=Math.max(10,Number(rows[rank-2]?.promotion_rank??0)+1);}
  else if(currentBid===0&&rows.length){nextBid=Math.max(10,Number(rows[rows.length-1]?.promotion_rank??0)+1);}
  const {data:subscription}=await admin.from("business_plan_subscriptions").select("id,status,stripe_subscription_id").eq("business_id",business.id).in("status",["pending","active","past_due"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
  return NextResponse.json({businessName:business.name,category:business.category,currentBid,rank,nextBid,activeSubscription:Boolean(subscription?.stripe_subscription_id&&subscription?.status!=="canceled")});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load leaderboard status."},{status:500});}
}
