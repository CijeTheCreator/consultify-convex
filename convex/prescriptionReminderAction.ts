import { action } from "@/convex/_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ReminderResult {
  prescriptionId: string;
  success: boolean;
  emailId?: string;
  error?: string;
}

export const sendPrescriptionReminders = action({
  args: {},
  handler: async (ctx) => {
    const prescriptions = await ctx.runQuery(api.prescriptions.getAllPrescriptionsForReminders);

    const results: ReminderResult[] = [];

    for (const prescription of prescriptions) {
      try {
        const patient = await ctx.runQuery(api.users.getUserById, {
          userId: prescription.patientId
        });

        if (!patient) {
          console.error(`Patient not found for prescription ${prescription._id}`);
          continue;
        }

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Consultify <consultify@cee-jay.tech>",
            to: patient.email,
            subject: "Prescription Reminder",
            html: generateReminderHTML(prescription, patient.name),
          }),
        });

        if (response.ok) {
          const emailResult = await response.json();

          await ctx.runMutation(api.prescriptions.markReminderSent, {
            prescriptionId: prescription._id,
          });

          results.push({
            prescriptionId: prescription._id,
            success: true,
            emailId: emailResult.id,
          });
        } else {
          const error = await response.text();
          console.error(`Failed to send email for prescription ${prescription._id}:`, error);
          results.push({
            prescriptionId: prescription._id,
            success: false,
            error: error,
          });
        }
      } catch (error) {
        console.error(`Error processing prescription ${prescription._id}:`, error);
        results.push({
          prescriptionId: prescription._id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      totalProcessed: prescriptions.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});

function generateReminderHTML(prescription: Doc<"prescriptions">, patientName: string): string {
  const startDate = new Date(prescription.startTimestamp).toLocaleDateString();
  const endDate = new Date(prescription.endTimestamp).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prescription Reminder</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #555;
        }
        .prescription-card {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0;
        }
        .drug-name {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 15px;
        }
        .prescription-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #dee2e6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
          flex: 1;
        }
        .detail-value {
          color: #6c757d;
          flex: 2;
          text-align: right;
        }
        .frequency-highlight {
          background: #e3f2fd;
          color: #1976d2;
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 600;
          text-align: center;
          margin: 15px 0;
        }
        .reminder-text {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #dee2e6;
        }
        .footer p {
          margin: 5px 0;
          color: #6c757d;
          font-size: 14px;
        }
        .consultify-logo {
          color: #667eea;
          font-weight: bold;
          font-size: 18px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
          .drug-name {
            font-size: 20px;
          }
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          .detail-label {
            font-size: 14px;
          }
          .detail-value {
            text-align: left;
            font-size: 14px;
            font-weight: 600;
            color: #495057;
          }
          .frequency-highlight {
            font-size: 14px;
            padding: 6px 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 Prescription Reminder</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello <strong>${patientName}</strong>,
          </div>
          
          <p>This is a friendly reminder about your current prescription. Please ensure you're taking your medication as prescribed.</p>
          
          <div class="prescription-card">
            <div class="drug-name">${prescription.drugName}</div>
            
            <div class="frequency-highlight">
              Take ${prescription.frequency}
            </div>
            
            <div class="prescription-details">
              <div class="detail-row">
                <span class="detail-label">Start Date</span>
                <span class="detail-value">${startDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">End Date</span>
                <span class="detail-value">${endDate}</span>
              </div>
            </div>
          </div>
          
          <div class="reminder-text">
            <strong>⚠️ Important:</strong> Please follow your prescribed dosage and timing. If you have any questions or experience side effects, contact your healthcare provider immediately.
          </div>
          
          <p>If you need to discuss your prescription or have any concerns, please don't hesitate to schedule a follow-up consultation through our platform.</p>
        </div>
        
        <div class="footer">
          <p class="consultify-logo">Consultify</p>
          <p>Your trusted healthcare companion</p>
          <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
