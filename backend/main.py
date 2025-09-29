from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os
from datetime import datetime

app = FastAPI(title="Preferio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",  # Vite default port
        "https://preferio.vercel.app",  # Vercel production domain
        "https://*.vercel.app"  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

# Enhanced Landfill Report Models
class DateRange(BaseModel):
    start_date: str
    end_date: str
    period: str

class SourceInfo(BaseModel):
    type: str  # 'upload' | 'manual'
    file_name: Optional[str] = None
    uploaded_at: Optional[str] = None
    ocr_confidence: Optional[float] = None

class AuditEntry(BaseModel):
    id: str
    action: str  # 'created' | 'updated' | 'locked' | 'unlocked' | 'published'
    user_id: str
    timestamp: str
    changes: Optional[List[dict]] = None
    comment: Optional[str] = None

class ViewState(BaseModel):
    showAddForm: bool = False
    pricingType: str = "gcv"  # 'gcv' | 'fixed'
    editingRow: Optional[int] = None
    editData: dict = {}
    editingHeader: bool = False
    headerTitle: str = ""
    editingQuotaWeight: bool = False
    quotaWeightValue: float = 0.0
    newRow: dict = {}
    lastSaved: Optional[str] = None
    userPreferences: dict = {}

class LandfillRow(BaseModel):
    id: Optional[int] = None
    
    # Data Source Tracking
    source: str = "manual"  # 'ocr' | 'manual' | 'calculated'
    ocr_confidence: Optional[float] = None
    
    # Weight Data
    receive_ton: Optional[float] = None
    ton: float
    total_ton: float
    
    # Pricing Configuration
    pricing_type: str = "gcv"  # 'gcv' | 'fixed'
    gcv: Optional[float] = None
    multi: Optional[float] = None
    price: Optional[float] = None
    
    # Calculated Fields
    baht_per_ton: float
    amount: float
    vat: float
    total: float
    
    # Metadata
    remark: str = ""
    needs_review: bool = False
    verified_by: Optional[str] = None

class LandfillReport(BaseModel):
    # Core Identification
    id: Optional[str] = None
    version: int = 1
    status: str = "draft"  # 'draft' | 'locked' | 'published' | 'archived'
    
    # Query/Filter Fields
    company_id: str
    date_range: DateRange
    
    # Source Information
    source: SourceInfo
    
    # User Tracking
    locked_by: Optional[str] = None
    locked_at: Optional[str] = None
    created_by: str = "system"
    last_modified_by: str = "system"
    
    # Report Content (existing structure)
    report_info: dict
    data_rows: List[LandfillRow]
    totals: dict
    additional_info: dict
    
    # View State
    view_state: Optional[ViewState] = None
    
    # Audit Trail
    audit_trail: List[AuditEntry] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# All Reports Models
class ReportSummary(BaseModel):
    id: str
    name: str
    company: str
    period: str
    created_at: str
    updated_at: str
    total_amount: float

class AllReports(BaseModel):
    reports: List[dict]

# In-memory storage (replace with database in production)
items_db = []
next_id = 1

# Landfill report storage
landfill_data_file = "landfill_data.json"

def load_landfill_data():
    if os.path.exists(landfill_data_file):
        with open(landfill_data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_landfill_data(data):
    with open(landfill_data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# All Reports Functions
def load_all_reports():
    try:
        if os.path.exists('all_reports.json'):
            with open('all_reports.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"reports": []}
    except Exception as e:
        print(f"Error loading all reports: {e}")
        return {"reports": []}

def save_all_reports(data):
    try:
        with open('all_reports.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving all reports: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to Preferio API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/items", response_model=List[Item])
async def get_items():
    return items_db

@app.post("/items", response_model=Item)
async def create_item(item: ItemCreate):
    global next_id
    new_item = Item(
        id=next_id,
        name=item.name,
        description=item.description,
        price=item.price
    )
    items_db.append(new_item)
    next_id += 1
    return new_item

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    return {"error": "Item not found"}

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item_update: ItemCreate):
    for i, item in enumerate(items_db):
        if item.id == item_id:
            updated_item = Item(
                id=item_id,
                name=item_update.name,
                description=item_update.description,
                price=item_update.price
            )
            items_db[i] = updated_item
            return updated_item
    return {"error": "Item not found"}

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    for i, item in enumerate(items_db):
        if item.id == item_id:
            deleted_item = items_db.pop(i)
            return {"message": f"Item {deleted_item.name} deleted successfully"}
    return {"error": "Item not found"}

# Enhanced Landfill Report Endpoints
@app.get("/landfill-reports")
async def get_reports(
    company_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None
):
    """Get list of landfill reports with optional filtering"""
    all_reports = load_all_reports()
    reports = all_reports.get('reports', [])
    
    # Apply filters
    filtered_reports = []
    for report in reports:
        # Company filter
        if company_id and report.get('company_id') != company_id:
            continue
            
        # Date range filter
        if start_date and report.get('date_range', {}).get('start_date') < start_date:
            continue
        if end_date and report.get('date_range', {}).get('end_date') > end_date:
            continue
            
        # Status filter
        if status and report.get('status') != status:
            continue
            
        filtered_reports.append(report)
    
    return {"reports": filtered_reports}

@app.get("/landfill-report")
async def get_landfill_report():
    """Get the current active landfill report (backward compatibility)"""
    data = load_landfill_data()
    if data:
        return data
    return {"message": "No landfill report data found"}

@app.get("/landfill-reports/{report_id}")
async def get_report_by_id(report_id: str):
    """Get a specific landfill report by ID"""
    all_reports = load_all_reports()
    for report in all_reports.get('reports', []):
        if report.get('id') == report_id:
            return report
    return {"error": "Report not found"}

@app.get("/landfill-reports/{report_id}/versions")
async def get_report_versions(report_id: str):
    """Get version history for a report"""
    # For now, return basic version info
    # In production, you'd query a versions table
    return {
        "report_id": report_id,
        "versions": [
            {
                "version": 1,
                "created_at": "2025-01-15T10:30:00Z",
                "created_by": "system",
                "change_summary": "Initial version"
            }
        ]
    }

@app.post("/landfill-report")
async def create_landfill_report(report: LandfillReport):
    save_landfill_data(report.dict())
    return {"message": "Landfill report saved successfully", "data": report}

# Locking and Version Control Endpoints
@app.post("/landfill-reports/{report_id}/lock")
async def lock_report(report_id: str, user_id: str = "default_user"):
    """Lock a report for editing by a specific user"""
    all_reports = load_all_reports()
    
    for report in all_reports.get('reports', []):
        if report.get('id') == report_id:
            # Check if already locked by another user
            if report.get('locked_by') and report.get('locked_by') != user_id:
                return {
                    "error": "Report is already locked by another user",
                    "locked_by": report.get('locked_by'),
                    "locked_at": report.get('locked_at')
                }
            
            # Lock the report
            report['locked_by'] = user_id
            report['locked_at'] = datetime.now().isoformat()
            report['status'] = 'locked'
            
            # Add audit entry
            audit_entry = {
                "id": f"audit_{len(report.get('audit_trail', [])) + 1}",
                "action": "locked",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "comment": f"Report locked by {user_id}"
            }
            report.setdefault('audit_trail', []).append(audit_entry)
            
            save_all_reports(all_reports)
            return {"message": "Report locked successfully", "locked_by": user_id}
    
    return {"error": "Report not found"}

@app.post("/landfill-reports/{report_id}/unlock")
async def unlock_report(report_id: str, user_id: str = "default_user"):
    """Unlock a report"""
    all_reports = load_all_reports()
    
    for report in all_reports.get('reports', []):
        if report.get('id') == report_id:
            if report.get('locked_by') != user_id:
                return {"error": "You don't have permission to unlock this report"}
            
            # Unlock the report
            report['locked_by'] = None
            report['locked_at'] = None
            report['status'] = 'draft'
            
            # Add audit entry
            audit_entry = {
                "id": f"audit_{len(report.get('audit_trail', [])) + 1}",
                "action": "unlocked",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "comment": f"Report unlocked by {user_id}"
            }
            report.setdefault('audit_trail', []).append(audit_entry)
            
            save_all_reports(all_reports)
            return {"message": "Report unlocked successfully"}
    
    return {"error": "Report not found"}

@app.post("/landfill-reports/{report_id}/save")
async def save_report_with_version(report_id: str, report_data: dict, user_id: str = "default_user"):
    """Save a report with version control"""
    all_reports = load_all_reports()
    
    for report in all_reports.get('reports', []):
        if report.get('id') == report_id:
            # Check if user has lock
            if report.get('locked_by') != user_id:
                return {"error": "You don't have permission to edit this report"}
            
            # Increment version
            current_version = report.get('version', 1)
            new_version = current_version + 1
            
            # Update report data
            report.update(report_data)
            report['version'] = new_version
            report['last_modified_by'] = user_id
            report['updated_at'] = datetime.now().isoformat()
            
            # Add audit entry
            audit_entry = {
                "id": f"audit_{len(report.get('audit_trail', [])) + 1}",
                "action": "updated",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "comment": f"Report updated to version {new_version}"
            }
            report.setdefault('audit_trail', []).append(audit_entry)
            
            save_all_reports(all_reports)
            return {
                "message": "Report saved successfully",
                "version": new_version,
                "updated_at": report['updated_at']
            }
    
    return {"error": "Report not found"}

@app.post("/landfill-report/row")
async def add_landfill_row(row: LandfillRow):
    data = load_landfill_data()
    if not data:
        return {"error": "No report found. Create a report first."}
    
    # Auto-generate ID if not provided
    if not row.id:
        max_id = max([r.get('id', 0) for r in data.get('data_rows', [])], default=0)
        row.id = max_id + 1
    
    data['data_rows'].append(row.dict())
    
    # Recalculate totals
    total_amount = sum(r['amount'] for r in data['data_rows'])
    total_vat = sum(r['vat'] for r in data['data_rows'])
    total_total = sum(r['total'] for r in data['data_rows'])
    
    data['totals'] = {
        'amount': total_amount,
        'vat': total_vat,
        'total': total_total
    }
    
    save_landfill_data(data)
    return {"message": "Row added successfully", "row": row}

@app.put("/landfill-report")
async def update_landfill_report(report_data: dict):
    """Update the entire landfill report"""
    # Recalculate totals if data_rows are provided
    if 'data_rows' in report_data:
        total_amount = sum(row.get('amount', 0) for row in report_data['data_rows'])
        total_vat = sum(row.get('vat', 0) for row in report_data['data_rows'])
        total_total = sum(row.get('total', 0) for row in report_data['data_rows'])
        
        report_data['totals'] = {
            'receive_ton': sum(row.get('receive_ton', 0) or 0 for row in report_data['data_rows']),
            'ton': sum(row.get('ton', 0) for row in report_data['data_rows']),
            'total_ton': sum(row.get('total_ton', 0) for row in report_data['data_rows']),
            'amount': total_amount,
            'vat': total_vat,
            'total': total_total
        }
    
    # Save updated data
    save_landfill_data(report_data)
    
    return {"message": "Report updated successfully"}

@app.put("/landfill-report/view-state")
async def update_view_state(view_state: ViewState):
    """Update the view state for the landfill report"""
    try:
        # Load current data
        with open("landfill_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Update view state
        data["view_state"] = view_state.dict()
        
        # Save back to file
        with open("landfill_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return {"message": "View state updated successfully", "view_state": view_state.dict()}
    except Exception as e:
        return {"error": f"Failed to update view state: {str(e)}"}

@app.get("/landfill-report/view-state")
async def get_view_state():
    """Get the current view state for the landfill report"""
    try:
        # Load current data
        with open("landfill_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        view_state = data.get("view_state", {})
        return {"view_state": view_state}
    except Exception as e:
        return {"error": f"Failed to get view state: {str(e)}"}

@app.post("/landfill-reports/{report_id}/attachments")
async def upload_attachments(report_id: str, request: Request):
    """Upload attachments for a specific report"""
    try:
        form = await request.form()
        uploaded_files = []
        
        # Create attachments directory if it doesn't exist
        attachments_dir = f"attachments/{report_id}"
        os.makedirs(attachments_dir, exist_ok=True)
        
        # Process each uploaded file
        for key, file in form.items():
            if key.startswith('attachment_'):
                # Generate unique filename
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{file.filename}"
                file_path = os.path.join(attachments_dir, filename)
                
                # Save file
                with open(file_path, "wb") as buffer:
                    content = await file.read()
                    buffer.write(content)
                
                uploaded_files.append({
                    "id": f"att_{len(uploaded_files) + 1}",
                    "filename": file.filename,
                    "saved_filename": filename,
                    "file_path": file_path,
                    "size": len(content),
                    "uploaded_at": datetime.now().isoformat(),
                    "uploaded_by": form.get('user_id', 'unknown')
                })
        
        # Update the report with attachment info
        all_reports = load_all_reports()
        for report in all_reports.get('reports', []):
            if report.get('id') == report_id:
                if 'attachments' not in report:
                    report['attachments'] = []
                report['attachments'].extend(uploaded_files)
                save_all_reports(all_reports)
                break
        
        return {
            "message": f"Successfully uploaded {len(uploaded_files)} attachment(s)",
            "attachments": uploaded_files
        }
    except Exception as e:
        return {"error": f"Failed to upload attachments: {str(e)}"}

@app.get("/landfill-reports/{report_id}/attachments")
async def get_attachments(report_id: str):
    """Get all attachments for a specific report"""
    try:
        all_reports = load_all_reports()
        for report in all_reports.get('reports', []):
            if report.get('id') == report_id:
                return {"attachments": report.get('attachments', [])}
        
        return {"attachments": []}
    except Exception as e:
        return {"error": f"Failed to get attachments: {str(e)}"}

@app.get("/attachments/{report_id}/{filename}")
async def get_attachment_file(report_id: str, filename: str):
    """Serve attachment files"""
    try:
        file_path = f"attachments/{report_id}/{filename}"
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
            return {"error": "File not found"}
    except Exception as e:
        return {"error": f"Failed to serve file: {str(e)}"}

@app.put("/landfill-report/row/{row_id}")
async def update_landfill_row(row_id: int, row: LandfillRow):
    data = load_landfill_data()
    if not data:
        return {"error": "No report found"}
    
    for i, r in enumerate(data['data_rows']):
        if r.get('id') == row_id:
            row.id = row_id
            data['data_rows'][i] = row.dict()
            
            # Recalculate totals
            total_amount = sum(r['amount'] for r in data['data_rows'])
            total_vat = sum(r['vat'] for r in data['data_rows'])
            total_total = sum(r['total'] for r in data['data_rows'])
            
            data['totals'] = {
                'amount': total_amount,
                'vat': total_vat,
                'total': total_total
            }
            
            save_landfill_data(data)
            return {"message": "Row updated successfully", "row": row}
    
    return {"error": "Row not found"}

@app.delete("/landfill-report/row/{row_id}")
async def delete_landfill_row(row_id: int):
    data = load_landfill_data()
    if not data:
        return {"error": "No report found"}
    
    for i, r in enumerate(data['data_rows']):
        if r.get('id') == row_id:
            deleted_row = data['data_rows'].pop(i)
            
            # Recalculate totals
            total_amount = sum(r['amount'] for r in data['data_rows'])
            total_vat = sum(r['vat'] for r in data['data_rows'])
            total_total = sum(r['total'] for r in data['data_rows'])
            
            data['totals'] = {
                'amount': total_amount,
                'vat': total_vat,
                'total': total_total
            }
            
            save_landfill_data(data)
            return {"message": f"Row {row_id} deleted successfully"}
    
    return {"error": "Row not found"}

@app.get("/landfill-report/export")
async def export_landfill_report():
    data = load_landfill_data()
    if not data:
        return {"error": "No report data found"}
    
    return data

# All Reports Endpoints
@app.get("/all-reports")
async def get_all_reports():
    """Get list of all landfill reports with full revision management data"""
    data = load_all_reports()
    return data

@app.get("/all-reports/{report_id}")
async def get_report_by_id(report_id: str):
    """Get a specific landfill report by ID"""
    data = load_all_reports()
    
    for report in data.get('reports', []):
        if report.get('id') == report_id:
            return report
    
    return {"error": "Report not found"}

@app.post("/all-reports")
async def create_new_report(report_data: dict):
    """Create a new landfill report"""
    data = load_all_reports()
    
    # Generate new ID
    existing_ids = [r.get('id') for r in data.get('reports', [])]
    new_id = f"P{max([int(id[1:]) for id in existing_ids if id and id.startswith('P')], default=7921) + 1}"
    
    # Add metadata
    report_data['id'] = new_id
    report_data['created_at'] = datetime.now().isoformat()
    report_data['updated_at'] = datetime.now().isoformat()
    
    data['reports'].append(report_data)
    save_all_reports(data)
    
    return {"message": "Report created successfully", "report_id": new_id}

@app.put("/all-reports/{report_id}")
async def update_report(report_id: str, report_data: dict):
    """Update an existing landfill report"""
    data = load_all_reports()
    
    for i, report in enumerate(data.get('reports', [])):
        if report.get('id') == report_id:
            report_data['id'] = report_id
            report_data['created_at'] = report.get('created_at')
            report_data['updated_at'] = datetime.now().isoformat()
            
            data['reports'][i] = report_data
            save_all_reports(data)
            return {"message": "Report updated successfully"}
    
    return {"error": "Report not found"}

@app.delete("/all-reports/{report_id}")
async def delete_report(report_id: str):
    """Delete a landfill report"""
    data = load_all_reports()
    
    for i, report in enumerate(data.get('reports', [])):
        if report.get('id') == report_id:
            del data['reports'][i]
            save_all_reports(data)
            return {"message": "Report deleted successfully"}
    
    return {"error": "Report not found"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
