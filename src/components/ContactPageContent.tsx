import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, ArrowRight, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";



const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  /** when true, renders a header with eyebrow + title + subtitle (used on dedicated page) */
  showHeader?: boolean;
  /** override title */
  title?: string;
  /** override subtitle */
  subtitle?: string;
  /** "h2" quando incorporato nella home (l'H1 della home sta nell'hero) */
  headingLevel?: "h1" | "h2";
}

const ContactPageContent = ({
  showHeader = true,
  title = "Parliamo del tuo progetto",
  subtitle = "Scrivici, chiamaci o compila il form: ti rispondiamo entro 24 ore con il prossimo step giusto per te.",
  headingLevel = "h1",
}: Props) => {
  const Heading = headingLevel;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({ nome: "", email: "", oggetto: "", messaggio: "" });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email || !data.messaggio) {
      toast({ title: "Campi obbligatori", description: "Email e messaggio sono richiesti.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionId = crypto.randomUUID();
      const messageWithSubject = data.oggetto
        ? `Oggetto: ${data.oggetto}\n\n${data.messaggio}`
        : data.messaggio;

      // 1) Notifica interna a info@setupevents.it
      const notify = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-notification",
          recipientEmail: "info@setupevents.it",
          idempotencyKey: `contact-notify-${submissionId}`,
          templateData: { email: data.email, message: messageWithSubject },
        },
      });
      if (notify.error) throw notify.error;

      // 2) Conferma al cliente
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-confirmation",
          recipientEmail: data.email,
          idempotencyKey: `contact-confirm-${submissionId}`,
        },
      });

      toast({ title: "Messaggio inviato", description: "Ti rispondiamo entro 24 ore lavorative." });
      setData({ nome: "", email: "", oggetto: "", messaggio: "" });
    } catch {
      toast({ title: "Errore", description: "Riprova più tardi o scrivici via email.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      {showHeader && (
        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-32 md:pt-40 pb-6 md:pb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-primary/80 font-semibold mb-5">
            Contatti
          </p>
          <Heading className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[1.05]">
            {title}
          </Heading>
          <p className="mt-5 text-sm sm:text-base text-white/75 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      )}

      {/* Two columns */}
      <div className="relative z-10 container-custom px-6 pb-4 md:pb-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-8 max-w-5xl mx-auto">

          {/* MIDDLE — info card */}
          <motion.div
            className="rounded-2xl p-7 md:p-9"
            style={{
              background: "rgba(20,20,20,0.55)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            <h2 className="text-primary text-xl md:text-2xl font-display font-bold mb-7">
              Resta in contatto
            </h2>

            <div className="space-y-6">
              <ContactRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value="info@setupevents.it"
                href="mailto:info@setupevents.it"
              />
              <ContactRow
                icon={<Phone className="w-4 h-4" />}
                label="Telefono"
                value="+39 328 416 3053"
                href="tel:+393284163053"
              />
              <ContactRow
                icon={<MapPin className="w-4 h-4" />}
                label="Sede"
                value={<>Firenze, Italia<br /><span className="text-white/60">Operiamo in tutta Italia & EU</span></>}
                href="https://www.google.com/maps/search/?api=1&query=Firenze%2C+Italia"
                external
              />
            </div>

            <div className="mt-9 pt-7 border-t border-white/[0.06]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55 mb-4">Seguici</p>
              <div className="flex gap-3">
                <SocialBtn href="https://www.instagram.com/setup_eventss/" label="Instagram"><Instagram className="w-4 h-4" /></SocialBtn>
                <SocialBtn href="https://linkedin.com" label="LinkedIn"><Linkedin className="w-4 h-4" /></SocialBtn>
              </div>
            </div>

            <div className="mt-7 pt-7 border-t border-white/[0.06]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55 mb-3">Orari</p>
              <p className="text-white/85 text-sm">Lun – Ven · 9:30 – 18:30</p>
              <p className="text-white/60 text-xs mt-1">Risposta entro 24 ore lavorative</p>
            </div>

            {/* Prenota call CTA */}
            <Link
              to="/prenota-call"
              className="mt-8 group flex items-center justify-between w-full px-5 py-4 rounded-xl border border-primary/30 bg-primary/[0.08] hover:bg-primary/[0.15] hover:border-primary/50 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-white text-sm font-semibold">Preferisci una call?</span>
              </span>
              <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* RIGHT — form */}
          <motion.div
            className="rounded-2xl p-7 md:p-10"
            style={{
              background: "rgba(20,20,20,0.55)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            <h2 className="text-primary text-xl md:text-2xl font-display font-bold mb-2">
              Scrivici
            </h2>
            <p className="text-white/75 text-sm mb-7">
              Compila il form e ti ricontattiamo con il prossimo passo.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="nome" placeholder="Nome" value={data.nome} onChange={handle} />
                <Field name="email" type="email" required placeholder="Email *" value={data.email} onChange={handle} />
              </div>

              <Field name="oggetto" placeholder="Oggetto (opzionale)" value={data.oggetto} onChange={handle} />

              <textarea
                name="messaggio"
                value={data.messaggio}
                onChange={handle}
                required
                rows={6}
                placeholder="Raccontaci il tuo progetto *"
                maxLength={2000}
                className="w-full rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/55 outline-none resize-none transition-all duration-300 focus:border-primary/40"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative overflow-hidden rounded-xl py-4 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 border border-primary/40"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.06))",
                  boxShadow: "0 8px 32px hsl(var(--primary) / 0.15)",
                }}
              >
                <span className="relative z-10 inline-flex items-center gap-2 justify-center uppercase tracking-[0.2em] text-xs">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Invio in corso</>
                  ) : (
                    <>Invia messaggio <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></>
                  )}
                </span>
              </button>

              <p className="text-xs text-white/55 text-center">
                Inviando il form accetti la nostra{" "}
                <Link to="/privacy-policy" className="text-white/80 hover:text-white underline underline-offset-2">
                  Privacy Policy
                </Link>.
              </p>
            </form>
          </motion.div>
        </div>

      </div>
    </>
  );
};

/* helpers */
const ContactRow = ({ icon, label, value, href, external = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; href?: string; external?: boolean }) => {
  const Tag: any = href ? "a" : "div";
  const extraProps = href && external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Tag {...(href ? { href, ...extraProps } : {})} className="flex items-start gap-4 group min-h-[44px]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-primary transition-colors group-hover:bg-primary/15"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.3em] text-white/55 mb-1">{label}</p>
        <p className="text-white text-sm group-hover:text-white transition-colors">{value}</p>
      </div>
    </Tag>
  );
};

const SocialBtn = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    className="w-11 h-11 rounded-lg flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/30 transition-all"
    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
    {children}
  </a>
);

const Field = ({ name, type = "text", required = false, placeholder, value, onChange }:
  { name: string; type?: string; required?: boolean; placeholder: string; value: string; onChange: any }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    maxLength={255}
    className="w-full rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/55 outline-none transition-all duration-300 focus:border-primary/40"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  />
);

export default ContactPageContent;
