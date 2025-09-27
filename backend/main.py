from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Landfill Report Models
class LandfillRow(BaseModel):
    id: Optional[int] = None
    receive_ton: Optional[float] = None
    ton: float
    gcv: Optional[float] = None
    multi: Optional[float] = None
    price: Optional[float] = None
    total_ton: float
    baht_per_ton: float
    amount: float
    vat: float
    total: float
    remark: Optional[str] = ""

class LandfillReport(BaseModel):
    report_info: dict
    data_rows: List[LandfillRow]
    totals: dict
    additional_info: dict

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

# Landfill Report Endpoints
@app.get("/landfill-report")
async def get_landfill_report():
    data = load_landfill_data()
    if data:
        return data
    return {"message": "No landfill report data found"}

@app.post("/landfill-report")
async def create_landfill_report(report: LandfillReport):
    save_landfill_data(report.dict())
    return {"message": "Landfill report saved successfully", "data": report}

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
    """Get list of all landfill reports with summary information"""
    data = load_all_reports()
    reports_summary = []
    
    for report in data.get('reports', []):
        summary = {
            "id": report.get('id'),
            "name": report.get('name'),
            "company": report.get('report_info', {}).get('company'),
            "period": report.get('report_info', {}).get('period'),
            "created_at": report.get('created_at'),
            "updated_at": report.get('updated_at'),
            "total_amount": report.get('totals', {}).get('total', 0)
        }
        reports_summary.append(summary)
    
    return {"reports": reports_summary}

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
