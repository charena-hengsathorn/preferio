import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sampleData = {
    "metadata": {
      "version": "1.0",
      "created": "2025-01-15T10:30:00Z",
      "last_updated": "2025-01-15T12:45:00Z",
      "source": "sample_generator"
    },
    "company_info": {
      "name": "Sample Landfill Company",
      "registration": "REG-2025-001",
      "address": {
        "street": "123 Sample Street",
        "city": "Sample City",
        "province": "Sample Province",
        "postal_code": "12345",
        "country": "Thailand"
      },
      "contact": {
        "phone": "+66-12-345-6789",
        "email": "info@samplecompany.com",
        "website": "https://samplecompany.com"
      }
    },
    "financial_summary": {
      "total_revenue": 1250000.50,
      "total_expenses": 850000.25,
      "net_profit": 399999.75,
      "currency": "THB",
      "fiscal_year": 2025
    },
    "operations": {
      "landfill_sites": [
        {
          "id": "LF-001",
          "name": "North Site",
          "capacity": 50000,
          "current_usage": 0.75,
          "status": "active",
          "coordinates": {
            "latitude": 13.7563,
            "longitude": 100.5018
          }
        },
        {
          "id": "LF-002", 
          "name": "South Site",
          "capacity": 30000,
          "current_usage": 0.45,
          "status": "active",
          "coordinates": {
            "latitude": 13.7563,
            "longitude": 100.5018
          }
        }
      ],
      "vehicles": {
        "trucks": 25,
        "excavators": 5,
        "compactors": 3,
        "loaders": 8
      }
    },
    "environmental_data": {
      "emissions": {
        "co2_tons_per_month": 150.5,
        "methane_tons_per_month": 45.2,
        "reduction_target": 0.15
      },
      "waste_processing": {
        "total_processed_tons": 12500,
        "recycled_percentage": 0.35,
        "landfill_percentage": 0.65
      }
    },
    "compliance": {
      "licenses": [
        {
          "type": "operating_license",
          "number": "OP-2025-001",
          "issued_date": "2025-01-01",
          "expiry_date": "2025-12-31",
          "status": "valid"
        },
        {
          "type": "environmental_permit",
          "number": "ENV-2025-001", 
          "issued_date": "2025-01-01",
          "expiry_date": "2025-12-31",
          "status": "valid"
        }
      ],
      "inspections": [
        {
          "date": "2025-01-10",
          "type": "monthly",
          "inspector": "John Smith",
          "result": "passed",
          "notes": "All systems operating within parameters"
        },
        {
          "date": "2024-12-15",
          "type": "quarterly",
          "inspector": "Jane Doe",
          "result": "passed",
          "notes": "Minor maintenance recommended"
        }
      ]
    },
    "performance_metrics": {
      "efficiency": {
        "processing_time_per_ton": 2.5,
        "cost_per_ton": 45.75,
        "satisfaction_rating": 4.2
      },
      "safety": {
        "incidents_this_year": 2,
        "lost_time_hours": 48,
        "safety_training_hours": 1200
      }
    },
    "future_plans": {
      "expansion": {
        "new_site_planned": true,
        "estimated_capacity": 75000,
        "completion_date": "2026-06-30"
      },
      "technology_upgrades": [
        "Automated sorting system",
        "Advanced monitoring sensors",
        "Mobile app for drivers"
      ]
    }
  };

  // Add some delay to simulate API call
  setTimeout(() => {
    res.status(200).json(sampleData);
  }, 500);
}
