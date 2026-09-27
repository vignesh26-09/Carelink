import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import { announceChange, useLiveQuery } from "./live";

const roles = { PATIENT: "Patient", DOCTOR: "Doctor", CLINIC_ADMIN: "Administrator" };
const publicPath = (path, method = "GET") => ["/api/auth/login", "/api/auth/register"].includes(path)
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
      setSession(profile); setPage("dashboard");
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
  return <div className="app-shell">
    <header className="site-header">
      <button className="brand" onClick={() => setPage(session ? "dashboard" : "home")}><span className="brand-mark">✦</span>CareLink</button>
      <nav aria-label="Main navigation">
        <button onClick={() => setPage(session ? "dashboard" : "home")}>{session ? "My dashboard" : "Home"}</button>
        <button onClick={() => setPage("doctors")}>Doctors</button>
        {session ? <><span className="account-chip">{session.fullName} · {roles[session.role]}</span><button onClick={signOut}>Sign out</button></>
          : <><button onClick={() => setPage("login")}>Sign in</button><button className="button small" onClick={() => setPage("register")}>Create account</button></>}
      </nav>
    </header>
    {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    {checking ? <main className="page"><p>Checking your account…</p></main> : <>
      {page === "home" && <main><section className="hero"><div><p className="eyebrow">A more human way to manage care</p><h1>Care, without the <em>running around.</em></h1><p className="intro">Find your doctor, make time for your health, and keep your care connected.</p><div className="actions"><button className="button" onClick={() => setPage("register")}>Begin with CareLink →</button><button className="text-button" onClick={() => setPage("doctors")}>Meet our doctors</button></div></div><div className="hero-card"><div className="sun"/><h2>A little more calm.<br/>A lot more care.</h2><p>Your appointments, care team, and visit details in one welcoming place.</p></div></section></main>}
      {page === "login" && <AuthForm busy={busy} submit={e => authenticate(e, false)} switchPage={() => setPage("register")}/>}
      {page === "register" && <AuthForm register busy={busy} submit={e => authenticate(e, true)} switchPage={() => setPage("login")}/>}
      {page === "doctors" && <main className="page"><p className="eyebrow">Your care team</p><h1>Find someone who understands.</h1><DoctorList doctors={doctors} error={doctorError} retry={loadDoctors} book={book} canBook={!session || session.role === "PATIENT"}/></main>}
      {page?.kind === "booking" && <Booking doctor={page.doctor} api={api} done={() => { setPage("dashboard"); setNotice("Your appointment is booked. Your doctor will confirm it shortly."); }}/>}
      {page === "dashboard" && session && <Dashboard key={session.email} session={session} doctors={doctors} doctorError={doctorError} loadDoctors={loadDoctors} book={book} api={api}/>}
    </>}
    <footer>✦ CareLink — Care should feel connected.</footer>
  </div>;
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
  return <><ErrorMessage message={error} retry={retry}/><div className="doctor-grid">{doctors.map(d => <article className="doctor" key={d.id}><div className="doctor-avatar">{doctorName(d).slice(0,1)}</div><p className="specialty">{d.specialization}</p><h2>Dr. {doctorName(d)}</h2><p>{d.yearsOfExperience} years of experience</p><p>₹{Number(d.consultationFee).toLocaleString("en-IN")} per consultation</p>{canBook && <button className="text-button" onClick={() => book(d)}>See available times →</button>}</article>)}</div>{!error && !doctors.length && <div className="empty">No doctors are available yet. Please check back soon.</div>}</>;
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
