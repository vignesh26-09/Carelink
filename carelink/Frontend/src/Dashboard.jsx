import { useState } from "react";
import { useLiveQuery } from "./live";
import CometDial from "./components/CometDial.jsx";
const money = n => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR"}).format(Number(n || 0));
const date = n => n ? new Date(n).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}) : "—";
const name = d => d.fullName || d.account.email.split("@")[0];
const labels = {PENDING:"In queue · awaiting approval",CONFIRMED:"In queue · confirmed",IN_PROGRESS:"In progress",COMPLETED:"Completed",CANCELLED:"Cancelled"};
function ErrorBox({error}) { return error ? <p className="form-message" role="alert">{error}</p> : null; }

export default function Dashboard({session,doctors,doctorError,loadDoctors,book,api,hospital,hospitals,addHospital}) {
  const [tab,setTab] = useState("overview");
  const role=session.role, patient=role==="PATIENT", doctor=role==="DOCTOR";
  const live = useLiveQuery(async signal => {
    const [visits, stats, profile] = await Promise.all([
      api(role==="CLINIC_ADMIN"?"/api/appointments":"/api/appointments/my", {signal}),
      api("/api/dashboard", {signal}), api("/api/auth/me", {signal})
    ]);
    return {visits, stats, profile};
  }, [api, role, session.email]);
  const visits=live.data?.visits, stats=live.data?.stats, profile=live.data?.profile||session;
  const error=live.error, refresh=live.refresh;
  const tabs=[["overview","Dashboard"],["profile","My profile"],...(patient?[["doctors","Doctors"]]:[]),["bookings",patient?"My bookings":"Appointments"],["invoices",patient?"Medicines & invoices":"Invoices & earnings"],...(doctor?[["schedule","Availability"]]:[]),...(role==="CLINIC_ADMIN"?[["network","Hospital network"],["accounts","Doctors & patients"]]:[])];
  return <div className="workspace"><header className="workspace-topbar"><div className="dashboard-brand"><span>✦</span><div><small>{hospital.place}</small><strong>{hospital.name}</strong></div></div><nav aria-label="Dashboard sections">{tabs.map(([key,label])=><button key={key} aria-current={tab===key?"page":undefined} onClick={()=>setTab(key)}>{label}</button>)}</nav><div className="dashboard-user"><strong>{profile.fullName || "My account"}</strong><small>{patient?"Patient":doctor?"Doctor":"Platform admin"}</small></div></header>
    <main className="workspace-main"><header className="workspace-header"><div><p className="eyebrow">{patient?"Patient":doctor?"Doctor":"Platform administrator"} dashboard</p><h1>Welcome back, {doctor?"Dr. ":""}{profile.fullName || "there"}.</h1><p className="muted">{patient?"How are you feeling today? Let’s find the care you need.":doctor?"A clear view of your patients, so you can focus on their care.":"A connected view across every CareLink hospital."}</p></div><div className="header-counters">{patient&&<div className="patient-progress"><CometDial value={(stats?.completedVisits||0)+(stats?.inProgress||0)} total={3} label="Your care journey"/><span>Your care<br/>journey</span></div>}<div className="header-count current-count" aria-live="polite"><strong>{stats?.inProgress ?? "…"}</strong><span>In consultation now</span></div><div className="header-count completed-count" aria-live="polite"><strong>{stats?.completedVisits ?? "…"}</strong><span>Completed consultations</span>{!patient&&<small>{stats?.patientsConsulted ?? "…"} patients consulted</small>}</div></div></header>
      <div className="sync-row"><span className={`sync-status ${error?"offline":""}`} role="status">{error?"Reconnecting — your last update is still shown":live.updatedAt?"Updates automatically · every few seconds":"Connecting to your care team…"}</span><button className="text-button refresh" onClick={refresh}>Refresh now</button></div><ErrorBox error={error}/>
      {tab==="profile"&&<section className="profile-card"><div className="profile-intro"><div className="profile-avatar">{(profile.fullName||"?").slice(0,1)}</div><div><p className="eyebrow">Your CareLink account</p><h2>{profile.fullName || "Your profile"}</h2><p className="muted">Your details are kept here so your care team can recognise you.</p><span className="profile-status"><i/> Account active</span></div></div><dl><div><dt>Account type</dt><dd>{patient?"Patient":doctor?"Doctor":"Administrator"}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div>{patient&&<><div><dt>Blood group</dt><dd>{profile.bloodGroup||"Not recorded"}</dd></div><div><dt>Emergency contact</dt><dd>{profile.emergencyContact||"Not recorded"}</dd></div></>}{doctor&&<><div><dt>Specialization</dt><dd>{profile.specialization}</dd></div><div><dt>Experience</dt><dd>{profile.yearsOfExperience} years</dd></div><div><dt>Consultation fee</dt><dd>{money(profile.consultationFee)}</dd></div></>}</dl></section>}
      {tab==="network"&&<HospitalNetwork hospitals={hospitals} addHospital={addHospital}/>}
      {tab==="overview"&&<><div className="metrics"><Metric label="In queue" value={stats?.inQueue}/><Metric label="In progress" value={stats?.inProgress}/><Metric label="Consultations completed" value={stats?.completedVisits}/><Metric label={patient?"Demo payments":"Demo doctor earnings"} value={stats?money(patient?stats.demoGrossRevenue:stats.demoDoctorEarnings):"…"}/></div>
        {!patient&&<div className="metrics secondary-metrics"><Metric label="Patients consulted" value={stats?.patientsConsulted}/><Metric label="Patients reported recovered" value={stats?.patientsReportedRecovered}/><Metric label="In-person referrals" value={stats?.inPersonReferrals}/><Metric label="Outstanding invoices" value={stats?money(stats.outstanding):"…"}/></div>}
        <p className="muted small-note">Recovery counts reflect doctor-recorded outcomes, not a guarantee of cure.</p>
        {patient&&<section><div className="section-head"><h2>Your care team</h2><button className="text-button" onClick={()=>setTab("doctors")}>See all doctors</button></div><Doctors doctors={doctors.slice(0,3)} book={book} error={doctorError}/></section>}
        <section className="dashboard-section"><div className="section-head"><h2>{patient?"Your recent visits":"Appointment activity"}</h2><button className="text-button" onClick={()=>setTab("bookings")}>View all bookings</button></div><VisitList visits={visits?.slice(-3).reverse()} role={role} api={api} refresh={refresh} demo={stats?.demoPaymentsEnabled}/></section></>}
      {tab==="doctors"&&<section><h2>Find your doctor</h2><Doctors doctors={doctors} book={book} error={doctorError}/></section>}
      {tab==="bookings"&&<Bookings visits={visits} role={role} api={api} refresh={refresh} demo={stats?.demoPaymentsEnabled}/>}
      {tab==="invoices"&&<section><h2>{patient?"Your medicines & invoices":"Invoices & earnings"}</h2><p className="demo-banner">Demo payment mode. No money is collected and no medicine is dispatched.</p><div className="metrics"><Metric label={patient?"Doctor fees (demo paid)":"Doctor earnings (demo)"} value={stats?money(stats.demoDoctorEarnings):"…"}/><Metric label="Medicine charges (demo paid)" value={stats?money(stats.demoMedicineRevenue):"…"}/><Metric label="Total demo payments" value={stats?money(stats.demoGrossRevenue):"…"}/><Metric label="Outstanding" value={stats?money(stats.outstanding):"…"}/></div>{role==="CLINIC_ADMIN"&&<p className="muted">This is a fee breakdown, not profit. Pharmacy costs, commissions, taxes, and refunds are not configured.</p>}<VisitList visits={visits?.filter(a=>a.invoice)} role={role} api={api} refresh={refresh} demo={stats?.demoPaymentsEnabled}/></section>}
      {tab==="schedule"&&<Schedule api={api} visits={visits||[]} refresh={refresh}/>}
      {tab==="accounts"&&<Accounts api={api} doctors={doctors} loadDoctors={loadDoctors}/>}
    </main></div>;
}
function HospitalNetwork({hospitals,addHospital}) {
  const [open,setOpen] = useState(false);
  function submit(event) {
    event.preventDefault();
    addHospital(Object.fromEntries(new FormData(event.currentTarget)));
    event.currentTarget.reset();
    setOpen(false);
  }
  return <section className="network-admin"><div className="network-heading"><div><p className="eyebrow">Platform control room</p><h2>Hospital spaces, with local ownership.</h2><p className="muted">Add a hospital to the CareLink network, then assign its own administrator when server-side workspaces are enabled.</p></div><button className="button" onClick={()=>setOpen(value=>!value)}>{open?"Close form":"Add hospital"}</button></div>{open&&<form className="inline-form hospital-form" onSubmit={submit}><label>Hospital name<input name="name" required maxLength={120}/></label><label>Location<input name="place" required maxLength={120} placeholder="Area, City"/></label><label>Care focus<input name="focus" maxLength={120} placeholder="For example: Family care"/></label><button className="button">Add to network</button></form>}<div className="hospital-admin-list">{hospitals.map((h,index)=><article key={h.id}><span>✦</span><div><strong>{h.name}</strong><small>{h.place} · {index===0?"Platform administrator assigned":"Administrator allocation pending"}</small></div><span className={`allocation-state ${index===0?"assigned":"pending"}`}>{index===0?"Configured":"Needs admin"}</span></article>)}</div><p className="small-note">Added hospitals are saved in this browser for the preview. Secure administrator allocation and hospital-scoped records need the next backend migration.</p></section>;
}
function Metric({label,value}) {return <div className="metric"><span>{label}</span><strong>{value??"…"}</strong></div>;}
function Doctors({doctors,book,error}) {return <><ErrorBox error={error}/><div className="doctor-grid">{doctors.map(d=><article className="doctor" key={d.id}><div className="doctor-avatar">{name(d).slice(0,1)}</div><p className="specialty">{d.specialization}</p><h2>Dr. {name(d)}</h2><p>{d.yearsOfExperience} years of experience</p><p>{money(d.consultationFee)} consultation fee</p><button className="text-button" onClick={()=>book(d)}>See available times →</button></article>)}</div>{!doctors.length&&<p className="empty">No doctors available.</p>}</>;}
function Bookings(props) {
  const [filter,setFilter]=useState("ALL");
  const filtered=props.visits?.filter(a=>filter==="ALL"||filter==="QUEUE"&&["PENDING","CONFIRMED"].includes(a.status)||a.status===filter);
  return <section><h2>Appointment history</h2><div className="filter-tabs">{[["ALL","All"],["QUEUE","In queue"],["IN_PROGRESS","In progress"],["COMPLETED","Completed"],["CANCELLED","Cancelled"]].map(([key,label])=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label}</button>)}</div><VisitList {...props} visits={filtered}/></section>;
}
function VisitList({visits,...props}) {return visits===null||visits===undefined?<p>Loading appointments…</p>:visits.length?<div className="appointment-list">{visits.map(a=><Visit key={a.id} a={a} {...props}/>)}</div>:<p className="empty">No appointments in this view.</p>;}
function Visit({a,role,api,refresh,demo}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[confirm,setConfirm]=useState(false);
  async function act(path,body,method="POST") {setBusy(true);setError("");try{await api(path,{method,...(body?{body:JSON.stringify(body)}:{})});setConfirm(false);refresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <article className="visit-card"><div className="section-head"><div><h3>{role==="PATIENT"?"Dr. "+name(a.doctor):a.patient.fullName}</h3><p>Visit #{a.id} · {date(a.slot.startTime)}</p><small>{role!=="PATIENT"?"Dr. "+name(a.doctor)+" · ":""}{a.doctor.specialization}</small></div><span key={a.status} className="status state-change" role="status">{labels[a.status]}</span></div><p>{a.reasonForVisit}</p><ErrorBox error={error}/>
    {a.diagnosis&&<div className="visit-notes"><strong>Consultation notes</strong><p>{a.diagnosis}</p>{!a.invoice&&<p>{a.medications||"No medicines recorded"}</p>}</div>}
    <div className="actions">{role==="DOCTOR"&&a.status==="PENDING"&&<button disabled={busy} className="button" onClick={()=>act("/api/consultations/"+a.id+"/approve")}>Approve appointment</button>}
    {role==="DOCTOR"&&a.status==="CONFIRMED"&&<button disabled={busy} className="button" onClick={()=>act("/api/consultations/"+a.id+"/start")}>Start consultation</button>}
    {role!=="CLINIC_ADMIN"&&["PENDING","CONFIRMED"].includes(a.status)&&(confirm?<><span>Cancel this appointment?</span><button className="outline" disabled={busy} onClick={()=>act("/api/appointments/cancel/"+a.id,null,"PUT")}>Yes, cancel</button><button className="text-button" onClick={()=>setConfirm(false)}>Keep appointment</button></>:<button className="text-button" onClick={()=>setConfirm(true)}>Cancel appointment</button>)}</div>
    {role==="DOCTOR"&&a.status==="IN_PROGRESS"&&<CarePlan fee={a.consultationFeeSnapshot??a.doctor.consultationFee} busy={busy} submit={body=>act("/api/consultations/"+a.id+"/care-plan",body)}/>}
    {a.invoice&&<Invoice a={a} role={role} busy={busy} act={act} demo={demo}/>}
  </article>;
}
function CarePlan({fee,busy,submit}) {
  const [rows,setRows]=useState([]),[referral,setReferral]=useState(false);
  function update(index,key,value){setRows(old=>old.map((r,i)=>i===index?{...r,[key]:value}:r));}
  function send(e){e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));submit({diagnosis:values.diagnosis,medicines:referral?[]:rows.map(r=>({...r,quantity:Number(r.quantity),unitPrice:Number(r.unitPrice)})),inPersonRequired:referral,referralNote:values.referralNote||"",outcome:values.outcome});}
  const total=Number(fee)+(referral?0:rows.reduce((s,r)=>s+Number(r.quantity)*Number(r.unitPrice),0));
  return <form className="inline-form care-plan" onSubmit={send}><h4>Care plan & prescription</h4><label>Diagnosis<textarea name="diagnosis" required maxLength={5000}/></label><label className="check-label"><input type="checkbox" checked={referral} onChange={e=>setReferral(e.target.checked)}/>In-person check required</label>
    {referral?<label>In-person assessment instructions<textarea name="referralNote" required maxLength={2000}/><small>No medicine delivery order will be created for this referral.</small></label>:<><div className="medicine-editor">{rows.map((r,i)=><fieldset key={i}><legend>Medicine {i+1}</legend><label>Medicine name<input aria-label={"Medicine name "+(i+1)} required maxLength={120} value={r.name} onChange={e=>update(i,"name",e.target.value)}/></label><label>Dosage & instructions<input aria-label={"Instructions "+(i+1)} required maxLength={500} value={r.instructions} onChange={e=>update(i,"instructions",e.target.value)}/></label><label>Quantity<input aria-label={"Quantity "+(i+1)} type="number" min="1" max="1000" step="1" required value={r.quantity} onChange={e=>update(i,"quantity",e.target.value)}/></label><label>Unit price (₹)<input aria-label={"Unit price "+(i+1)} type="number" min="0" max="100000" step=".01" required value={r.unitPrice} onChange={e=>update(i,"unitPrice",e.target.value)}/></label><button type="button" className="text-button" onClick={()=>setRows(old=>old.filter((_,idx)=>idx!==i))}>Remove medicine {i+1}</button></fieldset>)}</div><button type="button" className="outline" disabled={rows.length>=30} onClick={()=>setRows(old=>[...old,{name:"",instructions:"",quantity:1,unitPrice:""}])}>Add medicine</button><small>Leave the list empty if no medicine is prescribed.</small></>}
    <label>Recorded outcome<select name="outcome" defaultValue="NOT_RECORDED"><option value="NOT_RECORDED">Not yet assessed</option><option value="FOLLOW_UP">Follow-up needed</option><option value="IMPROVED">Patient improved</option><option value="RECOVERED">Patient reported recovered</option></select></label>
    <div className="invoice-total">Doctor fee {money(fee)} · Invoice total {money(total)}</div><button className="button" disabled={busy}>Complete consultation</button>
  </form>;
}
function Invoice({a,role,busy,act,demo}) {
  const inv=a.invoice;const items=JSON.parse(inv.itemsJson);const [confirm,setConfirm]=useState(false);
  async function download(){
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({unit:"mm",format:"a4"});
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18; let y = 21;
    const currency = value => `INR ${Number(value || 0).toLocaleString("en-IN", {minimumFractionDigits:2,maximumFractionDigits:2})}`;
    const addText = (text, x, width, size = 10, color = [35,66,78]) => {
      doc.setFontSize(size); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || "-"), width);
      if (y + lines.length * 5.1 > 274) { doc.addPage(); y = 21; }
      doc.text(lines, x, y); y += lines.length * 5.1;
    };
    doc.setFillColor(18, 105, 103); doc.rect(0, 0, pageWidth, 38, "F");
    doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.text("CareLink", margin, 18);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.text("DEMO CONSULTATION INVOICE", margin, 27);
    doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.text(`INVOICE CL-${inv.id}`, pageWidth-margin, 18, {align:"right"});
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.text(`Issued ${date(inv.issuedAt)}`, pageWidth-margin, 27, {align:"right"});
    y = 52; doc.setFont("helvetica","bold"); addText("Billed to", margin, 70, 10); doc.setFont("helvetica","normal"); addText(a.patient.fullName, margin, 70); addText(a.patient.account?.email, margin, 70, 9);
    y = 52; doc.setFont("helvetica","bold"); addText("Consultation", 112, 72, 10); doc.setFont("helvetica","normal"); addText(`Dr. ${name(a.doctor)}`, 112, 72); addText(`${a.doctor.specialization} | Visit #${a.id}`, 112, 72, 9);
    y = Math.max(y, 88); doc.setDrawColor(205,226,221); doc.line(margin,y,pageWidth-margin,y); y += 10;
    doc.setFont("helvetica","bold"); addText("Care summary", margin, pageWidth-margin*2, 12); doc.setFont("helvetica","normal"); addText(a.diagnosis || "Consultation completed", margin, pageWidth-margin*2, 10); y += 5;
    doc.setFillColor(235,248,244); doc.rect(margin,y,pageWidth-margin*2,8,"F"); doc.setTextColor(23,89,83); doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.text("DESCRIPTION",margin+3,y+5.4); doc.text("AMOUNT",pageWidth-margin-3,y+5.4,{align:"right"}); y += 14;
    const row = (description, amount, note = "") => {
      const title = doc.splitTextToSize(description, 112), details = note ? doc.splitTextToSize(note, 112) : [];
      const height = (title.length * 5.1) + (details.length * 4.2) + 10;
      if (y + height > 268) { doc.addPage(); y = 21; }
      const rowY = y;
      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(35,66,78); doc.text(title,margin+3,rowY);
      if(details.length) { doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(82,112,117); doc.text(details,margin+3,rowY + title.length * 5.1); }
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(35,66,78); doc.text(currency(amount),pageWidth-margin-3,rowY,{align:"right"});
      y += height; doc.setDrawColor(224,237,233); doc.line(margin,y-5,pageWidth-margin,y-5);
    };
    row("Doctor consultation fee", inv.doctorFee, `Dr. ${name(a.doctor)} - ${a.doctor.specialization}`);
    items.forEach(item => row(item.name, Number(item.quantity) * Number(item.unitPrice), `${item.quantity} x ${currency(item.unitPrice)} | ${item.instructions}`));
    if (!items.length) row("No medicines prescribed", 0, "Consultation only");
    y += 3; doc.setFillColor(18,105,103); doc.roundedRect(112,y,76,24,3,3,"F"); doc.setTextColor(220,250,243); doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.text("TOTAL DUE",118,y+8); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(15); doc.text(currency(inv.total),182,y+17,{align:"right"}); y += 36;
    if(inv.inPersonRequired) { doc.setFillColor(255,246,224); doc.roundedRect(margin,y,pageWidth-margin*2,22,3,3,"F"); doc.setTextColor(120,76,15); doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.text("In-person check required",margin+5,y+8); doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.text(doc.splitTextToSize(inv.referralNote || "Please follow your clinician's instructions.",pageWidth-margin*2-10),margin+5,y+15); }
    doc.setTextColor(88,112,117); doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.text("Demo invoice - not a tax invoice. No real payment or medicine dispatch has occurred.",margin,286);
    doc.save(`CareLink-invoice-${inv.id}.pdf`);
  }
  return <section className="invoice"><div className="section-head"><h4>Prescription & invoice CL-{inv.id}</h4><span className="status">{inv.status.replaceAll("_"," ")}</span></div>
    {inv.inPersonRequired&&<div className="referral"><strong>In-person check required</strong><p>{inv.referralNote}</p><small>Follow your clinician’s instructions. Medicine delivery is not available for this referral.</small></div>}
    {items.length>0?<div className="table-scroll"><table><thead><tr><th>Medicine & instructions</th><th>Quantity</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>{items.map((m,i)=><tr key={i}><td><strong>{m.name}</strong><small>{m.instructions}</small></td><td>{m.quantity}</td><td>{money(m.unitPrice)}</td><td>{money(m.quantity*m.unitPrice)}</td></tr>)}</tbody></table></div>:<p>No medicines prescribed.</p>}
    <dl className="invoice-summary"><div><dt>Doctor consultation fee</dt><dd>{money(inv.doctorFee)}</dd></div><div><dt>Medicine charges</dt><dd>{money(inv.medicineTotal)}</dd></div><div className="invoice-total"><dt>Total</dt><dd>{money(inv.total)}</dd></div></dl><p className="muted">Issued {date(inv.issuedAt)} · Outcome: {inv.outcome.replaceAll("_"," ").toLowerCase()}</p>
    {role==="PATIENT"&&inv.status==="ISSUED"&&<button className="button" disabled={busy} onClick={()=>act("/api/appointments/"+a.id+"/accept")}>{items.length?"Accept medicines & invoice":"Accept consultation invoice"}</button>}
    {role==="PATIENT"&&inv.status==="ACCEPTED"&&(demo?<div className="demo-banner"><p>Demo checkout: no real charge or delivery will take place.</p>{confirm?<><button className="button" disabled={busy} onClick={()=>act("/api/appointments/"+a.id+"/demo-pay")}>Confirm demo payment {money(inv.total)}</button><button className="text-button" onClick={()=>setConfirm(false)}>Go back</button></>:<button className="button" onClick={()=>setConfirm(true)}>Pay {money(inv.total)} (demo)</button>}</div>:<p>Payment checkout is not configured. Contact the clinic.</p>)}
    {inv.status==="DEMO_PAID"&&<div className="demo-banner" role="status">{inv.deliveryStatus==="DEMO_QUEUED"?"Demo order placed — your medicine delivery is queued. In a live service, your medicines would be delivered soon. No medicine has actually been dispatched.":"Demo payment recorded. "+(inv.inPersonRequired?"Please attend the in-person assessment.":"No medicine delivery is required.")}</div>}
    <div className="actions"><button className="text-button" onClick={download}>Download printable PDF</button></div>
  </section>;
}
function Schedule({api,visits,refresh}) {
  const [error,setError]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[removing,setRemoving]=useState(null);
  const live = useLiveQuery(signal => api("/api/schedule/my", {signal}), [api]);
  const slots=live.data||[], load=live.refresh;
  async function create(e){e.preventDefault();const form=e.currentTarget;const params=new URLSearchParams(Object.fromEntries(new FormData(form)));setBusy(true);setError("");try{await api("/api/schedule/slots?"+params,{method:"POST"});form.reset();setMessage("Availability added.");await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function remove(id){setBusy(true);setError("");try{await api("/api/schedule/slots/"+id,{method:"DELETE"});setRemoving(null);setMessage("Availability removed.");await load();refresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <section><h2>Your availability</h2><ErrorBox error={error||live.error}/>{message&&<p role="status">{message}</p>}<form className="schedule-form" onSubmit={create}><label>Starts<input name="start" type="datetime-local" required/></label><label>Ends<input name="end" type="datetime-local" required/></label><button className="button" disabled={busy}>Add availability</button></form><div className="slot-list">{slots.filter(s=>!s.withdrawn&&new Date(s.endTime)>new Date()).map(s=>{const visit=visits.find(a=>a.slot.id===s.id&&a.status!=="CANCELLED");return <article key={s.id} className="slot-item"><strong>{date(s.startTime)}</strong><small>Until {date(s.endTime)}</small><span className="status">{visit?labels[visit.status]:s.booked?"Booked":"Available"}</span>{visit&&<span>{visit.patient.fullName}</span>}{!s.booked&&(removing===s.id?<><span>Remove this available slot?</span><button className="text-button" disabled={busy} onClick={()=>remove(s.id)}>Confirm removal</button><button className="text-button" onClick={()=>setRemoving(null)}>Keep slot</button></>:<button className="text-button" onClick={()=>setRemoving(s.id)}>Remove slot</button>)}</article>;})}</div></section>;
}
function Accounts({api,doctors,loadDoctors}) {
  const [error,setError]=useState(""),[message,setMessage]=useState(""),[pending,setPending]=useState(null),[busy,setBusy]=useState(false);
  const live = useLiveQuery(signal => api("/api/patients", {signal}), [api]);
  const patients=live.data||[], load=live.refresh;
  async function add(e){e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));setBusy(true);setError("");try{await api("/api/doctors",{method:"POST",body:JSON.stringify({...data,consultationFee:Number(data.consultationFee),yearsOfExperience:Number(data.yearsOfExperience)})});form.reset();await loadDoctors();setMessage("Doctor account created. Share their credentials privately.");}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function deactivate(){setBusy(true);setError("");try{await api("/api/"+pending.type+"/"+pending.id,{method:"DELETE"});setPending(null);await load();await loadDoctors();}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <section><h2>Clinic accounts</h2><ErrorBox error={error||live.error}/>{message&&<p role="status">{message}</p>}<details className="create-doctor"><summary>Add a doctor</summary><form className="inline-form" onSubmit={add}><label>Doctor full name<input name="fullName" required maxLength={100}/></label><label>Doctor email<input name="email" type="email" required/></label><label>Initial password<input name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password"/></label><label>Specialization<input name="specialization" required/></label><label>Consultation fee (₹)<input name="consultationFee" type="number" min=".01" max="100000" step=".01" required/></label><label>Years of experience<input name="yearsOfExperience" type="number" min="0" step="1" required/></label><button className="button" disabled={busy}>Create doctor account</button></form></details>
    {pending&&<div className="notice" role="alert">Deactivate {pending.name}? History will be retained.<button disabled={busy} onClick={deactivate}>Confirm deactivation</button><button onClick={()=>setPending(null)}>Keep active</button></div>}<div className="admin-grid"><section><h3>Doctors ({doctors.length})</h3>{doctors.map(d=><div className="list-row" key={d.id}><span>Dr. {name(d)}<small>{d.account.email} · {money(d.consultationFee)}</small></span><button className="text-button" onClick={()=>setPending({type:"doctors",id:d.id,name:name(d)})}>Deactivate</button></div>)}</section><section><h3>Patients ({patients.length})</h3>{patients.map(p=><div className="list-row" key={p.id}><span>{p.fullName}<small>{p.account.email}</small></span>{p.account.active?<button className="text-button" onClick={()=>setPending({type:"patients",id:p.id,name:p.fullName})}>Deactivate</button>:<span className="status">Inactive</span>}</div>)}</section></div></section>;
}
