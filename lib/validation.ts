import { normaliseRegistration } from "./format";

export const validators = {
  name(v: string) {
    const t = v.trim();
    if (!t) return "Please tell us your name.";
    if (t.length < 2) return "That looks a little short.";
    return null;
  },
  mobile(v: string) {
    const d = v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    if (!d) return "We need a mobile number to confirm.";
    if (!/^[6-9]\d{9}$/.test(d)) return "Enter a 10-digit Indian mobile number.";
    return null;
  },
  required(label: string) {
    return (v: string) => (v && v.trim() ? null : `Please choose ${label}.`);
  },
  registration(v: string) {
    const r = normaliseRegistration(v);
    if (!r) return "Enter your registration number.";
    // Standard (TN37AB1234) and Bharat series (22BH1234AA) formats.
    if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/.test(r) && !/^\d{2}BH\d{4}[A-Z]{1,2}$/.test(r))
      return "That doesn't look like a registration number — try e.g. TN 37 AB 1234.";
    return null;
  },
};

export const cleanMobile = (v: string) => v.replace(/\D/g, "").slice(-10);
