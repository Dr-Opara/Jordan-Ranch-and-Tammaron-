"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Community="jordan_ranch"|"tamarron";
type PostType="for_sale"|"free"|"yard_sale";

export default function NewListingPage(){
 const router=useRouter();
 const [community,setCommunity]=useState<Community>("jordan_ranch");
 const [postType,setPostType]=useState<PostType>("for_sale");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [price,setPrice]=useState("");
 const [category,setCategory]=useState("Furniture");
 const [both,setBoth]=useState(true);
 const [files,setFiles]=useState<File[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const [checkingAccess,setCheckingAccess]=useState(true);

 useEffect(()=>{void (async()=>{
   const s=createClient();
   const {data:u}=await s.auth.getUser();
   if(!u.user){window.location.replace("/login");return;}
   const [{data:p},{data:v}] = await Promise.all([
     s.from("profiles").select("community,verification_status").eq("id",u.user.id).maybeSingle(),
     s.from("resident_verifications").select("community,status").eq("user_id",u.user.id).maybeSingle(),
   ]);
   const verified=p?.verification_status==="verified"||v?.status==="verified";
   if(!verified){window.location.replace("/");return;}
   const resolvedCommunity=(p?.community??v?.community??"jordan_ranch") as Community;
   setCommunity(resolvedCommunity);
   setCheckingAccess(false);
 })();},[]);

 function changePostType(next:PostType){
   setPostType(next);
   if(next==="free"){setPrice("0");setCategory("Free Stuff");}
   if(next==="yard_sale"){setPrice("");setCategory("Yard Sale");}
 }

 async function submit(e:FormEvent){
   e.preventDefault();setLoading(true);setError("");
   const s=createClient();const {data:u}=await s.auth.getUser();
   if(!u.user){window.location.replace("/login");return;}
   const urls:string[]=[];
   for(const file of files.slice(0,5)){
     const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
     const path=`${u.user.id}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
     const {error:up}=await s.storage.from("marketplace-media").upload(path,file);
     if(up){setError(up.message);setLoading(false);return;}
     const {data:url}=s.storage.from("marketplace-media").getPublicUrl(path);urls.push(url.publicUrl);
   }
   const numericPrice=postType==="free"?0:price.trim()===""?null:Number(price);
   if(numericPrice!==null&&!Number.isFinite(numericPrice)){setError("Enter a valid price.");setLoading(false);return;}
   const finalTitle=postType==="yard_sale"&&!title.toLowerCase().includes("yard sale")?`Yard Sale — ${title.trim()}`:title.trim();
   const {error}=await s.from("marketplace_listings").insert({seller_id:u.user.id,title:finalTitle,description:description.trim()||null,price:numericPrice,category,community,visible_to_both:both,image_urls:urls,status:"active"});
   if(error){setError(error.message);setLoading(false);return;}
   window.location.replace("/");
 }

 if(checkingAccess)return <main className="auth-page"><section className="auth-card">Checking resident access…</section></main>;

 return <main className="auth-page"><section className="auth-card wide"><Link href="/" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge">Resident Marketplace</span><h1>Post something</h1><p className="auth-copy">Sell an item, give something away for free, or post a yard sale. New resident posts also appear on the Home feed for verified residents.</p><form className="form-stack" onSubmit={submit}>
 <label>What are you posting?<select value={postType} onChange={e=>changePostType(e.target.value as PostType)}><option value="for_sale">For Sale</option><option value="free">Free / Giveaway</option><option value="yard_sale">Yard Sale</option></select></label>
 <label>Title<input required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder={postType==="yard_sale"?"Saturday neighborhood sale":"What are you offering?"}/></label>
 <div className="form-grid two">
   <label>Price <span className="optional">{postType==="free"?"Free":"optional"}</span><input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} disabled={postType==="free"}/></label>
   <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{["Furniture","Kids & Baby","Electronics","Home & Garden","Appliances","Clothing","Tools","Vehicles","Yard Sale","Free Stuff","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
 </div>
 <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={1000} placeholder={postType==="yard_sale"?"Date, time, general items available, and any helpful details. Do not include your home address unless you want other verified residents to see it.":"Add condition, pickup details, or anything residents should know."}/></label>
 <label>Photos <span className="optional">up to 5</span><input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files??[]).slice(0,5))}/></label>
 <label><span><input type="checkbox" checked={both} onChange={e=>setBoth(e.target.checked)}/> Show this post to verified residents in both Jordan Ranch and Tamarron</span></label>
 <div className="private-note">Posting as a verified {community==="jordan_ranch"?"Jordan Ranch":"Tamarron"} resident. Your private verification address is never automatically displayed on a post.</div>
 {error&&<div className="form-error">{error}</div>}<button className="btn-primary" disabled={loading}>{loading?"Publishing…":"Publish Post"}</button></form></section></main>;
}
