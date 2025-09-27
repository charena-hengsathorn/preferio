from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os

app = FastAPI(title="Preferio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite and Next.js default ports
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
