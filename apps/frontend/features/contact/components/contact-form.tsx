"use client";

import React from "react";
import { Button, Input, Textarea } from "@/shared/components";
import { VALIDATION } from "@/shared/utils/constants";
import { trackError } from "@/shared/utils/error-tracking";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const [state, setState] = React.useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!state.name.trim()) errs.name = "Nom requis";
    if (!state.email.trim()) errs.email = "Email requis";
    else if (!VALIDATION.EMAIL_REGEX.test(state.email)) errs.email = "Email invalide";
    if (!state.subject.trim()) errs.subject = "Sujet requis";
    if (!state.message.trim() || state.message.trim().length < 10) errs.message = "Message trop court";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || `${apiUrl}/support/contact`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setStatus("success");
    } catch (err) {
      await trackError(err, { page: "contact", payload: state });
      setStatus("error");
      setErrorMessage("Échec de l’envoi. Vous pouvez nous écrire à support@domofix.com.");
    }
  };

  return (
    <section id="contact-form" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-3">Envoyer un message</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Remplissez le formulaire et nous vous répondrons au plus vite.</p>
        </div>

        <div className="max-w-2xl mx-auto rounded-2xl bg-white p-6 md:p-8 shadow-sm ring-1 ring-gray-200">
          {status === "success" ? (
            <div className="text-center">
              <p className="text-base text-gray-800 mb-2">Merci ! Votre message a été envoyé.</p>
              <p className="text-sm text-gray-600">Nous vous répondrons sous 24 heures.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Nom"
                  name="name"
                  placeholder="Votre nom"
                  value={state.name}
                  onChange={onChange}
                  required
                  error={errors.name}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={state.email}
                  onChange={onChange}
                  required
                  error={errors.email}
                />
              </div>
              <Input
                label="Sujet"
                name="subject"
                placeholder="Comment pouvons-nous aider ?"
                value={state.subject}
                onChange={onChange}
                required
                error={errors.subject}
              />
              <Textarea
                label="Message"
                name="message"
                placeholder="Décrivez votre demande avec le plus de détails possible."
                value={state.message}
                onChange={onChange}
                required
                error={errors.message}
                rows={6}
              />

              {status === "error" && (
                <div className="text-sm text-red-600">{errorMessage}</div>
              )}

              <div className="flex justify-start sm:justify-end">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  isLoading={status === "loading"}
                  className="w-full sm:w-auto"
                >
                  Envoyer
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}