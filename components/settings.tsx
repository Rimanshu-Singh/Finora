"use client";
import { useState } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useLedger } from "./provider";
import { PageHeader, Modal } from "./ui";
import { paymentMethods } from "./expense-form";
import type { Settings } from "@/lib/types";
export function SettingsPage() {
  const { data, setData, notify } = useLedger();
  const [preview, setPreview] = useState("");
  const s = data.settings;
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  return (
    <>
      <PageHeader title="Settings" subtitle="Make Finora feel like you." />
      <div className="settings-content">
        <section className="settings-section">
          <h2>General</h2>
          <label className="setting-row">
            <span>
              Name<small>A personal touch to your everyday.</small>
            </span>
            <input
              value={s.name}
              maxLength={50}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="setting-row">
            <span>
              Currency<small>Expenses in this demo are recorded in INR.</small>
            </span>
            <select
              value={s.currency}
              onChange={(e) => update("currency", e.target.value)}
            >
              <option value="INR">INR · Indian rupee ₹</option>
            </select>
          </label>
          <label className="setting-row">
            <span>Locale</span>
            <select
              value={s.locale}
              onChange={(e) => update("locale", e.target.value)}
            >
              <option value="en-IN">English (India)</option>
              <option value="en-GB">English (United Kingdom)</option>
              <option value="en-US">English (United States)</option>
            </select>
          </label>
          <label className="setting-row">
            <span>Week starts on</span>
            <select
              value={s.weekStarts}
              onChange={(e) => update("weekStarts", e.target.value)}
            >
              <option>Monday</option>
              <option>Sunday</option>
            </select>
          </label>
        </section>
        <section className="settings-section">
          <h2>Preferences</h2>
          <label className="setting-row">
            <span>Default dashboard period</span>
            <select
              value={s.period}
              onChange={(e) =>
                update("period", e.target.value as Settings["period"])
              }
            >
              {["Today", "Week", "Month", "Year"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="setting-row">
            <span>
              Start screen<small>Preference for a future saved session.</small>
            </span>
            <select
              value={s.startScreen}
              onChange={(e) => update("startScreen", e.target.value)}
            >
              <option value="/">Home</option>
              <option value="/transactions">Transactions</option>
              <option value="/analytics">Insights</option>
            </select>
          </label>
          <div className="setting-row">
            <span>
              Appearance<small>A calmer view, day or night.</small>
            </span>
            <div className="periods">
              {(["System", "Light", "Dark"] as const).map((t) => (
                <button
                  key={t}
                  aria-pressed={s.theme === t}
                  onClick={() => update("theme", t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="settings-section">
          <h2>Expense settings</h2>
          <label className="setting-row">
            <span>Default payment method</span>
            <select
              value={s.paymentMethod}
              onChange={(e) =>
                update(
                  "paymentMethod",
                  e.target.value as Settings["paymentMethod"],
                )
              }
            >
              {paymentMethods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="setting-row">
            <span>
              Quick-add suggestions
              <small>Turn a few words into an expense.</small>
            </span>
            <button
              role="switch"
              aria-checked={s.suggestions}
              aria-label="Quick-add suggestions"
              className="toggle"
              onClick={() => update("suggestions", !s.suggestions)}
            >
              <span />
            </button>
          </div>
          <div className="setting-row">
            <span>
              Ask for a note
              <small>Show a note field when adding an expense.</small>
            </span>
            <button
              role="switch"
              aria-checked={s.askNote}
              aria-label="Ask for a note"
              className="toggle"
              onClick={() => update("askNote", !s.askNote)}
            >
              <span />
            </button>
          </div>
        </section>
        <section className="settings-section">
          <h2>Your data</h2>
          {[
            { name: "Export expenses", icon: Download },
            { name: "Import expenses", icon: Upload },
            { name: "Download CSV", icon: FileSpreadsheet },
          ].map((a) => (
            <div className="setting-row" key={a.name}>
              <span>
                {a.name}
                <small>Available when your data is connected.</small>
              </span>
              <button className="button" onClick={() => setPreview(a.name)}>
                <a.icon size={15} />
                Preview
              </button>
            </div>
          ))}
        </section>
        <section className="settings-section">
          <h2>Danger zone</h2>
          <div className="setting-row">
            <span>
              Delete all expense data
              <small>Permanently clear your Finora.</small>
            </span>
            <button
              className="button danger-outline"
              onClick={() => setPreview("Delete all expense data")}
            >
              Delete data
            </button>
          </div>
        </section>
        <p className="footnote">
          Demo workspace · Changes last until you refresh.
        </p>
      </div>
      {preview && (
        <Modal title={preview} onClose={() => setPreview("")}>
          <p className="muted">
            {preview === "Delete all expense data"
              ? "This is a preview of the data controls. No expense data will be deleted."
              : "This control is a frontend preview. File import and export will be available after the data layer is connected."}
          </p>
          <div className="form-actions">
            <button
              className="button primary"
              onClick={() => {
                setPreview("");
                notify("Preview closed");
              }}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
