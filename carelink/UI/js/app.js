// CareLink — API client for Spring Boot backend
const CL = {
  base(){return location.pathname.includes('/pages/')?'../':'';},
  apiUrl(){return localStorage.getItem('cl_api')||'http://localhost:8080';},
  setApiUrl(u){localStorage.setItem('cl_api',u.replace(/\/$/,''));},
  user(){try{return JSON.parse(localStorage.getItem('user'))}catch(e){return null}},
  token(){const u=this.user();return u&&u.token;},
  saveUser(u){localStorage.setItem('user',JSON.stringify(u));},
  logout(){localStorage.removeItem('user');location.href=this.base()+'pages/login.html';},
  requireAuth(role){
    const u=this.user();
    if(!u){location.href=this.base()+'pages/login.html';return null;}
    if(role){
      const roles=Array.isArray(role)?role:[role];
      if(!roles.includes(u.role)){location.href=this.base()+'pages/dashboard.html';return null;}
    }
    return u;
  },
  async api(path,{method='GET',body,query,auth=true}={}){
    let url=this.apiUrl()+path;
    if(query){
      const qs=new URLSearchParams(query).toString();
      url+= (url.includes('?')?'&':'?')+qs;
    }
    const headers={'Accept':'application/json'};
    if(body!==undefined) headers['Content-Type']='application/json';
    if(auth && this.token()) headers['Authorization']='Bearer '+this.token();
    let res;
    try{
      res=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    }catch(e){throw new Error('Network error — is the backend running at '+this.apiUrl()+'?');}
    if(res.status===401){
      // Only bounce if we thought we were logged in
      if(this.token()){this.logout();}
      throw new Error('Unauthorized');
    }
    if(!res.ok){
      let msg='Request failed ('+res.status+')';
      try{const j=await res.json();msg=j.message||j.error||msg;}catch(e){}
      throw new Error(msg);
    }
    if(res.status===204) return null;
    const t=await res.text(); if(!t) return null;
    try{return JSON.parse(t);}catch(e){return t;}
  },

  // ===== Auth =====
  auth:{
    login(email,password){return CL.api('/api/auth/login',{method:'POST',body:{email,password},auth:false});},
    registerPatient(dto){return CL.api('/api/auth/register',{method:'POST',body:dto,auth:false});}
  },
  // ===== Doctors =====
  doctors:{
    list(){return CL.api('/api/doctors',{auth:false});},
    remove(id){return CL.api('/api/doctors/'+id,{method:'DELETE'});}
  },
  // ===== Patients =====
  patients:{
    list(){return CL.api('/api/patients');},
    remove(id){return CL.api('/api/patients/'+id,{method:'DELETE'});}
  },
  // ===== Schedule =====
  schedule:{
    createSlot(start,end){
      // append :00 seconds if the datetime-local value is 16 chars
      const s=start.length===16?start+':00':start;
      const e=end.length===16?end+':00':end;
      return CL.api('/api/schedule/slots',{method:'POST',query:{start:s,end:e}});
    },
    availableFor(doctorId){return CL.api('/api/schedule/slots/'+doctorId,{auth:false});},
    mine(){return CL.api('/api/schedule/my');}
  },
  // ===== Appointments =====
  appointments:{
    book(slotId,reasonForVisit){return CL.api('/api/appointments/book',{method:'POST',body:{slotId,reasonForVisit}});},
    cancel(id){return CL.api('/api/appointments/cancel/'+id,{method:'PUT'});},
    mine(){return CL.api('/api/appointments/my');},
    all(){return CL.api('/api/appointments');}
  },
  // ===== Consultations =====
  consultations:{
    approve(id){return CL.api('/api/consultations/'+id+'/approve',{method:'POST'});},
    start(id){return CL.api('/api/consultations/'+id+'/start',{method:'POST'});},
    finalize(id,diagnosis,medicationsJson){return CL.api('/api/consultations/'+id+'/finalize',{method:'POST',query:{diagnosis,medicationsJson}});}
  },

  // ===== Helpers =====
  fmt(t){if(!t) return '—'; try{return new Date(t).toLocaleString();}catch(e){return t;}},
  statusBadge(s){return `<span class="badge badge-status status-${s}">${s}</span>`;},
  doctorEmail(d){return d?.account?.email || d?.email || '—';},
  patientEmail(p){return p?.account?.email || p?.email || '—';},
  toast(msg,type='primary'){
    const el=document.createElement('div');
    el.className=`toast align-items-center text-bg-${type} border-0 position-fixed top-0 end-0 m-3 show`;
    el.style.zIndex=9999;
    el.innerHTML=`<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button></div>`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),4000);
  },
  renderNavbar(active){
    const u=this.user(); if(!u) return '';
    const links={
      PATIENT:[['dashboard.html','Home','house'],['doctors.html','Find Doctor','search'],['my-appointments.html','My Appointments','calendar-check']],
      DOCTOR:[['dashboard.html','Home','house'],['schedule.html','My Schedule','clock'],['consultations.html','Consultations','clipboard2-pulse']],
      CLINIC_ADMIN:[['dashboard.html','Home','house'],['manage-doctors.html','Manage Doctors','person-badge'],['manage-patients.html','Manage Patients','people'],['all-appointments.html','All Appointments','calendar3']]
    }[u.role]||[];
    return `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold text-primary" href="dashboard.html"><i class="bi bi-heart-pulse-fill me-1"></i>CareLink</a>
        <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMain"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="navMain">
          <ul class="navbar-nav me-auto">
            ${links.map(([h,l,i])=>`<li class="nav-item"><a class="nav-link ${active===h?'active fw-semibold':''}" href="${h}"><i class="bi bi-${i} me-1"></i>${l}</a></li>`).join('')}
          </ul>
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#apiModal" title="API settings"><i class="bi bi-gear"></i></button>
            <span class="text-muted small d-none d-md-inline">Welcome, <strong>${u.email}</strong> <span class="badge bg-secondary">${u.role}</span></span>
            <button class="btn btn-sm btn-outline-danger" onclick="CL.logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </div>
    </nav>
    <div class="modal fade" id="apiModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Backend API URL</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        <label class="form-label small">Base URL of Spring Boot API</label>
        <input id="apiInput" class="form-control" value="${this.apiUrl()}">
        <p class="small text-muted mt-2 mb-0">Default: <code>http://localhost:8080</code></p>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" onclick="CL.setApiUrl(document.getElementById('apiInput').value);location.reload()">Save</button></div>
    </div></div></div>`;
  },
  mountNav(active){
    const slot=document.getElementById('nav-slot');
    if(slot) slot.innerHTML=this.renderNavbar(active);
  }
};
