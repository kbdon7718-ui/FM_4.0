import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.jsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog.jsx';
import { Calendar } from '../ui/calendar.jsx';
import { GraphicalFuelDialog } from '../GraphicalFuelDialog.jsx';
import { 
  Droplet, 
  Download,
  Calendar as CalendarIcon,
  Gauge,
  Navigation,
  Search,
  User,
  Phone,
  BadgeCheck,
  IndianRupee,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3,
  MapPin,
  LineChart
} from 'lucide-react';

export function FuelReports() {
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [dateFilter, setDateFilter] = useState('all');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [graphicalFuelDialogOpen, setGraphicalFuelDialogOpen] = useState(false);

  // Get today's date for comparison
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Calculate yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Mock fuel refill data with detailed tracking
  const fuelRefillData = [
    {
      id: 1,
      vehicle: 'TN-01-AB-1234',
      driver: 'Rajesh Kumar',
      refillDate: todayStr,
      refillTime: '06:30 AM',
      fuelRefilled: 45,
      distanceSinceLastRefill: 540,
      cost: 4050,
      pricePerLiter: 90,
      location: 'Ambattur Fuel Station',
      fuelBefore: 12,
      fuelAfter: 57,
      efficiency: 12.0,
      supervisor: {
        name: 'Ravi Shankar',
        phone: '+91 98765 43210',
        id: 'SUP-001'
      }
    },
    {
      id: 2,
      vehicle: 'TN-01-AB-1235',
      driver: 'Anil Sharma',
      refillDate: todayStr,
      refillTime: '01:45 PM',
      fuelRefilled: 52,
      distanceSinceLastRefill: 702,
      cost: 4680,
      pricePerLiter: 90,
      location: 'Sriperumbudur HP',
      fuelBefore: 8,
      fuelAfter: 60,
      efficiency: 13.5,
      supervisor: {
        name: 'Sunil Kumar',
        phone: '+91 98765 43211',
        id: 'SUP-002'
      }
    },
    {
      id: 3,
      vehicle: 'TN-01-AB-1236',
      driver: 'Vikram Singh',
      refillDate: yesterdayStr,
      refillTime: '08:00 AM',
      fuelRefilled: 55,
      distanceSinceLastRefill: 616,
      cost: 4950,
      pricePerLiter: 90,
      location: 'Oragadam BPCL',
      fuelBefore: 5,
      fuelAfter: 60,
      efficiency: 11.2,
      supervisor: {
        name: 'Prakash Reddy',
        phone: '+91 98765 43212',
        id: 'SUP-003'
      }
    },
    {
      id: 4,
      vehicle: 'TN-01-AB-1238',
      driver: 'Ramesh Yadav',
      refillDate: todayStr,
      refillTime: '03:30 PM',
      fuelRefilled: 46,
      distanceSinceLastRefill: 639,
      cost: 4140,
      pricePerLiter: 90,
      location: 'Irungattukottai IOC',
      fuelBefore: 14,
      fuelAfter: 60,
      efficiency: 13.9,
      supervisor: {
        name: 'Ravi Shankar',
        phone: '+91 98765 43210',
        id: 'SUP-001'
      }
    },
  ];

  // Calculate 30-day statistics for a vehicle
  const calculate30DayStats = (vehicleNumber) => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const vehicleRecords = fuelRefillData.filter(record => {
      const recordDate = new Date(record.refillDate);
      return record.vehicle === vehicleNumber && recordDate >= thirtyDaysAgo;
    });

    const totalFuel = vehicleRecords.reduce((sum, r) => sum + r.fuelRefilled, 0);
    const totalDistance = vehicleRecords.reduce((sum, r) => sum + r.distanceSinceLastRefill, 0);
    const totalCost = vehicleRecords.reduce((sum, r) => sum + r.cost, 0);
    const avgEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0';
    const avgPricePerLiter = vehicleRecords.length > 0 
      ? (vehicleRecords.reduce((sum, r) => sum + r.pricePerLiter, 0) / vehicleRecords.length).toFixed(2)
      : '0';
    const refillCount = vehicleRecords.length;

    return {
      totalFuel,
      totalDistance,
      totalCost,
      avgEfficiency,
      avgPricePerLiter,
      refillCount
    };
  };

  const openDetailsDialog = (record) => {
    setSelectedRecord(record);
    setDetailsDialogOpen(true);
  };

  // Filter data based on selection, search, AND date
  const filteredData = fuelRefillData.filter(record => {
    const matchesVehicle = selectedVehicle === 'all' || record.vehicle === selectedVehicle;
    const matchesSearch = 
      record.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = record.refillDate === todayStr;
    } else if (dateFilter === 'yesterday') {
      matchesDate = record.refillDate === yesterdayStr;
    } else if (dateFilter === 'custom' && selectedDate) {
      const customDateStr = selectedDate.toISOString().split('T')[0];
      matchesDate = record.refillDate === customDateStr;
    }
    
    return matchesVehicle && matchesSearch && matchesDate;
  });

  // Calculate vehicle-wise averages
  const vehicleStats = fuelRefillData.reduce((acc, record) => {
    if (!acc[record.vehicle]) {
      acc[record.vehicle] = {
        vehicle: record.vehicle,
        driver: record.driver,
        totalRefills: 0,
        totalFuelRefilled: 0,
        totalDistance: 0,
        totalCost: 0,
        avgEfficiency: 0,
        refills: []
      };
    }
    acc[record.vehicle].totalRefills += 1;
    acc[record.vehicle].totalFuelRefilled += record.fuelRefilled;
    acc[record.vehicle].totalDistance += record.distanceSinceLastRefill;
    acc[record.vehicle].totalCost += record.cost;
    acc[record.vehicle].refills.push(record.efficiency);
    return acc;
  }, {});

  // Calculate average efficiency for each vehicle
  Object.keys(vehicleStats).forEach(vehicle => {
    const stats = vehicleStats[vehicle];
    stats.avgEfficiency = Number((stats.totalDistance / stats.totalFuelRefilled).toFixed(2));
  });

  const vehicleStatsArray = Object.values(vehicleStats);

  // Overall summary
  const totalFuelRefilled = fuelRefillData.reduce((sum, record) => sum + record.fuelRefilled, 0);
  const totalDistance = fuelRefillData.reduce((sum, record) => sum + record.distanceSinceLastRefill, 0);
  const totalCost = fuelRefillData.reduce((sum, record) => sum + record.cost, 0);
  const overallAvgEfficiency = Number((totalDistance / totalFuelRefilled).toFixed(2));

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 13) return 'text-green-600';
    if (efficiency >= 12) return 'text-blue-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency) => {
    if (efficiency >= 13) return <Badge className="bg-green-500">Excellent</Badge>;
    if (efficiency >= 12) return <Badge className="bg-blue-500">Good</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="h-5 w-5 text-cyan-500" />
              <p className="text-sm text-slate-600">Total Fuel Refilled</p>
            </div>
            <p className="text-slate-900">{totalFuelRefilled}L</p>
            <p className="text-xs text-slate-500 mt-1">Across all vehicles</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-slate-600">Total Distance</p>
            </div>
            <p className="text-slate-900">{totalDistance.toLocaleString()} km</p>
            <p className="text-xs text-slate-500 mt-1">All vehicles combined</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-5 w-5 text-green-500" />
              <p className="text-sm text-slate-600">Overall Avg Efficiency</p>
            </div>
            <p className={`${getEfficiencyColor(overallAvgEfficiency)}`}>
              {overallAvgEfficiency} km/L
            </p>
            <p className="text-xs text-slate-500 mt-1">Fleet average</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-5 w-5 text-purple-500" />
              <p className="text-sm text-slate-600">Total Cost</p>
            </div>
            <p className="text-slate-900">₹{totalCost.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">At ₹90/liter avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle-Wise Fuel Summary */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Vehicle-Wise Fuel Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Total Fuel Refilled (L)</TableHead>
                <TableHead>Total Distance (km)</TableHead>
                <TableHead>Overall Avg Efficiency</TableHead>
                <TableHead>Total Cost (₹)</TableHead>
                <TableHead className="bg-green-50">Graphical Fuel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleStatsArray.map((vehicle) => (
                <TableRow key={vehicle.vehicle}>
                  <TableCell className="font-medium">{vehicle.vehicle}</TableCell>
                  <TableCell>{vehicle.driver}</TableCell>
                  <TableCell className="text-cyan-600">{vehicle.totalFuelRefilled}L</TableCell>
                  <TableCell className="text-blue-600">{vehicle.totalDistance.toLocaleString()} km</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={getEfficiencyColor(vehicle.avgEfficiency)}>
                        {vehicle.avgEfficiency} km/L
                      </span>
                      {getEfficiencyBadge(vehicle.avgEfficiency)}
                    </div>
                  </TableCell>
                  <TableCell>₹{vehicle.totalCost.toLocaleString()}</TableCell>
                  <TableCell className="bg-green-50">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      onClick={() => {
                        setSelectedRecord(fuelRefillData.find(r => r.vehicle === vehicle.vehicle));
                        setGraphicalFuelDialogOpen(true);
                      }}
                    >
                      <LineChart className="h-4 w-4" />
                      View Graph
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Fuel Refill Log */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-cyan-500" />
              Detailed Fuel Refill Log
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search vehicle, driver, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="TN-01-AB-1234">TN-01-AB-1234</SelectItem>
                  <SelectItem value="TN-01-AB-1235">TN-01-AB-1235</SelectItem>
                  <SelectItem value="TN-01-AB-1236">TN-01-AB-1236</SelectItem>
                  <SelectItem value="TN-01-AB-1238">TN-01-AB-1238</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date Filter Buttons */}
          <div className="mb-6 flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-600">Filter by Date:</span>
            </div>
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateFilter('all');
                setSelectedDate(undefined);
              }}
              className={dateFilter === 'all' ? 'bg-slate-700 hover:bg-slate-800' : ''}
            >
              All Dates
            </Button>
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateFilter('today');
                setSelectedDate(undefined);
              }}
              className={dateFilter === 'today' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Today
            </Button>
            <Button
              variant={dateFilter === 'yesterday' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateFilter('yesterday');
                setSelectedDate(undefined);
              }}
              className={dateFilter === 'yesterday' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Yesterday
            </Button>
            
            {/* Calendar Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className={dateFilter === 'custom' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {selectedDate && dateFilter === 'custom' 
                    ? selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Pick Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setDateFilter('custom');
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {(dateFilter !== 'all' || selectedDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter('all');
                  setSelectedDate(undefined);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Filter
              </Button>
            )}
          </div>

          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-700">
              <strong>Showing {filteredData.length} refill record{filteredData.length !== 1 ? 's' : ''}</strong> 
              {selectedVehicle !== 'all' && ` for vehicle ${selectedVehicle}`}
              {dateFilter === 'today' && ' (Today)'}
              {dateFilter === 'yesterday' && ' (Yesterday)'}
              {dateFilter === 'custom' && selectedDate && ` (${selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})`}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fuel Before</TableHead>
                <TableHead>Fuel Refilled (L)</TableHead>
                <TableHead>Fuel After</TableHead>
                <TableHead>Distance Run (km)</TableHead>
                <TableHead>Average (km/L)</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm">{record.refillDate}</p>
                      <p className="text-xs text-slate-500">{record.refillTime}</p>
                    </div>
                  </TableCell>
                  <TableCell>{record.vehicle}</TableCell>
                  <TableCell>{record.driver}</TableCell>
                  <TableCell className="text-sm">{record.location}</TableCell>
                  <TableCell className="text-orange-600">{record.fuelBefore}L</TableCell>
                  <TableCell className="text-cyan-600">{record.fuelRefilled}L</TableCell>
                  <TableCell className="text-green-600">{record.fuelAfter}L</TableCell>
                  <TableCell className="text-blue-600">{record.distanceSinceLastRefill} km</TableCell>
                  <TableCell className={getEfficiencyColor(record.efficiency)}>
                    {record.efficiency} km/L
                  </TableCell>
                  <TableCell>₹{record.cost.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => openDetailsDialog(record)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      More Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No refill records found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculation Method Info */}
      <Card className="border-slate-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="text-sm text-blue-900 mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            How Average Efficiency is Calculated
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Average Efficiency (km/L)</strong> = Distance Traveled Since Last Refill ÷ Fuel Refilled</p>
            <p className="text-xs text-blue-700">
              Example: If a vehicle traveled 540 km and refilled 45 liters, the efficiency is 540 ÷ 45 = 12.0 km/L
            </p>
            <p className="text-xs text-blue-700 mt-3">
              <strong>Note:</strong> This calculation provides the actual fuel consumption between refills and helps identify vehicles with poor efficiency or potential fuel wastage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-cyan-500" />
              Detailed Refill Information - {selectedRecord?.vehicle}
            </DialogTitle>
            <DialogDescription>
              Comprehensive vehicle fuel refill details and 30-day performance statistics
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (() => {
            const stats30Day = calculate30DayStats(selectedRecord.vehicle);
            return (
              <div className="space-y-6">
                {/* Current Refill Details */}
                <div>
                  <h3 className="text-sm mb-3 text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    Current Refill Transaction
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Date & Time</p>
                        <p className="text-slate-900">{selectedRecord.refillDate}</p>
                        <p className="text-xs text-slate-600">{selectedRecord.refillTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Fuel Station</p>
                        <p className="text-slate-900">{selectedRecord.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Driver Name</p>
                        <p className="text-slate-900">{selectedRecord.driver}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplet className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Fuel Level Before</p>
                        <p className="text-slate-900">{selectedRecord.fuelBefore}L</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplet className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Fuel Refilled</p>
                        <p className="text-slate-900">{selectedRecord.fuelRefilled}L</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplet className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Fuel Level After</p>
                        <p className="text-slate-900">{selectedRecord.fuelAfter}L</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Distance Since Last Refill</p>
                        <p className="text-slate-900">{selectedRecord.distanceSinceLastRefill} km</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Gauge className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Fuel Efficiency</p>
                        <p className={getEfficiencyColor(selectedRecord.efficiency)}>
                          {selectedRecord.efficiency} km/L
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IndianRupee className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Price per Liter</p>
                        <p className="text-slate-900">₹{selectedRecord.pricePerLiter}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IndianRupee className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="text-slate-900">₹{selectedRecord.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supervisor Details */}
                <div>
                  <h3 className="text-sm mb-3 text-slate-700 flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                    Supervisor Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-green-700">Supervisor Name</p>
                        <p className="text-green-900">{selectedRecord.supervisor.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-green-700">Phone Number</p>
                        <p className="text-green-900">{selectedRecord.supervisor.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-green-700">Supervisor ID</p>
                        <p className="text-green-900">{selectedRecord.supervisor.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 30-Day Vehicle Statistics */}
                <div>
                  <h3 className="text-sm mb-3 text-slate-700 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Last 30 Days Performance - {selectedRecord.vehicle}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="h-5 w-5 text-blue-600" />
                          <p className="text-xs text-blue-700">Total Fuel Refilled</p>
                        </div>
                        <p className="text-blue-900">{stats30Day.totalFuel}L</p>
                        <p className="text-xs text-blue-600 mt-1">{stats30Day.refillCount} refills</p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Navigation className="h-5 w-5 text-green-600" />
                          <p className="text-xs text-green-700">Total Distance</p>
                        </div>
                        <p className="text-green-900">{stats30Day.totalDistance.toLocaleString()} km</p>
                        <p className="text-xs text-green-600 mt-1">Last 30 days</p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IndianRupee className="h-5 w-5 text-purple-600" />
                          <p className="text-xs text-purple-700">Total Fuel Cost</p>
                        </div>
                        <p className="text-purple-900">₹{stats30Day.totalCost.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1">Last 30 days</p>
                      </CardContent>
                    </Card>

                    <Card className="border-cyan-200 bg-cyan-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge className="h-5 w-5 text-cyan-600" />
                          <p className="text-xs text-cyan-700">Average Efficiency</p>
                        </div>
                        <p className="text-cyan-900">{stats30Day.avgEfficiency} km/L</p>
                        <p className="text-xs text-cyan-600 mt-1">30-day average</p>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IndianRupee className="h-5 w-5 text-orange-600" />
                          <p className="text-xs text-orange-700">Avg Price/Liter</p>
                        </div>
                        <p className="text-orange-900">₹{stats30Day.avgPricePerLiter}</p>
                        <p className="text-xs text-orange-600 mt-1">30-day average</p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUpIcon className="h-5 w-5 text-slate-600" />
                          <p className="text-xs text-slate-700">Today's Price</p>
                        </div>
                        <p className="text-slate-900">₹{selectedRecord.pricePerLiter}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {selectedRecord.pricePerLiter > parseFloat(stats30Day.avgPricePerLiter) ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <TrendingUpIcon className="h-3 w-3" />
                              Higher than avg
                            </span>
                          ) : selectedRecord.pricePerLiter < parseFloat(stats30Day.avgPricePerLiter) ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <TrendingDownIcon className="h-3 w-3" />
                              Lower than avg
                            </span>
                          ) : (
                            <span className="text-slate-600">Same as average</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm text-blue-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance Insights
                  </h4>
                  <div className="space-y-2 text-xs text-blue-800">
                    <p>
                      • This vehicle has completed <strong>{stats30Day.refillCount} refills</strong> in the last 30 days
                    </p>
                    <p>
                      • Average fuel consumption: <strong>{stats30Day.totalFuel > 0 ? (stats30Day.totalFuel / stats30Day.refillCount).toFixed(1) : 0}L per refill</strong>
                    </p>
                    <p>
                      • Average distance per refill: <strong>{stats30Day.refillCount > 0 ? (stats30Day.totalDistance / stats30Day.refillCount).toFixed(0) : 0} km</strong>
                    </p>
                    <p>
                      • Current efficiency ({selectedRecord.efficiency} km/L) is{' '}
                      {selectedRecord.efficiency > parseFloat(stats30Day.avgEfficiency) ? (
                        <span className="text-green-700">better than</span>
                      ) : selectedRecord.efficiency < parseFloat(stats30Day.avgEfficiency) ? (
                        <span className="text-red-700">worse than</span>
                      ) : (
                        <span>equal to</span>
                      )} the 30-day average
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Graphical Fuel Report Dialog */}
      <GraphicalFuelDialog 
        open={graphicalFuelDialogOpen} 
        onOpenChange={setGraphicalFuelDialogOpen}
        vehicleNumber={selectedRecord?.vehicle}
      />
    </div>
  );
}
