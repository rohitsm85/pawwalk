import { setGlobalOptions } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/firestore";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as nodemailer from "nodemailer";

// Match the Firestore database's region (see firebase.json) so the
// Firestore trigger and function run co-located.
setGlobalOptions({ maxInstances: 10, region: "australia-southeast1" });

initializeApp();

// Gmail account used both to send notifications and as the admin
// recipient for "new booking" alerts. Set via:
//   firebase functions:secrets:set GMAIL_USER
//   firebase functions:secrets:set GMAIL_APP_PASSWORD
// GMAIL_APP_PASSWORD is a 16-character Gmail App Password (requires 2FA
// enabled on the account), not the account's login password.
const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");

const ADMIN_PANEL_URL = "https://pawwalk-ten.vercel.app/admin";

function formatDisplayTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function buildIcs(walk: {
  dogName: string;
  ownerName: string;
  date: string;
  time: string;
}): string {
  const start = new Date(`${walk.date}T${walk.time}:00`);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const stampFormat = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${walk.date}-${walk.time}-${walk.dogName}@pawwalk-2da30`.replace(
    /\s+/g,
    "-"
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PawWalk//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampFormat(new Date())}`,
    `DTSTART:${stampFormat(start)}`,
    `DTEND:${stampFormat(end)}`,
    `SUMMARY:Dog Walk - ${walk.dogName} (${walk.ownerName})`,
    `DESCRIPTION:Confirmed dog walk booking for ${walk.dogName}\\, owner ${walk.ownerName}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser.value(),
      pass: gmailAppPassword.value(),
    },
  });
}

interface Walk {
  ownerName: string;
  dogName: string;
  email: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
}

// Keeps the public bookedSlots collection (no PII) in sync with walks,
// and sends notification emails: to the admin on a new booking request,
// and to the client when the admin approves/rejects it.
export const onWalkWritten = onDocumentWritten(
  { document: "walks/{walkId}", secrets: [gmailUser, gmailAppPassword] },
  async (event) => {
    const before = event.data?.before.exists
      ? (event.data.before.data() as Walk)
      : null;
    const after = event.data?.after.exists
      ? (event.data.after.data() as Walk)
      : null;

    const db = getFirestore();
    const slotSource = after ?? before;
    if (slotSource) {
      const slotRef = db
        .collection("bookedSlots")
        .doc(`${slotSource.date}_${slotSource.time}`);

      if (!after || after.status === "rejected") {
        await slotRef.delete().catch((err) => {
          logger.warn("Failed to clear bookedSlots doc", err);
        });
      } else {
        await slotRef.set({
          date: after.date,
          time: after.time,
          status: after.status,
        });
      }
    }

    const transport = getTransport();
    const from = gmailUser.value();

    // New booking created -> notify the admin.
    if (!before && after && after.status === "pending") {
      try {
        await transport.sendMail({
          from,
          to: from,
          subject: `New walk request: ${after.dogName} on ${after.date}`,
          text:
            `${after.ownerName} requested a walk for ${after.dogName} ` +
            `on ${after.date} at ${formatDisplayTime(after.time)}.\n` +
            `Notes: ${after.notes || "(none)"}\n\n` +
            `Approve or reject: ${ADMIN_PANEL_URL}`,
        });
      } catch (err) {
        logger.error("Failed to send admin notification email", err);
      }
      return;
    }

    // Status changed to approved/rejected -> notify the client.
    if (
      before &&
      after &&
      before.status !== after.status &&
      (after.status === "approved" || after.status === "rejected")
    ) {
      if (!after.email) {
        logger.warn("Walk has no client email, skipping client notification");
        return;
      }

      const isApproved = after.status === "approved";
      try {
        await transport.sendMail({
          from,
          to: after.email,
          subject: isApproved
            ? `Your walk for ${after.dogName} is confirmed!`
            : `Your walk request for ${after.dogName} was declined`,
          text: isApproved
            ? `Good news! ${after.dogName}'s walk on ${after.date} at ` +
              `${formatDisplayTime(after.time)} is confirmed. See you then!`
            : `Sorry, we're unable to confirm ${after.dogName}'s walk on ` +
              `${after.date} at ${formatDisplayTime(after.time)}. ` +
              "Please try booking another slot.",
          ...(isApproved
            ? {
              icalEvent: {
                filename: "walk.ics",
                method: "REQUEST",
                content: buildIcs(after),
              },
            }
            : {}),
        });
      } catch (err) {
        logger.error("Failed to send client notification email", err);
      }
    }
  }
);
