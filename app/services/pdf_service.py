import os
from datetime import datetime
from typing import Dict, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.core.config import settings


CLINIC_INFO = {
    "name": "AI Medical Scribe Clinic",
    "address": "123 Healthcare Avenue, Medical District",
    "phone": "(555) 123-4567",
    "email": "contact@aimedicalscribe.com",
    "license": "MED-12345"
}


def generate_prescription_pdf(
    visit_id: int,
    patient_info: Dict[str, Any],
    prescription_data: Dict[str, Any],
    doctor_info: Optional[Dict[str, Any]] = None
) -> str:
    os.makedirs(settings.STORAGE_PRESCRIPTIONS_PATH, exist_ok=True)
    
    filename = f"prescription_{visit_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_path = os.path.join(settings.STORAGE_PRESCRIPTIONS_PATH, filename)
    
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=6,
        alignment=1
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Normal'],
        fontSize=10,
        alignment=1,
        textColor=colors.grey
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=12,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.darkblue
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4
    )
    
    elements = []
    
    elements.append(Paragraph(CLINIC_INFO["name"], title_style))
    elements.append(Paragraph(CLINIC_INFO["address"], header_style))
    elements.append(Paragraph(f"Phone: {CLINIC_INFO['phone']} | Email: {CLINIC_INFO['email']}", header_style))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.darkblue))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("MEDICAL PRESCRIPTION", ParagraphStyle(
        'PrescriptionTitle',
        parent=styles['Heading1'],
        fontSize=14,
        alignment=1,
        textColor=colors.darkblue
    )))
    elements.append(Spacer(1, 0.15*inch))
    
    elements.append(Paragraph("Patient Information", section_style))
    patient_data = [
        ["Name:", patient_info.get("name", "N/A"), "Date:", datetime.now().strftime("%Y-%m-%d")],
        ["Age:", str(patient_info.get("age", "N/A")), "Gender:", patient_info.get("gender", "N/A")],
        ["Phone:", patient_info.get("phone", "N/A"), "Visit ID:", str(visit_id)]
    ]
    
    patient_table = Table(patient_data, colWidths=[1*inch, 2*inch, 1*inch, 2*inch])
    patient_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.15*inch))
    
    elements.append(Paragraph("Medications", section_style))
    
    medications = prescription_data.get("medications", [])
    if medications:
        med_data = [["#", "Medication", "Dosage", "Frequency", "Duration"]]
        for i, med in enumerate(medications, 1):
            med_data.append([
                str(i),
                med.get("name", ""),
                med.get("dosage", ""),
                med.get("frequency", ""),
                med.get("duration", "")
            ])
        
        med_table = Table(med_data, colWidths=[0.4*inch, 2*inch, 1.2*inch, 1.4*inch, 1.2*inch])
        med_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(med_table)
    else:
        elements.append(Paragraph("No medications prescribed.", normal_style))
    
    elements.append(Spacer(1, 0.15*inch))
    
    advice = prescription_data.get("advice", [])
    if advice:
        elements.append(Paragraph("Medical Advice", section_style))
        for item in advice:
            elements.append(Paragraph(f"• {item}", normal_style))
    
    follow_up = prescription_data.get("follow_up")
    if follow_up:
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("Follow-up", section_style))
        elements.append(Paragraph(follow_up, normal_style))
    
    elements.append(Spacer(1, 0.5*inch))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    elements.append(Spacer(1, 0.2*inch))
    
    if doctor_info:
        doctor_name = doctor_info.get("full_name", doctor_info.get("username", "Physician"))
    else:
        doctor_name = "Attending Physician"
    
    signature_data = [
        ["", ""],
        ["_" * 30, "_" * 30],
        [f"Dr. {doctor_name}", "Date: " + datetime.now().strftime("%Y-%m-%d")],
        ["Signature", ""]
    ]
    
    sig_table = Table(signature_data, colWidths=[3*inch, 3*inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(sig_table)
    
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(
        "This prescription is generated by AI Medical Scribe and must be reviewed by the prescribing physician.",
        ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)
    ))
    
    doc.build(elements)
    
    return file_path
