import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import { announceChange, useLiveQuery } from "./live";
import ParticleText from "./components/ParticleText.jsx";
import FlipCard from "./components/FlipCard.jsx";
import CometDial from "./components/CometDial.jsx";
import ScrollWiden from "./components/ScrollWiden.jsx";
import { hospitals } from "./hospitals.js";

const roles = { PATIENT: "Patient", DOCTOR: "Doctor", CLINIC_ADMIN: "Platform administrator" };
const publicPath = (path, method = "GET") => ["/api/auth/login", "/api/auth/register", "/api/public/impact"].includes(path)
  || (method === "GET" && (path === "/api/doctors" || path.startsWith("/api/schedule/slots/")));
const time = value => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Time unavailable";
const doctorName = d => d.fullName || d.account?.email?.split("@")[0] || "CareLink specialist";

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("home");
  const [doctors, setDoctors] = useState([]);
  const [doctorError, setDoctorError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("carelink_intro_seen"));
  const [hospitalNetwork, setHospitalNetwork] = useState(() => {
    try { return JSON.parse(localStorage.getItem("carelink_hospital_network")) || hospitals; }
    catch { return hospitals; }
  });
  const [hospitalId, setHospitalId] = useState(() => sessionStorage.getItem("carelink_hospital") || "harbor");
  const selectedHospital = hospitalNetwork.find(h => h.id === hospitalId) || hospitalNetwork[0];
  function chooseHospital(id) { sessionStorage.setItem("carelink_hospital", id); setHospitalId(id); setPage(session ? "dashboard" : "home"); }
  function addHospital(values) {
    const id = `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
    const hospital = { id, name: values.name.trim(), place: values.place.trim(), focus: values.focus.trim() || "Local care", color: "#dff6ec" };
    setHospitalNetwork(current => {
      const next = [...current, hospital];
      localStorage.setItem("carelink_hospital_network", JSON.stringify(next));
      return next;
    });
    chooseHospital(id);
    setNotice(`${hospital.name} was added to the local platform preview.`);
  }

  const api = useCallback(async (path, options = {}) => {
    const token = sessionStorage.getItem("carelink_token");
    const response = await fetch(path, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(!publicPath(path, options.method) && token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
    if (!response.ok) {
      if (response.status === 401 && !publicPath(path, options.method) && sessionStorage.getItem("carelink_token") === token) {
        sessionStorage.removeItem("carelink_token"); sessionStorage.removeItem("carelink_user");
        setSession(null); setPage("login");
      }
      throw new Error(data?.error || (response.status === 403 ? "Your account cannot perform this action." : `Request failed (${response.status}). Please try again.`));
    }
    if (options.method && options.method !== "GET") announceChange();
    return data;
  }, []);
  const doctorQuery = useLiveQuery(signal => api("/api/doctors", {signal}), [api]);
  const impactQuery = useLiveQuery(signal => api("/api/public/impact", {signal}), [api]);
  const loadDoctors = doctorQuery.refresh;
  useEffect(() => {
    if (doctorQuery.data) setDoctors(doctorQuery.data);
    setDoctorError(doctorQuery.error);
  }, [doctorQuery.data, doctorQuery.error]);
  useEffect(() => {
    let live = true;
    if (!sessionStorage.getItem("carelink_token")) { setChecking(false); return; }
    api("/api/auth/me").then(user => { if (live) { setSession(user); setPage("dashboard"); } })
      .catch(e => { if (live) setNotice(e.message); })
      .finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [api]);
  useEffect(() => {
    if (!showSplash) return undefined;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("carelink_intro_seen", "true");
      setShowSplash(false);
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [showSplash]);
  function signOut() {
    sessionStorage.removeItem("carelink_token"); sessionStorage.removeItem("carelink_user");
    setSession(null); setPage("home"); setNotice("You have signed out.");
  }
  async function authenticate(event, register) {
    event.preventDefault(); setBusy(true); setNotice("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api(register ? "/api/auth/register" : "/api/auth/login", { method: "POST", body: JSON.stringify(values) });
      sessionStorage.setItem("carelink_token", data.token);
      sessionStorage.removeItem("carelink_user");
      const profile = await api("/api/auth/me");
      setSession(profile); setPage(profile.role === "PATIENT" ? "hospitals" : "dashboard");
      setNotice(data.emailNotification === "ACCEPTED" ? "You’re signed in. Your email notification is on its way."
        : data.emailNotification === "FAILED" ? "You’re signed in, but the email notification could not be delivered."
        : "You’re signed in. Welcome to your CareLink space.");
      loadDoctors();
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  }
  function book(doctor) {
    if (!session) { setPage("login"); setNotice("Sign in to choose an appointment."); }
    else if (session.role !== "PATIENT") setNotice("Appointment booking is available to patient accounts.");
    else setPage({ kind: "booking", doctor });
  }
  // Hospital membership will be enforced by the API once hospital workspaces
  // exist server-side. Until then, keep the care directory useful at every
  // selected hospital rather than presenting an empty directory.
  const visibleDoctors = doctors;
  if (showSplash) return <IntroSplash/>;
  return <div className="app-shell blue-shell">
    {(!session || page !== "dashboard") && <header className="site-header">
      <div className="brand-area"><button className="brand" onClick={() => setPage(session ? "dashboard" : "home")}><span className="brand-mark">✦</span>CareLink</button>{session && <button className="hospital-chip" onClick={() => setPage("hospitals")} aria-label="Choose hospital"><span className="hospital-chip-dot"/> {selectedHospital.name}<span>⌄</span></button>}</div>
      <nav aria-label="Main navigation">
        {session && <button onClick={() => setPage("doctors")}>Doctors</button>}
        {session ? <><span className="account-chip">{session.fullName} · {roles[session.role]}</span><button onClick={signOut}>Sign out</button></>
          : <><button className="button small" onClick={() => setPage("login")}>Sign in</button><button className="quiet" onClick={() => setPage("register")}>Create account</button></>}
      </nav>
    </header>}
    {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    {checking ? <main className="page"><p>Checking your account…</p></main> : <>
      {page === "home" && <main><section className="hero blue-hero"><div><p className="eyebrow">One caring platform. Local hospital teams.</p><h1><ParticleText text="Care that meets you"/><em> where you are.</em></h1><p className="intro">Sign in when you are ready. Your hospital and care team appear inside your own secure CareLink space.</p><div className="actions"><button className="button" onClick={() => document.getElementById("platform-details")?.scrollIntoView({behavior:"smooth"})}>See how CareLink works ↓</button><button className="text-button" onClick={() => setPage("login")}>Sign in to CareLink</button></div></div><div className="hero-card network-card"><p className="card-label">CareLink impact</p><CometDial value={impactQuery.data?.patientsConsulted || 0} total={Math.max(impactQuery.data?.patientsConsulted || 0, 1)} display={impactQuery.data?.patientsConsulted ?? "…"} label="Patients consulted"/><h2>Patients cared<br/>for, together.</h2><p>{impactQuery.data ? "Completed consultations across CareLink." : "Loading CareLink impact…"}</p></div></section><ScrollWiden className="platform-story-wrap"><section id="platform-details" className="platform-story"><p className="eyebrow">Scroll into the platform</p><h2>Local care should feel personal, even when the network grows.</h2><div className="story-steps"><article><span>01</span><h3>Enter your care space</h3><p>Sign in securely to access the actions and information meant for you.</p></article><article><span>02</span><h3>Choose your hospital</h3><p>Once inside, select the hospital where you want to receive care.</p></article><article><span>03</span><h3>Follow your care</h3><p>Meet the care team, book, consult, and keep every update in one clear place.</p></article></div><button className="button" onClick={() => setPage("login")}>Continue to sign in →</button></section></ScrollWiden></main>}
      {page === "hospitals" && session && <HospitalPicker hospitals={hospitalNetwork} selected={hospitalId} choose={chooseHospital}/>}
      {page === "login" && <AuthForm busy={busy} submit={e => authenticate(e, false)} switchPage={() => setPage("register")}/>}
      {page === "register" && <AuthForm register busy={busy} submit={e => authenticate(e, true)} switchPage={() => setPage("login")}/>}
      {page === "doctors" && session && <main className="page"><p className="eyebrow">{selectedHospital.name} care team</p><h1>Find someone who understands.</h1><DoctorList doctors={visibleDoctors} error={doctorError} retry={loadDoctors} book={book} canBook={session.role === "PATIENT"}/></main>}
      {page?.kind === "booking" && <Booking doctor={page.doctor} api={api} done={() => { setPage("dashboard"); setNotice("Your appointment is booked. Your doctor will confirm it shortly."); }}/>}
      {page === "dashboard" && session && <Dashboard key={session.email} session={session} doctors={visibleDoctors} doctorError={doctorError} loadDoctors={loadDoctors} book={book} api={api} hospital={selectedHospital} hospitals={hospitalNetwork} addHospital={addHospital}/>}
    </>}
    <footer>✦ CareLink — Care should feel connected.</footer>
  </div>;
}

function IntroSplash() {
  return <main className="intro-splash" aria-label="Opening CareLink"><div className="intro-orbit"><span>✦</span></div><p>CareLink</p><small>Care, closer to home.</small></main>;
}

function AuthForm({ register, busy, submit, switchPage }) {
  const [role, setRole] = useState("PATIENT");
  return <main className="auth-wrap"><section className="auth-card">
    <p className="eyebrow">{register ? "Your first step" : "Your CareLink account"}</p>
    <h1>{register ? "Let’s get to know you." : "Welcome back."}</h1>
    {!register && <><div className="role-picker">{Object.entries(roles).map(([value, label]) => <button key={value} className={`role-option ${value === role ? "active" : ""}`} aria-pressed={value === role} onClick={() => setRole(value)}>{label}</button>)}</div><p className="role-hint">{role === "PATIENT" ? "Sign in to see your appointments and care team." : "Use the account provided by your clinic. Your account determines which workspace opens."}</p></>}
    <form onSubmit={submit}>
      {register && <label>Full name<input name="fullName" autoComplete="name" required maxLength={100}/></label>}
      <label>Email address<input name="email" type="email" autoComplete="username" required/></label>
      <label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 12 : undefined} maxLength={72}/>{register && <small>Use at least 12 characters.</small>}</label>
      {register && <><label>Blood group<select name="bloodGroup" required><option value="">Choose your blood group</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(v => <option key={v}>{v}</option>)}</select></label><label>Emergency contact<input name="emergencyContact" type="tel" required/></label></>}
      <button className="button wide" disabled={busy}>{busy ? "Please wait…" : register ? "Create my account" : "Sign in"}</button>
    </form><p className="auth-switch">{register ? "Already registered?" : "New patient?"} <button onClick={switchPage}>{register ? "Sign in" : "Create an account"}</button></p>
  </section></main>;
}
function ErrorMessage({ message, retry }) {
  return message ? <div className="form-message" role="alert">{message}{retry && <button className="text-button" onClick={retry}> Try again</button>}</div> : null;
}
function DoctorList({ doctors, error, retry, book, canBook = true }) {
  return <><ErrorMessage message={error} retry={retry}/><div className="doctor-grid">{doctors.map(d => <FlipCard key={d.id} label={`Dr. ${doctorName(d)}`} front={<><SpecialtyVisual specialty={d.specialization}/><div className="doctor-card-copy"><p className="specialty">{d.specialization}</p><h2>Dr. {doctorName(d)}</h2><p>{d.yearsOfExperience} years of experience</p><p>₹{Number(d.consultationFee).toLocaleString("en-IN")} per consultation</p></div></>} back={<div className="doctor-card-copy doctor-card-back"><p className="specialty">How Dr. {doctorName(d).split(" ")[0]} can help</p><h2>{d.specialization} care, with time to listen.</h2><p>Review availability at your selected hospital and choose a time that feels right.</p>{canBook && <button className="button" onClick={() => book(d)}>See available times</button>}</div>}/>)}</div>{!error && !doctors.length && <div className="empty">No doctors are available at this hospital yet. Choose another hospital or check back soon.</div>}</>;
}
function SpecialtyVisual({specialty}) {
  if (specialty === "Cardiology") return <div className="specialty-visual heart-visual" aria-label="Cardiology illustration"><svg viewBox="0 0 240 130" aria-hidden="true"><path d="M119 106S42 65 42 31c0-22 29-31 45-8 16-23 41-14 42 8 1-22 27-31 43-8 16-23 45-14 45 8 0 34-77 75-98 75Z"/><path d="M18 67h49l13-26 18 48 21-36 17 14h84"/></svg><span>Heart care</span></div>;
  if (specialty === "Dermatology") return <div className="specialty-visual skin-visual" aria-label="Dermatology illustration"><svg viewBox="0 0 240 130" aria-hidden="true"><path d="M53 99c31-51 69-74 126-67-4 47-32 80-76 83-23 2-42-3-50-16Z"/><path d="M81 88c9-25 28-43 57-54M103 100c9-21 25-37 49-47M125 104c8-14 19-25 34-33"/><circle cx="166" cy="29" r="9"/></svg><span>Skin care</span></div>;
  return <div className="specialty-visual general-visual" aria-label="General medicine illustration"><svg viewBox="0 0 240 130" aria-hidden="true"><path d="M120 25v80M80 65h80"/><circle cx="120" cy="65" r="46"/><path d="M48 106c22-13 43-12 61 4M131 110c19-17 40-18 61-4"/></svg><span>Everyday care</span></div>;
}
function HospitalPicker({ hospitals, selected, choose }) {
  return <main className="page hospital-page"><p className="eyebrow">Your local care, your choice</p><h1>Which hospital feels right today?</h1><p className="intro">Your hospital appears beside CareLink and keeps your care team clear as you book.</p><div className="hospital-grid">{hospitals.map(h => <button key={h.id} className={`hospital-card ${selected === h.id ? "selected" : ""}`} style={{"--hospitalTint":h.color}} onClick={() => choose(h.id)}><span className="hospital-symbol">✦</span><strong>{h.name}</strong><small>{h.place}</small><p>{h.focus}</p><span>{selected === h.id ? "Selected" : "Choose this hospital"} →</span></button>)}</div><section className="platform-note"><p className="eyebrow">For hospital teams</p><h2>One CareLink platform, independent hospital workspaces.</h2><p>A platform administrator can give each hospital its own administrator, who manages that hospital’s doctors, schedules and local patient care.</p></section></main>;
}
function Booking({ doctor, api, done }) {
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const slotQuery = useLiveQuery(signal => api(`/api/schedule/slots/${doctor.id}`, {signal}), [api, doctor.id]);
  const slots = slotQuery.data, load = slotQuery.refresh;
  async function submit(e) {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); setBusy(true);
    try { await api("/api/appointments/book", { method:"POST", body:JSON.stringify({slotId:Number(data.slotId), reasonForVisit:data.reasonForVisit}) }); done(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="auth-wrap"><section className="auth-card"><p className="eyebrow">Your next visit</p><h1>Dr. {doctorName(doctor)}</h1><p>{doctor.specialization} · ₹{doctor.consultationFee}</p><ErrorMessage message={error || slotQuery.error} retry={load}/><form onSubmit={submit}><label>Appointment time<select name="slotId" required><option value="">{slots === null ? "Loading…" : "Choose a time"}</option>{slots?.map(s => <option key={s.id} value={s.id}>{time(s.startTime)}</option>)}</select></label><label>What would you like help with?<textarea name="reasonForVisit" required maxLength={1000}/></label><button className="button" disabled={busy || !slots?.length}>{busy ? "Booking…" : "Confirm appointment"}</button></form>{slots?.length === 0 && <p>No times are available. Please choose another doctor or check later.</p>}</section></main>;
}
