// Contact form: validation, sanitising, Formspree delivery or an Instagram-DM brief as fallback.
type Brief = { type: string; name: string; org: string; phone: string; email: string; date: string; size: string; message: string };

const form = document.getElementById("enquiry") as HTMLFormElement | null;
const status = document.getElementById("formStatus");
const size = document.getElementById("f-size") as HTMLInputElement | null;
const sizeOut = document.getElementById("sizeOut");
const dateIn = document.getElementById("f-date") as HTMLInputElement | null;

size?.addEventListener("input", () => { if (sizeOut) sizeOut.textContent = Number(size.value).toLocaleString("en-IN"); });
if (dateIn) dateIn.min = new Date().toISOString().slice(0, 10);

const clean = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "").replace(/[\u0000-\u001F\u007F<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function setErr(id: string, msg?: string): void {
  const input = document.getElementById(id) as HTMLInputElement;
  const field = input.closest(".field")!;
  let err = field.querySelector<HTMLElement>(".err");
  field.classList.toggle("is-err", !!msg);
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) {
    if (!err) { err = document.createElement("span"); err.className = "err"; err.id = `${id}-err`; field.appendChild(err); input.setAttribute("aria-describedby", err.id); }
    err.textContent = msg;
  } else if (err) { err.remove(); input.removeAttribute("aria-describedby"); }
}

function validate(d: Brief): boolean {
  let ok = true;
  if (d.name.length < 2) { setErr("f-name", "Enter your name."); ok = false; } else setErr("f-name");
  if (!/^\+?[0-9\s-]{10,15}$/.test(d.phone)) { setErr("f-phone", "Enter a 10-digit mobile number, with +91 if you like."); ok = false; } else setErr("f-phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { setErr("f-email", "Enter an email address like name@company.com."); ok = false; } else setErr("f-email");
  return ok;
}

const briefText = (d: Brief) =>
  `Enquiry for Crew Commune\nType: ${d.type}\nName: ${d.name}${d.org ? ` (${d.org})` : ""}\nPhone: ${d.phone}\nEmail: ${d.email}\nPreferred date: ${d.date || "Flexible"}\nPeople: ${d.size}${d.message ? `\nNotes: ${d.message}` : ""}`;

function showDone(f: HTMLFormElement, d: Brief, sent: boolean): void {
  const box = document.createElement("div"); box.className = "done";
  const h = document.createElement("h3"); h.className = "d d-m"; h.textContent = sent ? "Enquiry sent." : "Your brief is ready.";
  const p = document.createElement("p");
  p.textContent = sent ? `Thanks, ${d.name}. The Crew Commune team will call you on ${d.phone}.` : "Copy this brief and send it to Crew Commune on Instagram. The team replies to DMs there.";
  const pre = document.createElement("pre"); pre.textContent = briefText(d);
  const acts = document.createElement("div"); acts.className = "acts";
  const copy = document.createElement("button"); copy.type = "button"; copy.className = "btn btn--sm btn--light"; copy.textContent = "Copy brief";
  copy.addEventListener("click", () => {
    const sel = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); copy.textContent = "Selected — press Ctrl+C"; };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(briefText(d)).then(() => (copy.textContent = "Copied"), sel); else sel();
  });
  acts.appendChild(copy);
  if (!sent) {
    const ig = document.createElement("a"); ig.className = "btn btn--sm btn--red"; ig.textContent = "Open Instagram DM ↗";
    ig.href = `https://ig.me/m/${encodeURIComponent(f.dataset.ig ?? "crewcommune")}`; ig.target = "_blank"; ig.rel = "noopener noreferrer";
    acts.appendChild(ig);
  }
  const again = document.createElement("button"); again.type = "button"; again.className = "copy"; again.textContent = "Edit details";
  again.addEventListener("click", () => { box.remove(); Array.from(f.children).forEach((c) => ((c as HTMLElement).hidden = false)); });
  acts.appendChild(again);
  box.append(h, p, pre, acts);
  Array.from(f.children).forEach((c) => ((c as HTMLElement).hidden = true));
  f.appendChild(box);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  if (fd.get("website")) return; // honeypot
  const d: Brief = {
    type: clean(fd.get("type"), 40), name: clean(fd.get("name"), 80), org: clean(fd.get("org"), 100),
    phone: clean(fd.get("phone"), 16), email: clean(fd.get("email"), 120), date: clean(fd.get("date"), 10),
    size: clean(fd.get("size"), 6), message: clean(fd.get("message"), 1000),
  };
  if (!validate(d)) { if (status) status.textContent = "Check the highlighted fields."; form.querySelector<HTMLInputElement>(".is-err input")?.focus(); return; }
  const endpoint = form.dataset.endpoint ?? "";
  if (/^https:\/\/formspree\.io\//.test(endpoint)) {
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;
    if (status) status.textContent = "Sending…";
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(String(r.status));
      if (status) status.textContent = "";
      showDone(form, d, true);
    } catch {
      if (status) status.textContent = "The enquiry didn't go through. Copy the brief below and send it on Instagram instead.";
      showDone(form, d, false);
    } finally { if (btn) btn.disabled = false; }
  } else {
    if (status) status.textContent = "";
    showDone(form, d, false);
  }
});

export {};
