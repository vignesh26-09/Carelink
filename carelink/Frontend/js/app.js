// CareLink — client-side demo (mock data via localStorage)
const CL = {
  seed(){
    if(localStorage.getItem('cl_seeded')) return;
    const doctors=[
      {id:1,email:'doctor@carelink.com',specialization:'General Medicine',yearsOfExperience:10,consultationFee:50},
      {id:2,email:'drsmith@carelink.com',specialization:'Cardiology',yearsOfExperience:15,consultationFee:100},
      {id:3,email:'drjones@carelink.com',specialization:'Pediatrics',yearsOfExperience:8,consultationFee:70}
    ];
    const patients=[
      {id:1,email:'patient@carelink.com',fullName:'Jane Doe',bloodGroup:'O+',emergencyContact:'555-0100'},
      {id:2,email:'john@carelink.com',fullName:'John Smith',bloodGroup:'A+',emergencyContact:'555-0200'}
    ];
    const slots=[
      {id:1,doctorId:1,doctorEmail:'doctor@carelink.com',start:'2026-04-10T09:00',end:'2026-04-10T09:30',booked:false},
      {id:2,doctorId:1,doctorEmail:'doctor@carelink.com',start:'2026-04-10T10:00',end:'2026-04-10T10:30',booked:true},
      {id:3,doctorId:2,doctorEmail:'drsmith@carelink.com',start:'2026-04-11T14:00',end:'2026-04-11T14:30',booked:false}
    ];
    const appts=[
      {id:1,patientEmail:'patient@carelink.com',doctorEmail:'doctor@carelink.com',time:'2026-04-02T10:00',reason:'Fever',status:'CONFIRMED'},
      {id:2,patientEmail:'patient@carelink.com',doctorEmail:'doctor@carelink.com',time:'2026-04-03T18:45',reason:'Eye Pain',status:'PENDING'},
      {id:3,patientEmail:'john@carelink.com',doctorEmail:'drsmith@carelink.com',time:'2026-04-05T11:00',reason:'Checkup',status:'COMPLETED'}
    ];
    localStorage.setItem('cl_doctors',JSON.stringify(doctors));
    localStorage.setItem('cl_patients',JSON.stringify(patients));
    localStorage.setItem('cl_slots',JSON.stringify(slots));
    localStorage.setItem('cl_appts',JSON.stringify(appts));
    localStorage.setItem('cl_seeded','1');
  },
  get(k){return JSON.parse(localStorage.getItem(k)||'[]');},
  set(k,v){localStorage.setItem(k,JSON.stringify(v));},
  user(){return JSON.parse(localStorage.getItem('user')||'null');},
  login(email,password,role){
    if(!email||!password) return {ok:false,msg:'Missing credentials'};
    const user={email,role:role||this.roleFromEmail(email),token:'demo.'+btoa(email)};
    localStorage.setItem('user',JSON.stringify(user));
    return {ok:true,user};
  },
  roleFromEmail(e){
    if(e.startsWith('admin')) return 'CLINIC_ADMIN';
    if(e.startsWith('doctor')||e.startsWith('dr')) return 'DOCTOR';
    return 'PATIENT';
  },
  logout(){localStorage.removeItem('user');location.href=this.base()+'pages/login.html';},
  base(){return location.pathname.includes('/pages/')?'../':'';},
  requireAuth(role){
    const u=this.user();
    if(!u){location.href=this.base()+'pages/login.html';return null;}
    if(role && u.role!==role){location.href=this.base()+'pages/dashboard.html';return null;}
    return u;
  },
  fmt(t){try{return new Date(t).toLocaleString();}catch(e){return t;}},
  statusBadge(s){return `<span class="badge badge-status status-${s}">${s}</span>`;},
  renderNavbar(active){
    const u=this.user(); if(!u) return '';
    const base=this.base();
    const links={
      PATIENT:[['dashboard.html','Home','house'],['doctors.html','Find Doctor','search'],['my-appointments.html','My Appointments','calendar-check']],
      DOCTOR:[['dashboard.html','Home','house'],['schedule.html','My Schedule','clock'],['consultations.html','Consultations','clipboard2-pulse']],
      CLINIC_ADMIN:[['dashboard.html','Home','house'],['manage-doctors.html','Manage Doctors','person-badge'],['manage-patients.html','Manage Patients','people'],['all-appointments.html','All Appointments','calendar3']]
    }[u.role]||[];
    return `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold text-primary" href="${base}pages/dashboard.html"><i class="bi bi-heart-pulse-fill me-1"></i>CareLink</a>
        <ul class="navbar-nav me-auto">
          ${links.map(([h,l,i])=>`<li class="nav-item"><a class="nav-link ${active===h?'active fw-semibold':''}" href="${h}"><i class="bi bi-${i} me-1"></i>${l}</a></li>`).join('')}
        </ul>
        <div class="d-flex align-items-center gap-3">
          <span class="text-muted small">Welcome back! <strong>${u.email}</strong> <span class="badge bg-secondary">${u.role}</span></span>
          <button class="btn btn-sm btn-outline-danger" onclick="CL.logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
        </div>
      </div>
    </nav>`;
  },
  mountNav(active){
    document.getElementById('nav-slot').innerHTML=this.renderNavbar(active);
  }
};
CL.seed();
