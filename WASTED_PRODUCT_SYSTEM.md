# Wasted Product System - Added Files

## Models
```
models/
├── reason.ts              # Reason model (reason, textId)
└── wastedProduct.ts       # WastedProduct model (layerWidth, wastedWidth, layerHeight, wastedHeight, reason, step, user)
```

## API Endpoints
```
app/api/
├── reasons/
│   └── route.ts           # GET/POST for reasons
├── wasted-products/
│   └── route.ts           # GET/POST for wasted products
├── staff/
│   └── search/
│       └── route.ts       # GET staff search by name
└── steps/
    └── route.ts           # GET all steps
```

## Components
```
components/
├── SearchSelect.tsx       # Dynamic search component for users
└── Dropdown.tsx          # Static dropdown for steps/reasons
```

## Database Connection
```
lib/
└── dbConnect.ts          # MongoDB connection utility
```

## Updated Files
```
app/test/page.tsx         # Updated to use wasted product form with ProductLayer lookup
```

## Workflow
1. **Input**: Production code → finds ProductLayer (width/height)
2. **Form**: Wasted dimensions + select reason/step/user
3. **Submit**: Creates wasted product entry

## Form Flow

### Step 1: Production Code Input
```
[Production Code Input] → Auto-lookup ProductLayer
                      ↓
[Display: Width, Height, Production Date]
```

### Step 2: Wasted Dimensions
```
[Wasted Width Input]  [Wasted Height Input]
```

### Step 3: Reference Selections
```
[Reason Dropdown]     ← Loads from /api/reasons
[Step Dropdown]       ← Loads from /api/steps  
[User Search]         ← Dynamic search /api/staff/search
```

### Step 4: Submit
```
Data Sent to /api/wasted-products:
{
  layerWidth: [from ProductLayer],
  wastedWidth: [user input],
  layerHeight: [from ProductLayer], 
  wastedHeight: [user input],
  reason: [selected reason ID],
  step: [selected step ID],
  user: [selected staff ID]
}
```

## Sample Data

### Sample Reasons (4 entries)
```
1. Glass Breakage (GB001)
2. Wrong Dimensions (WD002) 
3. Quality Defect (QD003)
4. Machine Error (ME004)
```
*Use "Add Sample Reasons" button in test form to populate*

## Enhanced UX Features

### Production Code Search
- **3-second debounce**: Waits 3 seconds after user stops typing
- **Live status indicators**: 
  - 🟡 Searching (with spinner)
  - 🟢 Found (green border + checkmark)
  - 🔴 Not Found (red border + error message)
- **Visual feedback**: Border colors change based on search status
- **Auto-clear**: Clears results when code is too short

### Form Validation
- Prevents submission until valid production code is found
- Real-time feedback for all search fields
- Loading states for all async operations

## API Usage
- `GET /api/productLayer?productionCode=XXX` - Get ProductLayer dimensions
- `GET /api/reasons` - Get all reasons for dropdown
- `GET /api/steps` - Get all steps for dropdown  
- `GET /api/staff/search?name=john` - Search staff by name
- `POST /api/wasted-products` - Create wasted product entry
- `POST /api/reasons/seed` - Add sample reasons (development only)