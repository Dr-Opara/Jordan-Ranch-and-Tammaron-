"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BusinessRating({businessId,userId,initialRating}:{businessId:string;userId:string;initialRating:number|null}){
 const [rating,setRating]=useState(initialRating);const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
 async function rate(value:number){setSaving(true);setMessage("");const s=createClient();const {error}=await s.from("business_ratings").upsert({business_id:businessId,user_id:userId,rating:value},{onConflict:"business_id,user_id"});if(!error){setRating(value);setMessage("Rating saved");}else setMessage(error.message);setSaving(false);}
 return <div><div className="eyebrow">Your rating</div><div style={{display:"flex",gap:6,marginTop:8}}>{[1,2,3,4,5].map(n=><button key={n} aria-label={`${n} stars`} className="star-button" disabled={saving} onClick={()=>rate(n)}><Star size={26} fill={rating&&n<=rating?"currentColor":"none"}/></button>)}</div>{message&&<div className="profile-detail">{message}</div>}<div className="profile-detail">Ratings are stars only. There are no written reviews or comment threads.</div></div>;
}
