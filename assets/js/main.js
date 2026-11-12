/* ==========================================================
   Growlane AI — site scripts
   ========================================================== */

/*
 * FORM / EMAIL SETTINGS
 * ---------------------
 * Email delivery is not connected yet. Once the business email
 * (or a form service such as Formspree / EmailJS / your own API)
 * is ready, put its URL in FORM_ENDPOINT. Every form on the site
 * (contact, demo, careers, newsletter) will then POST its data there
 * as JSON. While it is empty, forms validate and show the success
 * message without sending anything.
 */
const SITE_CONFIG = {
  FORM_ENDPOINT: "", // e.g. "https://formspree.io/f/xxxxxxx" — add later
  CONTACT_EMAIL: "", // e.g. "hello@growlane.ai" — add later
};

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Header shadow + back-to-top ---------- */
  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle("scrolled", y > 10);
    toTop && toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", String(open));
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
    });
  });

  /* ---------- Pricing monthly / yearly ---------- */
  const billingBtns = document.querySelectorAll(".billing-toggle button");
  billingBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      billingBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const period = btn.dataset.period;
      document.querySelectorAll("[data-monthly]").forEach((el) => {
        el.textContent = el.dataset[period];
      });
      document.querySelectorAll(".period-label").forEach((el) => {
        el.textContent = period === "yearly" ? "/mo, billed yearly" : "/month";
      });
    })
  );

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach((wrap) => {
    const btns = wrap.querySelectorAll(".tab-btn");
    const panels = wrap.querySelectorAll(".tab-panel");
    const activate = (id) => {
      btns.forEach((b) => b.classList.toggle("active", b.dataset.tab === id));
      panels.forEach((p) => p.classList.toggle("active", p.id === id));
    };
    btns.forEach((b) => b.addEventListener("click", () => {
      activate(b.dataset.tab);
      history.replaceState(null, "", "#" + b.dataset.tab);
    }));
    const hash = location.hash.slice(1);
    if (hash && wrap.querySelector("#" + CSS.escape(hash))) activate(hash);
  });

  /* ---------- Pre-select plan / service from URL ---------- */
  const params = new URLSearchParams(location.search);
  ["plan", "service", "role"].forEach((key) => {
    const val = params.get(key);
    const field = document.querySelector(`[name="${key}"]`);
    if (val && field) {
      const opt = [...field.options].find((o) => o.value === val);
      if (opt) field.value = val;
    }
  });

  /* ---------- Forms ---------- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^[+\d][\d\s()-]{6,}$/;

  const validateField = (input) => {
    const field = input.closest(".field");
    if (!field) return true;
    let ok = true;
    const v = input.type === "checkbox" ? input.checked : input.value.trim();
    if (input.required && !v) ok = false;
    else if (input.type === "email" && v && !emailRe.test(v)) ok = false;
    else if (input.type === "tel" && v && !phoneRe.test(v)) ok = false;
    field.classList.toggle("invalid", !ok);
    return ok;
  };

  const send = async (data) => {
    if (!SITE_CONFIG.FORM_ENDPOINT) return true; // email not connected yet
    try {
      const res = await fetch(SITE_CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  document.querySelectorAll("form[data-form]").forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((i) => {
      i.addEventListener("blur", () => validateField(i));
      i.addEventListener("input", () => i.closest(".field.invalid") && validateField(i));
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      inputs.forEach((i) => { if (!validateField(i)) ok = false; });
      if (!ok) {
        const first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        first && first.focus();
        return;
      }
      const btn = form.querySelector("[type=submit]");
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "Sending…";
      const data = Object.fromEntries(new FormData(form).entries());
      data._form = form.dataset.form;
      data._page = location.pathname;
      const sent = await send(data);
      btn.disabled = false;
      btn.innerHTML = label;
      if (!sent) {
        showToast("Something went wrong. Please try again in a moment.");
        return;
      }
      form.reset();
      const success = document.getElementById(form.dataset.success);
      if (success) {
        form.style.display = "none";
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        showToast("Thanks! We'll be in touch soon.");
      }
    });
  });

  document.querySelectorAll("[data-reset-form]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const form = document.getElementById(btn.dataset.resetForm);
      const success = btn.closest(".form-success");
      success && success.classList.remove("show");
      if (form) form.style.display = "";
    })
  );

  /* ---------- Newsletter ---------- */
  document.querySelectorAll(".newsletter").forEach((nl) => {
    nl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = nl.querySelector("input");
      const msg = nl.parentElement.querySelector(".newsletter-msg");
      const v = input.value.trim();
      if (!emailRe.test(v)) {
        msg.textContent = "Please enter a valid email address.";
        msg.className = "newsletter-msg err";
        return;
      }
      const sent = await send({ email: v, _form: "newsletter" });
      msg.textContent = sent ? "You're subscribed — thanks for joining!" : "Couldn't subscribe right now. Please try again.";
      msg.className = "newsletter-msg " + (sent ? "ok" : "err");
      if (sent) input.value = "";
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});

/* ---------- Toast ---------- */
function showToast(text) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 3500);
}
