"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Calendar, Clock, Printer, MapPin } from "lucide-react"

interface Medication {
  drug_name: string
  amount: string
  frequency: string
}

interface PrescriptionCardProps {
  medications: Medication[]
  doctorName: string
  patientName: string
  timestamp: string
  language: "en" | "fr"
}

const translations = {
  en: {
    prescription: "Prescription",
    doctor: "Doctor",
    patient: "Patient",
    prescribedOn: "Prescribed on",
    print: "Print",
    nearbyPharmacies: "Nearby Pharmacies",
    amount: "Amount",
    frequency: "Frequency"
  },
  fr: {
    prescription: "Ordonnance",
    doctor: "Docteur",
    patient: "Patient",
    prescribedOn: "Prescrit le",
    print: "Imprimer",
    nearbyPharmacies: "Pharmacies à proximité",
    amount: "Quantité",
    frequency: "Fréquence"
  }
}

const pharmacies = [
  {
    name: "One Stop Shop Pharmacy",
    address: "UC Network House, University road., Nsukka 300001, Nigeria",
    phone: null
  },
  {
    name: "Pharmacy Building",
    address: "VC75+HXF, UNN, Owerre Eze Rd",
    phone: "0803 740 8410"
  },
  {
    name: "SSANU FITTAMAS PHARMACY AND COSMETICS",
    address: "VC92+C63",
    phone: "0913 054 8271"
  }
]

export default function PrescriptionCard({ medications, doctorName, patientName, timestamp, language }: PrescriptionCardProps) {
  const t = translations[language]

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t.prescription}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .prescription-info {
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .medications {
            margin-bottom: 30px;
          }
          .medication {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            background: white;
          }
          .medication-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
            color: #10b981;
          }
          .medication-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 14px;
          }
          .pharmacies {
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .pharmacy {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .pharmacy-name {
            font-weight: bold;
            color: #10b981;
          }
          .pharmacy-address {
            font-size: 14px;
            color: #666;
          }
          .pharmacy-phone {
            font-size: 14px;
            color: #333;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t.prescription}</h1>
          <div style="font-size: 14px; color: #666;">
            <div><strong>${t.doctor}:</strong> Dr. ${doctorName}</div>
            <div><strong>${t.patient}:</strong> ${patientName}</div>
            <div><strong>${t.prescribedOn}:</strong> ${new Date(timestamp).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="medications">
          <h2>Medications</h2>
          ${medications.map(med => `
            <div class="medication">
              <div class="medication-name">${med.drug_name}</div>
              <div class="medication-details">
                <div><strong>${t.amount}:</strong> ${med.amount}</div>
                <div><strong>${t.frequency}:</strong> ${med.frequency}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="pharmacies">
          <h2>${t.nearbyPharmacies}</h2>
          ${pharmacies.map(pharmacy => `
            <div class="pharmacy">
              <div class="pharmacy-name">${pharmacy.name}</div>
              <div class="pharmacy-address">${pharmacy.address}</div>
              ${pharmacy.phone ? `<div class="pharmacy-phone">Tel: ${pharmacy.phone}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `

    printWindow?.document.write(printContent)
    printWindow?.document.close()
  }

  return (
    <Card className="max-w-md bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-green-800">
            <Pill className="w-5 h-5 mr-2" />
            {t.prescription}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Rx
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Printer className="w-4 h-4 mr-1" />
              {t.print}
            </Button>
          </div>
        </div>
        <div className="text-sm text-green-700">
          <div>
            <strong>{t.doctor}:</strong> Dr. {doctorName}
          </div>
          <div>
            <strong>{t.patient}:</strong> {patientName}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {medications.map((medication, index) => (
          <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
            <div className="font-medium text-gray-900 mb-2">{medication.drug_name}</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-green-600" />
                <span>{medication.amount}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-green-600" />
                <span>{medication.frequency}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg p-3 border border-green-100 mt-4">
          <div className="flex items-center text-sm font-medium text-green-800 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            {t.nearbyPharmacies}
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            {pharmacies.map((pharmacy, index) => (
              <div key={index} className="border-b border-green-50 pb-2 last:border-b-0">
                <div className="font-medium text-green-700">{pharmacy.name}</div>
                <div className="text-gray-600">{pharmacy.address}</div>
                {pharmacy.phone && (
                  <div className="text-gray-500">Tel: {pharmacy.phone}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-green-100">
          <div className="flex items-center justify-between">
            <span>{t.prescribedOn} {new Date(timestamp).toLocaleDateString()}</span>
            <span>{new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
