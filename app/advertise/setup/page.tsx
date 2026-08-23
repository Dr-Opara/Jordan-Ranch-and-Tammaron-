"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories=["Restaurants","Medical","Dental","Beauty","Home Services","Fitness","Childcare","Automotive","Shopping","Real Estate","Professional Services","Pet Services","Entertainment","Education","Other"];
const initialForm={name:"",legal_business_name:"",category:"Restaurants",description:"",contact_first_name:"",contact_last_name:"",contact_title:"",contact_email:"",business_email:"",phone:"",website_url:"",address_line1:"",address_line2:"",city:"",state:"TX",postal_code:"",service_area:"Jordan Ranch & Tamarron",year_established:"",instagram_url:"",facebook_url:"",license_type:"",license_number:""};
type FormState=typeof initialForm;

export default function BusinessSetupPage() {
  const router = useRouter();
  const [form,setForm]=useState<FormState>(initialForm);
  const [terms,setTerms]=useState(false);const [privacy,setPrivacy]=useState(false);const [error,setError]=useState("");const [loading,setLoading]=useState(false);
  const update=(key:keyof FormState,value:string)=>setForm(p=>({...p,[key]:value}));

  useEffect(()=>{(async()=>{const s=createClient();const {data}=await s.auth.getUser();if(!data.user){router.replace("/advertise/signup");return;}const {data:b}=await s.from("businesses").select("*").eq("owner_user_id",data.user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();if(b){const values=b as Record<string,unknown>;setForm(p=>({...p,...Object.fromEntries(Object.keys(p).map(k=>[k,typeof values[k]==="string"?values[k]:p[k as keyof FormState]])),year_established:b.year_established?String(b.year_established):""} as FormState));}})();},[router]);

  async function submit(e:FormEvent){
    e.preventDefault();setError("");if(!terms||!privacy){setError("You must accept the Terms and Privacy Policy before submitting.");return;}setLoading(true);
    const s=createClient();const {data}=await s.auth.getUser();const user=data.user;if(!user){router.replace("/advertise/signup");return;}
    const payload={owner_user_id:user.id,name:form.name.trim(),legal_business_name:form.legal_business_name.trim()||form.name.trim(),category:form.category,description:form.description.trim(),contact_first_name:form.contact_first_name.trim(),contact_last_name:form.contact_last_name.trim(),contact_title:form.contact_title.trim()||null,contact_email:form.contact_email.trim(),business_email:form.business_email.trim()||form.contact_email.trim(),phone:form.phone.trim(),website_url:form.website_url.trim()||null,address_line1:form.address_line1.trim(),address_line2:form.address_line2.trim()||null,address:form.address_line1.trim(),city:form.city.trim(),state:form.state.trim(),postal_code:form.postal_code.trim(),service_area:form.service_area.trim(),year_established:form.year_established?Number(form.year_established):null,instagram_url:form.instagram_url.trim()||null,facebook_url:form.facebook_url.trim()||null,license_type:form.license_type.trim()||null,license_number:form.license_number.trim()||null,is_claimed:true,is_verified:false,review_status:"submitted",submitted_at:new Date().toISOString(),terms_accepted_at:new Date().toISOString(),privacy_accepted_at:new Date().toISOString()};
    const {data:existing}=await s.from("businesses").select("id").eq("owner_user_id",user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
    const result=existing?await s.from("businesses").update(payload).eq("id",existing.id).select("id").single():await s.from("businesses").insert(payload).select("id").single();
    if(result.error){setError(result.error.message);setLoading(false);return;}
    router.push("/advertise/plans");
  }

  return <main className="auth-page"><section className="auth-card wide">
    <Link href="/advertise" className="auth-brand">Jordan Ranch & Tamarron</Link><span className="badge sponsored">Business Application</span><h1>Tell us about your business</h1>
    <p className="auth-copy">Complete the information residents need to evaluate your business. Your listing will remain private until payment is completed and the business is approved.</p>
    <form onSubmit={submit} className="form-stack">
      <div className="form-grid two"><label>Public business name<input required value={form.name} onChange={e=>update("name",e.target.value)}/></label><label>Legal business name<input required value={form.legal_business_name} onChange={e=>update("legal_business_name",e.target.value)}/></label></div>
      <div className="form-grid two"><label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>Year established<input type="number" min="1800" max="2100" value={form.year_established} onChange={e=>update("year_established",e.target.value)}/></label></div>
      <label>Business description<textarea required maxLength={1500} value={form.description} onChange={e=>update("description",e.target.value)} placeholder="What do you offer, who do you serve, and what should residents know?"/></label>
      <div className="form-grid two"><label>Contact first name<input required value={form.contact_first_name} onChange={e=>update("contact_first_name",e.target.value)}/></label><label>Contact last name<input required value={form.contact_last_name} onChange={e=>update("contact_last_name",e.target.value)}/></label></div>
      <div className="form-grid two"><label>Contact title<input value={form.contact_title} onChange={e=>update("contact_title",e.target.value)}/></label><label>Contact email<input type="email" required value={form.contact_email} onChange={e=>update("contact_email",e.target.value)}/></label></div>
      <div className="form-grid two"><label>Public business email<input type="email" required value={form.business_email} onChange={e=>update("business_email",e.target.value)}/></label><label>Business phone<input required value={form.phone} onChange={e=>update("phone",e.target.value)}/></label></div>
      <label>Website <span className="optional">optional</span><input type="url" value={form.website_url} onChange={e=>update("website_url",e.target.value)}/></label>
      <label>Business address<input required value={form.address_line1} onChange={e=>update("address_line1",e.target.value)}/></label>
      <label>Suite / Unit <span className="optional">optional</span><input value={form.address_line2} onChange={e=>update("address_line2",e.target.value)}/></label>
      <div className="form-grid two"><label>City<input required value={form.city} onChange={e=>update("city",e.target.value)}/></label><label>State<input required maxLength={2} value={form.state} onChange={e=>update("state",e.target.value.toUpperCase())}/></label></div>
      <div className="form-grid two"><label>ZIP code<input required value={form.postal_code} onChange={e=>update("postal_code",e.target.value)}/></label><label>Service area<input required value={form.service_area} onChange={e=>update("service_area",e.target.value)}/></label></div>
      <div className="form-grid two"><label>Instagram <span className="optional">optional</span><input type="url" value={form.instagram_url} onChange={e=>update("instagram_url",e.target.value)}/></label><label>Facebook <span className="optional">optional</span><input type="url" value={form.facebook_url} onChange={e=>update("facebook_url",e.target.value)}/></label></div>
      <div className="form-grid two"><label>License / credential type <span className="optional">if applicable</span><input value={form.license_type} onChange={e=>update("license_type",e.target.value)}/></label><label>License / credential number <span className="optional">if applicable</span><input value={form.license_number} onChange={e=>update("license_number",e.target.value)}/></label></div>
      <div className="private-note">For regulated businesses, administrators may request supporting license or insurance documentation before approval.</div>
      <label><span><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> I certify the business information is accurate and agree to the advertising Terms.</span></label>
      <label><span><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/> I acknowledge the Privacy Policy and business-review process.</span></label>
      {error&&<div className="form-error">{error}</div>}<button className="btn-primary" disabled={loading}>{loading?"Submitting…":"Continue to Advertising Plan & Payment"}</button>
    </form>
  </section></main>;
}
